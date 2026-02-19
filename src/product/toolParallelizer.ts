import { randomUUID } from 'node:crypto';

export interface ParallelTask { id: string; fn: () => Promise<unknown>; label?: string; }
export interface ParallelResult { results: unknown[]; totalMs: number; errors: string[]; }

export async function runParallel(tasks: ParallelTask[]): Promise<ParallelResult> {
  const start = Date.now();
  const settled = await Promise.allSettled(tasks.map(t => t.fn()));
  const results: unknown[] = [];
  const errors: string[] = [];
  for (let i = 0; i < settled.length; i++) {
    const s = settled[i]!;
    if (s.status === 'fulfilled') results.push(s.value);
    else { results.push(null); errors.push(`${tasks[i]?.label ?? tasks[i]?.id ?? i}: ${(s as PromiseRejectedResult).reason}`); }
  }
  return { results, totalMs: Date.now() - start, errors };
}

export function aggregateResults(results: unknown[]): Record<string, unknown> {
  const merged: Record<string, unknown> = {};
  for (let i = 0; i < results.length; i++) {
    if (results[i] && typeof results[i] === 'object') Object.assign(merged, results[i]);
    else merged[`result_${i}`] = results[i];
  }
  return merged;
}

export function detectConflicts(results: unknown[]): { hasConflicts: boolean; conflicts: string[] } {
  const conflicts: string[] = [];
  const keys = new Map<string, unknown[]>();
  for (const r of results) {
    if (r && typeof r === 'object') {
      for (const [k, v] of Object.entries(r as Record<string, unknown>)) {
        if (!keys.has(k)) keys.set(k, []);
        keys.get(k)!.push(v);
      }
    }
  }
  for (const [k, vals] of keys) {
    const unique = new Set(vals.map(v => JSON.stringify(v)));
    if (unique.size > 1) conflicts.push(`Conflicting values for "${k}"`);
  }
  return { hasConflicts: conflicts.length > 0, conflicts };
}

export async function parallelizeTools(fns: Array<() => Promise<unknown>>): Promise<{ results: unknown[]; totalMs: number }> {
  const start = Date.now();
  const results = await Promise.all(fns.map(fn => fn()));
  return { results, totalMs: Date.now() - start };
}
