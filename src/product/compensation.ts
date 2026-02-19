import { randomUUID } from 'node:crypto';

export interface CompensationEntry { id: string; action: string; compensateFn: () => unknown; compensated: boolean; timestamp: number; }
export interface CompensationAction { actionId: string; operation: string; reversed: boolean; }

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
    return entry.compensateFn();
  }

  getLog(): CompensationEntry[] { return [...this.log.values()]; }
}

export function compensate(operation: string): CompensationAction {
  return { actionId: randomUUID(), operation, reversed: true };
}
