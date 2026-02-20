/**
 * compensation.ts — CompensationSaga for multi-step LIFO rollback,
 * outcome tracking, and automatic pruning.
 */

import { randomUUID } from 'node:crypto';

export interface CompensationEntry {
  id: string;
  action: string;
  compensateFn: () => unknown;
  compensated: boolean;
  timestamp: number;
  outcome?: 'success' | 'failed';
  error?: string;
}

export interface CompensationAction {
  actionId: string;
  operation: string;
  reversed: boolean;
}

export interface SagaResult {
  sagaId: string;
  status: 'completed' | 'compensated' | 'partial-failure';
  stepsExecuted: number;
  stepsCompensated: number;
  errors: string[];
}

/* ── CompensationLog (backward compat) ───────────────────────────── */

export class CompensationLog {
  private log = new Map<string, CompensationEntry>();

  recordAction(id: string, action: string, compensateWith: () => unknown): void {
    this.log.set(id, { id, action, compensateFn: compensateWith, compensated: false, timestamp: Date.now() });
  }

  compensate(id: string): unknown {
    const entry = this.log.get(id);
    if (!entry) throw new Error(`Action ${id} not found`);
    if (entry.compensated) throw new Error('Already compensated');
    entry.compensated = true;
    try {
      const result = entry.compensateFn();
      entry.outcome = 'success';
      return result;
    } catch (err) {
      entry.outcome = 'failed';
      entry.error = err instanceof Error ? err.message : String(err);
      throw err;
    }
  }

  getLog(): CompensationEntry[] { return [...this.log.values()]; }

  /** Prune old completed entries */
  prune(maxAgeMs = 24 * 3600_000): number {
    const cutoff = Date.now() - maxAgeMs;
    let pruned = 0;
    for (const [id, entry] of this.log) {
      if (entry.compensated && entry.timestamp < cutoff) {
        this.log.delete(id);
        pruned++;
      }
    }
    return pruned;
  }
}

/* ── CompensationSaga (multi-step LIFO rollback) ─────────────────── */

export interface SagaStep {
  name: string;
  execute: () => unknown | Promise<unknown>;
  compensate: () => unknown | Promise<unknown>;
}

export class CompensationSaga {
  private sagaId = randomUUID();
  private steps: SagaStep[] = [];
  private executed: SagaStep[] = [];

  addStep(step: SagaStep): this {
    this.steps.push(step);
    return this;
  }

  async run(): Promise<SagaResult> {
    const errors: string[] = [];
    let stepsExecuted = 0;

    for (const step of this.steps) {
      try {
        await step.execute();
        this.executed.push(step);
        stepsExecuted++;
      } catch (err) {
        errors.push(`Step "${step.name}" failed: ${err instanceof Error ? err.message : String(err)}`);
        // LIFO compensation
        const compensated = await this.compensateAll();
        return {
          sagaId: this.sagaId,
          status: compensated.errors.length > 0 ? 'partial-failure' : 'compensated',
          stepsExecuted,
          stepsCompensated: compensated.count,
          errors: [...errors, ...compensated.errors],
        };
      }
    }

    return { sagaId: this.sagaId, status: 'completed', stepsExecuted, stepsCompensated: 0, errors: [] };
  }

  private async compensateAll(): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = [];
    let count = 0;
    // LIFO order
    for (let i = this.executed.length - 1; i >= 0; i--) {
      const step = this.executed[i]!;
      try {
        await step.compensate();
        count++;
      } catch (err) {
        errors.push(`Compensation for "${step.name}" failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    return { count, errors };
  }
}

/* ── Legacy compat ───────────────────────────────────────────────── */

export function compensate(operation: string): CompensationAction {
  return { actionId: randomUUID(), operation, reversed: true };
}
