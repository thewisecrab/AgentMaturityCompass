/**
 * Formal maturity specification — M(a,d,t) = Σ w_i · E_i · decay(t - t_i)
 */

export type MaturityLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

export interface EvidenceArtifact {
  qid: string;
  kind: 'observed' | 'attested' | 'self_reported';
  trust: number;
  payload: unknown;
  timestamp: Date;
}

export interface DimensionScore {
  level: MaturityLevel;
  score: number;
  gaps: string[];
}

export interface MaturityScore {
  overallLevel: MaturityLevel;
  overallScore: number;
  dimensionScores: Record<string, DimensionScore>;
}

const TRUST_WEIGHTS: Record<EvidenceArtifact['kind'], number> = {
  observed: 1.0,
  attested: 0.8,
  self_reported: 0.4,
};

const HALF_LIFE_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

export function evidenceDecay(ageMs: number): number {
  return Math.exp(-0.693 * ageMs / HALF_LIFE_MS);
}

function scoreToLevel(score: number): MaturityLevel {
  if (score >= 0.9) return 'L5';
  if (score >= 0.75) return 'L4';
  if (score >= 0.55) return 'L3';
  if (score >= 0.35) return 'L2';
  if (score >= 0.15) return 'L1';
  return 'L0';
}

export function computeMaturityScore(
  evidence: EvidenceArtifact[],
  weights?: Record<string, number>,
): MaturityScore {
  const now = Date.now();
  const byDimension = new Map<string, EvidenceArtifact[]>();

  for (const e of evidence) {
    const dim = e.qid.split('.')[0] ?? 'unknown';
    const arr = byDimension.get(dim) ?? [];
    arr.push(e);
    byDimension.set(dim, arr);
  }

  const dimensionScores: Record<string, DimensionScore> = {};
  let totalWeightedScore = 0;
  let totalWeight = 0;

  const allWeights = [...byDimension.keys()].map(dim => weights?.[dim] ?? 1.0);
  if (allWeights.some(w => Number.isNaN(w))) {
    throw new Error("NaN weight detected in scoring — check dimension configuration");
  }

  for (const [dim, artifacts] of byDimension) {
    const w = weights?.[dim] ?? 1.0;
    let dimScore = 0;
    let dimWeight = 0;

    for (const a of artifacts) {
      const ageMs = now - a.timestamp.getTime();
      const decay = evidenceDecay(ageMs);
      const trustW = TRUST_WEIGHTS[a.kind];
      dimScore += a.trust * trustW * decay;
      dimWeight += trustW * decay;
    }

    const normalized = dimWeight > 0 ? Math.min(1, dimScore / dimWeight) : 0;
    const gaps: string[] = [];
    if (normalized < 0.5) gaps.push(`${dim} below baseline`);
    if (artifacts.length < 3) gaps.push(`${dim} insufficient evidence`);

    dimensionScores[dim] = { level: scoreToLevel(normalized), score: normalized, gaps };
    totalWeightedScore += normalized * w;
    totalWeight += w;
  }

  const overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  return { overallLevel: scoreToLevel(overallScore), overallScore, dimensionScores };
}

export function improvementVelocity(before: MaturityScore, after: MaturityScore, deltaMs: number): number {
  const deltaDays = deltaMs / (24 * 60 * 60 * 1000);
  if (deltaDays < 1) return 0;
  return (after.overallScore - before.overallScore) / deltaDays;
}
