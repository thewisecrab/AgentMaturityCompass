import { resolve } from "node:path";
import { DEFAULT_WORKSPACE_ID, normalizeWorkspaceId } from "./workspaceId.js";
import { hostWorkspaceDir } from "./workspacePaths.js";

export interface WorkspaceRuntimeResolution {
  hostMode: boolean;
  hostDir: string | null;
  defaultWorkspaceId: string;
  singleWorkspaceDir: string | null;
}

export function resolveWorkspaceRuntime(params: {
  hostDir?: string | null;
  workspaceDir?: string | null;
  defaultWorkspaceId?: string;
}): WorkspaceRuntimeResolution {
  const defaultWorkspaceId = normalizeWorkspaceId(params.defaultWorkspaceId ?? DEFAULT_WORKSPACE_ID);
  const hostDir = params.hostDir ? resolve(params.hostDir) : null;
  if (hostDir) {
    return {
      hostMode: true,
      hostDir,
      defaultWorkspaceId,
      singleWorkspaceDir: null
    };
  }
  const workspaceDir = resolve(params.workspaceDir ?? process.cwd());
  return {
    hostMode: false,
    hostDir: null,
    defaultWorkspaceId,
    singleWorkspaceDir: workspaceDir
  };
}

export function resolveWorkspacePathOrThrow(resolution: WorkspaceRuntimeResolution, workspaceId: string): string {
  if (resolution.hostMode) {
    return hostWorkspaceDir(resolution.hostDir!, workspaceId);
  }
  return resolution.singleWorkspaceDir!;
}

