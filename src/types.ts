export type RiskLevel = 'Safe' | 'Suspicious' | 'High Risk';

export type ScanType = 'message' | 'url' | 'qr';

export interface ScanResult {
  id: string;
  type: ScanType;
  input: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100
  summary: string;
  reasons: string[];
  safetyTips: string[];
  category?: string;
  highlights?: string[];
  nlpDetails?: {
    urgencyLevel: 'None' | 'Moderate' | 'High' | 'Extreme';
    financialIntent: boolean;
    threatOrFearTactics: boolean;
    extractedUrls: string[];
    sentiment: string;
    flaggedKeywords: string[];
    aiAssisted?: boolean;
  };
  urlDetails?: {
    protocol: string;
    hostname: string;
    pathname: string;
    isHttps: boolean;
    isIpAddress: boolean;
    isShortener: boolean;
    suspiciousTld: boolean;
    brandImpersonation?: string;
    excessiveSubdomains: boolean;
    hasPhishingKeywords: boolean;
  };
  qrDetails?: {
    rawContent: string;
    contentType: 'URL' | 'Text' | 'Phone' | 'Email' | 'Other';
  };
  timestamp: string;
}

export interface SystemStats {
  totalScans: number;
  safeCount: number;
  suspiciousCount: number;
  highRiskCount: number;
  avgRiskScore: number;
}
