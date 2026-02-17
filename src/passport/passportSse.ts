import type { OrgSseHub } from "../org/orgSse.js";

export type PassportSseEventType = "PASSPORT_UPDATED" | "STANDARD_UPDATED";

export function emitPassportSse(params: {
  hub: OrgSseHub;
  type: PassportSseEventType;
  nodeIds?: string[];
}): void {
  params.hub.emit({
    type: params.type,
    nodeIds: params.nodeIds ?? [],
    ts: Date.now(),
    version: 1
  });
}
