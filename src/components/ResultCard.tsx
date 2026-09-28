import React, { useState } from 'react';
import { ScanResult } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  Sparkles,
  Info,
  Lock,
  Unlock,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ResultCardProps {
  result: ScanResult;
  onClear?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onClear }) => {
  const [copied, setCopied] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const getRiskColors = (risk: string) => {
    switch (risk) {
      case 'High Risk':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          badge: 'bg-rose-600 text-white shadow-rose-200',
          meter: 'bg-rose-500',
          border: 'border-rose-300',
          ring: 'ring-rose-400',
          icon: ShieldAlert,
          iconColor: 'text-rose-600'
        };
      case 'Suspicious':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-900',
          badge: 'bg-amber-500 text-white shadow-amber-200',
          meter: 'bg-amber-500',
          border: 'border-amber-300',
          ring: 'ring-amber-400',
          icon: AlertTriangle,
          iconColor: 'text-amber-600'
        };
      case 'Safe':
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          badge: 'bg-emerald-600 text-white shadow-emerald-200',
          meter: 'bg-emerald-500',
          border: 'border-emerald-300',
          ring: 'ring-emerald-400',
          icon: ShieldCheck,
          iconColor: 'text-emerald-600'
        };
    }
  };

  const colors = getRiskColors(result.riskLevel);
  const IconComponent = colors.icon;

  const copyReport = () => {
    const reportText = `[ScamShield AI Scan Report]
Verdict: ${result.riskLevel} (${result.riskScore}/100)
Category: ${result.category || 'General'}
Input: ${result.input}
Reasons:
${result.reasons.map((r, i) => ` ${i + 1}. ${r}`).join('\n')}
Safety Tips:
${result.safetyTips.map((t, i) => ` • ${t}`).join('\n')}
Scan Time: ${new Date(result.timestamp).toLocaleString()}
`;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`mt-6 rounded-2xl border ${colors.border} bg-white shadow-lg overflow-hidden transition-all duration-300`}>
      {/* Top Banner Status */}
      <div className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3 ${colors.bg}`}>
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-white/80 shadow-xs">
            <IconComponent className={`w-7 h-7 ${colors.iconColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-xs ${colors.badge}`}>
                {result.riskLevel}
              </span>
              {result.category && (
                <span className="text-xs font-medium text-slate-600 bg-white/70 px-2.5 py-0.5 rounded-full border border-slate-200">
                  {result.category}
                </span>
              )}
              {result.nlpDetails?.aiAssisted && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-indigo-500" /> AI Verified
                </span>
              )}
            </div>
            <p className="text-sm font-semibold mt-1 text-slate-800">{result.summary}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={copyReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors"
            title="Copy Report to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            {copied ? 'Copied' : 'Copy Report'}
          </button>
          {onClear && (
            <button
              onClick={onClear}
              className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Scan Another
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Risk Score Gauge & Meter */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Composite Risk Score
            </span>
            <span className={`text-base font-extrabold ${result.riskScore > 60 ? 'text-rose-600' : result.riskScore > 25 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {result.riskScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
            </span>
          </div>

          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5 flex">
            <div
              className={`h-full rounded-full transition-all duration-700 ${colors.meter}`}
              style={{ width: `${Math.max(4, result.riskScore)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
            <span>0 Safe</span>
            <span>30 Suspicious</span>
            <span>65+ High Risk</span>
          </div>
        </div>

        {/* Input Preview / Highlighted Keywords */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
            Analyzed Input
          </label>
          <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs break-all max-h-36 overflow-y-auto leading-relaxed border border-slate-800">
            {result.input}
          </div>
          {result.highlights && result.highlights.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500">Trigger Keywords:</span>
              {result.highlights.map((kw, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200 rounded-md"
                >
                  "{kw}"
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Two Columns: Simple Reasons & Safety Tips */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Reasons */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-amber-100 text-amber-700">
                <Info className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Detected Signals & Reasons</h4>
            </div>
            <ul className="space-y-2">
              {result.reasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Safety Tips */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-emerald-100 text-emerald-700">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Recommended Safety Tips</h4>
            </div>
            <ul className="space-y-2">
              {result.safetyTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                  <span className="text-emerald-600 font-bold text-xs shrink-0">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Forensic / Technical Dropdown */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="flex items-center justify-between w-full text-xs font-medium text-slate-500 hover:text-slate-800 py-1 transition-colors"
          >
            <span>College Forensic Breakdown (NLP Lexical & Protocol Data)</span>
            {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showTechnicalDetails && (
            <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 font-mono">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-slate-400 text-[10px]">SCAN ID</div>
                  <div className="font-semibold text-slate-700 truncate">{result.id}</div>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-slate-400 text-[10px]">TIMESTAMP</div>
                  <div className="font-semibold text-slate-700 truncate">{new Date(result.timestamp).toLocaleTimeString()}</div>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-slate-400 text-[10px]">TYPE</div>
                  <div className="font-semibold text-slate-700 uppercase">{result.type}</div>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-slate-400 text-[10px]">EVAL ENGINE</div>
                  <div className="font-semibold text-slate-700">{result.nlpDetails?.aiAssisted ? 'Hybrid NLP + Gemini' : 'Rule-based NLP Engine'}</div>
                </div>
              </div>

              {result.urlDetails && (
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <div className="text-[11px] font-bold text-slate-700 mb-1">URL Structural Analysis:</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 text-[11px]">
                    <span className="flex items-center gap-1">
                      {result.urlDetails.isHttps ? <Lock className="w-3 h-3 text-emerald-600" /> : <Unlock className="w-3 h-3 text-rose-500" />}
                      Protocol: {result.urlDetails.protocol}
                    </span>
                    <span>Host: {result.urlDetails.hostname}</span>
                    <span>IP Address: {result.urlDetails.isIpAddress ? 'Yes (Flagged)' : 'No'}</span>
                    <span>Shortener: {result.urlDetails.isShortener ? 'Yes (Masked)' : 'No'}</span>
                    <span>Suspicious TLD: {result.urlDetails.suspiciousTld ? 'Yes (Flagged)' : 'No'}</span>
                    <span>Subdomains: {result.urlDetails.excessiveSubdomains ? 'Nested (Flagged)' : 'Normal'}</span>
                  </div>
                </div>
              )}

              {result.nlpDetails && (
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <div className="text-[11px] font-bold text-slate-700 mb-1">NLP Psychological Metrics:</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 text-[11px]">
                    <span>Urgency Level: <strong className="text-slate-800">{result.nlpDetails.urgencyLevel}</strong></span>
                    <span>Sentiment Tone: <strong className="text-slate-800">{result.nlpDetails.sentiment}</strong></span>
                    <span>Financial Intent: <strong className="text-slate-800">{result.nlpDetails.financialIntent ? 'Detected' : 'None'}</strong></span>
                    <span>Fear/Coercion: <strong className="text-slate-800">{result.nlpDetails.threatOrFearTactics ? 'Detected' : 'None'}</strong></span>
                    <span>Embedded Links: <strong className="text-slate-800">{result.nlpDetails.extractedUrls.length}</strong></span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
