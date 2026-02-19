export type GovernanceTarget = 'agent' | 'platform' | 'ecosystem' | 'community';

export interface CommunityGovernanceProfile {
  target: GovernanceTarget;
  evidenceGatedReputation: boolean;
  trustTierSystem: boolean;
  crossAgentVerification: boolean;
  platformTransparency: number;
  votingManipulationResistance: number;
  incidentResponseTime?: number;
  overallScore: number;
  level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
}

export function assessCommunityGovernance(input: Partial<CommunityGovernanceProfile>): CommunityGovernanceProfile {
  const target = input.target ?? 'agent';
  const evidenceGatedReputation = input.evidenceGatedReputation ?? false;
  const trustTierSystem = input.trustTierSystem ?? false;
  const crossAgentVerification = input.crossAgentVerification ?? false;
  const platformTransparency = Math.min(1, Math.max(0, input.platformTransparency ?? 0));
  const votingManipulationResistance = Math.min(1, Math.max(0, input.votingManipulationResistance ?? 0));

  let score = 0;
  if (evidenceGatedReputation) score += 20;
  if (trustTierSystem) score += 20;
  if (crossAgentVerification) score += 20;
  score += Math.round(platformTransparency * 20);
  score += Math.round(votingManipulationResistance * 20);

  const level = score >= 90 ? 'L5' : score >= 70 ? 'L4' : score >= 50 ? 'L3' : score >= 30 ? 'L2' : 'L1';

  return {
    target,
    evidenceGatedReputation,
    trustTierSystem,
    crossAgentVerification,
    platformTransparency,
    votingManipulationResistance,
    incidentResponseTime: input.incidentResponseTime,
    overallScore: score,
    level,
  };
}
