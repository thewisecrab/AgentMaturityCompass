import { canonicalize } from "../utils/json.js";
import type { AMCTraceV1 } from "../correlation/traceSchema.js";

const SECRET_REDACTIONS: RegExp[] = [
  /sk-[A-Za-z0-9]{10,}/g,
  /bearer\s+[A-Za-z0-9._-]{10,}/gi,
  /(?:api|secret|token|key)\s*[:=]\s*[A-Za-z0-9._-]{10,}/gi
];

function redactString(value: string): string {
  let redacted = value;
  for (const pattern of SECRET_REDACTIONS) {
    redacted = redacted.replace(pattern, "[REDACTED]");
  }
  return redacted;
}

function redactValue(value: unknown): unknown {
  if (typeof value === "string") {
    return redactString(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item));
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(obj)) {
      out[key] = redactValue(item);
    }
    return out;
  }
  return value;
}

export type TraceInput = Omit<AMCTraceV1, "amc_trace_v" | "ts"> & {
  ts?: number;
};

export function buildTrace(input: TraceInput): AMCTraceV1 {
  if (!input.agentId || input.agentId.trim().length === 0) {
    throw new Error("Trace input must include non-empty agentId.");
  }
  const payload: AMCTraceV1 = {
    amc_trace_v: 1,
    ts: input.ts ?? Date.now(),
    agentId: input.agentId,
    event: input.event,
    request_id: input.request_id,
    receipt: input.receipt,
    providerId: input.providerId,
    model: input.model,
    note: input.note,
    hashes: input.hashes
  };
  return redactValue(payload) as AMCTraceV1;
}

export function stableTraceString(trace: AMCTraceV1): string {
  return canonicalize(trace);
}

export function logTrace(input: TraceInput): AMCTraceV1 {
  const trace = buildTrace(input);
  process.stdout.write(`${stableTraceString(trace)}\n`);
  return trace;
}
