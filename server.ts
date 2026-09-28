import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { analyzeMessageText } from './src/utils/nlpEngine';
import { analyzeUrlString } from './src/utils/urlEngine';
import { analyzeQrPayload } from './src/utils/qrEngine';
import { COLLEGE_PROJECT_FILES } from './src/utils/collegeCodeTemplates';
import { ScanResult } from './src/types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HISTORY_FILE = path.resolve(process.cwd(), 'data', 'history.json');

// Ensure data folder and file exists
if (!fs.existsSync(path.dirname(HISTORY_FILE))) {
  fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true });
}
if (!fs.existsSync(HISTORY_FILE)) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2), 'utf-8');
}

function readHistory(): ScanResult[] {
  try {
    const raw = fs.readFileSync(HISTORY_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read history:', err);
    return [];
  }
}

function writeHistory(data: ScanResult[]): void {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write history:', err);
  }
}

app.use(express.json({ limit: '10mb' }));

// Helper to optionally enrich with Gemini API
async function enrichWithMessageGemini(message: string, baseResult: ScanResult): Promise<ScanResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return baseResult;
  }

  try {
    const ai = new GoogleGenAI();
    const prompt = `You are ScamShield AI, an expert cybersecurity scanner that inspects messages for scams, phishing, social engineering, extortion, and fraud.
Analyze the following user-submitted message:
"""
${message}
"""

Evaluate the risk level ("Safe", "Suspicious", or "High Risk") and calculate an integer risk score (0 to 100).
Provide 2 to 4 simple concise reasons why, and 2 to 4 actionable safety tips.
Also provide the fraud category (e.g., Phishing, Banking Fraud, Job Scam, Lottery Scam, Normal Communication).

Respond ONLY in valid JSON matching this schema:
{
  "riskLevel": "Safe" | "Suspicious" | "High Risk",
  "riskScore": number,
  "category": string,
  "summary": string,
  "reasons": string[],
  "safetyTips": string[],
  "flaggedKeywords": string[]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return {
        ...baseResult,
        riskLevel: parsed.riskLevel || baseResult.riskLevel,
        riskScore: typeof parsed.riskScore === 'number' ? parsed.riskScore : baseResult.riskScore,
        category: parsed.category || baseResult.category,
        summary: parsed.summary || baseResult.summary,
        reasons: Array.isArray(parsed.reasons) && parsed.reasons.length > 0 ? parsed.reasons : baseResult.reasons,
        safetyTips: Array.isArray(parsed.safetyTips) && parsed.safetyTips.length > 0 ? parsed.safetyTips : baseResult.safetyTips,
        highlights: Array.from(new Set([...(baseResult.highlights || []), ...(parsed.flaggedKeywords || [])])),
        nlpDetails: {
          ...baseResult.nlpDetails,
          urgencyLevel: baseResult.nlpDetails?.urgencyLevel || 'None',
          financialIntent: baseResult.nlpDetails?.financialIntent || false,
          threatOrFearTactics: baseResult.nlpDetails?.threatOrFearTactics || false,
          extractedUrls: baseResult.nlpDetails?.extractedUrls || [],
          sentiment: baseResult.nlpDetails?.sentiment || 'Neutral',
          flaggedKeywords: Array.from(new Set([...(baseResult.nlpDetails?.flaggedKeywords || []), ...(parsed.flaggedKeywords || [])])),
          aiAssisted: true
        }
      };
    }
  } catch (err) {
    console.warn('Gemini AI enrichment skipped, using rule-based NLP baseline:', err);
  }

  return baseResult;
}

// API Routes
app.post('/api/scan/message', async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const baseline = analyzeMessageText(message);
  const finalResult = await enrichWithMessageGemini(message, baseline);

  // Auto persist to history
  const history = readHistory();
  history.unshift(finalResult);
  writeHistory(history.slice(0, 100)); // retain last 100

  return res.json(finalResult);
});

app.post('/api/scan/url', async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  const baseline = analyzeUrlString(url);

  // Auto persist to history
  const history = readHistory();
  history.unshift(baseline);
  writeHistory(history.slice(0, 100));

  return res.json(baseline);
});

app.post('/api/scan/qr', async (req: Request, res: Response) => {
  const { payload } = req.body;
  if (!payload || typeof payload !== 'string') {
    return res.status(400).json({ error: 'Decoded QR payload is required' });
  }

  const baseline = analyzeQrPayload(payload);

  // Auto persist to history
  const history = readHistory();
  history.unshift(baseline);
  writeHistory(history.slice(0, 100));

  return res.json(baseline);
});

app.get('/api/history', (_req: Request, res: Response) => {
  const history = readHistory();
  return res.json(history);
});

app.post('/api/history', (req: Request, res: Response) => {
  const newScan: ScanResult = req.body;
  if (!newScan || !newScan.id) {
    return res.status(400).json({ error: 'Valid scan object required' });
  }

  const history = readHistory();
  // Check if exists
  const existingIdx = history.findIndex(h => h.id === newScan.id);
  if (existingIdx >= 0) {
    history[existingIdx] = newScan;
  } else {
    history.unshift(newScan);
  }
  writeHistory(history.slice(0, 100));
  return res.json({ success: true, count: history.length });
});

app.delete('/api/history/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const history = readHistory();
  const filtered = history.filter(item => item.id !== id);
  writeHistory(filtered);
  return res.json({ success: true, count: filtered.length });
});

app.delete('/api/history', (_req: Request, res: Response) => {
  writeHistory([]);
  return res.json({ success: true, count: 0 });
});

app.get('/api/stats', (_req: Request, res: Response) => {
  const history = readHistory();
  const total = history.length;
  const safeCount = history.filter(h => h.riskLevel === 'Safe').length;
  const suspiciousCount = history.filter(h => h.riskLevel === 'Suspicious').length;
  const highRiskCount = history.filter(h => h.riskLevel === 'High Risk').length;
  const avgScore = total > 0 ? Math.round(history.reduce((acc, h) => acc + (h.riskScore || 0), 0) / total) : 0;

  return res.json({
    totalScans: total,
    safeCount,
    suspiciousCount,
    highRiskCount,
    avgRiskScore: avgScore
  });
});

app.get('/api/college-code', (_req: Request, res: Response) => {
  return res.json(COLLEGE_PROJECT_FILES);
});

// Dev vs Prod Vite Integration
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`ScamShield AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
