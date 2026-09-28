import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  Clipboard,
  Trash2,
  Send,
  Loader2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { ScanResult } from '../types';
import { ResultCard } from './ResultCard';
import { analyzeMessageText } from '../utils/nlpEngine';

interface MessageCheckerProps {
  onScanComplete: (result: ScanResult) => void;
  initialMessage?: string;
}

export const MessageChecker: React.FC<MessageCheckerProps> = ({
  onScanComplete,
  initialMessage = ''
}) => {
  const [message, setMessage] = useState(initialMessage);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleMessages = [
    {
      label: 'Bank Account Frozen',
      category: 'Phishing',
      text: 'URGENT: Your Chase bank account has been suspended due to unauthorized access. Click http://chase-security-restore.xyz to verify your identity within 24 hours.'
    },
    {
      label: 'Lottery Prize Winner',
      category: 'Financial Scam',
      text: 'Congratulations! You won $50,000 in the Amazon 2026 Customer Draw. Pay $25 processing fee via Apple Gift Card immediately to release your cash reward.'
    },
    {
      label: 'Work From Home Scam',
      category: 'Job Fraud',
      text: 'Earn $500/day working 1 hour from home! No experience required. Daily payout guaranteed. Contact recruitment manager on Telegram @daily_income_now.'
    },
    {
      label: 'Fake FedEx Delivery',
      category: 'Package Scam',
      text: 'FedEx: Your parcel #FX-9982 is on hold at customs. Update your delivery address and pay $1.50 clearance fee at http://fedx-package-clear.top'
    },
    {
      label: 'Safe Campus Notice',
      category: 'Safe / Normal',
      text: 'Reminder: College library will remain open until midnight throughout finals week. Please return reserved textbooks to the front desk by Friday.'
    }
  ];

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setMessage(text);
        setError(null);
      }
    } catch {
      setError('Unable to read from clipboard. Please paste manually into the box.');
    }
  };

  const handleClear = () => {
    setMessage('');
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanText = message.trim();
    if (!cleanText) {
      setError('Please enter or paste a message to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First attempt server endpoint with Gemini AI / Express
      const response = await fetch('/api/scan/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: cleanText })
      });

      if (response.ok) {
        const data: ScanResult = await response.json();
        setResult(data);
        onScanComplete(data);
      } else {
        // Fallback to client-side NLP engine
        const fallbackResult = analyzeMessageText(cleanText);
        setResult(fallbackResult);
        onScanComplete(fallbackResult);
      }
    } catch {
      // Network fallback to instant client-side NLP
      const fallbackResult = analyzeMessageText(cleanText);
      setResult(fallbackResult);
      onScanComplete(fallbackResult);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Message Checker</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Evaluate text messages, SMS, emails, or chat messages for psychological manipulation, phishing, and fraud.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg w-fit">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>NLP Urgency + AI Heuristics</span>
        </div>
      </div>

      {/* Quick Test Preset Pills */}
      <div>
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-blue-600" />
          <span>Quick Test Presets (Click to Load)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {sampleMessages.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setMessage(sample.text);
                setError(null);
                setResult(null);
              }}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all text-left ${
                sample.category.includes('Safe')
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
              }`}
            >
              <span className="font-bold">{sample.label}</span>
              <span className="text-[10px] text-slate-400 block">{sample.category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleAnalyze} className="space-y-3">
        <div className="relative rounded-2xl border border-slate-300 bg-white shadow-xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Paste Message Content</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePaste}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md shadow-2xs transition-colors cursor-pointer"
              >
                <Clipboard className="w-3.5 h-3.5 text-slate-500" />
                <span>Paste</span>
              </button>
              {message && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          <textarea
            rows={5}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setError(null);
            }}
            placeholder="e.g. URGENT: Your PayPal account has been limited due to suspicious login attempts. Verify immediately at http://secure-paypal-alert.xyz or your funds will be frozen."
            className="w-full p-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-y"
          />

          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-400">
            <span>Characters: {message.length}</span>
            <span>Supports SMS, WhatsApp, Email text & Direct Messages</span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Private & confidential inspection
          </span>

          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing NLP Patterns...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Check Message Risk</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Result Card */}
      {result && <ResultCard result={result} onClear={handleClear} />}
    </div>
  );
};
