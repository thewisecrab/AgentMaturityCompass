import type { OrgSseHub } from "../org/orgSse.js";

export type AssuranceSseEventType =
  | "ASSURANCE_RUN_UPDATED"
  | "ASSURANCE_CERT_UPDATED"
  | "ASSURANCE_THRESHOLD_BREACH";

export function emitAssuranceSse(params: {
  hub: OrgSseHub;
  type: AssuranceSseEventType;
  nodeIds?: string[];
}): void {
  params.hub.emit({
    type: params.type,
    nodeIds: params.nodeIds ?? [],
    ts: Date.now(),
    version: 1
  });
}
