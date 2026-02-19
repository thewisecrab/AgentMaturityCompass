import { randomUUID } from 'node:crypto';

export interface Goal { id: string; agentId: string; description: string; targetMetric?: string; deadline?: number; progress: number; milestones: { label: string; at: number; reached: boolean }[]; }
export interface GoalStatus { goalId: string; progress: number; complete: boolean; }

export class GoalTracker {
  private goals = new Map<string, Goal>();

  setGoal(agentId: string, goal: { description: string; targetMetric?: string; deadline?: number }): Goal {
    const g: Goal = { id: randomUUID(), agentId, ...goal, progress: 0, milestones: [
      { label: '25%', at: 0.25, reached: false },
      { label: '50%', at: 0.5, reached: false },
      { label: '75%', at: 0.75, reached: false },
      { label: '100%', at: 1, reached: false },
    ]};
    this.goals.set(g.id, g);
    return g;
  }

  updateProgress(goalId: string, progress: number): Goal {
    const g = this.goals.get(goalId);
    if (!g) throw new Error('Goal not found');
    g.progress = Math.min(1, Math.max(0, progress));
    for (const m of g.milestones) { if (g.progress >= m.at) m.reached = true; }
    return g;
  }

  getGoalStatus(goalId: string): GoalStatus {
    const g = this.goals.get(goalId);
    if (!g) throw new Error('Goal not found');
    return { goalId: g.id, progress: g.progress, complete: g.progress >= 1 };
  }

  listGoals(agentId: string): Goal[] {
    return [...this.goals.values()].filter(g => g.agentId === agentId);
  }
}

export function trackGoal(goalId: string, progress: number): GoalStatus {
  return { goalId, progress: Math.min(1, progress), complete: progress >= 1 };
}
