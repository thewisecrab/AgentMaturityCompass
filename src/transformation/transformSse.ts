import type { OrgSseHub } from "../org/orgSse.js";

export type TransformSseType =
  | "TRANSFORM_PLAN_CREATED"
  | "TRANSFORM_PLAN_UPDATED"
  | "TRANSFORM_TASK_ATTESTED";

export function emitTransformSse(params: {
  orgSse: OrgSseHub;
  type: TransformSseType;
  nodeIds?: string[];
  ts?: number;
}): void {
  params.orgSse.emit({
    type: params.type,
    nodeIds: [...new Set(params.nodeIds ?? [])].sort((a, b) => a.localeCompare(b)),
    ts: params.ts ?? Date.now(),
    version: 1
  });
}
