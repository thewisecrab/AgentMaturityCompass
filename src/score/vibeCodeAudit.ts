/**
 * Vibe Code Audit — "Claude built it. AMC validates it's safe."
 *
 * For the 164K+ vibe coders building production apps with AI tools,
 * with zero security awareness. Scans AI-generated code for critical
 * issues before going live.
 */

export interface VibeCodeFinding {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  line?: number;
  recommendation: string;
}

export interface VibeCodeAuditResult {
  safe: boolean;
  score: number; // 0–100, higher = safer
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  findings: VibeCodeFinding[];
  criticalCount: number;
  highCount: number;
  summary: string;
  deploymentReady: boolean;
  quickFixes: string[];
}

// Patterns that indicate security issues in AI-generated code
const CRITICAL_PATTERNS: { pattern: RegExp; category: string; description: string; recommendation: string }[] = [
  {
    pattern: /process\.env\.(?!NODE_ENV|PORT|HOST)\w+.*(?:console\.log|res\.send|res\.json|return)/,
    category: 'Secret Exposure',
    description: 'Environment variable (likely a secret/API key) may be sent to client or logged',
    recommendation: 'Never expose process.env secrets in responses or logs. Use server-side only.',
  },
  {
    pattern: /(?:password|secret|token|apikey|api_key)\s*[:=]\s*["'][^"']{4,}/i,
    category: 'Hardcoded Credential',
    description: 'Hardcoded credential found in source code',
    recommendation: 'Move all credentials to environment variables. Never hardcode secrets.',
  },
  {
    pattern: /eval\s*\([^)]*(?:req\.|request\.|body\.|query\.|params\.)/,
    category: 'Code Injection',
    description: 'eval() called with user-controlled input — remote code execution risk',
    recommendation: 'Never use eval() with user input. Use safe alternatives.',
  },
  {
    pattern: /(?:exec|execSync|spawn|spawnSync)\s*\([^)]*(?:req\.|request\.|body\.|query\.|params\.|\$\{)/,
    category: 'Command Injection',
    description: 'Shell command executed with user-controlled input',
    recommendation: 'Sanitize all input before shell commands, or use parameterized alternatives.',
  },
  {
    pattern: /innerHTML\s*=\s*(?!['"`]<)/,
    category: 'XSS Risk',
    description: 'innerHTML assignment without sanitization — cross-site scripting risk',
    recommendation: 'Use textContent or DOMPurify to sanitize HTML before insertion.',
  },
  {
    pattern: /SELECT\s+[\w*,\s]+FROM\s+\w+\s+WHERE\s+[\w.]+\s*=\s*['"]\s*\+/i,
    category: 'SQL Injection',
    description: 'SQL query built with string concatenation — SQL injection risk',
    recommendation: 'Use parameterized queries or a query builder. Never concatenate user input into SQL.',
  },
  {
    pattern: /app\.use\s*\(\s*(?:cors\(\)|\bexpress\.static)/,
    category: 'CORS/Static Misconfiguration',
    description: 'CORS enabled for all origins or static files served without configuration',
    recommendation: 'Restrict CORS to known origins. Configure static file serving explicitly.',
  },
  {
    pattern: /(?:fs\.read|readFile|createReadStream)\s*\([^)]*(?:req\.|request\.|body\.|query\.|params\.|\$\{)/,
    category: 'Path Traversal',
    description: 'File read using user-controlled path — directory traversal risk',
    recommendation: 'Validate and sanitize file paths. Use path.resolve() and check it stays in allowed directory.',
  },
];

const HIGH_PATTERNS: { pattern: RegExp; category: string; description: string; recommendation: string }[] = [
  {
    pattern: /(?:app\.post|router\.post|app\.put|router\.put)\s*\([^)]+\)[\s\S]{0,200}(?!authenticate|authorize|auth|middleware|protect)/,
    category: 'Missing Auth Check',
    description: 'POST/PUT endpoint may lack authentication middleware',
    recommendation: 'Add authentication middleware to all mutation endpoints.',
  },
  {
    pattern: /password\s*===?\s*req\.|req\.body\.password\s*===?\s*(?!hash|bcrypt)/i,
    category: 'Plain-Text Password Comparison',
    description: 'Password compared in plain text — should use bcrypt/argon2',
    recommendation: 'Use bcrypt.compare() or argon2.verify() for password verification. Never store plain text.',
  },
  {
    pattern: /(?:localStorage|sessionStorage)\.setItem\s*\([^)]*(?:token|password|secret|key)/i,
    category: 'Sensitive Data in Browser Storage',
    description: 'Token or credential stored in localStorage/sessionStorage',
    recommendation: 'Use httpOnly cookies for tokens. Never store secrets in localStorage.',
  },
  {
    pattern: /console\.log\s*\([^)]*(?:password|token|secret|key|credential)/i,
    category: 'Secret Logging',
    description: 'Sensitive data logged to console — visible in server logs',
    recommendation: 'Remove console.log statements containing sensitive data.',
  },
  {
    pattern: /https?:\/\/0\.0\.0\.0|listen\s*\(\s*(?:0|'0\.0\.0\.0')/,
    category: 'Open Binding',
    description: 'Server bound to 0.0.0.0 — exposed on all network interfaces',
    recommendation: "In production, bind to specific interface or use environment variable for host.",
  },
];

const MEDIUM_PATTERNS: { pattern: RegExp; category: string; description: string; recommendation: string }[] = [
  {
    pattern: /app\.use\s*\(\s*express\.json\s*\(\s*\)\s*\)/,
    category: 'Missing Body Size Limit',
    description: 'JSON body parser without size limit — DoS via large payloads',
    recommendation: "Add size limit: express.json({ limit: '10kb' })",
  },
  {
    pattern: /new Date\(\s*req\.|Date\.parse\s*\(\s*req\./,
    category: 'Date Injection',
    description: 'Date constructed from user input without validation',
    recommendation: 'Validate date strings before parsing. Use a date validation library.',
  },
  {
    pattern: /require\s*\(\s*(?:req\.|request\.|body\.|`)/,
    category: 'Dynamic Require',
    description: 'Dynamic module require with user-controlled input',
    recommendation: 'Never use require() with user-controlled paths. Use a whitelist.',
  },
];

function scanCode(code: string, patterns: typeof CRITICAL_PATTERNS, severity: VibeCodeFinding['severity']): VibeCodeFinding[] {
  const findings: VibeCodeFinding[] = [];
  const lines = code.split('\n');

  for (const { pattern, category, description, recommendation } of patterns) {
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i] ?? '')) {
        findings.push({ severity, category, description, line: i + 1, recommendation });
        break; // one finding per pattern
      }
    }
    // Also test full code for multi-line patterns
    if (!findings.find(f => f.category === category) && pattern.test(code)) {
      findings.push({ severity, category, description, recommendation });
    }
  }
  return findings;
}

export function auditVibeCode(code: string, filename?: string): VibeCodeAuditResult {
  void filename; // reserved for future per-file context
  const findings: VibeCodeFinding[] = [
    ...scanCode(code, CRITICAL_PATTERNS, 'critical'),
    ...scanCode(code, HIGH_PATTERNS, 'high'),
    ...scanCode(code, MEDIUM_PATTERNS, 'medium'),
  ];

  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const highCount = findings.filter(f => f.severity === 'high').length;
  const mediumCount = findings.filter(f => f.severity === 'medium').length;

  // Score: start at 100, deduct per finding
  const score = Math.max(0, 100 - criticalCount * 30 - highCount * 15 - mediumCount * 5);

  const grade: VibeCodeAuditResult['grade'] =
    score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F';

  const safe = criticalCount === 0 && highCount === 0;
  const deploymentReady = criticalCount === 0 && highCount <= 1 && score >= 70;

  const quickFixes = findings
    .filter(f => f.severity === 'critical' || f.severity === 'high')
    .slice(0, 5)
    .map(f => `[${f.category}] ${f.recommendation}`);

  const summary = deploymentReady
    ? `Code passed vibe audit with grade ${grade}. ${mediumCount} low-priority issues to review.`
    : `⚠️ ${criticalCount} critical and ${highCount} high severity issues must be fixed before deployment.`;

  return { safe, score, grade, findings, criticalCount, highCount, summary, deploymentReady, quickFixes };
}

export function auditVibeCodeFiles(files: Record<string, string>): {
  overall: VibeCodeAuditResult;
  byFile: Record<string, VibeCodeAuditResult>;
} {
  const byFile: Record<string, VibeCodeAuditResult> = {};
  const allFindings: VibeCodeFinding[] = [];

  for (const [filename, code] of Object.entries(files)) {
    const result = auditVibeCode(code, filename);
    byFile[filename] = result;
    allFindings.push(...result.findings);
  }

  const criticalCount = allFindings.filter(f => f.severity === 'critical').length;
  const highCount = allFindings.filter(f => f.severity === 'high').length;
  const mediumCount = allFindings.filter(f => f.severity === 'medium').length;
  const score = Math.max(0, 100 - criticalCount * 30 - highCount * 15 - mediumCount * 5);
  const grade: VibeCodeAuditResult['grade'] =
    score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F';
  const safe = criticalCount === 0 && highCount === 0;
  const deploymentReady = criticalCount === 0 && highCount <= 1 && score >= 70;
  const quickFixes = allFindings.filter(f => f.severity === 'critical').slice(0, 5).map(f => f.recommendation);
  const summary = deploymentReady
    ? `All files passed vibe audit (grade ${grade}).`
    : `${criticalCount} critical issues across ${Object.keys(files).length} files. Not ready for deployment.`;

  return {
    overall: { safe, score, grade, findings: allFindings, criticalCount, highCount, summary, deploymentReady, quickFixes },
    byFile,
  };
}
