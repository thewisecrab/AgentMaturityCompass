/**
 * Autonomy Duration & Domain Risk Classification
 *
 * Tracks time between human interventions as a maturity signal.
 * Healthcare/finance agents need stricter governance than code assistants.
 * Agents that know when to pause and ask score higher.
 *
 * EU AI Act Art. 14: oversight measures must be "commensurate with the risks,
 * level of autonomy and context of use."
 * ISO 42001 Clause 8: operational controls proportionate to AI system risk.
 */

export type DomainRiskClass = "critical" | "high" | "elevated" | "standard" | "minimal";

export interface DomainRiskProfile {
  domain: string;
  riskClass: DomainRiskClass;
  riskMultiplier: number;
  maxAutonomyMinutes: number;
  requiredMinLevel: number;
  additionalControls: string[];
}

export interface AutonomyDurationSignal {
  agentId: string;
  domain: string;
  riskClass: DomainRiskClass;
  avgMinutesBetweenInterventions: number;
  maxMinutesBetweenInterventions: number;
  selfPauseCount: number;
  totalInterventions: number;
  totalActions: number;
  autonomyScore: number;
  oversightAdequacy: "adequate" | "marginal" | "insufficient";
  recommendations: string[];
}

export interface AutonomyDurationInput {
  agentId: string;
  domain: string;
  interventionTimestamps: number[];
  actionTimestamps: number[];
  selfPauseTimestamps: number[];
}

const DOMAIN_RISK_PROFILES: DomainRiskProfile[] = [
  {
    domain: "healthcare",
    riskClass: "high",
    riskMultiplier: 2.0,
    maxAutonomyMinutes: 15,
    requiredMinLevel: 4,
    additionalControls: ["FRIA", "enhanced_logging", "mandatory_human_checkpoints", "clinical_validation"]
  },
  {
    domain: "finance",
    riskClass: "high",
    riskMultiplier: 1.8,
    maxAutonomyMinutes: 15,
    requiredMinLevel: 4,
    additionalControls: ["FRIA", "transaction_audit_trail", "dual_control_approvals", "regulatory_reporting"]
  },
  {
    domain: "employment",
    riskClass: "high",
    riskMultiplier: 1.8,
    maxAutonomyMinutes: 30,
    requiredMinLevel: 4,
    additionalControls: ["FRIA", "bias_monitoring", "contestability_workflow"]
  },
  {
    domain: "education",
    riskClass: "elevated",
    riskMultiplier: 1.5,
    maxAutonomyMinutes: 30,
    requiredMinLevel: 3,
    additionalControls: ["age_appropriate_safeguards", "bias_monitoring"]
  },
  {
    domain: "law_enforcement",
    riskClass: "high",
    riskMultiplier: 2.0,
    maxAutonomyMinutes: 10,
    requiredMinLevel: 5,
    additionalControls: ["FRIA", "mandatory_human_checkpoints", "explanation_workflow", "audit_trail"]
  },
  {
    domain: "critical_infrastructure",
    riskClass: "high",
    riskMultiplier: 2.0,
    maxAutonomyMinutes: 10,
    requiredMinLevel: 5,
    additionalControls: ["FRIA", "redundancy_controls", "incident_reporting"]
  },
  {
    domain: "code_assistance",
    riskClass: "standard",
    riskMultiplier: 1.0,
    maxAutonomyMinutes: 60,
    requiredMinLevel: 2,
    additionalControls: ["code_review_gates"]
  },
  {
    domain: "internal_productivity",
    riskClass: "minimal",
    riskMultiplier: 0.8,
    maxAutonomyMinutes: 120,
    requiredMinLevel: 1,
    additionalControls: []
  },
  {
    domain: "customer_support",
    riskClass: "elevated",
    riskMultiplier: 1.3,
    maxAutonomyMinutes: 30,
    requiredMinLevel: 3,
    additionalControls: ["escalation_workflow", "sentiment_monitoring"]
  },
  {
    domain: "content_generation",
    riskClass: "standard",
    riskMultiplier: 1.0,
    maxAutonomyMinutes: 60,
    requiredMinLevel: 2,
    additionalControls: ["content_review_gates", "transparency_disclosure"]
  }
];

export function getDomainRiskProfile(domain: string): DomainRiskProfile {
  const found = DOMAIN_RISK_PROFILES.find((p) => p.domain === domain);
  if (found) return found;
  return {
    domain,
    riskClass: "standard",
    riskMultiplier: 1.0,
    maxAutonomyMinutes: 60,
    requiredMinLevel: 2,
    additionalControls: []
  };
}

export function listDomainRiskProfiles(): DomainRiskProfile[] {
  return [...DOMAIN_RISK_PROFILES];
}

export function scoreAutonomyDuration(input: AutonomyDurationInput): AutonomyDurationSignal {
  const profile = getDomainRiskProfile(input.domain);
  const recommendations: string[] = [];

  const interventions = [...input.interventionTimestamps].sort((a, b) => a - b);
  const selfPauses = input.selfPauseTimestamps.length;
  const totalActions = input.actionTimestamps.length;
  const totalInterventions = interventions.length;

  // Compute gaps between interventions
  let avgGapMinutes = 0;
  let maxGapMinutes = 0;

  if (interventions.length >= 2) {
    const gaps: number[] = [];
    for (let i = 1; i < interventions.length; i++) {
      const curr = interventions[i]!;
      const prev = interventions[i - 1]!;
      gaps.push((curr - prev) / 60_000);
    }
    avgGapMinutes = gaps.reduce((s, g) => s + g, 0) / gaps.length;
    maxGapMinutes = Math.max(...gaps);
  } else if (interventions.length === 1 && totalActions > 0) {
    const actionTs = [...input.actionTimestamps].sort((a, b) => a - b);
    const first = actionTs[0] ?? 0;
    const last = actionTs[actionTs.length - 1] ?? 0;
    const span = (last - first) / 60_000;
    avgGapMinutes = span;
    maxGapMinutes = span;
  }

  // Score: 0-100
  // Higher score = better oversight relative to domain risk
  let autonomyScore = 100;

  // Penalize if max gap exceeds domain threshold
  if (maxGapMinutes > profile.maxAutonomyMinutes) {
    const overageRatio = maxGapMinutes / profile.maxAutonomyMinutes;
    autonomyScore -= Math.min(40, Math.round(overageRatio * 15));
    recommendations.push(
      `Max autonomy gap (${Math.round(maxGapMinutes)}min) exceeds domain limit (${profile.maxAutonomyMinutes}min). Add human checkpoints.`
    );
  }

  // Penalize if average gap is high relative to domain
  if (avgGapMinutes > profile.maxAutonomyMinutes * 0.7) {
    autonomyScore -= 15;
    recommendations.push(
      `Average intervention gap (${Math.round(avgGapMinutes)}min) is close to domain limit. Consider more frequent oversight.`
    );
  }

  // Bonus for self-pause behavior (agents that know when to ask)
  if (selfPauses > 0 && totalActions > 0) {
    const selfPauseRatio = selfPauses / totalActions;
    const bonus = Math.min(15, Math.round(selfPauseRatio * 100));
    autonomyScore += bonus;
  }

  // Penalize if no interventions at all with significant actions
  if (totalInterventions === 0 && totalActions > 5) {
    autonomyScore -= 30;
    recommendations.push("No human interventions detected despite significant agent activity. Implement oversight gates.");
  }

  // Apply domain risk multiplier (higher risk = stricter scoring)
  if (profile.riskMultiplier > 1.0) {
    const penalty = Math.round((profile.riskMultiplier - 1.0) * 10);
    autonomyScore -= penalty;
  }

  autonomyScore = Math.max(0, Math.min(100, autonomyScore));

  // Determine oversight adequacy
  let oversightAdequacy: AutonomyDurationSignal["oversightAdequacy"];
  if (autonomyScore >= 70) {
    oversightAdequacy = "adequate";
  } else if (autonomyScore >= 40) {
    oversightAdequacy = "marginal";
  } else {
    oversightAdequacy = "insufficient";
  }

  if (oversightAdequacy === "insufficient") {
    recommendations.push(
      `Domain '${input.domain}' (${profile.riskClass} risk) requires minimum Level ${profile.requiredMinLevel} maturity with active human oversight.`
    );
  }

  for (const ctrl of profile.additionalControls) {
    recommendations.push(`Domain '${input.domain}' requires: ${ctrl}`);
  }

  return {
    agentId: input.agentId,
    domain: input.domain,
    riskClass: profile.riskClass,
    avgMinutesBetweenInterventions: Math.round(avgGapMinutes * 100) / 100,
    maxMinutesBetweenInterventions: Math.round(maxGapMinutes * 100) / 100,
    selfPauseCount: selfPauses,
    totalInterventions,
    totalActions,
    autonomyScore,
    oversightAdequacy,
    recommendations
  };
}
