import { ScanResult, RiskLevel } from '../types';
import { analyzeUrlString } from './urlEngine';

// Dictionary of scam triggers grouped by category
const SCAM_PATTERNS = {
  urgency: [
    'immediately', 'urgent', 'action required', 'account suspended', 'account frozen',
    'within 24 hours', 'within 12 hours', 'expires today', 'final notice', 'final warning',
    'last chance', 'act now', 'locked out', 'unauthorized access', 'security alert',
    'arrest warrant', 'legal action', 'police case', 'law enforcement', 'terminated'
  ],
  financial: [
    'wire transfer', 'crypto', 'bitcoin', 'usdt', 'gift card', 'steam card', 'apple card',
    'lottery', 'winner', 'claim your prize', 'cash reward', 'free money', 'inheritance',
    'tax refund', 'irs refund', 'unclaimed funds', 'western union', 'cashapp', 'venmo balance',
    'deposit now', 'investment return', 'guaranteed profit', 'double your money'
  ],
  credentials: [
    'verify your account', 'verify identity', 'confirm password', 'enter otp', 'share otp',
    'one-time password', 'security pin', 'cvv', 'card number', 'ssn', 'social security',
    'click the link below', 'click here to verify', 'update payment details', 're-activate account',
    'login immediately', 'reset password now'
  ],
  impersonation: [
    'paypal support', 'netflix billing', 'amazon security', 'bank of america', 'wells fargo',
    'chase bank', 'usps delivery', 'fedex package', 'dhl shipment', 'apple care', 'microsoft support',
    'geek squad', 'norton renewal', 'mcafee subscription', 'customs officer', 'tax department'
  ],
  jobScam: [
    'work from home', 'earn $500', 'earn $1000', 'part time job', 'no experience required',
    'daily payout', 'contact via telegram', 'whatsapp recruiter', 'data entry operator',
    'exclusive investment', 'trading bot'
  ]
};

// URL regex to find embedded links in text
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}\/[^\s]*)/gi;

export function analyzeMessageText(text: string): ScanResult {
  const cleanText = text.trim();
  const lowerText = cleanText.toLowerCase();

  const matchedKeywords: string[] = [];
  const reasons: string[] = [];
  const safetyTips: string[] = [];

  let urgencyScore = 0;
  let financialScore = 0;
  let credentialScore = 0;
  let impersonationScore = 0;
  let jobScamScore = 0;

  // Check urgency triggers
  SCAM_PATTERNS.urgency.forEach(phrase => {
    if (lowerText.includes(phrase)) {
      matchedKeywords.push(phrase);
      urgencyScore += 12;
    }
  });

  // Check financial triggers
  SCAM_PATTERNS.financial.forEach(phrase => {
    if (lowerText.includes(phrase)) {
      matchedKeywords.push(phrase);
      financialScore += 15;
    }
  });

  // Check credentials triggers
  SCAM_PATTERNS.credentials.forEach(phrase => {
    if (lowerText.includes(phrase)) {
      matchedKeywords.push(phrase);
      credentialScore += 18;
    }
  });

  // Check impersonation triggers
  SCAM_PATTERNS.impersonation.forEach(phrase => {
    if (lowerText.includes(phrase)) {
      matchedKeywords.push(phrase);
      impersonationScore += 14;
    }
  });

  // Check job scam triggers
  SCAM_PATTERNS.jobScam.forEach(phrase => {
    if (lowerText.includes(phrase)) {
      matchedKeywords.push(phrase);
      jobScamScore += 14;
    }
  });

  // Check for embedded URLs
  const extractedUrls = cleanText.match(URL_REGEX) || [];
  let urlRiskBonus = 0;

  if (extractedUrls.length > 0) {
    for (const urlStr of extractedUrls) {
      const urlAnalysis = analyzeUrlString(urlStr);
      if (urlAnalysis.riskLevel === 'High Risk') {
        urlRiskBonus += 25;
        reasons.push(`Contains high-risk link: ${urlStr}`);
      } else if (urlAnalysis.riskLevel === 'Suspicious') {
        urlRiskBonus += 15;
        reasons.push(`Contains suspicious link: ${urlStr}`);
      } else {
        urlRiskBonus += 5;
      }
    }
  }

  // Check excessive uppercase (SHOUTING / urgency)
  const uppercaseCount = (cleanText.match(/[A-Z]/g) || []).length;
  const lettersCount = (cleanText.match(/[a-zA-Z]/g) || []).length;
  if (lettersCount > 15 && uppercaseCount / lettersCount > 0.45) {
    urgencyScore += 8;
    reasons.push('Excessive uppercase characters detected (intimidation/urgency tactic)');
  }

  // Check for suspicious phone formatting or currency signs
  const currencyMatches = (cleanText.match(/[$€£₹]\s?[0-9,]+/g) || []).length;
  if (currencyMatches >= 2) {
    financialScore += 6;
  }

  // Build Reasons
  if (urgencyScore >= 12) {
    reasons.push('High psychological pressure: Message forces immediate panic or artificial deadlines.');
  }
  if (credentialScore >= 15) {
    reasons.push('Credential harvesting risk: Asks for OTP, password, account verification, or personal identity.');
  }
  if (financialScore >= 15) {
    reasons.push('Suspicious financial claim: Involves unverified winnings, prizes, refunds, crypto, or gift cards.');
  }
  if (impersonationScore >= 14) {
    reasons.push('Brand or Institution impersonation: Names reputable banks, parcel carriers, or tech support.');
  }
  if (jobScamScore >= 14) {
    reasons.push('Unrealistic employment lure: Promotes high daily earnings with no experience or directs to Telegram.');
  }

  // Calculate Base Risk Score (0 - 100)
  let totalScore = urgencyScore + financialScore + credentialScore + impersonationScore + jobScamScore + urlRiskBonus;
  
  // Normalize
  totalScore = Math.min(100, Math.max(0, totalScore));

  // Determine Category
  let category = 'General Communication';
  if (credentialScore > 0 || (impersonationScore > 0 && extractedUrls.length > 0)) {
    category = 'Phishing & Credential Theft';
  } else if (financialScore >= 15) {
    category = 'Financial & Lottery Fraud';
  } else if (jobScamScore >= 14) {
    category = 'Task & Job Offer Scam';
  } else if (impersonationScore >= 14) {
    category = 'Brand Impersonation Scam';
  } else if (urgencyScore >= 12) {
    category = 'Panic / Extortion Tactic';
  }

  // Determine Risk Level
  let riskLevel: RiskLevel = 'Safe';
  if (totalScore >= 60 || credentialScore >= 25 || (impersonationScore >= 14 && extractedUrls.length > 0)) {
    riskLevel = 'High Risk';
  } else if (totalScore >= 25) {
    riskLevel = 'Suspicious';
  }

  // Build Safety Tips
  if (riskLevel === 'High Risk') {
    safetyTips.push('Do not click any link or call numbers provided in this message.');
    safetyTips.push('Never share OTPs, PINs, passwords, or CVV numbers with anyone.');
    safetyTips.push('Legitimate banks and agencies never ask for sensitive credentials via text message.');
    safetyTips.push('Block the sender and report as spam on your device.');
  } else if (riskLevel === 'Suspicious') {
    safetyTips.push('Double-check the sender identity through official customer service channels.');
    safetyTips.push('Avoid opening links directly; type the known official website into your browser.');
    safetyTips.push('Be cautious of unsolicited promotions or unexpected delivery notifications.');
  } else {
    reasons.push('No obvious phishing triggers, coercion, or deceptive keywords detected.');
    safetyTips.push('Always practice safe browsing and never share confidential account details.');
  }

  // Urgency label
  let urgencyLevel: 'None' | 'Moderate' | 'High' | 'Extreme' = 'None';
  if (urgencyScore >= 24) urgencyLevel = 'Extreme';
  else if (urgencyScore >= 12) urgencyLevel = 'High';
  else if (urgencyScore > 0) urgencyLevel = 'Moderate';

  return {
    id: 'scan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    type: 'message',
    input: cleanText,
    riskLevel,
    riskScore: totalScore,
    category,
    summary: riskLevel === 'High Risk'
      ? 'High probability of cyber scam or phishing attempt. Take defensive actions.'
      : riskLevel === 'Suspicious'
        ? 'Suspicious elements identified. Proceed with elevated caution.'
        : 'Message appears normal with standard conversational tone.',
    reasons: reasons.slice(0, 5),
    safetyTips: safetyTips.slice(0, 4),
    highlights: Array.from(new Set(matchedKeywords)),
    nlpDetails: {
      urgencyLevel,
      financialIntent: financialScore > 0,
      threatOrFearTactics: urgencyScore >= 12,
      extractedUrls,
      sentiment: urgencyScore > 10 ? 'Alarmist / Coercive' : financialScore > 10 ? 'Enticing / Promotional' : 'Neutral',
      flaggedKeywords: Array.from(new Set(matchedKeywords)),
      aiAssisted: false
    },
    timestamp: new Date().toISOString()
  };
}
