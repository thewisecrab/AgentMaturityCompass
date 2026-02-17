export type HostWorkspaceEventType =
  | "WORKSPACE_CREATED"
  | "WORKSPACE_DELETED"
  | "PORTFOLIO_UPDATED";

export interface HostWorkspaceEvent {
  type: HostWorkspaceEventType;
  workspaceId?: string;
  ts: number;
}

