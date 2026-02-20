/**
 * communityGovernance.ts — Community governance assessment with
 * ReputationRegistry class (endorse, violations, leaderboard).
 */

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
  recommendations: string[];
}

export interface ReputationEntry {
  agentId: string;
  endorsements: number;
  violations: number;
  score: number;
  lastUpdated: number;
}

/* ── Assessment ──────────────────────────────────────────────────── */

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

  const level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5' =
    score >= 90 ? 'L5' : score >= 70 ? 'L4' : score >= 50 ? 'L3' : score >= 30 ? 'L2' : 'L1';

  const recommendations: string[] = [];
  if (!evidenceGatedReputation) recommendations.push('Implement evidence-gated reputation: require verifiable proof for reputation changes');
  if (!trustTierSystem) recommendations.push('Create a trust tier system with automatic promotion/demotion based on behavior');
  if (!crossAgentVerification) recommendations.push('Enable cross-agent verification for critical actions');
  if (platformTransparency < 0.7) recommendations.push('Increase platform transparency through public audit logs and decision records');
  if (votingManipulationResistance < 0.7) recommendations.push('Add Sybil resistance and weighted voting to prevent manipulation');

  return {
    target, evidenceGatedReputation, trustTierSystem, crossAgentVerification,
    platformTransparency, votingManipulationResistance,
    incidentResponseTime: input.incidentResponseTime,
    overallScore: score, level, recommendations,
  };
}

/* ── ReputationRegistry ──────────────────────────────────────────── */

export class ReputationRegistry {
  private entries = new Map<string, ReputationEntry>();

  /** Ensure agent exists in registry */
  private ensure(agentId: string): ReputationEntry {
    let entry = this.entries.get(agentId);
    if (!entry) {
      entry = { agentId, endorsements: 0, violations: 0, score: 50, lastUpdated: Date.now() };
      this.entries.set(agentId, entry);
    }
    return entry;
  }

  /** Endorse an agent (increases score) */
  endorse(agentId: string, weight = 1): ReputationEntry {
    const entry = this.ensure(agentId);
    entry.endorsements += weight;
    entry.score = Math.min(100, entry.score + 5 * weight);
    entry.lastUpdated = Date.now();
    return entry;
  }

  /** Record a violation (decreases score) */
  recordViolation(agentId: string, severity: number = 1): ReputationEntry {
    const entry = this.ensure(agentId);
    entry.violations += 1;
    entry.score = Math.max(0, entry.score - 10 * severity);
    entry.lastUpdated = Date.now();
    return entry;
  }

  /** Get agent's reputation */
  getReputation(agentId: string): ReputationEntry | undefined {
    return this.entries.get(agentId);
  }

  /** Get top agents by score */
  leaderboard(limit = 10): ReputationEntry[] {
    return [...this.entries.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /** Get agents below a threshold */
  lowReputation(threshold = 30): ReputationEntry[] {
    return [...this.entries.values()].filter(e => e.score < threshold);
  }

  /** Reset an agent's reputation */
  reset(agentId: string): void {
    this.entries.delete(agentId);
  }

  /** Get all entries */
  listAll(): ReputationEntry[] {
    return [...this.entries.values()];
  }

  /** Decay scores over time (call periodically) */
  applyDecay(decayFactor = 0.99): void {
    for (const entry of this.entries.values()) {
      entry.score = Math.max(0, entry.score * decayFactor);
      entry.lastUpdated = Date.now();
    }
  }
}
