import React, { useState } from 'react';
import {
  Code2,
  FileCode,
  Database,
  Terminal,
  Copy,
  Check,
  Download,
  BookOpen,
  Layers,
  Cpu,
  Shield,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { COLLEGE_PROJECT_FILES, CodeFile } from '../utils/collegeCodeTemplates';

export const CollegeProjectDocs: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(COLLEGE_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const vivaQuestions = [
    {
      q: 'How does the system distinguish between a benign message and a phishing attempt?',
      a: 'The system uses a rule-based NLP lexical pipeline that scans for urgency triggers ("immediately", "suspended", "arrest"), financial lure keywords ("lottery", "crypto", "cash reward"), and credential harvesting demands ("OTP", "verify password", "CVV"). Scores are weighted and normalized to calculate a risk percentage.'
    },
    {
      q: 'What is typosquatting and how does ScamShield AI detect it?',
      a: 'Typosquatting (URL hijacking) uses deceptive spellings mimicking reputable brands (e.g., "paypa1" or "arnazon"). The URL engine compares host tokens against known corporate brand lists and checks for visual character substitutions (1 for l, 0 for o, 3 for e).'
    },
    {
      q: 'Why are QR codes considered a cyber threat vector ("Quishing")?',
      a: 'Unlike plain text links, humans cannot read a 2D QR matrix visually. Attackers print fake QR stickers over parking meters or restaurant menus directing victims to malware or fake banking sites. ScamShield decrypts the payload in a sandboxed canvas before opening.'
    },
    {
      q: 'What is the role of SQLite in this architecture?',
      a: 'SQLite stores persistent audit trails of all scans (input string, risk level, composite score, reasons, and timestamps). Its zero-configuration serverless nature makes it ideal for embedded applications and rapid local query performance.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Academic Project Architecture & Python Flask Source
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Complete documentation, technical architecture, and runnable Python Flask + SQLite codebase for college submission and evaluation.
        </p>
      </div>

      {/* Architecture Overview */}
      <div className="bg-slate-900 text-slate-200 rounded-3xl p-6 md:p-8 border border-slate-800 space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">System Design</span>
          <h3 className="text-xl font-bold text-white mt-1">End-to-End Project Architecture</h3>
          <p className="text-xs text-slate-400 mt-1">
            Dataflow diagram representing how user input is processed, classified by the NLP/Heuristic engine, logged to SQLite, and rendered.
          </p>
        </div>

        {/* Architecture Diagram Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          {/* Layer 1 */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white">Client UI Layer</div>
            <p className="text-[11px] text-slate-400">
              HTML5, Tailwind CSS, Responsive React / JS controls, Canvas QR Decoder.
            </p>
          </div>

          {/* Layer 2 */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white">API Gateway / Flask</div>
            <p className="text-[11px] text-slate-400">
              RESTful routes (`/api/check-message`, `/api/check-url`, `/api/history`).
            </p>
          </div>

          {/* Layer 3 */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 mx-auto flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white">NLP & Heuristic Engine</div>
            <p className="text-[11px] text-slate-400">
              Weighted urgency analysis, credential lure detection, and typosquatting regex.
            </p>
          </div>

          {/* Layer 4 */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white">SQLite Database</div>
            <p className="text-[11px] text-slate-400">
              Persistent forensic storage (`scams` table) with structured audit trails.
            </p>
          </div>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-bold text-slate-800">Source Code Viewer</span>
            <span className="text-xs text-slate-500">({selectedFile.description})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* File Tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 bg-slate-900 border-b border-slate-800 overflow-x-auto">
          {COLLEGE_PROJECT_FILES.map(file => (
            <button
              key={file.filename}
              onClick={() => setSelectedFile(file)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-medium rounded-t-lg transition-colors cursor-pointer ${
                selectedFile.filename === file.filename
                  ? 'bg-slate-800 text-cyan-300 border-t-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{file.filename}</span>
            </button>
          ))}
        </div>

        {/* Code Content */}
        <div className="p-4 bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-[480px]">
          <pre className="leading-relaxed">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      </div>

      {/* Viva / Presentation Q&A */}
      <div className="bg-slate-50 rounded-3xl p-6 md:p-8 border border-slate-200/90 space-y-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-slate-900">
            College Viva & Examination Preparation Guide
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {vivaQuestions.map((qa, idx) => (
            <div key={idx} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="text-xs font-bold text-slate-900 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 text-[10px]">
                  Q{idx + 1}
                </span>
                <span>{qa.q}</span>
              </div>
              <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                {qa.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
