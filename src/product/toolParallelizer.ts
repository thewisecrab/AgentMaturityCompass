/**
 * toolParallelizer.ts — Parallel tool execution with concurrency
 * control (semaphore), per-task timeouts, priority ordering, and
 * cancellation support.
 */

import { randomUUID } from 'node:crypto';

/* ── Interfaces ──────────────────────────────────────────────────── */

export interface ParallelTask {
  id: string;
  name: string;
  fn: () => Promise<unknown>;
  priority: number;
  timeout?: number;
  group?: string;
}

export interface TaskResult {
  id: string;
  name: string;
  result?: unknown;
  error?: string;
  durationMs: number;
  status: 'fulfilled' | 'rejected' | 'timeout' | 'cancelled';
}

/** Backward-compatible with stubs.ts ParallelResult, extended. */
export interface ParallelResult {
  results: unknown[];
  totalMs: number;
  tasks: TaskResult[];
}

/* ── Semaphore ───────────────────────────────────────────────────── */

class Semaphore {
  private queue: Array<() => void> = [];
  private active = 0;
  constructor(private concurrency: number) {}

  async acquire(): Promise<void> {
    if (this.active < this.concurrency) { this.active++; return; }
    return new Promise<void>(resolve => this.queue.push(resolve));
  }

  release(): void {
    this.active--;
    const next = this.queue.shift();
    if (next) { this.active++; next(); }
  }
}

/* ── Parallelizer ────────────────────────────────────────────────── */

export class ToolParallelizer {
  private tasks: ParallelTask[] = [];
  private concurrency = Infinity;
  private globalTimeout?: number;
  private cancelled = false;

  addTask(name: string, fn: () => Promise<unknown>, opts?: { priority?: number; timeout?: number; group?: string }): this {
    this.tasks.push({
      id: randomUUID(),
      name,
      fn,
      priority: opts?.priority ?? 0,
      timeout: opts?.timeout,
      group: opts?.group,
    });
    return this;
  }

  withConcurrency(n: number): this {
    this.concurrency = Math.max(1, n);
    return this;
  }

  withTimeout(ms: number): this {
    this.globalTimeout = ms;
    return this;
  }

  cancel(): void {
    this.cancelled = true;
  }

  async run(): Promise<ParallelResult> {
    this.cancelled = false;
    const start = Date.now();

    // Sort by priority descending (higher priority first)
    const sorted = [...this.tasks].sort((a, b) => b.priority - a.priority);
    const sem = new Semaphore(this.concurrency);
    const taskResults: TaskResult[] = [];

    const executeOne = async (task: ParallelTask): Promise<TaskResult> => {
      if (this.cancelled) {
        return { id: task.id, name: task.name, durationMs: 0, status: 'cancelled' };
      }

      await sem.acquire();
      const taskStart = Date.now();

      try {
        if (this.cancelled) {
          return { id: task.id, name: task.name, durationMs: 0, status: 'cancelled' };
        }

        const timeout = task.timeout ?? this.globalTimeout;
        let result: unknown;

        if (timeout) {
          result = await Promise.race([
            task.fn(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout)),
          ]);
        } else {
          result = await task.fn();
        }

        return {
          id: task.id,
          name: task.name,
          result,
          durationMs: Date.now() - taskStart,
          status: 'fulfilled',
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          id: task.id,
          name: task.name,
          error: msg,
          durationMs: Date.now() - taskStart,
          status: msg === 'timeout' ? 'timeout' : 'rejected',
        };
      } finally {
        sem.release();
      }
    };

    const settled = await Promise.all(sorted.map(t => executeOne(t)));
    taskResults.push(...settled);

    return {
      results: taskResults.map(tr => tr.result ?? null),
      totalMs: Date.now() - start,
      tasks: taskResults,
    };
  }
}

/* ── Backward-compatible free function (stubs.ts) ────────────────── */

export async function parallelizeTools(
  fns: Array<() => Promise<unknown>>,
): Promise<ParallelResult> {
  const p = new ToolParallelizer();
  for (let i = 0; i < fns.length; i++) p.addTask(`task_${i}`, fns[i]!);
  return p.run();
}
