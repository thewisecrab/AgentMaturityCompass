/**
 * escalation.ts — Rule-based auto-routing with regex patterns,
 * SLA breach detection, and resolution tracking.
 */

import { randomUUID } from 'node:crypto';

export interface EscalationRecord {
  id: string;
  issue: string;
  severity: number;
  status: 'open' | 'routed' | 'resolved';
  assignedTo?: string;
  createdAt: number;
  slaDeadline: number;
  resolvedAt?: number;
  resolution?: string;
  routedBy?: 'manual' | 'auto-rule';
}

export interface Escalation {
  escalationId: string;
  reason: string;
  level: number;
}

export interface RoutingRule {
  id: string;
  pattern: RegExp;
  severity: number;
  assignTo: string;
  description: string;
}

/* ── SLA definitions by severity ─────────────────────────────────── */

const SLA_MS: Record<number, number> = {
  1: 4 * 3600_000,  // 4 hours
  2: 2 * 3600_000,  // 2 hours
  3: 3600_000,       // 1 hour
  4: 1800_000,       // 30 min
  5: 900_000,        // 15 min
};

/* ── Manager ─────────────────────────────────────────────────────── */

export class EscalationManager {
  private records = new Map<string, EscalationRecord>();
  private rules: RoutingRule[] = [];

  /** Add auto-routing rule */
  addRule(pattern: RegExp, severity: number, assignTo: string, description?: string): string {
    const id = randomUUID();
    this.rules.push({ id, pattern, severity, assignTo, description: description ?? '' });
    return id;
  }

  removeRule(ruleId: string): boolean {
    const idx = this.rules.findIndex(r => r.id === ruleId);
    if (idx === -1) return false;
    this.rules.splice(idx, 1);
    return true;
  }

  listRules(): RoutingRule[] { return [...this.rules]; }

  /** Escalate with optional auto-routing */
  escalate(issue: string, severity: number): EscalationRecord {
    const sev = Math.max(1, Math.min(5, severity));
    const r: EscalationRecord = {
      id: randomUUID(), issue, severity: sev, status: 'open',
      createdAt: Date.now(), slaDeadline: Date.now() + (SLA_MS[sev] ?? 3600_000),
    };

    // Try auto-routing
    for (const rule of this.rules) {
      if (rule.pattern.test(issue)) {
        r.status = 'routed';
        r.assignedTo = rule.assignTo;
        r.severity = Math.max(r.severity, rule.severity);
        r.routedBy = 'auto-rule';
        break;
      }
    }

    this.records.set(r.id, r);
    return r;
  }

  routeToHuman(issue: string, context: string): EscalationRecord {
    const r = this.escalate(issue, 3);
    r.status = 'routed';
    r.assignedTo = 'human-queue';
    r.routedBy = 'manual';
    return r;
  }

  resolve(id: string, resolution: string): EscalationRecord | undefined {
    const r = this.records.get(id);
    if (!r) return undefined;
    r.status = 'resolved';
    r.resolution = resolution;
    r.resolvedAt = Date.now();
    return r;
  }

  trackEscalation(id: string): EscalationRecord | undefined {
    return this.records.get(id);
  }

  /** Detect SLA breaches */
  detectSlaBreaches(): EscalationRecord[] {
    const now = Date.now();
    return [...this.records.values()].filter(r =>
      r.status !== 'resolved' && now > r.slaDeadline
    );
  }

  /** Get all open escalations sorted by severity (highest first) */
  listOpen(): EscalationRecord[] {
    return [...this.records.values()]
      .filter(r => r.status !== 'resolved')
      .sort((a, b) => b.severity - a.severity);
  }

  /** Get stats */
  stats(): { total: number; open: number; routed: number; resolved: number; slaBreaches: number } {
    const all = [...this.records.values()];
    return {
      total: all.length,
      open: all.filter(r => r.status === 'open').length,
      routed: all.filter(r => r.status === 'routed').length,
      resolved: all.filter(r => r.status === 'resolved').length,
      slaBreaches: this.detectSlaBreaches().length,
    };
  }
}

/* ── Legacy compat ───────────────────────────────────────────────── */

export function escalateIssue(reason: string, level?: number): Escalation {
  return { escalationId: randomUUID(), reason, level: level ?? 1 };
}
