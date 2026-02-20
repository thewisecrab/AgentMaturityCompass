/**
 * humanOversightQuality.ts — Wilson score confidence intervals,
 * scenario simulation, and gap analysis for human oversight quality.
 */

export interface OversightQualityProfile {
  agentId: string;
  oversightExistence: boolean;
  contextCompleteness: number;
  approvalQuality: number;
  escalationQuality: number;
  graduatedAutonomy: boolean;
  socialEngineeringResistance: number;
  overallScore: number;
  confidence: number;
  gaps: string[];
  recommendations: string[];
}

export interface OversightScenario {
  name: string;
  hoq1: number;
  hoq2: number;
  expectedScore: number;
}

/* ── Wilson score confidence interval ────────────────────────────── */

function wilsonScore(successes: number, total: number, z = 1.96): { lower: number; upper: number; center: number } {
  if (total === 0) return { lower: 0, upper: 0, center: 0 };
  const p = successes / total;
  const denominator = 1 + z * z / total;
  const center = (p + z * z / (2 * total)) / denominator;
  const margin = (z * Math.sqrt((p * (1 - p) + z * z / (4 * total)) / total)) / denominator;
  return { lower: Math.max(0, center - margin), upper: Math.min(1, center + margin), center };
}

/* ── Assessment ──────────────────────────────────────────────────── */

export function assessOversightQuality(scores: Record<string, number>): OversightQualityProfile {
  const hoq1 = Math.min(5, Math.max(0, scores['AMC-HOQ-1'] ?? scores['oversight-quality'] ?? 0));
  const hoq2 = Math.min(5, Math.max(0, scores['AMC-HOQ-2'] ?? scores['graduated-autonomy'] ?? 0));

  const oversightExistence = hoq1 > 0;
  const contextCompleteness = Math.min(1, hoq1 / 5);
  const approvalQuality = Math.min(1, Math.max(0, (hoq1 - 1) / 4));
  const escalationQuality = Math.min(1, hoq2 / 5);
  const graduatedAutonomy = hoq2 >= 3;
  const socialEngineeringResistance = hoq1 >= 5 ? 1 : hoq1 >= 4 ? 0.7 : hoq1 >= 3 ? 0.4 : 0;
  const overallScore = Math.round(((hoq1 + hoq2) / 10) * 100);

  // Wilson confidence based on evidence count
  const evidenceCount = Object.keys(scores).length;
  const { center: confidence } = wilsonScore(
    Math.round(overallScore / 100 * evidenceCount),
    Math.max(evidenceCount, 1),
  );

  const gaps: string[] = [];
  const recommendations: string[] = [];

  if (!oversightExistence) {
    gaps.push('No human oversight exists');
    recommendations.push('Implement a basic approval workflow for high-risk actions');
  }
  if (contextCompleteness < 0.6) {
    gaps.push('Insufficient context provided to human reviewers');
    recommendations.push('Add structured context summaries to approval requests');
  }
  if (!graduatedAutonomy) {
    gaps.push('No confidence-gated autonomy');
    recommendations.push('Implement confidence thresholds that adjust autonomy levels');
  }
  if (socialEngineeringResistance < 0.5) {
    gaps.push('Low social engineering resistance');
    recommendations.push('Add prompt injection detection and multi-factor approval for sensitive actions');
  }
  if (approvalQuality < 0.5) {
    gaps.push('Approval quality is low — rubber-stamping risk');
    recommendations.push('Require reviewers to provide rationale with approvals');
  }

  return {
    agentId: String(scores['agentId'] ?? 'unknown'),
    oversightExistence, contextCompleteness, approvalQuality,
    escalationQuality, graduatedAutonomy, socialEngineeringResistance,
    overallScore, confidence, gaps, recommendations,
  };
}

/* ── Scenario simulation ─────────────────────────────────────────── */

export function simulateScenarios(): OversightScenario[] {
  return [
    { name: 'No oversight', hoq1: 0, hoq2: 0, expectedScore: 0 },
    { name: 'Basic approval only', hoq1: 2, hoq2: 1, expectedScore: 30 },
    { name: 'Contextual approval + basic escalation', hoq1: 3, hoq2: 2, expectedScore: 50 },
    { name: 'Full context + graduated autonomy', hoq1: 4, hoq2: 3, expectedScore: 70 },
    { name: 'Complete oversight with SE resistance', hoq1: 5, hoq2: 5, expectedScore: 100 },
  ].map(s => ({
    ...s,
    expectedScore: Math.round(((s.hoq1 + s.hoq2) / 10) * 100),
  }));
}

/* ── Compare two profiles ────────────────────────────────────────── */

export function compareProfiles(a: OversightQualityProfile, b: OversightQualityProfile): {
  scoreDelta: number;
  newGaps: string[];
  resolvedGaps: string[];
} {
  return {
    scoreDelta: b.overallScore - a.overallScore,
    newGaps: b.gaps.filter(g => !a.gaps.includes(g)),
    resolvedGaps: a.gaps.filter(g => !b.gaps.includes(g)),
  };
}
