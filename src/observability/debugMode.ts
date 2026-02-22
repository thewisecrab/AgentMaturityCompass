import chalk from "chalk";
import { openLedger } from "../ledger/ledger.js";
import type { EvidenceEventType, TrustTier } from "../types.js";
import {
  detectEvidenceStreamAnomalies,
  type EvidenceSignalPoint,
  type ObservabilityAnomaly,
  type ScoreSignalPoint
} from "./anomalyDetector.js";

interface EvidenceDebugRow {
  row_id: number;
  id: string;
  ts: number;
  session_id: string;
  runtime: string;
  event_type: EvidenceEventType;
  meta_json: string;
  payload_sha256: string;
  event_hash: string;
}

export interface DebugEventFilter {
  agentId: string;
  dimension?: string;
  questionId?: string;
  eventType?: string;
}

export interface EvidenceDebugEvent {
  rowId: number;
  id: string;
  ts: number;
  sessionId: string;
  runtime: string;
  eventType: EvidenceEventType;
  agentId: string;
  trustTier: TrustTier;
  severity: string;
  dimension: string | null;
  questionId: string | null;
  meta: Record<string, unknown>;
  payloadSha256: string;
  eventHash: string;
}

export interface ListDebugEventsOptions extends DebugEventFilter {
  workspace?: string;
  limit?: number;
}

export interface StreamDebugEventsOptions extends DebugEventFilter {
  workspace?: string;
  pollIntervalMs?: number;
  follow?: boolean;
  limit?: number;
  includeHistorical?: boolean;
  maxFollowIterations?: number;
  signal?: AbortSignal;
  onEvent?: (event: EvidenceDebugEvent) => void;
  onAnomaly?: (anomaly: ObservabilityAnomaly) => void;
}

export interface RunDebugCliOptions extends StreamDebugEventsOptions {
  color?: boolean;
}

function parseMeta(metaJson: string): Record<string, unknown> {
  try {
    return JSON.parse(metaJson) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function getString(meta: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = meta[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}

function normalizeTrustTier(meta: Record<string, unknown>, eventType: EvidenceEventType): TrustTier {
  const candidate = meta.trustTier;
  if (
    candidate === "OBSERVED" ||
    candidate === "OBSERVED_HARDENED" ||
    candidate === "ATTESTED" ||
    candidate === "SELF_REPORTED"
  ) {
    return candidate;
  }
  return eventType === "review" ? "SELF_REPORTED" : "OBSERVED";
}

function normalizeSeverity(meta: Record<string, unknown>, eventType: EvidenceEventType): string {
  const candidate = getString(meta, ["severity"]);
  if (candidate) {
    return candidate.toUpperCase();
  }
  if (eventType === "stderr" || eventType === "agent_stderr") {
    return "HIGH";
  }
  return "INFO";
}

function normalizeAgentId(meta: Record<string, unknown>): string {
  return getString(meta, ["agentId", "agent_id"]) ?? "unknown";
}

function normalizeDimension(meta: Record<string, unknown>): string | null {
  return getString(meta, ["dimension", "dimensionId", "dimension_id"]);
}

function normalizeQuestionId(meta: Record<string, unknown>): string | null {
  return getString(meta, ["questionId", "question_id"]);
}

function normalizeFilterValue(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.toLowerCase() : undefined;
}

function matchesFilter(event: EvidenceDebugEvent, filter: DebugEventFilter): boolean {
  const dimensionFilter = normalizeFilterValue(filter.dimension);
  const questionFilter = normalizeFilterValue(filter.questionId);
  const eventTypeFilter = normalizeFilterValue(filter.eventType);
  const eventAgent = event.agentId.toLowerCase();
  const targetAgent = filter.agentId.trim().toLowerCase();

  const matchesAgent = eventAgent === targetAgent || (targetAgent === "default" && eventAgent === "unknown");
  if (!matchesAgent) return false;
  if (dimensionFilter && (event.dimension ?? "").toLowerCase() !== dimensionFilter) return false;
  if (questionFilter && (event.questionId ?? "").toLowerCase() !== questionFilter) return false;
  if (eventTypeFilter && event.eventType.toLowerCase() !== eventTypeFilter) return false;
  return true;
}

function toDebugEvent(row: EvidenceDebugRow): EvidenceDebugEvent {
  const meta = parseMeta(row.meta_json);
  return {
    rowId: row.row_id,
    id: row.id,
    ts: row.ts,
    sessionId: row.session_id,
    runtime: row.runtime,
    eventType: row.event_type,
    agentId: normalizeAgentId(meta),
    trustTier: normalizeTrustTier(meta, row.event_type),
    severity: normalizeSeverity(meta, row.event_type),
    dimension: normalizeDimension(meta),
    questionId: normalizeQuestionId(meta),
    meta,
    payloadSha256: row.payload_sha256,
    eventHash: row.event_hash
  };
}

function trustColor(tier: TrustTier) {
  if (tier === "OBSERVED_HARDENED") return chalk.greenBright;
  if (tier === "OBSERVED") return chalk.green;
  if (tier === "ATTESTED") return chalk.cyan;
  return chalk.yellow;
}

function severityColor(severity: string) {
  const value = severity.toUpperCase();
  if (value === "CRITICAL") return chalk.redBright;
  if (value === "HIGH" || value === "ERROR") return chalk.red;
  if (value === "WARN" || value === "WARNING" || value === "MEDIUM") return chalk.yellow;
  if (value === "LOW" || value === "DEBUG") return chalk.gray;
  return chalk.blue;
}

function toSignalPoints(events: EvidenceDebugEvent[]): {
  evidencePoints: EvidenceSignalPoint[];
  scorePoints: ScoreSignalPoint[];
} {
  const evidencePoints: EvidenceSignalPoint[] = events.map((event) => ({
    ts: event.ts,
    eventId: event.id,
    eventType: event.eventType,
    trustTier: event.trustTier
  }));

  const scorePoints: ScoreSignalPoint[] = [];
  for (const event of events) {
    const raw = event.meta.score;
    if (typeof raw === "number" && Number.isFinite(raw)) {
      scorePoints.push({ ts: event.ts, score: raw, runId: event.meta.runId as string | undefined });
      continue;
    }
    if (typeof raw === "string" && raw.trim().length > 0) {
      const parsed = Number.parseFloat(raw);
      if (Number.isFinite(parsed)) {
        scorePoints.push({ ts: event.ts, score: parsed, runId: event.meta.runId as string | undefined });
      }
    }
  }

  return { evidencePoints, scorePoints };
}

function parseLimit(limit: number | undefined, fallback: number): number {
  if (typeof limit !== "number" || !Number.isFinite(limit) || limit <= 0) return fallback;
  return Math.max(1, Math.min(10_000, Math.floor(limit)));
}

export function listEvidenceDebugEvents(options: ListDebugEventsOptions): EvidenceDebugEvent[] {
  const workspace = options.workspace ?? process.cwd();
  const limit = parseLimit(options.limit, 200);
  const ledger = openLedger(workspace);
  try {
    const rows = ledger.db
      .prepare(
        `SELECT rowid as row_id, id, ts, session_id, runtime, event_type, meta_json, payload_sha256, event_hash
         FROM evidence_events
         ORDER BY rowid DESC
         LIMIT ?`
      )
      .all(limit) as EvidenceDebugRow[];

    return rows
      .reverse()
      .map(toDebugEvent)
      .filter((event) => matchesFilter(event, options));
  } finally {
    ledger.close();
  }
}

export function formatDebugEventLine(event: EvidenceDebugEvent, color = true): string {
  const isoTs = new Date(event.ts).toISOString();
  const trustLabel = color ? trustColor(event.trustTier)(event.trustTier) : event.trustTier;
  const severityLabel = color ? severityColor(event.severity)(event.severity) : event.severity;
  const eventType = color ? chalk.bold(event.eventType) : event.eventType;
  const dim = event.dimension ? ` dim=${event.dimension}` : "";
  const qid = event.questionId ? ` q=${event.questionId}` : "";
  return `${isoTs} [${trustLabel}] [${severityLabel}] ${eventType} agent=${event.agentId}${qid}${dim} id=${event.id}`;
}

export function formatAnomalyLine(anomaly: ObservabilityAnomaly, color = true): string {
  const label = `[ANOMALY:${anomaly.type}]`;
  if (!color) {
    return `${label} ${anomaly.message}`;
  }
  if (anomaly.severity === "CRITICAL") return `${chalk.redBright(label)} ${chalk.redBright(anomaly.message)}`;
  if (anomaly.severity === "HIGH") return `${chalk.red(label)} ${chalk.red(anomaly.message)}`;
  if (anomaly.severity === "WARN") return `${chalk.yellow(label)} ${chalk.yellow(anomaly.message)}`;
  return `${chalk.blue(label)} ${chalk.blue(anomaly.message)}`;
}

export async function streamEvidenceDebugEvents(options: StreamDebugEventsOptions): Promise<void> {
  const workspace = options.workspace ?? process.cwd();
  const pollIntervalMs = parseLimit(options.pollIntervalMs, 1000);
  const follow = options.follow ?? false;
  const includeHistorical = options.includeHistorical ?? true;
  const historicalLimit = parseLimit(options.limit, 100);
  const maxFollowIterations = options.maxFollowIterations ? Math.max(1, Math.floor(options.maxFollowIterations)) : null;
  const ledger = openLedger(workspace);

  const rollingEvents: EvidenceDebugEvent[] = [];
  const emittedAnomalyKeys = new Set<string>();
  let lastRowId = 0;

  const pushAndDetect = (events: EvidenceDebugEvent[]): void => {
    if (events.length === 0) return;
    rollingEvents.push(...events);
    const maxRolling = 4000;
    if (rollingEvents.length > maxRolling) {
      rollingEvents.splice(0, rollingEvents.length - maxRolling);
    }
    const points = toSignalPoints(rollingEvents);
    const anomalies = detectEvidenceStreamAnomalies({
      evidencePoints: points.evidencePoints,
      scorePoints: points.scorePoints
    });
    for (const anomaly of anomalies) {
      const key = `${anomaly.type}:${anomaly.ts}:${anomaly.message}`;
      if (emittedAnomalyKeys.has(key)) continue;
      emittedAnomalyKeys.add(key);
      options.onAnomaly?.(anomaly);
    }
  };

  try {
    const latestRow = ledger.db.prepare("SELECT MAX(rowid) AS row_id FROM evidence_events").get() as
      | { row_id: number | null }
      | undefined;
    lastRowId = latestRow?.row_id ?? 0;

    if (includeHistorical) {
      const initialRows = ledger.db
        .prepare(
          `SELECT rowid as row_id, id, ts, session_id, runtime, event_type, meta_json, payload_sha256, event_hash
           FROM evidence_events
           ORDER BY rowid DESC
           LIMIT ?`
        )
        .all(historicalLimit) as EvidenceDebugRow[];
      const initial = initialRows
        .reverse()
        .map(toDebugEvent)
        .filter((event) => matchesFilter(event, options));
      for (const event of initial) {
        options.onEvent?.(event);
      }
      pushAndDetect(initial);
      const maxInitialRow = initialRows.length > 0 ? Math.max(...initialRows.map((row) => row.row_id)) : 0;
      if (maxInitialRow > lastRowId) {
        lastRowId = maxInitialRow;
      }
    }

    if (!follow) {
      return;
    }

    let iterations = 0;
    while (!options.signal?.aborted) {
      const rows = ledger.db
        .prepare(
          `SELECT rowid as row_id, id, ts, session_id, runtime, event_type, meta_json, payload_sha256, event_hash
           FROM evidence_events
           WHERE rowid > ?
           ORDER BY rowid ASC`
        )
        .all(lastRowId) as EvidenceDebugRow[];

      const events = rows.map(toDebugEvent).filter((event) => matchesFilter(event, options));
      for (const event of events) {
        options.onEvent?.(event);
      }
      pushAndDetect(events);

      if (rows.length > 0) {
        lastRowId = rows[rows.length - 1]!.row_id;
      }

      iterations += 1;
      if (maxFollowIterations !== null && iterations >= maxFollowIterations) {
        break;
      }
      await new Promise((resolvePromise) => setTimeout(resolvePromise, pollIntervalMs));
    }
  } finally {
    ledger.close();
  }
}

export async function runDebugModeCli(options: RunDebugCliOptions): Promise<void> {
  const color = options.color ?? true;
  const follow = options.follow ?? false;

  if (!follow) {
    const rows = listEvidenceDebugEvents(options);
    for (const row of rows) {
      console.log(formatDebugEventLine(row, color));
    }
    if (rows.length === 0) {
      console.log("No matching evidence events.");
    }
    return;
  }

  console.log(`Streaming evidence for agent=${options.agentId} (Ctrl+C to stop)`);
  const abort = new AbortController();
  const shutdown = (): void => {
    abort.abort();
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  try {
    await streamEvidenceDebugEvents({
      ...options,
      follow: true,
      signal: abort.signal,
      onEvent: (event) => {
        console.log(formatDebugEventLine(event, color));
      },
      onAnomaly: (anomaly) => {
        console.log(formatAnomalyLine(anomaly, color));
      }
    });
  } finally {
    process.off("SIGINT", shutdown);
    process.off("SIGTERM", shutdown);
  }
}
