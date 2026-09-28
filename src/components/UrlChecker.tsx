import React, { useState } from 'react';
import {
  Globe,
  Search,
  Clipboard,
  Trash2,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Tag,
  ExternalLink,
  Lock,
  Unlock,
  Layers
} from 'lucide-react';
import { ScanResult } from '../types';
import { ResultCard } from './ResultCard';
import { analyzeUrlString } from '../utils/urlEngine';

interface UrlCheckerProps {
  onScanComplete: (result: ScanResult) => void;
  initialUrl?: string;
}

export const UrlChecker: React.FC<UrlCheckerProps> = ({
  onScanComplete,
  initialUrl = ''
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleUrls = [
    {
      label: 'Direct IP Phishing',
      category: 'Raw IP Host',
      url: 'http://192.168.1.100/paypal/login.php'
    },
    {
      label: 'Abused TLD + Brand Spoof',
      category: 'Fake Domain',
      url: 'http://secure-chase-update.verify-account.xyz/login'
    },
    {
      label: 'Typosquatting Link',
      category: 'Deceptive Character',
      url: 'http://paypa1-update-security.com/signin'
    },
    {
      label: 'Shortened Link',
      category: 'Masked Destination',
      url: 'https://bit.ly/campus-exclusive-prizes'
    },
    {
      label: 'Safe University Portal',
      category: 'Legitimate HTTPS',
      url: 'https://www.stanford.edu/academics/courses'
    }
  ];

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setError(null);
      }
    } catch {
      setError('Unable to read clipboard. Please paste manually.');
    }
  };

  const handleClear = () => {
    setUrl('');
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUrl = url.trim();
    if (!cleanUrl) {
      setError('Please enter a web address (URL) to evaluate.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/scan/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl })
      });

      if (response.ok) {
        const data: ScanResult = await response.json();
        setResult(data);
        onScanComplete(data);
      } else {
        const fallback = analyzeUrlString(cleanUrl);
        setResult(fallback);
        onScanComplete(fallback);
      }
    } catch {
      const fallback = analyzeUrlString(cleanUrl);
      setResult(fallback);
      onScanComplete(fallback);
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
            <div className="p-2 rounded-xl bg-cyan-100 text-cyan-700">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">URL Checker</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Detect suspicious domain patterns, IP hostnames, abusive TLDs, and brand typosquatting in web links.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg w-fit">
          <Layers className="w-3.5 h-3.5 text-cyan-600" />
          <span>7-Point Heuristic Inspection</span>
        </div>
      </div>

      {/* Preset Pills */}
      <div>
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-cyan-600" />
          <span>Test Preset URLs (Click to Inspect)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {sampleUrls.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setUrl(sample.url);
                setError(null);
                setResult(null);
              }}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all text-left ${
                sample.category.includes('Safe') || sample.category.includes('Legitimate')
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/50'
              }`}
            >
              <span className="font-bold">{sample.label}</span>
              <span className="text-[10px] text-slate-400 block truncate max-w-xs">{sample.url}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAnalyze} className="space-y-3">
        <div className="rounded-2xl border border-slate-300 bg-white p-2 shadow-xs focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
          <div className="flex items-center gap-2">
            <div className="pl-3 text-slate-400">
              <Globe className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              placeholder="e.g. http://secure-login-chase.update-portal.xyz/verify.php"
              className="w-full py-3 px-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            {url && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                title="Clear"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handlePaste}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Paste
            </button>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Inspecting...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Inspect URL</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" /> SSL / Protocol
            </span>
            <span>•</span>
            <span>Domain Typosquatting</span>
            <span>•</span>
            <span>Disposable TLDs</span>
          </div>
          <span>Safe browsing pre-screening</span>
        </div>
      </form>

      {/* Result Card */}
      {result && <ResultCard result={result} onClear={handleClear} />}
    </div>
  );
};
