/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { HeroHome } from './components/HeroHome';
import { MessageChecker } from './components/MessageChecker';
import { UrlChecker } from './components/UrlChecker';
import { QrScanner } from './components/QrScanner';
import { HistoryView } from './components/HistoryView';
import { CollegeProjectDocs } from './components/CollegeProjectDocs';
import { ScanResult, SystemStats } from './types';
import { ShieldAlert, Heart, ExternalLink } from 'lucide-react';

const INITIAL_FALLBACK_HISTORY: ScanResult[] = [
  {
    id: 'scan_init_1',
    type: 'message',
    input: 'URGENT: Your Chase bank account has been suspended due to unauthorized access. Click http://chase-security-restore.xyz to verify your identity within 24 hours.',
    riskLevel: 'High Risk',
    riskScore: 92,
    category: 'Phishing & Credential Theft',
    summary: 'High probability of cyber scam or phishing attempt. Take defensive actions.',
    reasons: [
      'High psychological pressure: Message forces immediate panic or artificial deadlines.',
      'Credential harvesting risk: Asks for OTP, password, account verification, or personal identity.',
      'Brand or Institution impersonation: Names reputable banks, parcel carriers, or tech support.',
      'Contains high-risk link: http://chase-security-restore.xyz'
    ],
    safetyTips: [
      'Do not click any link or call numbers provided in this message.',
      'Never share OTPs, PINs, passwords, or CVV numbers with anyone.',
      'Legitimate banks and agencies never ask for sensitive credentials via text message.',
      'Block the sender and report as spam on your device.'
    ],
    highlights: ['urgent', 'account suspended', 'verify your account', 'within 24 hours'],
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'scan_init_2',
    type: 'url',
    input: 'http://192.168.1.100/paypal/login.php',
    riskLevel: 'High Risk',
    riskScore: 88,
    category: 'Direct IP Attack Vector',
    summary: 'High-risk malicious or deceptive web address detected.',
    reasons: [
      'Insecure connection: Uses unencrypted HTTP rather than HTTPS.',
      'Direct IP hostname (192.168.1.100) used instead of legitimate registered domain name.',
      'Potential brand impersonation: Uses brand name "paypal" inside an unverified domain.',
      'Contains high-risk credential keywords: [login]'
    ],
    safetyTips: [
      'Do NOT visit this link or input any passwords or personal details.',
      'The domain exhibits active deception characteristics typical of credential harvesters.',
      'If you already visited, immediately change passwords for related accounts.'
    ],
    highlights: ['192.168.1.100', 'paypal', 'login'],
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'scan_init_3',
    type: 'qr',
    input: 'https://www.stanford.edu/academics/courses',
    riskLevel: 'Safe',
    riskScore: 0,
    category: 'Academic / Safe',
    summary: 'URL appears to be structurally valid and standard.',
    reasons: [
      'Decoded QR payload type: [URL]',
      'Domain syntax follows legitimate structure with standard encryption and reputable TLD.'
    ],
    safetyTips: [
      'Always preview the decoded URL or destination before clicking or accepting permissions.',
      'Standard safe browsing: Ensure the lock icon is present and never reuse master passwords.'
    ],
    highlights: [],
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString()
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [initialMessageTarget, setInitialMessageTarget] = useState<string>('');
  const [initialUrlTarget, setInitialUrlTarget] = useState<string>('');

  // Fetch initial history from server, fallback to localStorage/preset
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setHistory(data);
          return;
        }
      }
    } catch {
      // offline or dev fallback
    }

    const localSaved = localStorage.getItem('scamshield_history');
    if (localSaved) {
      try {
        setHistory(JSON.parse(localSaved));
        return;
      } catch {
        // fallback
      }
    }

    setHistory(INITIAL_FALLBACK_HISTORY);
  };

  const handleScanComplete = (newScan: ScanResult) => {
    setHistory(prev => {
      const updated = [newScan, ...prev.filter(item => item.id !== newScan.id)].slice(0, 100);
      try {
        localStorage.setItem('scamshield_history', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    // Fire & forget sync to server
    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newScan)
    }).catch(() => {});
  };

  const handleClearHistory = async () => {
    setHistory([]);
    localStorage.removeItem('scamshield_history');
    try {
      await fetch('/api/history', { method: 'DELETE' });
    } catch {
      // ignore
    }
  };

  const handleDeleteItem = async (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    try {
      localStorage.setItem('scamshield_history', JSON.stringify(updated));
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
  };

  // Quick scan router from Home page
  const handleQuickScan = (input: string) => {
    const isUrl = /^https?:\/\//i.test(input) ||
      (input.includes('.') && !input.includes(' ') && (input.startsWith('www.') || input.length < 100));

    if (isUrl) {
      setInitialUrlTarget(input);
      setActiveTab('url');
    } else {
      setInitialMessageTarget(input);
      setActiveTab('message');
    }
  };

  // Compute stats
  const totalScans = history.length;
  const safeCount = history.filter(h => h.riskLevel === 'Safe').length;
  const suspiciousCount = history.filter(h => h.riskLevel === 'Suspicious').length;
  const highRiskCount = history.filter(h => h.riskLevel === 'High Risk').length;
  const avgRiskScore = totalScans > 0
    ? Math.round(history.reduce((acc, h) => acc + (h.riskScore || 0), 0) / totalScans)
    : 0;

  const stats: SystemStats = {
    totalScans,
    safeCount,
    suspiciousCount,
    highRiskCount,
    avgRiskScore
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {activeTab === 'home' && (
          <HeroHome
            onNavigate={setActiveTab}
            stats={stats}
            onQuickScan={handleQuickScan}
          />
        )}

        {activeTab === 'message' && (
          <MessageChecker
            onScanComplete={handleScanComplete}
            initialMessage={initialMessageTarget}
          />
        )}

        {activeTab === 'url' && (
          <UrlChecker
            onScanComplete={handleScanComplete}
            initialUrl={initialUrlTarget}
          />
        )}

        {activeTab === 'qr' && (
          <QrScanner onScanComplete={handleScanComplete} />
        )}

        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onClearHistory={handleClearHistory}
            onDeleteItem={handleDeleteItem}
            onRefreshHistory={fetchHistory}
          />
        )}

        {activeTab === 'college-code' && (
          <CollegeProjectDocs />
        )}
      </main>

      {/* College Project Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600/30 flex items-center justify-center text-cyan-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="font-bold text-white">ScamShield AI</span>
            <span className="text-slate-500">|</span>
            <span>College Cybersecurity Project</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <button
              onClick={() => setActiveTab('college-code')}
              className="hover:text-cyan-400 transition-colors"
            >
              System Architecture & Flask Source
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('history')}
              className="hover:text-cyan-400 transition-colors"
            >
              Audit Logs & CSV Export
            </button>
            <span>•</span>
            <span>SQLite Database Engine</span>
          </div>

          <p className="text-[11px] text-slate-500">
            For academic demonstration & cyber defense research.
          </p>
        </div>
      </footer>
    </div>
  );
}
