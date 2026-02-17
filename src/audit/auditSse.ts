import type { OrgSseHub } from "../org/orgSse.js";

export type AuditSseEventType =
  | "AUDIT_BINDER_UPDATED"
  | "AUDIT_EVIDENCE_REQUEST_UPDATED";

export function emitAuditSse(params: {
  hub: OrgSseHub;
  type: AuditSseEventType;
  nodeIds?: string[];
}): void {
  params.hub.emit({
    type: params.type,
    nodeIds: params.nodeIds ?? [],
    ts: Date.now(),
    version: 1
  });
}
