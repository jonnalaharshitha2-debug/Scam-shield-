import jsQR from 'jsqr';
import QRCode from 'qrcode';
import { ScanResult } from '../types';
import { analyzeUrlString } from './urlEngine';
import { analyzeMessageText } from './nlpEngine';

export async function decodeQrFromImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not available'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          resolve(code.data);
        } else {
          reject(new Error('No valid QR code could be detected in this image. Please ensure the QR code is clearly visible, well-lit, and not cropped.'));
        }
      };
      img.onerror = () => reject(new Error('Failed to load image file'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function decodeQrFromImageData(imageData: ImageData): string | null {
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'attemptBoth',
  });
  return code ? code.data : null;
}

export function analyzeQrPayload(payload: string): ScanResult {
  const cleanPayload = payload.trim();
  const isUrl = /^https?:\/\//i.test(cleanPayload) ||
                /^(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}(\/.*)?$/i.test(cleanPayload);

  let baseResult: ScanResult;
  let contentType: 'URL' | 'Text' | 'Phone' | 'Email' | 'Other' = 'Other';

  if (isUrl) {
    contentType = 'URL';
    baseResult = analyzeUrlString(cleanPayload);
  } else if (/^(tel:|phone:|\+?[0-9\s-]{7,15}$)/i.test(cleanPayload)) {
    contentType = 'Phone';
    baseResult = analyzeMessageText(cleanPayload);
  } else if (/^(mailto:|[\w.-]+@[\w.-]+\.\w+)/i.test(cleanPayload)) {
    contentType = 'Email';
    baseResult = analyzeMessageText(cleanPayload);
  } else {
    contentType = 'Text';
    baseResult = analyzeMessageText(cleanPayload);
  }

  // Prepend QR-specific context to reasons and safety tips
  const qrReasons = [
    `Decoded QR payload type: [${contentType}]`,
    ...baseResult.reasons
  ];

  const qrSafetyTips = [
    'Always preview the decoded URL or destination before clicking or accepting permissions.',
    ...baseResult.safetyTips
  ];

  return {
    ...baseResult,
    id: 'scan_qr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    type: 'qr',
    input: cleanPayload,
    reasons: qrReasons.slice(0, 5),
    safetyTips: qrSafetyTips.slice(0, 5),
    qrDetails: {
      rawContent: cleanPayload,
      contentType
    }
  };
}

export interface SampleQrPreset {
  id: string;
  title: string;
  description: string;
  category: string;
  payload: string;
  expectedRisk: 'Safe' | 'Suspicious' | 'High Risk';
  dataUrl?: string;
}

export const SAMPLE_QR_PRESETS: SampleQrPreset[] = [
  {
    id: 'phishing_bank',
    title: 'Fake Bank Login QR',
    description: 'Quishing attack redirecting to an unauthorized payment portal on an untrusted TLD.',
    category: 'Quishing / Phishing',
    payload: 'http://secure-chase-update.verify-account.xyz/login?id=8842',
    expectedRisk: 'High Risk'
  },
  {
    id: 'crypto_giveaway',
    title: 'Crypto Prize Scam QR',
    description: 'Prompts users to send crypto to claim double return rewards immediately.',
    category: 'Financial Fraud',
    payload: 'URGENT: Claim 2.5 Bitcoin! Send 0.1 BTC to wallet 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa within 12 hours to claim bonus.',
    expectedRisk: 'High Risk'
  },
  {
    id: 'shortened_link',
    title: 'Shortened Link QR',
    description: 'QR code masking the real landing page using a URL shortener.',
    category: 'Masked URL',
    payload: 'https://bit.ly/campus-event-discount-2026',
    expectedRisk: 'Suspicious'
  },
  {
    id: 'safe_university',
    title: 'Stanford University Portal QR',
    description: 'Legitimate academic portal link with verified HTTPS encryption.',
    category: 'Academic / Safe',
    payload: 'https://www.stanford.edu/academics/courses',
    expectedRisk: 'Safe'
  }
];

export async function generateQrDataUrl(text: string): Promise<string> {
  return await QRCode.toDataURL(text, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 280,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    }
  });
}
