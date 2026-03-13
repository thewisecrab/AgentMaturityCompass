/**
 * Industry-Specific Trust Models for AMC Score
 *
 * Dynamic risk weighting, sector-specific trust decay rates,
 * regulatory environment adaptation, and industry benchmark normalization.
 * Replaces one-size-fits-all weighting with context-aware scoring.
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface IndustryTrustModel {
  industryId: string;
  name: string;
  riskProfile: "critical" | "high" | "medium" | "low";
  dimensionWeights: Record<string, number>;    // Dimension → weight multiplier
  trustDecayRate: number;                       // Score points lost per 24h without refresh
  maxStaleHours: number;                        // Hours before trust expires completely
  evidenceRequirements: {
    minObservedShare: number;                   // Minimum % of observed (not self-reported) evidence
    minEvidenceCount: number;                   // Minimum evidence artifacts needed
    requiredDimensions: string[];               // Dimensions that MUST have evidence
  };
  regulatoryFrameworks: string[];              // Applicable compliance frameworks
  benchmarkPercentiles: IndustryBenchmark;     // What scores mean in this industry
}

export interface IndustryBenchmark {
  p25: number;    // 25th percentile score in this industry
  p50: number;    // Median
  p75: number;    // 75th percentile
  p90: number;    // Top 10%
  p99: number;    // Top 1%
  sampleSize: number;
  lastUpdated: number;
}

export interface IndustryAdjustedScore {
  rawScore: number;
  adjustedScore: number;
  industryId: string;
  percentileRank: number;          // Where this agent sits vs industry peers
  dimensionAdjustments: Record<string, { raw: number; weighted: number; weight: number }>;
  decayApplied: number;
  riskFactors: string[];
  complianceGaps: string[];
}

// ── Industry Models ────────────────────────────────────────────────────────

export const INDUSTRY_TRUST_MODELS: Record<string, IndustryTrustModel> = {
  healthcare: {
    industryId: "healthcare",
    name: "Healthcare & Life Sciences",
    riskProfile: "critical",
    dimensionWeights: {
      security: 1.5, privacy: 1.8, reliability: 1.3, compliance: 1.6,
      safety: 2.0, transparency: 1.2, fairness: 1.1, governance: 1.4,
      evaluation: 1.0, cost: 0.6,
    },
    trustDecayRate: 8,       // 8 points/24h — fast decay in healthcare
    maxStaleHours: 72,       // 3 days max
    evidenceRequirements: {
      minObservedShare: 0.7,   // 70% must be observed evidence
      minEvidenceCount: 50,
      requiredDimensions: ["security", "privacy", "safety", "compliance"],
    },
    regulatoryFrameworks: ["HIPAA", "FDA_21CFR11", "EU_MDR", "GDPR"],
    benchmarkPercentiles: { p25: 45, p50: 62, p75: 78, p90: 88, p99: 95, sampleSize: 1200, lastUpdated: Date.now() },
  },
  finance: {
    industryId: "finance",
    name: "Financial Services",
    riskProfile: "critical",
    dimensionWeights: {
      security: 1.6, privacy: 1.4, reliability: 1.5, compliance: 1.8,
      safety: 1.2, transparency: 1.3, fairness: 1.4, governance: 1.5,
      evaluation: 1.1, cost: 0.8,
    },
    trustDecayRate: 6,
    maxStaleHours: 120,
    evidenceRequirements: {
      minObservedShare: 0.65,
      minEvidenceCount: 40,
      requiredDimensions: ["security", "compliance", "governance", "reliability"],
    },
    regulatoryFrameworks: ["SOX", "PCI_DSS", "MiFID_II", "GDPR", "DORA"],
    benchmarkPercentiles: { p25: 48, p50: 65, p75: 80, p90: 90, p99: 96, sampleSize: 2500, lastUpdated: Date.now() },
  },
  defense: {
    industryId: "defense",
    name: "Defense & Intelligence",
    riskProfile: "critical",
    dimensionWeights: {
      security: 2.0, privacy: 1.5, reliability: 1.8, compliance: 1.5,
      safety: 1.8, transparency: 0.8, fairness: 0.9, governance: 1.6,
      evaluation: 1.3, cost: 0.5,
    },
    trustDecayRate: 12,      // Fastest decay — 12 points/24h
    maxStaleHours: 48,
    evidenceRequirements: {
      minObservedShare: 0.85,
      minEvidenceCount: 80,
      requiredDimensions: ["security", "reliability", "safety", "governance", "evaluation"],
    },
    regulatoryFrameworks: ["NIST_800_53", "FedRAMP", "ITAR", "CMMC"],
    benchmarkPercentiles: { p25: 55, p50: 70, p75: 85, p90: 92, p99: 98, sampleSize: 300, lastUpdated: Date.now() },
  },
  autonomous_vehicles: {
    industryId: "autonomous_vehicles",
    name: "Autonomous Vehicles & Robotics",
    riskProfile: "critical",
    dimensionWeights: {
      security: 1.4, privacy: 1.0, reliability: 2.0, compliance: 1.3,
      safety: 2.0, transparency: 1.5, fairness: 1.0, governance: 1.4,
      evaluation: 1.6, cost: 0.7,
    },
    trustDecayRate: 10,
    maxStaleHours: 24,       // Tightest window — must re-verify daily
    evidenceRequirements: {
      minObservedShare: 0.8,
      minEvidenceCount: 100,
      requiredDimensions: ["safety", "reliability", "security", "evaluation", "transparency"],
    },
    regulatoryFrameworks: ["ISO_26262", "IEC_61508", "UNECE_R157", "SOTIF_ISO_21448"],
    benchmarkPercentiles: { p25: 40, p50: 58, p75: 75, p90: 86, p99: 94, sampleSize: 150, lastUpdated: Date.now() },
  },
  enterprise_saas: {
    industryId: "enterprise_saas",
    name: "Enterprise SaaS",
    riskProfile: "high",
    dimensionWeights: {
      security: 1.3, privacy: 1.2, reliability: 1.3, compliance: 1.2,
      safety: 1.0, transparency: 1.1, fairness: 1.0, governance: 1.2,
      evaluation: 1.0, cost: 1.0,
    },
    trustDecayRate: 3,
    maxStaleHours: 168,      // 7 days
    evidenceRequirements: {
      minObservedShare: 0.5,
      minEvidenceCount: 20,
      requiredDimensions: ["security", "reliability"],
    },
    regulatoryFrameworks: ["SOC2", "GDPR", "ISO_27001"],
    benchmarkPercentiles: { p25: 35, p50: 52, p75: 70, p90: 82, p99: 92, sampleSize: 5000, lastUpdated: Date.now() },
  },
  entertainment: {
    industryId: "entertainment",
    name: "Entertainment & Media",
    riskProfile: "low",
    dimensionWeights: {
      security: 1.0, privacy: 1.1, reliability: 1.0, compliance: 0.9,
      safety: 0.8, transparency: 1.2, fairness: 1.3, governance: 0.8,
      evaluation: 0.9, cost: 1.2,
    },
    trustDecayRate: 1,       // Slowest decay
    maxStaleHours: 720,      // 30 days
    evidenceRequirements: {
      minObservedShare: 0.3,
      minEvidenceCount: 10,
      requiredDimensions: ["fairness"],
    },
    regulatoryFrameworks: ["COPPA", "GDPR"],
    benchmarkPercentiles: { p25: 25, p50: 40, p75: 58, p90: 72, p99: 85, sampleSize: 3000, lastUpdated: Date.now() },
  },
};

// ── Industry-Adjusted Scoring ──────────────────────────────────────────────

/**
 * Apply industry-specific weights and decay to a raw AMC score.
 */
export function computeIndustryAdjustedScore(
  rawDimensionScores: Record<string, number>,
  industryId: string,
  lastVerifiedAt: number,
  observedEvidenceShare: number,
  now?: number,
): IndustryAdjustedScore {
  const model = INDUSTRY_TRUST_MODELS[industryId] ?? INDUSTRY_TRUST_MODELS.enterprise_saas!;
  const currentTime = now ?? Date.now();
  const staleHours = (currentTime - lastVerifiedAt) / 3600000;

  // Apply dimension weights
  const adjustments: Record<string, { raw: number; weighted: number; weight: number }> = {};
  let totalWeighted = 0;
  let totalWeight = 0;

  for (const [dim, rawScore] of Object.entries(rawDimensionScores)) {
    const weight = model.dimensionWeights[dim] ?? 1.0;
    const weighted = rawScore * weight;
    adjustments[dim] = { raw: rawScore, weighted, weight };
    totalWeighted += weighted;
    totalWeight += weight;
  }

  let adjustedScore = totalWeight > 0 ? totalWeighted / totalWeight : 0;

  // Apply temporal decay
  const decayPoints = Math.min(adjustedScore, (staleHours / 24) * model.trustDecayRate);
  if (staleHours > model.maxStaleHours) {
    adjustedScore = 0; // Expired
  } else {
    adjustedScore -= decayPoints;
  }
  adjustedScore = Math.max(0, Math.round(adjustedScore * 100) / 100);

  // Risk factors
  const riskFactors: string[] = [];
  if (staleHours > model.maxStaleHours * 0.5) riskFactors.push(`Trust aging: ${staleHours.toFixed(0)}h since last verification`);
  if (observedEvidenceShare < model.evidenceRequirements.minObservedShare) {
    riskFactors.push(`Low observed evidence: ${(observedEvidenceShare * 100).toFixed(0)}% (need ${(model.evidenceRequirements.minObservedShare * 100).toFixed(0)}%)`);
  }

  // Compliance gaps
  const complianceGaps: string[] = [];
  for (const dim of model.evidenceRequirements.requiredDimensions) {
    if (!rawDimensionScores[dim] || rawDimensionScores[dim]! < 50) {
      complianceGaps.push(`Required dimension "${dim}" below threshold`);
    }
  }

  // Percentile rank
  const bench = model.benchmarkPercentiles;
  let percentileRank: number;
  if (adjustedScore >= bench.p99) percentileRank = 99;
  else if (adjustedScore >= bench.p90) percentileRank = 90 + 9 * (adjustedScore - bench.p90) / (bench.p99 - bench.p90);
  else if (adjustedScore >= bench.p75) percentileRank = 75 + 15 * (adjustedScore - bench.p75) / (bench.p90 - bench.p75);
  else if (adjustedScore >= bench.p50) percentileRank = 50 + 25 * (adjustedScore - bench.p50) / (bench.p75 - bench.p50);
  else if (adjustedScore >= bench.p25) percentileRank = 25 + 25 * (adjustedScore - bench.p25) / (bench.p50 - bench.p25);
  else percentileRank = 25 * adjustedScore / Math.max(1, bench.p25);

  return {
    rawScore: Object.values(rawDimensionScores).reduce((s, v) => s + v, 0) / Object.keys(rawDimensionScores).length,
    adjustedScore,
    industryId: model.industryId,
    percentileRank: Math.round(percentileRank * 10) / 10,
    dimensionAdjustments: adjustments,
    decayApplied: decayPoints,
    riskFactors,
    complianceGaps,
  };
}
