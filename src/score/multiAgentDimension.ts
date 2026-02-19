/**
 * 8th AMC Dimension: Multi-Agent Coordination
 *
 * From Whitepaper Section 9.4 Future Work:
 * "A dedicated 8th dimension covering agent coordination protocols,
 *  shared state management, and emergent behavior in multi-agent pipelines."
 *
 * 8 questions in this dimension.
 */

export interface MultiAgentProfile {
  // MA-1: Coordination Protocol
  usesStandardCoordinationProtocol: boolean;   // MCP, A2A, or documented protocol
  coordinationProtocol?: string;

  // MA-2: Shared State Management
  hasSharedStateManager: boolean;              // explicit shared state (not implicit)
  sharedStateIsVersioned: boolean;             // state changes are versioned/auditable
  conflictResolutionDefined: boolean;          // how conflicts in shared state are resolved

  // MA-3: Inter-Agent Identity Verification
  agentsVerifyPeerIdentity: boolean;           // cryptographic agent-to-agent identity
  trustBootstrappingDocumented: boolean;       // how initial trust is established

  // MA-4: Task Distribution & Deduplication
  taskAssignmentIsExplicit: boolean;           // clear who does what
  deduplicationPreventsDoubleWork: boolean;    // same task not run twice

  // MA-5: Contribution Attribution
  perAgentContributionTracked: boolean;        // which agent produced which output
  conflictDetectionEnabled: boolean;           // detect when agents contradict each other

  // MA-6: Emergent Behavior Detection
  emergentBehaviorMonitored: boolean;          // watch for unexpected collective behavior
  coordinationQualityScored: boolean;          // do agents actually help vs duplicate/conflict?

  // MA-7: Failure Isolation
  agentFailureIsIsolated: boolean;             // one agent failure doesn't cascade
  degradedModeConfigured: boolean;             // system works with fewer agents

  // MA-8: Oversight Visibility
  humanCanSeeAllAgentDecisions: boolean;       // full trace across all agents
  crossAgentAuditTrail: boolean;               // audit trail spans agent boundaries
}

export interface MultiAgentDimensionScore {
  score: number;        // 0–100
  level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  questionScores: Record<string, number>;
  criticalGaps: string[];
  strengths: string[];
}

const QUESTIONS = [
  { id: 'MA-1', name: 'Coordination Protocol', fields: ['usesStandardCoordinationProtocol'], weight: 15 },
  { id: 'MA-2', name: 'Shared State Management', fields: ['hasSharedStateManager', 'sharedStateIsVersioned', 'conflictResolutionDefined'], weight: 15 },
  { id: 'MA-3', name: 'Inter-Agent Identity Verification', fields: ['agentsVerifyPeerIdentity', 'trustBootstrappingDocumented'], weight: 15 },
  { id: 'MA-4', name: 'Task Distribution', fields: ['taskAssignmentIsExplicit', 'deduplicationPreventsDoubleWork'], weight: 10 },
  { id: 'MA-5', name: 'Contribution Attribution', fields: ['perAgentContributionTracked', 'conflictDetectionEnabled'], weight: 10 },
  { id: 'MA-6', name: 'Emergent Behavior Detection', fields: ['emergentBehaviorMonitored', 'coordinationQualityScored'], weight: 15 },
  { id: 'MA-7', name: 'Failure Isolation', fields: ['agentFailureIsIsolated', 'degradedModeConfigured'], weight: 10 },
  { id: 'MA-8', name: 'Oversight Visibility', fields: ['humanCanSeeAllAgentDecisions', 'crossAgentAuditTrail'], weight: 10 },
];

export function scoreMultiAgentDimension(profile: MultiAgentProfile): MultiAgentDimensionScore {
  const questionScores: Record<string, number> = {};
  const criticalGaps: string[] = [];
  const strengths: string[] = [];
  let totalEarned = 0;
  let totalWeight = 0;

  for (const q of QUESTIONS) {
    const p = profile as unknown as Record<string, unknown>;
    const fieldsPassed = q.fields.filter(f => !!p[f]).length;
    const qScore = Math.round((fieldsPassed / q.fields.length) * 100);
    questionScores[q.id] = qScore;
    totalEarned += (qScore / 100) * q.weight;
    totalWeight += q.weight;

    if (qScore >= 80) strengths.push(`${q.id} (${q.name}): strong`);
    if (qScore < 40) criticalGaps.push(`${q.id} (${q.name}): ${q.fields.filter(f => !p[f]).join(', ')} not implemented`);
  }

  const score = Math.round((totalEarned / totalWeight) * 100);
  const level: MultiAgentDimensionScore['level'] =
    score >= 90 ? 'L5' : score >= 75 ? 'L4' : score >= 50 ? 'L3' : score >= 25 ? 'L2' : 'L1';

  return { score, level, questionScores, criticalGaps, strengths };
}
