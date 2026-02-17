import type { OrgSseHub } from "../org/orgSse.js";

export type PromptPackEventType =
  | "PROMPT_PACK_UPDATED"
  | "PROMPT_POLICY_UPDATED";

export function emitPromptPackSse(params: {
  hub: OrgSseHub;
  type: PromptPackEventType;
  nodeIds?: string[];
}): void {
  params.hub.emit({
    type: params.type,
    nodeIds: params.nodeIds ?? [],
    ts: Date.now(),
    version: 1
  });
}
