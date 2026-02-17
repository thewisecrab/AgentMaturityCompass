import type { OrgSseHub } from "../org/orgSse.js";

export type ValueSseEventType = "VALUE_UPDATED" | "VALUE_REGRESSION_DETECTED" | "VALUE_EVIDENCE_INSUFFICIENT";

export function emitValueSse(params: {
  hub: OrgSseHub;
  type: ValueSseEventType;
  nodeIds?: string[];
}): void {
  params.hub.emit({
    type: params.type,
    nodeIds: params.nodeIds ?? [],
    ts: Date.now(),
    version: 1
  });
}
