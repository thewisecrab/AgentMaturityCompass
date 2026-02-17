import type { TraceInput } from "./traceLogger.js";

const APPROVAL_TOKEN_RE = /\bAPPROVED_BY_OWNER:([A-Za-z0-9_-]{6,})\b/;

export function extractApprovalToken(text: string): string | null {
  const match = APPROVAL_TOKEN_RE.exec(text);
  return match?.[1] ?? null;
}

export function hasValidApprovalToken(text: string): boolean {
  return extractApprovalToken(text) !== null;
}

export function withApprovalTrace(params: {
  agentId: string;
  providerId?: string;
  token: string | null;
  note?: string;
}): TraceInput {
  return {
    agentId: params.agentId,
    event: "verification_step",
    providerId: params.providerId,
    note: params.token
      ? `approval token attached (${params.token.slice(0, 4)}***). ${params.note ?? ""}`.trim()
      : `approval token missing. ${params.note ?? ""}`.trim()
  };
}
