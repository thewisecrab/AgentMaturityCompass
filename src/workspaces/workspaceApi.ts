import { WorkspaceManager } from "./workspaceManager.js";

export function workspaceHealth(manager: WorkspaceManager, workspaceId: string): { ok: boolean; reasons: string[] } {
  return manager.workspaceReady(workspaceId);
}

export function listWorkspacesForApi(manager: WorkspaceManager): string[] {
  return manager.listWorkspaceIds();
}

