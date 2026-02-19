import { randomUUID } from 'node:crypto';

export interface EscalationRecord { id: string; issue: string; severity: number; status: 'open' | 'routed' | 'resolved'; assignedTo?: string; createdAt: number; slaDeadline: number; }
export interface Escalation { escalationId: string; reason: string; level: number; }

const SLA_MS: Record<number, number> = { 1: 4 * 3600000, 2: 2 * 3600000, 3: 3600000, 4: 1800000, 5: 900000 };

export class EscalationManager {
  private records = new Map<string, EscalationRecord>();

  escalate(issue: string, severity: number): EscalationRecord {
    const sev = Math.max(1, Math.min(5, severity));
    const r: EscalationRecord = { id: randomUUID(), issue, severity: sev, status: 'open', createdAt: Date.now(), slaDeadline: Date.now() + (SLA_MS[sev] ?? 3600000) };
    this.records.set(r.id, r);
    return r;
  }

  routeToHuman(issue: string, context: string): EscalationRecord {
    const r = this.escalate(issue, 3);
    r.status = 'routed';
    r.assignedTo = 'human-queue';
    return r;
  }

  trackEscalation(id: string): EscalationRecord | undefined { return this.records.get(id); }
}

export function escalateIssue(reason: string, level?: number): Escalation {
  return { escalationId: randomUUID(), reason, level: level ?? 1 };
}
