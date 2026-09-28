import React, { useState } from 'react';
import {
  History,
  Trash2,
  Download,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  MessageSquare,
  Globe,
  QrCode,
  Calendar,
  ExternalLink,
  Check,
  ChevronRight,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { ScanResult, RiskLevel, ScanType } from '../types';
import { ResultCard } from './ResultCard';

interface HistoryViewProps {
  history: ScanResult[];
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
  onRefreshHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onClearHistory,
  onDeleteItem,
  onRefreshHistory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ScanType>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | RiskLevel>('all');
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);

  // Filtered list
  const filteredHistory = history.filter(item => {
    const matchesSearch = item.input.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesRisk = riskFilter === 'all' || item.riskLevel === riskFilter;

    return matchesSearch && matchesType && matchesRisk;
  });

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scamshield_audit_history_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = ['ID', 'Type', 'Risk Level', 'Risk Score', 'Category', 'Input', 'Summary', 'Timestamp'];
    const rows = history.map(item => [
      `"${item.id}"`,
      `"${item.type}"`,
      `"${item.riskLevel}"`,
      item.riskScore,
      `"${(item.category || '').replace(/"/g, '""')}"`,
      `"${item.input.replace(/"/g, '""')}"`,
      `"${item.summary.replace(/"/g, '""')}"`,
      `"${item.timestamp}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scamshield_scan_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTypeIcon = (type: ScanType) => {
    switch (type) {
      case 'message': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'url': return <Globe className="w-4 h-4 text-cyan-500" />;
      case 'qr': return <QrCode className="w-4 h-4 text-indigo-500" />;
    }
  };

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'High Risk':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">High Risk</span>;
      case 'Suspicious':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">Suspicious</span>;
      case 'Safe':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">Safe</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <History className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Scan History & Audit Logs</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse previous scam detections, risk scores, forensic reasons, and safety recommendations.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRefreshHistory}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh History"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportCSV}
            disabled={history.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
            title="Export CSV for College Submission"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportJSON}
            disabled={history.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all scan history?')) {
                onClearHistory();
              }
            }}
            disabled={history.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keywords, URLs, or category..."
              className="w-full pl-9 pr-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-slate-500 mr-1">Type:</span>
            {(['all', 'message', 'url', 'qr'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  typeFilter === t ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Risk Filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-slate-500 mr-1">Risk:</span>
            {(['all', 'Safe', 'Suspicious', 'High Risk'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  riskFilter === r ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
          <span>Showing {filteredHistory.length} of {history.length} records</span>
          <span>Records persisted in SQLite / local storage</span>
        </div>
      </div>

      {/* Selected Scan Detail Modal / Expand */}
      {selectedScan && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Inspection Forensic Details</h3>
            <button
              onClick={() => setSelectedScan(null)}
              className="text-xs text-blue-600 hover:underline"
            >
              Close Details
            </button>
          </div>
          <ResultCard result={selectedScan} onClear={() => setSelectedScan(null)} />
        </div>
      )}

      {/* List / Cards */}
      {filteredHistory.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Scan Records Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            {searchTerm || typeFilter !== 'all' || riskFilter !== 'all'
              ? 'No scans match your current filter criteria. Try clearing search filters.'
              : 'Scan results from Message Checker, URL Inspector, or QR Scanner will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                  {getTypeIcon(item.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {getRiskBadge(item.riskLevel)}
                    <span className="text-xs font-bold text-slate-600">
                      Score: {item.riskScore}/100
                    </span>
                    {item.category && (
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 ml-auto">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-slate-800 truncate">
                    {item.input}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {item.summary}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => setSelectedScan(item)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  View Report
                </button>
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
