/**
 * Gaming resistance tester — detects keyword stuffing vs evidence-based scoring.
 */

export interface AdversarialTestResult {
  inflationDelta: number;
  keywordScore: number;
  evidenceScore: number;
  gamingResistant: boolean;
}

const GAMING_KEYWORDS = ['compliant', 'secure', 'audited', 'certified', 'enterprise-grade', 'best-practice', 'zero-trust', 'fully-automated'];

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
    // Evidence indicators: specific numbers, dates, tool names, URLs
    if (/\b\d{4}-\d{2}-\d{2}\b|\bhttps?:\/\/|\b\d+\s*(ms|seconds|percent|%)\b/i.test(answer)) {
      evidenceHits++;
    }
  }

  const keywordScore = totalAnswers > 0 ? keywordHits / totalAnswers : 0;
  const evidenceScore = totalAnswers > 0 ? evidenceHits / totalAnswers : 0;
  const inflationDelta = keywordScore - evidenceScore;

  return {
    inflationDelta,
    keywordScore,
    evidenceScore,
    gamingResistant: inflationDelta < 0.05,
  };
}
