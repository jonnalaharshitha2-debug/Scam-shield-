import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  MessageSquare,
  Globe,
  QrCode,
  History,
  ArrowRight,
  Sparkles,
  Zap,
  Lock,
  Terminal,
  Layers,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { NavTab } from './Navbar';
import { SystemStats } from '../types';

interface HeroHomeProps {
  onNavigate: (tab: NavTab) => void;
  stats: SystemStats;
  onQuickScan: (input: string) => void;
}

export const HeroHome: React.FC<HeroHomeProps> = ({ onNavigate, stats, onQuickScan }) => {
  const [quickInput, setQuickInput] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickInput.trim()) {
      onQuickScan(quickInput.trim());
    }
  };

  const sampleAttacks = [
    {
      title: 'Urgent Bank Freeze SMS',
      type: 'message',
      risk: 'High Risk',
      text: 'URGENT: Your bank account has been suspended due to suspicious activity. Verify identity within 24 hours at http://verify-account-chase.xyz to avoid permanent closure.'
    },
    {
      title: 'Crypto Prize Winner Trap',
      type: 'message',
      risk: 'High Risk',
      text: 'Congratulations! You won 1.5 BTC in the annual international crypto giveaway. Claim your cash reward immediately via telegram @claim_bonus.'
    },
    {
      title: 'Typosquatted Phishing URL',
      type: 'url',
      risk: 'High Risk',
      text: 'http://paypa1-security-verification.update-portal.xyz/login.php'
    },
    {
      title: 'Legitimate University Notice',
      type: 'message',
      risk: 'Safe',
      text: 'Reminder: The computer science project presentations will take place in Hall B at 2:00 PM tomorrow. Please ensure your slide decks are uploaded.'
    }
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 md:pt-14 md:pb-16 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl px-6 md:px-12">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        {/* Glow orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-700/50 text-cyan-300 text-xs font-semibold tracking-wide shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI & NLP Powered Cybersecurity Defense</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Stop Digital Scams <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
              Before They Strike.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            ScamShield AI inspects suspicious SMS messages, phishing URLs, and malicious QR codes using rule-based natural language processing, heuristic pattern filters, and AI threat classification.
          </p>

          {/* Quick Scanner Bar */}
          <div className="pt-2 max-w-2xl mx-auto">
            <form onSubmit={handleQuickSubmit} className="relative flex items-center">
              <div className="absolute left-4 text-slate-400 pointer-events-none">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="Paste any suspicious message text or URL here..."
                className="w-full pl-12 pr-32 py-4 bg-slate-800/90 text-white placeholder-slate-400 text-sm rounded-2xl border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none shadow-xl transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Check Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 100% Free
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" /> Real-time NLP Analysis
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-blue-400" /> Privacy Preserved
              </span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('message')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Launch Message Checker</span>
            </button>
            <button
              onClick={() => onNavigate('url')}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-sm font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>Launch URL Checker</span>
            </button>
            <button
              onClick={() => onNavigate('qr')}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-sm font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Launch QR Scanner</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="text-2xl font-black text-white">{stats.totalScans}</div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">Scans Performed</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="text-2xl font-black text-rose-400">{stats.highRiskCount}</div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">High Risks Blocked</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="text-2xl font-black text-amber-400">{stats.suspiciousCount}</div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">Suspicious Flagged</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="text-2xl font-black text-emerald-400">&lt; 0.1s</div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">Analysis Latency</div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Cards */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Complete 3-in-1 Fraud Detection Suite
          </h2>
          <p className="text-sm text-slate-600">
            Built for college students, faculty, and regular users to counter modern social engineering attacks.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div
            onClick={() => onNavigate('message')}
            className="group p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Message Checker
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Paste SMS, WhatsApp messages, or emails. The NLP engine detects psychological urgency, fake bank freezes, lottery lures, and credential requests.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Urgency & Fear Pressure Tagging
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Embedded Phishing Link Detection
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> OTP & Credential Theft Identification
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-3 flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
              <span>Open Message Checker</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => onNavigate('url')}
            className="group p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-cyan-400 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                URL Inspector
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Analyze web addresses before clicking. Uncovers typosquatting domains (e.g. paypa1), raw IP addresses, disposable TLDs, and masked link shorteners.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Typosquatting & Brand Spoofing Check
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Hostname IP Address Flagging
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Suspicious Top-Level Domain (TLD) Filter
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-3 flex items-center text-xs font-bold text-cyan-600 group-hover:translate-x-1 transition-transform">
              <span>Open URL Checker</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => onNavigate('qr')}
            className="group p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-indigo-400 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                QR Code Scanner
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload or capture QR codes. The scanner decodes the payload in an isolated sandbox, previews the text or URL, and automatically conducts safety checks.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Browser-side Decryption Sandbox
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> "Quishing" Phishing Defense
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Automatic URL/Text Redirection Inspection
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-3 flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
              <span>Open QR Scanner</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Sample Attacks Sandbox */}
      <section className="bg-slate-50 rounded-3xl p-6 md:p-8 border border-slate-200/80 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
              <Terminal className="w-3.5 h-3.5" /> Interactive Sandbox
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">
              Test Real-World Scam Scenarios in 1-Click
            </h3>
            <p className="text-xs text-slate-500">
              Click any sample below to load and run the complete AI/NLP scanner automatically.
            </p>
          </div>
          <button
            onClick={() => onNavigate('message')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Custom Check</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {sampleAttacks.map((sample, idx) => (
            <div
              key={idx}
              onClick={() => onQuickScan(sample.text)}
              className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {sample.type === 'message' ? 'SMS / Text' : 'URL Link'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    sample.risk === 'High Risk' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {sample.risk}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{sample.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 italic">
                  "{sample.text}"
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                <span>Run Test</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works: College NLP & Forensic Architecture */}
      <section className="rounded-3xl bg-slate-900 text-slate-200 p-8 md:p-10 border border-slate-800 space-y-8">
        <div className="max-w-2xl">
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
            System Methodology
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            How ScamShield AI Analyzes Threats
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            The project pairs rule-based Natural Language Processing (NLP) heuristics with deep structural pattern recognition to yield transparent, explainable results suitable for academic evaluation.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono font-bold text-sm">
              01
            </div>
            <h4 className="text-sm font-bold text-white">Lexical Tokenization</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Splits input into tokens, normalizes letter casing, and identifies embedded links, currency symbols, and uppercase ratios.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-sm">
              02
            </div>
            <h4 className="text-sm font-bold text-white">Psychological Profiling</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates urgency scores, panic tactics, and credential harvesting keywords based on weighted cybersecurity dictionaries.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-mono font-bold text-sm">
              03
            </div>
            <h4 className="text-sm font-bold text-white">Structural URL Audit</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts hostname, evaluates protocol encryption, detects IP addresses, suspicious TLDs, and typosquatting substitutions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono font-bold text-sm">
              04
            </div>
            <h4 className="text-sm font-bold text-white">Scoring & SQLite Log</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Normalizes composite score (0-100), outputs human-readable safety tips, and records persistent forensic logs in database.
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Built using HTML, CSS, JavaScript, Python Flask, SQLite, and Basic AI/NLP</span>
          </div>
          <button
            onClick={() => onNavigate('college-code')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
          >
            <span>View Complete Flask & SQLite Codebase</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
};
