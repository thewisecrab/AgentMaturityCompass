/**
 * goalTracker.ts — Goal management with milestones, decomposition,
 * and keyword-overlap drift detection.
 */

import { randomUUID } from 'node:crypto';

/* ── Interfaces ──────────────────────────────────────────────────── */

export type GoalStatusType = 'active' | 'completed' | 'abandoned' | 'drifted';
export type MilestoneStatus = 'pending' | 'in_progress' | 'done' | 'skipped' | 'blocked';

export interface MilestoneRecord {
  milestoneId: string;
  goalId: string;
  seq: number;
  title: string;
  status: MilestoneStatus;
  dependsOn: string[];
  completedAt?: number;
}

export interface GoalRecord {
  goalId: string;
  tenantId: string;
  title: string;
  description: string;
  status: GoalStatusType;
  keywords: string[];
  milestones: MilestoneRecord[];
  createdAt: number;
  updatedAt: number;
}

export interface DriftEvent {
  driftId: string;
  goalId: string;
  driftScore: number;
  aligned: boolean;
  explanation: string;
  detectedAt: number;
}

/** Backward-compat shape from stubs.ts */
export interface GoalStatus { goalId: string; progress: number; complete: boolean; }

/* ── Helpers ─────────────────────────────────────────────────────── */

function extractKeywords(text: string): string[] {
  const stopwords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'is', 'in', 'on', 'at', 'to',
    'for', 'of', 'with', 'by', 'it', 'this', 'that', 'was', 'are', 'be',
    'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'may', 'might', 'can', 'not', 'no', 'so', 'if', 'then', 'than', 'as',
  ]);
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopwords.has(w));
}

/* ── Class ───────────────────────────────────────────────────────── */

const DRIFT_THRESHOLD = 0.35;

export class GoalTracker {
  private goals = new Map<string, GoalRecord>();
  private milestoneIndex = new Map<string, MilestoneRecord>();
  private driftEvents: DriftEvent[] = [];

  createGoal(tenantId: string, title: string, description: string, keywords?: string[]): GoalRecord {
    const goal: GoalRecord = {
      goalId: randomUUID(), tenantId, title, description,
      status: 'active',
      keywords: keywords ?? extractKeywords(`${title} ${description}`),
      milestones: [],
      createdAt: Date.now(), updatedAt: Date.now(),
    };
    this.goals.set(goal.goalId, goal);
    return goal;
  }

  getGoal(goalId: string): GoalRecord | undefined {
    return this.goals.get(goalId);
  }

  addMilestone(goalId: string, title: string, seq: number, dependsOn: string[] = []): MilestoneRecord {
    const goal = this.goals.get(goalId);
    if (!goal) throw new Error(`Goal ${goalId} not found`);
    const milestone: MilestoneRecord = {
      milestoneId: randomUUID(), goalId, seq, title,
      status: 'pending', dependsOn,
    };
    goal.milestones.push(milestone);
    goal.milestones.sort((a, b) => a.seq - b.seq);
    goal.updatedAt = Date.now();
    this.milestoneIndex.set(milestone.milestoneId, milestone);
    return milestone;
  }

  updateMilestoneStatus(milestoneId: string, status: MilestoneStatus): MilestoneRecord {
    const milestone = this.milestoneIndex.get(milestoneId);
    if (!milestone) throw new Error(`Milestone ${milestoneId} not found`);

    // Check dependency constraints
    if (status === 'in_progress' || status === 'done') {
      for (const depId of milestone.dependsOn) {
        const dep = this.milestoneIndex.get(depId);
        if (dep && dep.status !== 'done' && dep.status !== 'skipped') {
          throw new Error(`Dependency ${depId} not completed`);
        }
      }
    }

    milestone.status = status;
    if (status === 'done') milestone.completedAt = Date.now();

    const goal = this.goals.get(milestone.goalId);
    if (goal) {
      goal.updatedAt = Date.now();
      // Auto-complete goal when all milestones are done or skipped
      const allDone = goal.milestones.length > 0 &&
        goal.milestones.every(m => m.status === 'done' || m.status === 'skipped');
      if (allDone) goal.status = 'completed';
    }
    return milestone;
  }

  /** Decompose a goal into milestones from spec strings */
  decompose(goalId: string, specs: string[]): MilestoneRecord[] {
    const results: MilestoneRecord[] = [];
    for (let i = 0; i < specs.length; i++) {
      results.push(this.addMilestone(goalId, specs[i]!, i));
    }
    return results;
  }

  /** Keyword-overlap drift detection */
  checkDrift(goalId: string, actionSummary: string): DriftEvent {
    const goal = this.goals.get(goalId);
    if (!goal) throw new Error(`Goal ${goalId} not found`);

    const actionKw = extractKeywords(actionSummary);
    if (actionKw.length === 0) {
      const event: DriftEvent = {
        driftId: randomUUID(), goalId, driftScore: 1, aligned: false,
        explanation: 'Action summary contained no meaningful keywords',
        detectedAt: Date.now(),
      };
      this.driftEvents.push(event);
      if (goal.status === 'active') goal.status = 'drifted';
      return event;
    }

    const goalKwSet = new Set(goal.keywords);
    const overlap = actionKw.filter(k => goalKwSet.has(k)).length;
    const driftScore = 1 - overlap / actionKw.length;
    const aligned = driftScore <= DRIFT_THRESHOLD;

    const event: DriftEvent = {
      driftId: randomUUID(), goalId, driftScore: Math.round(driftScore * 1000) / 1000,
      aligned,
      explanation: aligned
        ? `Action aligns with goal (${overlap}/${actionKw.length} keywords overlap)`
        : `Action may be drifting from goal (only ${overlap}/${actionKw.length} keywords overlap, threshold ${DRIFT_THRESHOLD})`,
      detectedAt: Date.now(),
    };
    this.driftEvents.push(event);
    if (!aligned && goal.status === 'active') goal.status = 'drifted';
    return event;
  }

  /** Get progress as ratio of done milestones */
  getProgress(goalId: string): number {
    const goal = this.goals.get(goalId);
    if (!goal || goal.milestones.length === 0) return 0;
    return goal.milestones.filter(m => m.status === 'done').length / goal.milestones.length;
  }

  getDriftHistory(goalId?: string): DriftEvent[] {
    if (goalId) return this.driftEvents.filter(e => e.goalId === goalId);
    return [...this.driftEvents];
  }

  listGoals(tenantId?: string): GoalRecord[] {
    const all = [...this.goals.values()];
    return tenantId ? all.filter(g => g.tenantId === tenantId) : all;
  }
}

/* ── Legacy compat ───────────────────────────────────────────────── */

export function trackGoal(goalId: string, progress: number): GoalStatus {
  return { goalId, progress: Math.min(1, progress), complete: progress >= 1 };
}
