/**
 * Autonomy control — decides when agent should ask vs act.
 */

import { randomUUID } from 'node:crypto';

export type AutonomyMode = 'ask' | 'act' | 'conditional';

export interface AutonomyDecision {
  mode: AutonomyMode;
  shouldAsk: boolean;
  rationale: string;
  decisionId: string;
}

const HIGH_RISK_TASKS = new Set(['delete', 'deploy', 'payment', 'email', 'publish', 'execute']);
const LOW_RISK_TASKS = new Set(['read', 'search', 'summarize', 'analyze', 'format']);

export class AutonomyDial {
  decide(
    _tenantId: string,
    taskType: string,
    confidence?: number,
    _context?: Record<string, unknown>,
  ): AutonomyDecision {
    const conf = confidence ?? 0.5;

    if (HIGH_RISK_TASKS.has(taskType.toLowerCase())) {
      return { mode: 'ask', shouldAsk: true, rationale: `High-risk task: ${taskType}`, decisionId: randomUUID() };
    }

    if (LOW_RISK_TASKS.has(taskType.toLowerCase()) && conf >= 0.8) {
      return { mode: 'act', shouldAsk: false, rationale: `Low-risk task with high confidence`, decisionId: randomUUID() };
    }

    return { mode: 'conditional', shouldAsk: conf < 0.7, rationale: `Confidence ${conf} for ${taskType}`, decisionId: randomUUID() };
  }
}
