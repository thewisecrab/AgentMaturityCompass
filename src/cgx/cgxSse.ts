import type { OrgSseHub } from "../org/orgSse.js";

export function emitCgxSse(params: {
  hub: OrgSseHub;
  type: "CGX_GRAPH_UPDATED" | "CGX_PACK_UPDATED";
  nodeIds?: string[];
}): void {
  params.hub.emit({
    type: params.type,
    nodeIds: params.nodeIds ?? [],
    ts: Date.now(),
    version: 1
  });
}
