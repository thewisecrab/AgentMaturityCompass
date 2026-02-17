import type { OrgSseHub } from "../org/orgSse.js";

export type MechanicEventType =
  | "MECHANIC_TARGETS_UPDATED"
  | "MECHANIC_PLAN_UPDATED"
  | "MECHANIC_SIMULATION_UPDATED"
  | "MECHANIC_EXECUTION_STARTED"
  | "MECHANIC_EXECUTION_COMPLETED"
  | "MECHANIC_EXECUTION_FAILED";

export function emitMechanicSse(params: {
  hub: OrgSseHub;
  type: MechanicEventType;
  nodeIds?: string[];
}): void {
  params.hub.emit({
    type: params.type,
    nodeIds: params.nodeIds ?? [],
    ts: Date.now(),
    version: 1
  });
}

