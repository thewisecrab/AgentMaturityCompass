import { resolve } from "node:path";
import { WorkspaceManager } from "./workspaceManager.js";

export function workspaceListCli(params: {
  hostDir?: string;
  workspaceDir?: string;
  defaultWorkspaceId?: string;
}): { workspaces: string[] } {
  const manager = new WorkspaceManager({
    hostDir: params.hostDir ? resolve(params.hostDir) : null,
    workspaceDir: params.workspaceDir ? resolve(params.workspaceDir) : null,
    defaultWorkspaceId: params.defaultWorkspaceId
  });
  return {
    workspaces: manager.listWorkspaceIds()
  };
}

