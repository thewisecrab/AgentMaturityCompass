/**
 * Threat intelligence — pattern matching against known threat indicators.
 */

export interface ThreatMatch {
  pattern: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface ThreatIntelResult {
  matched: boolean;
  threats: ThreatMatch[];
  totalEntries: number;
}

interface ThreatPattern {
  re: RegExp;
  category: string;
  severity: ThreatMatch['severity'];
}

const BUILT_IN_PATTERNS: ThreatPattern[] = [
  { re: /ignore\s+(previous|all|above)\s+(instructions|prompts|rules)/i, category: 'injection', severity: 'critical' },
  { re: /you\s+are\s+now\s+(DAN|unrestricted|jailbroken)/i, category: 'jailbreak', severity: 'critical' },
  { re: /\bsystem\s*:\s*you\s+are/i, category: 'injection', severity: 'high' },
  { re: /\bact\s+as\s+(if|though)\s+you\s+(have\s+no|don't\s+have)/i, category: 'jailbreak', severity: 'high' },
  { re: /\bexfiltrate\b/i, category: 'exfiltration', severity: 'critical' },
  { re: /\bbase64\s+(encode|decode)\b.*\b(password|secret|key)\b/i, category: 'exfiltration', severity: 'high' },
  { re: /\bcurl\b.*\b(password|token|secret)\b/i, category: 'exfiltration', severity: 'high' },
  { re: /\bdata:text\/html\b/i, category: 'injection', severity: 'medium' },
  { re: /\bprompt\s*leak/i, category: 'reconnaissance', severity: 'medium' },
  { re: /\brepeat\s+(the\s+)?(system\s+)?(prompt|instructions)\b/i, category: 'reconnaissance', severity: 'medium' },
];

export function checkThreatIntel(text: string): ThreatIntelResult {
  const threats: ThreatMatch[] = [];

  for (const pat of BUILT_IN_PATTERNS) {
    if (pat.re.test(text)) {
      threats.push({ pattern: pat.re.source, category: pat.category, severity: pat.severity });
    }
  }

  return { matched: threats.length > 0, threats, totalEntries: BUILT_IN_PATTERNS.length };
}

export function getStats(): { totalEntries: number; byCategory: Record<string, number> } {
  const byCategory: Record<string, number> = {};
  for (const p of BUILT_IN_PATTERNS) {
    byCategory[p.category] = (byCategory[p.category] ?? 0) + 1;
  }
  return { totalEntries: BUILT_IN_PATTERNS.length, byCategory };
}
