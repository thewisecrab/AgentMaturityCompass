import { randomUUID } from 'node:crypto';

export interface TaskSpec { specId: string; description: string; constraints: string[]; subtasks?: SubTask[]; complexity?: number; }
export interface SubTask { id: string; description: string; dependencies: string[]; }

export function createTaskSpec(description: string, constraints?: string[]): TaskSpec {
  const words = description.split(/\s+/);
  const autoConstraints = constraints ?? [];
  if (words.length > 50) autoConstraints.push('Complex task - consider decomposition');
  return { specId: randomUUID(), description, constraints: autoConstraints };
}

export function validateSpec(spec: TaskSpec): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!spec.description || spec.description.length < 10) issues.push('Description too short');
  if (spec.subtasks && spec.subtasks.length === 0) issues.push('Empty subtask list');
  // Check circular deps
  if (spec.subtasks) {
    const ids = new Set(spec.subtasks.map(s => s.id));
    for (const st of spec.subtasks) {
      for (const dep of st.dependencies) { if (!ids.has(dep)) issues.push(`Unknown dependency: ${dep}`); }
    }
  }
  return { valid: issues.length === 0, issues };
}

export function decomposeTask(spec: TaskSpec): SubTask[] {
  const parts = spec.description.split(/[;,]\s*|(?:\band\b)/i).filter(p => p.trim().length > 5);
  return parts.map((p, i) => ({ id: randomUUID(), description: p.trim(), dependencies: i > 0 ? [] : [] }));
}

export function estimateComplexity(spec: TaskSpec): number {
  let score = 0;
  const words = spec.description.split(/\s+/).length;
  score += Math.min(words / 20, 1) * 0.3;
  score += Math.min((spec.constraints?.length ?? 0) / 5, 1) * 0.3;
  score += Math.min((spec.subtasks?.length ?? 0) / 10, 1) * 0.2;
  if (/\b(complex|difficult|advanced|multi|integrate)\b/i.test(spec.description)) score += 0.2;
  return Math.min(1, score);
}
