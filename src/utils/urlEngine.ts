import { ScanResult, RiskLevel } from '../types';

const SUSPICIOUS_TLDS = [
  '.xyz', '.top', '.click', '.loan', '.work', '.gq', '.cf', '.tk', '.ml',
  '.country', '.zip', '.mov', '.buzz', '.fit', '.rest', '.bar', '.cam',
  '.sbs', '.monster', '.support', '.kim', '.icu', '.uno'
];

const KNOWN_SHORTENERS = [
  'bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'cutt.ly', 'rb.gy', 'ow.ly',
  'buff.ly', 'rebrand.ly', 'shorturl.at', 'bl.ink'
];

const POPULAR_BRANDS = [
  'paypal', 'amazon', 'apple', 'google', 'netflix', 'microsoft', 'facebook',
  'instagram', 'chase', 'wellsfargo', 'bankofamerica', 'citibank', 'usps',
  'fedex', 'dhl', 'walmart', 'binance', 'coinbase', 'metamask', 'steam'
];

const PHISHING_KEYWORDS = [
  'login', 'signin', 'log-in', 'sign-in', 'verify', 'verification', 'secure',
  'account', 'security', 'banking', 'update', 'auth', 'authorize', 'confirm',
  'recover', 'restore', 'wallet', 'crypto', 'validate', 'portal', 'ebayisapi',
  'webscr', 'password', 'credential', 'billing', 'invoice'
];

export function analyzeUrlString(rawInput: string): ScanResult {
  const cleanInput = rawInput.trim();
  let testUrl = cleanInput;

  // Add protocol if missing for URL parsing
  if (!/^https?:\/\//i.test(testUrl)) {
    testUrl = 'https://' + testUrl;
  }

  let parsed: URL | null = null;
  try {
    parsed = new URL(testUrl);
  } catch {
    // Malformed URL
    return {
      id: 'scan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      type: 'url',
      input: cleanInput,
      riskLevel: 'Suspicious',
      riskScore: 65,
      category: 'Malformed / Invalid URL',
      summary: 'The input does not conform to standard URL format and may be an obfuscated exploit.',
      reasons: ['Malformed or invalid URL syntax', 'Potential URI injection attempt'],
      safetyTips: ['Do not paste unverified or fragmented URLs in your address bar.'],
      timestamp: new Date().toISOString()
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const pathname = (parsed.pathname + parsed.search + parsed.hash).toLowerCase();
  const protocol = parsed.protocol.toLowerCase();

  const reasons: string[] = [];
  const safetyTips: string[] = [];
  const highlights: string[] = [];
  let riskScore = 0;

  // 1. Protocol check
  const isHttps = protocol === 'https:';
  if (!isHttps) {
    riskScore += 25;
    reasons.push('Insecure connection: Uses unencrypted HTTP rather than HTTPS.');
    highlights.push('http://');
  }

  // 2. IP Address as Hostname
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const isIpAddress = ipv4Regex.test(hostname);
  if (isIpAddress) {
    riskScore += 45;
    reasons.push(`Direct IP hostname (${hostname}) used instead of legitimate registered domain name.`);
    highlights.push(hostname);
  }

  // 3. Suspicious / Abused TLD
  const matchedTld = SUSPICIOUS_TLDS.find(tld => hostname.endsWith(tld));
  const suspiciousTld = Boolean(matchedTld);
  if (suspiciousTld && matchedTld) {
    riskScore += 25;
    reasons.push(`Suspicious top-level domain (${matchedTld}) frequently correlated with disposable phishing sites.`);
    highlights.push(matchedTld);
  }

  // 4. URL Shortener detection
  const isShortener = KNOWN_SHORTENERS.some(short => hostname === short || hostname.endsWith('.' + short));
  if (isShortener) {
    riskScore += 25;
    reasons.push('URL shortener service detected: The true final destination is hidden.');
    highlights.push(hostname);
  }

  // 5. Brand Impersonation / Typosquatting in Domain or Subdomains
  let brandImpersonation: string | undefined;
  for (const brand of POPULAR_BRANDS) {
    // Check if brand is in hostname but NOT the official root domain
    // E.g., paypal.com.evil.com or secure-paypal-verify.com
    const brandInHost = hostname.includes(brand);
    const isOfficial = hostname === `${brand}.com` || hostname.endsWith(`.${brand}.com`) ||
                       hostname === `${brand}.org` || hostname.endsWith(`.${brand}.org`);

    if (brandInHost && !isOfficial) {
      brandImpersonation = brand;
      riskScore += 40;
      reasons.push(`Potential brand impersonation: Uses brand name "${brand}" inside an unverified domain.`);
      highlights.push(brand);
      break;
    }

    // Levenshtein / visual spoofing (e.g. paypa1, amnazon, g00gle)
    const typoSubstitutions = [
      brand.replace(/l/g, '1'),
      brand.replace(/o/g, '0'),
      brand.replace(/e/g, '3'),
      brand.replace(/a/g, '4'),
      brand.replace(/i/g, '1'),
    ];
    for (const typo of typoSubstitutions) {
      if (typo !== brand && hostname.includes(typo)) {
        brandImpersonation = `${brand} (typosquatted: ${typo})`;
        riskScore += 45;
        reasons.push(`Typosquatting detected: Deceptive character substitution mimicking "${brand}".`);
        highlights.push(typo);
        break;
      }
    }
  }

  // 6. Subdomain count & length
  const domainParts = hostname.split('.');
  const excessiveSubdomains = domainParts.length >= 4;
  if (excessiveSubdomains && !isIpAddress) {
    riskScore += 20;
    reasons.push('Excessive subdomain depth: Phishing kits often nest subdomains to deceive mobile screens.');
  }

  // 7. Suspicious Phishing Keywords in hostname or path
  const matchedKeywords: string[] = [];
  PHISHING_KEYWORDS.forEach(kw => {
    if (hostname.includes(kw) || pathname.includes(kw)) {
      matchedKeywords.push(kw);
    }
  });

  const hasPhishingKeywords = matchedKeywords.length > 0;
  if (hasPhishingKeywords) {
    riskScore += Math.min(30, matchedKeywords.length * 10);
    reasons.push(`Contains high-risk credential keywords: [${matchedKeywords.slice(0, 4).join(', ')}]`);
    highlights.push(...matchedKeywords);
  }

  // 8. Obfuscation (@ symbol or excessive hyphens)
  if (cleanInput.includes('@')) {
    riskScore += 35;
    reasons.push('Deceptive "@" symbol detected: Often used to disguise host destinations in browsers.');
    highlights.push('@');
  }
  const hyphenCount = (hostname.match(/-/g) || []).length;
  if (hyphenCount >= 3) {
    riskScore += 15;
    reasons.push('High hyphen density in domain name commonly seen in algorithmically generated domains.');
  }

  // Cap risk score
  riskScore = Math.min(100, Math.max(0, riskScore));

  // Determine Risk Level
  let riskLevel: RiskLevel = 'Safe';
  if (riskScore >= 60 || isIpAddress || (brandImpersonation && hasPhishingKeywords)) {
    riskLevel = 'High Risk';
  } else if (riskScore >= 25 || isShortener) {
    riskLevel = 'Suspicious';
  }

  // Safety tips
  if (riskLevel === 'High Risk') {
    safetyTips.push('Do NOT visit this link or input any passwords or personal details.');
    safetyTips.push('The domain exhibits active deception characteristics typical of credential harvesters.');
    safetyTips.push('If you already visited, immediately change passwords for related accounts.');
  } else if (riskLevel === 'Suspicious') {
    safetyTips.push('Verify the exact domain spelling in your browser address bar.');
    safetyTips.push('If it is a shortened link (e.g., bit.ly), expand it using an unshortener tool before browsing.');
    safetyTips.push('Look for an authentic SSL certificate badge and check company registration.');
  } else {
    reasons.push('Domain syntax follows legitimate structure with standard encryption and reputable TLD.');
    safetyTips.push('Standard safe browsing: Ensure the lock icon is present and never reuse master passwords.');
  }

  let category = 'Web Resource';
  if (brandImpersonation) {
    category = 'Brand Spoofing / Phishing Link';
  } else if (isIpAddress) {
    category = 'Direct IP Attack Vector';
  } else if (isShortener) {
    category = 'Masked Destination Link';
  } else if (hasPhishingKeywords) {
    category = 'Credential Harvesting Target';
  }

  return {
    id: 'scan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    type: 'url',
    input: cleanInput,
    riskLevel,
    riskScore,
    category,
    summary: riskLevel === 'High Risk'
      ? 'High-risk malicious or deceptive web address detected.'
      : riskLevel === 'Suspicious'
        ? 'Suspicious link structure with anomalous indicators.'
        : 'URL appears to be structurally valid and standard.',
    reasons: reasons.slice(0, 5),
    safetyTips: safetyTips.slice(0, 4),
    highlights: Array.from(new Set(highlights)),
    urlDetails: {
      protocol,
      hostname,
      pathname,
      isHttps,
      isIpAddress,
      isShortener,
      suspiciousTld,
      brandImpersonation,
      excessiveSubdomains,
      hasPhishingKeywords
    },
    timestamp: new Date().toISOString()
  };
}
