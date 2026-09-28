export interface CodeFile {
  filename: string;
  language: string;
  description: string;
  content: string;
}

export const COLLEGE_PROJECT_FILES: CodeFile[] = [
  {
    filename: 'app.py',
    language: 'python',
    description: 'Main Python Flask application routing, API endpoints, and SQLite integration',
    content: `"""
ScamShield AI - College Project Backend
Framework: Python Flask + SQLite + Rule-based NLP
"""

import os
import sqlite3
import datetime
from flask import Flask, request, jsonify, render_template
from nlp_detector import analyze_message_nlp, analyze_url_heuristics

app = Flask(__name__)
DB_FILE = "scamshield.db"

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS scans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scan_type TEXT NOT NULL,
                input_content TEXT NOT NULL,
                risk_level TEXT NOT NULL,
                risk_score INTEGER NOT NULL,
                category TEXT,
                reasons TEXT,
                safety_tips TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/check-message", methods=["POST"])
def check_message():
    data = request.get_json() or {}
    message = data.get("message", "").strip()
    if not message:
        return jsonify({"error": "Message text is required"}), 400

    result = analyze_message_nlp(message)

    # Persist in SQLite
    with get_db() as conn:
        conn.execute("""
            INSERT INTO scans (scan_type, input_content, risk_level, risk_score, category, reasons, safety_tips)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            "message",
            message,
            result["risk_level"],
            result["risk_score"],
            result["category"],
            "||".join(result["reasons"]),
            "||".join(result["safety_tips"])
        ))
        conn.commit()

    return jsonify(result)

@app.route("/api/check-url", methods=["POST"])
def check_url():
    data = request.get_json() or {}
    url = data.get("url", "").strip()
    if not url:
        return jsonify({"error": "URL is required"}), 400

    result = analyze_url_heuristics(url)

    # Persist in SQLite
    with get_db() as conn:
        conn.execute("""
            INSERT INTO scans (scan_type, input_content, risk_level, risk_score, category, reasons, safety_tips)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            "url",
            url,
            result["risk_level"],
            result["risk_score"],
            result["category"],
            "||".join(result["reasons"]),
            "||".join(result["safety_tips"])
        ))
        conn.commit()

    return jsonify(result)

@app.route("/api/history", methods=["GET"])
def get_history():
    with get_db() as conn:
        cursor = conn.execute("""
            SELECT id, scan_type, input_content, risk_level, risk_score, category, reasons, safety_tips, created_at
            FROM scans
            ORDER BY created_at DESC
            LIMIT 50
        """)
        rows = cursor.fetchall()
        history = []
        for row in rows:
            history.append({
                "id": row["id"],
                "scan_type": row["scan_type"],
                "input": row["input_content"],
                "risk_level": row["risk_level"],
                "risk_score": row["risk_score"],
                "category": row["category"],
                "reasons": row["reasons"].split("||") if row["reasons"] else [],
                "safety_tips": row["safety_tips"].split("||") if row["safety_tips"] else [],
                "created_at": row["created_at"]
            })
        return jsonify(history)

@app.route("/api/history/<int:scan_id>", methods=["DELETE"])
def delete_history_item(scan_id):
    with get_db() as conn:
        conn.execute("DELETE FROM scans WHERE id = ?", (scan_id,))
        conn.commit()
    return jsonify({"success": True})

if __name__ == "__main__":
    init_db()
    print("ScamShield AI Flask server running on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
`
  },
  {
    filename: 'nlp_detector.py',
    language: 'python',
    description: 'Python NLP Lexical Engine with scam trigger weights and URL heuristic parser',
    content: `"""
NLP & Heuristic Detection Algorithms for ScamShield AI
Contains lexical urgency analysis, financial intent tagging, and URL structure parsing.
"""

import re
from urllib.parse import urlparse

# Dictionaries for rule-based NLP classification
URGENCY_KEYWORDS = [
    "urgent", "immediately", "immediate action", "account suspended", "within 24 hours",
    "final notice", "locked out", "arrest warrant", "freeze", "unauthorized access"
]

FINANCIAL_KEYWORDS = [
    "crypto", "bitcoin", "gift card", "lottery", "winner", "prize", "cash reward",
    "wire transfer", "western union", "claim prize", "tax refund", "investment return"
]

CREDENTIAL_KEYWORDS = [
    "verify account", "enter otp", "confirm password", "share pin", "cvv", "ssn",
    "click here to verify", "update payment", "security pin", "card details"
]

SUSPICIOUS_TLDS = [".xyz", ".top", ".click", ".loan", ".work", ".gq", ".cf", ".tk", ".country", ".zip"]
SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly"]
POPULAR_BRANDS = ["paypal", "amazon", "apple", "google", "netflix", "chase", "wellsfargo"]

def analyze_message_nlp(text):
    text_lower = text.lower()
    reasons = []
    safety_tips = []
    matched_keywords = []

    urgency_score = 0
    financial_score = 0
    credential_score = 0

    for kw in URGENCY_KEYWORDS:
        if kw in text_lower:
            matched_keywords.append(kw)
            urgency_score += 15

    for kw in FINANCIAL_KEYWORDS:
        if kw in text_lower:
            matched_keywords.append(kw)
            financial_score += 15

    for kw in CREDENTIAL_KEYWORDS:
        if kw in text_lower:
            matched_keywords.append(kw)
            credential_score += 20

    # Embedded link check
    links = re.findall(r'https?://[^\\s]+', text)
    if links:
        reasons.append(f"Message contains embedded link: {links[0]}")

    if urgency_score > 0:
        reasons.append("High psychological urgency detected (coercive deadline).")
    if credential_score > 0:
        reasons.append("Credential harvesting detected (request for password/OTP/verification).")
    if financial_score > 0:
        reasons.append("Unverified financial reward or pressure detected.")

    total_score = min(100, urgency_score + financial_score + credential_score + (20 if links else 0))

    if total_score >= 60:
        risk_level = "High Risk"
        safety_tips.append("Do not click any embedded links or call phone numbers.")
        safety_tips.append("Never provide OTP, passwords, or personal banking info.")
    elif total_score >= 25:
        risk_level = "Suspicious"
        safety_tips.append("Verify the sender through official public channels before responding.")
    else:
        risk_level = "Safe"
        reasons.append("No obvious phishing triggers or deceptive patterns found.")
        safety_tips.append("Maintain good digital hygiene and verify unknown senders.")

    category = "Phishing Attempt" if credential_score > 0 else "Financial Scam" if financial_score > 0 else "General"

    return {
        "risk_level": risk_level,
        "risk_score": total_score,
        "category": category,
        "reasons": reasons,
        "safety_tips": safety_tips,
        "matched_keywords": list(set(matched_keywords))
    }

def analyze_url_heuristics(url):
    reasons = []
    safety_tips = []
    score = 0

    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    parsed = urlparse(url)
    host = parsed.netloc.lower()

    if parsed.scheme == "http":
        score += 25
        reasons.append("Lacks HTTPS encryption (plain HTTP connection).")

    # Direct IP check
    if re.match(r"^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$", host):
        score += 45
        reasons.append(f"Uses direct IP address ({host}) instead of domain name.")

    # Suspicious TLD
    for tld in SUSPICIOUS_TLDS:
        if host.endswith(tld):
            score += 25
            reasons.append(f"Suspicious top-level domain ({tld}) detected.")
            break

    # URL Shortener
    for short in SHORTENERS:
        if short in host:
            score += 25
            reasons.append("URL shortener used: Real landing page is masked.")
            break

    # Brand typosquatting
    for brand in POPULAR_BRANDS:
        if brand in host and not (host == f"{brand}.com" or host.endswith(f".{brand}.com")):
            score += 35
            reasons.append(f"Brand impersonation attempt detected for '{brand}'.")
            break

    score = min(100, score)
    if score >= 60:
        risk_level = "High Risk"
        safety_tips.append("Do NOT visit this link or enter any personal credentials.")
    elif score >= 25:
        risk_level = "Suspicious"
        safety_tips.append("Examine the address bar carefully for typos or odd subdomains.")
    else:
        risk_level = "Safe"
        reasons.append("Standard domain syntax and verified secure protocol detected.")
        safety_tips.append("Ensure the browser lock icon is valid before logging in.")

    return {
        "risk_level": risk_level,
        "risk_score": score,
        "category": "URL Inspection",
        "reasons": reasons,
        "safety_tips": safety_tips
    }
`
  },
  {
    filename: 'schema.sql',
    language: 'sql',
    description: 'SQLite database schema for scan history and risk logs',
    content: `-- SQLite Database Schema for ScamShield AI
CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_type TEXT CHECK(scan_type IN ('message', 'url', 'qr')) NOT NULL,
    input_content TEXT NOT NULL,
    risk_level TEXT CHECK(risk_level IN ('Safe', 'Suspicious', 'High Risk')) NOT NULL,
    risk_score INTEGER NOT NULL CHECK(risk_score >= 0 AND risk_score <= 100),
    category TEXT,
    reasons TEXT, -- Stored as delimited strings
    safety_tips TEXT, -- Stored as delimited strings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_risk_level ON scans(risk_level);
`
  },
  {
    filename: 'requirements.txt',
    language: 'plaintext',
    description: 'Python package dependencies for college setup',
    content: `Flask==3.0.0
Pillow==10.2.0
pyzbar==0.1.9
requests==2.31.0
`
  }
];
