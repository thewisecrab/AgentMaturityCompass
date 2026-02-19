import { randomUUID } from 'node:crypto';

export interface AuditEvent {
  eventId: string;
  timestamp: Date;
  actor: string;
  action: string;
  resource: string;
  outcome: string;
  severity: string;
  metadata?: Record<string, unknown>;
}

export interface SiemExportResult { formatted: string; format: string; byteSize: number; eventId: string; }
export interface SiemBatchResult { results: SiemExportResult[]; totalBytes: number; format: string; count: number; }

const severityToNum: Record<string, number> = {
  low: 3, medium: 5, high: 7, critical: 10, info: 1, warning: 5,
};

function formatCef(event: AuditEvent): string {
  const sev = severityToNum[event.severity.toLowerCase()] ?? 5;
  return `CEF:0|AMC|AgentWatch|1.0|${event.action}|${event.action}|${sev}|src=${event.actor} dst=${event.resource} outcome=${event.outcome}`;
}

function formatLeef(event: AuditEvent): string {
  return `LEEF:2.0|AMC|AgentWatch|1.0|${event.action}|src=${event.actor}\tdst=${event.resource}\tsev=${event.severity}`;
}

function formatJsonLd(event: AuditEvent): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SecurityEvent',
    eventId: event.eventId,
    timestamp: event.timestamp.toISOString(),
    actor: event.actor,
    action: event.action,
    resource: event.resource,
    outcome: event.outcome,
    severity: event.severity,
    metadata: event.metadata ?? {},
  });
}

export function exportEvent(event: AuditEvent, format: 'cef' | 'leef' | 'json-ld'): SiemExportResult {
  let formatted: string;
  switch (format) {
    case 'cef': formatted = formatCef(event); break;
    case 'leef': formatted = formatLeef(event); break;
    case 'json-ld': formatted = formatJsonLd(event); break;
  }
  return { formatted, format, byteSize: Buffer.byteLength(formatted, 'utf8'), eventId: event.eventId };
}

export function exportBatch(events: AuditEvent[], format: 'cef' | 'leef' | 'json-ld'): SiemBatchResult {
  const results = events.map(e => exportEvent(e, format));
  return { results, totalBytes: results.reduce((s, r) => s + r.byteSize, 0), format, count: results.length };
}

/** Backward-compatible wrapper */
export function exportToSiem(events: Array<{ action: string; risk: string }>, format?: string) {
  const fmt = format ?? 'splunk';
  return {
    events: events.map(e => ({ eventId: randomUUID(), category: e.action, severity: e.risk, timestamp: new Date() })),
    format: fmt,
    exported: true,
  };
}
