/**
 * Static code/skill analyzer — pure TypeScript, no external deps.
 * Detects dangerous patterns in code: eval, exec, hardcoded secrets, etc.
 */

export interface AnalyzerFinding {
  severity: 'critical' | 'high' | 'medium' | 'low';
  pattern: string;
  line?: number;
  description: string;
}

export interface AnalyzerResult {
  riskScore: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'safe';
  findings: AnalyzerFinding[];
  filesScanned: number;
}

interface DangerPattern {
  re: RegExp;
  severity: AnalyzerFinding['severity'];
  description: string;
}

const DANGER_PATTERNS: DangerPattern[] = [
  { re: /\beval\s*\(/g, severity: 'critical', description: 'Dynamic code execution via eval()' },
  { re: /\bexec\s*\(/g, severity: 'critical', description: 'Shell execution via exec()' },
  { re: /\bexecSync\s*\(/g, severity: 'critical', description: 'Synchronous shell execution' },
  { re: /\bspawn\s*\(/g, severity: 'high', description: 'Process spawning detected' },
  { re: /child_process/g, severity: 'critical', description: 'Child process module usage' },
  { re: /\bFunction\s*\(/g, severity: 'critical', description: 'Dynamic function constructor' },
  { re: /sk-[A-Za-z0-9]{20,}/g, severity: 'critical', description: 'Hardcoded OpenAI API key' },
  { re: /gho_[A-Za-z0-9]{20,}/g, severity: 'critical', description: 'Hardcoded GitHub token' },
  { re: /AKIA[A-Z0-9]{16}/g, severity: 'critical', description: 'Hardcoded AWS access key' },
  { re: /\bfetch\s*\(/g, severity: 'medium', description: 'Network call detected' },
  { re: /\bXMLHttpRequest\b/g, severity: 'medium', description: 'XMLHttpRequest usage' },
  { re: /\bwriteFileSync\s*\(/g, severity: 'high', description: 'Synchronous file write' },
  { re: /\bwriteFile\s*\(/g, severity: 'medium', description: 'File write operation' },
  { re: /\bunlinkSync\s*\(/g, severity: 'high', description: 'File deletion' },
  { re: /\brm\s+-rf\b/g, severity: 'critical', description: 'Recursive force delete in string' },
];

function computeRiskLevel(score: number): AnalyzerResult['riskLevel'] {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'low';
  return 'safe';
}

export function analyzeSkill(code: string, _filename?: string): AnalyzerResult {
  const findings: AnalyzerFinding[] = [];
  const lines = code.split('\n');

  for (const pat of DANGER_PATTERNS) {
    const re = new RegExp(pat.re.source, pat.re.flags);
    for (let i = 0; i < lines.length; i++) {
      if (re.test(lines[i]!)) {
        findings.push({
          severity: pat.severity,
          pattern: pat.re.source,
          line: i + 1,
          description: pat.description,
        });
      }
    }
  }

  const severityWeights = { critical: 25, high: 15, medium: 8, low: 3 };
  let riskScore = 0;
  for (const f of findings) {
    riskScore += severityWeights[f.severity];
  }
  riskScore = Math.min(100, riskScore);

  return {
    riskScore,
    riskLevel: computeRiskLevel(riskScore),
    findings,
    filesScanned: 1,
  };
}
