/**
 * adversarial.ts — Semantic gaming detection with answer inflation,
 * copy-paste detection, buzzword density, and evidence specificity.
 */

export interface AdversarialTestResult {
  inflationDelta: number;
  keywordScore: number;
  evidenceScore: number;
  gamingResistant: boolean;
  gamingIndicators: GamingIndicator[];
  overallGamingRisk: 'low' | 'medium' | 'high';
}

export interface GamingIndicator {
  type: 'keyword-stuffing' | 'copy-paste' | 'buzzword-density' | 'low-specificity' | 'answer-inflation';
  severity: number; // 0-1
  description: string;
  affectedQuestions: string[];
}

/* ── Constants ───────────────────────────────────────────────────── */

const GAMING_KEYWORDS = [
  'compliant', 'secure', 'audited', 'certified', 'enterprise-grade',
  'best-practice', 'zero-trust', 'fully-automated', 'industry-leading',
  'state-of-the-art', 'world-class', 'cutting-edge',
];

const BUZZWORDS = [
  'synergy', 'leverage', 'paradigm', 'scalable', 'robust', 'holistic',
  'comprehensive', 'seamless', 'innovative', 'transformative',
  'next-generation', 'mission-critical', 'turnkey',
];

/* ── Copy-paste detection (Jaccard similarity between answers) ──── */

function tokenize(text: string): Set<string> {
  return new Set(text.toLowerCase().split(/\W+/).filter(w => w.length > 3));
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  const intersection = [...a].filter(x => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

function detectCopyPaste(answers: Record<string, string>): { score: number; pairs: string[] } {
  const entries = Object.entries(answers);
  const pairs: string[] = [];
  let totalSim = 0;
  let comparisons = 0;

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const sim = jaccardSimilarity(tokenize(entries[i]![1]), tokenize(entries[j]![1]));
      totalSim += sim;
      comparisons++;
      if (sim > 0.7) {
        pairs.push(`${entries[i]![0]} ↔ ${entries[j]![0]} (${Math.round(sim * 100)}%)`);
      }
    }
  }

  return { score: comparisons > 0 ? totalSim / comparisons : 0, pairs };
}

/* ── Buzzword density ────────────────────────────────────────────── */

function buzzwordDensity(text: string): number {
  const words = text.toLowerCase().split(/\W+/);
  if (words.length === 0) return 0;
  const hits = words.filter(w => BUZZWORDS.some(bw => w.includes(bw))).length;
  return hits / words.length;
}

/* ── Evidence specificity (dates, numbers, URLs, tool names) ─────── */

function evidenceSpecificity(text: string): number {
  const indicators = [
    /\b\d{4}-\d{2}-\d{2}\b/,              // dates
    /\bhttps?:\/\/\S+/,                     // URLs
    /\b\d+\s*(ms|seconds?|minutes?|hours?|percent|%|GB|MB|KB)\b/i, // metrics
    /\bversion\s*\d+\.\d+/i,              // version numbers
    /\b(SHA-?256|HMAC|RSA|AES|TLS)\b/i,   // technical specifics
    /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/, // IP addresses
  ];

  let hits = 0;
  for (const pattern of indicators) {
    if (pattern.test(text)) hits++;
  }
  return Math.min(1, hits / indicators.length);
}

/* ── Answer inflation (high scores without evidence) ─────────────── */

function detectInflation(answers: Record<string, string>): { score: number; inflated: string[] } {
  const inflated: string[] = [];
  let inflationCount = 0;

  for (const [qid, answer] of Object.entries(answers)) {
    const hasKeywords = GAMING_KEYWORDS.some(kw => answer.toLowerCase().includes(kw));
    const specificity = evidenceSpecificity(answer);
    if (hasKeywords && specificity < 0.2) {
      inflated.push(qid);
      inflationCount++;
    }
  }

  return {
    score: Object.keys(answers).length > 0 ? inflationCount / Object.keys(answers).length : 0,
    inflated,
  };
}

/* ── Main test ───────────────────────────────────────────────────── */

export function testGamingResistance(answers: Record<string, string>): AdversarialTestResult {
  let keywordHits = 0;
  let evidenceHits = 0;
  let totalAnswers = 0;

  for (const answer of Object.values(answers)) {
    totalAnswers++;
    const lower = answer.toLowerCase();
    for (const kw of GAMING_KEYWORDS) {
      if (lower.includes(kw)) { keywordHits++; break; }
    }
    if (/\b\d{4}-\d{2}-\d{2}\b|\bhttps?:\/\/|\b\d+\s*(ms|seconds|percent|%)\b/i.test(answer)) {
      evidenceHits++;
    }
  }

  const keywordScore = totalAnswers > 0 ? keywordHits / totalAnswers : 0;
  const evidenceScore = totalAnswers > 0 ? evidenceHits / totalAnswers : 0;
  const inflationDelta = keywordScore - evidenceScore;

  // Detailed indicators
  const indicators: GamingIndicator[] = [];

  // Keyword stuffing
  if (keywordScore > 0.5) {
    indicators.push({
      type: 'keyword-stuffing',
      severity: keywordScore,
      description: `${Math.round(keywordScore * 100)}% of answers contain gaming keywords`,
      affectedQuestions: Object.keys(answers).filter(q => GAMING_KEYWORDS.some(kw => answers[q]!.toLowerCase().includes(kw))),
    });
  }

  // Copy-paste
  const copyPaste = detectCopyPaste(answers);
  if (copyPaste.score > 0.3) {
    indicators.push({
      type: 'copy-paste',
      severity: copyPaste.score,
      description: `High similarity detected between ${copyPaste.pairs.length} answer pairs`,
      affectedQuestions: copyPaste.pairs,
    });
  }

  // Buzzword density
  const allText = Object.values(answers).join(' ');
  const bwDensity = buzzwordDensity(allText);
  if (bwDensity > 0.05) {
    indicators.push({
      type: 'buzzword-density',
      severity: Math.min(1, bwDensity * 10),
      description: `Buzzword density of ${Math.round(bwDensity * 100)}% exceeds threshold`,
      affectedQuestions: [],
    });
  }

  // Answer inflation
  const inflation = detectInflation(answers);
  if (inflation.score > 0.2) {
    indicators.push({
      type: 'answer-inflation',
      severity: inflation.score,
      description: `${inflation.inflated.length} answers have high-confidence claims without evidence`,
      affectedQuestions: inflation.inflated,
    });
  }

  // Low specificity
  if (evidenceScore < 0.2 && totalAnswers > 3) {
    indicators.push({
      type: 'low-specificity',
      severity: 1 - evidenceScore,
      description: `Only ${Math.round(evidenceScore * 100)}% of answers contain specific evidence`,
      affectedQuestions: [],
    });
  }

  const maxSeverity = indicators.length > 0 ? Math.max(...indicators.map(i => i.severity)) : 0;
  const overallGamingRisk: 'low' | 'medium' | 'high' =
    maxSeverity > 0.6 ? 'high' : maxSeverity > 0.3 ? 'medium' : 'low';

  return {
    inflationDelta,
    keywordScore,
    evidenceScore,
    gamingResistant: inflationDelta < 0.05 && overallGamingRisk === 'low',
    gamingIndicators: indicators,
    overallGamingRisk,
  };
}
