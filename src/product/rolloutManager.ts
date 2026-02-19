import { randomUUID } from 'node:crypto';

export interface RolloutStage { percentage: number; duration: number; }
export interface Rollout { id: string; feature: string; stages: RolloutStage[]; currentStage: number; status: 'active' | 'complete' | 'rolled-back'; startedAt: number; }
export interface RolloutStatus { feature: string; percentage: number; enabled: boolean; }

export class RolloutManager {
  private rollouts = new Map<string, Rollout>();

  createRollout(feature: string, stages: RolloutStage[]): Rollout {
    const r: Rollout = { id: randomUUID(), feature, stages, currentStage: 0, status: 'active', startedAt: Date.now() };
    this.rollouts.set(r.id, r);
    return r;
  }

  advanceRollout(rolloutId: string): Rollout {
    const r = this.rollouts.get(rolloutId);
    if (!r) throw new Error('Rollout not found');
    if (r.currentStage < r.stages.length - 1) r.currentStage++;
    else r.status = 'complete';
    return r;
  }

  rollback(rolloutId: string): Rollout {
    const r = this.rollouts.get(rolloutId);
    if (!r) throw new Error('Rollout not found');
    r.status = 'rolled-back';
    r.currentStage = 0;
    return r;
  }

  getStatus(rolloutId: string): { percentage: number; stage: number; status: string } {
    const r = this.rollouts.get(rolloutId);
    if (!r) throw new Error('Rollout not found');
    return { percentage: r.stages[r.currentStage]?.percentage ?? 0, stage: r.currentStage, status: r.status };
  }
}

export function checkRollout(feature: string, percentage?: number): RolloutStatus {
  const pct = percentage ?? 100;
  return { feature, percentage: pct, enabled: Math.random() * 100 < pct };
}
