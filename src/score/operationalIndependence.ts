/**
 * Operational Independence Score from guard-events telemetry.
 */

import { readGuardEvents } from "../enforce/evidenceEmitter.js";

export interface OperationalIndependenceScore {
  score: number; // 0-100
  longestRunDays: number;
  escalationRate: number; // percent
  driftEvents: number;
  qualityHeld: boolean;
}

interface GuardEventLike {
  created_at: string;
  decision: string;
  reason: string;
  severity: string;
  meta_json: string | null;
}

interface DayFlags {
  humanApproval: boolean;
  drift: boolean;
}

function parseMeta(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function toDayList(events: GuardEventLike[]): string[] {
  const daySet = new Set<string>();
  for (const e of events) {
    daySet.add(new Date(e.created_at).toISOString().slice(0, 10));
  }
  return Array.from(daySet).sort();
}

function isHumanIntervention(event: GuardEventLike): boolean {
  const reason = event.reason || "";
  const meta = parseMeta(event.meta_json);
  return (
    event.decision === "stepup" ||
    meta?.humanApproval === true ||
    /(approval|escalation|human|manual|override)/i.test(reason)
  );
}

function isDrift(event: GuardEventLike): boolean {
  const reason = (event.reason || "").toLowerCase();
  const meta = parseMeta(event.meta_json);
  const auditType = String((meta as { auditType?: string } | null)?.auditType || "").toLowerCase();
  return reason.includes("drift") || reason.includes("anomaly") || reason.includes("deviation") || auditType.includes("drift");
}

export function scoreOperationalIndependence(agentId: string, windowDays = 30): OperationalIndependenceScore {
  const events = readGuardEvents(agentId, windowDays * 24)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((ev) => ({
      created_at: ev.created_at,
      decision: ev.decision,
      reason: ev.reason,
      severity: ev.severity,
      meta_json: ev.meta_json
    }));

  const byDay = new Map<string, DayFlags[]>();
  let driftEvents = 0;

  for (const event of events) {
    const day = new Date(event.created_at).toISOString().slice(0, 10);
    const bucket = byDay.get(day) ?? [];
    const flags: DayFlags = {
      humanApproval: isHumanIntervention(event),
      drift: isDrift(event)
    };
    bucket.push(flags);
    byDay.set(day, bucket);
    if (flags.drift) driftEvents += 1;
  }

  const days = toDayList(events);
  let longestRunDays = 0;
  let currentRun = 0;
  for (const day of days) {
    const hasHuman = byDay.get(day)?.some((entry) => entry.humanApproval) ?? false;
    if (!hasHuman) {
      currentRun += 1;
      longestRunDays = Math.max(longestRunDays, currentRun);
    } else {
      currentRun = 0;
    }
  }

  const escalated = events.filter((e) => e.decision === "stepup" || e.decision === "warn").length;
  const escalationRate = events.length === 0 ? 100 : Math.round((escalated / events.length) * 100);

  const hasCritical = events.some((e) => String(e.severity).toLowerCase() === "critical");
  const driftInWindow = driftEvents > 0;
  const qualityHeld = !hasCritical && !driftInWindow;

  const runComponent = Math.min(45, (longestRunDays / Math.max(windowDays, 1)) * 45);
  const escalationComponent = Math.max(0, 35 - escalationRate * 0.35);
  const qualityComponent = qualityHeld ? 15 : 0;
  const driftPenalty = Math.max(0, 5 - driftEvents);
  const score = Math.max(0, Math.min(100, Math.round(runComponent + escalationComponent + qualityComponent + driftPenalty)));

  return {
    score,
    longestRunDays,
    escalationRate,
    driftEvents,
    qualityHeld
  };
}
