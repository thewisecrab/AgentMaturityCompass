import { cpSync, readdirSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";
import { initWorkspace } from "../workspace.js";
import { pathExists } from "../utils/fs.js";
import {
  appendHostAudit,
  createHostUser,
  createWorkspaceRecord,
  disableHostUser,
  grantMembership,
  initHostDb,
  listHostUsers,
  listWorkspaceRecords,
  revokeMembershipRole,
  setWorkspaceStatus
} from "./hostDb.js";
import { normalizeWorkspaceId } from "./workspaceId.js";
import { hostDeletedWorkspacesDir, hostWorkspaceDir } from "./workspacePaths.js";

export function hostInitCli(hostDir: string): void {
  initHostDb(hostDir);
}

export function hostUserAddCli(params: {
  hostDir: string;
  username: string;
  password: string;
  isHostAdmin?: boolean;
}): void {
  createHostUser({
    hostDir: params.hostDir,
    username: params.username,
    password: params.password,
    isHostAdmin: params.isHostAdmin
  });
}

export function hostUserDisableCli(hostDir: string, username: string): void {
  disableHostUser(hostDir, username);
}

export function hostWorkspaceCreateCli(params: {
  hostDir: string;
  workspaceId: string;
  name: string;
}): string {
  const workspaceId = normalizeWorkspaceId(params.workspaceId);
  createWorkspaceRecord({
    hostDir: params.hostDir,
    workspaceId,
    name: params.name
  });
  const dir = hostWorkspaceDir(params.hostDir, workspaceId);
  if (!pathExists(join(dir, ".amc"))) {
    initWorkspace({ workspacePath: dir, trustBoundaryMode: "isolated" });
  }
  appendHostAudit(params.hostDir, "WORKSPACE_CREATED", null, {
    workspaceId
  });
  return dir;
}

export function hostWorkspaceDeleteCli(hostDir: string, workspaceId: string): string {
  const id = normalizeWorkspaceId(workspaceId);
  const from = hostWorkspaceDir(hostDir, id);
  const to = join(hostDeletedWorkspacesDir(hostDir), `${id}_${Date.now()}`);
  if (pathExists(from)) {
    renameSync(from, to);
  }
  setWorkspaceStatus(hostDir, id, "DELETED");
  appendHostAudit(hostDir, "WORKSPACE_DELETED", null, {
    workspaceId: id
  });
  return to;
}

export function hostWorkspacePurgeCli(hostDir: string, workspaceId: string): void {
  const id = normalizeWorkspaceId(workspaceId);
  const deletedBase = hostDeletedWorkspacesDir(hostDir);
  if (!pathExists(deletedBase)) {
    return;
  }
  for (const entry of readdirSync(deletedBase, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    if (!entry.name.startsWith(`${id}_`)) {
      continue;
    }
    rmSync(join(deletedBase, entry.name), { recursive: true, force: true });
  }
  setWorkspaceStatus(hostDir, id, "DELETED");
  appendHostAudit(hostDir, "WORKSPACE_PURGED", null, {
    workspaceId: id
  });
}

export function hostMembershipGrantCli(params: {
  hostDir: string;
  username: string;
  workspaceId: string;
  role: "OWNER" | "OPERATOR" | "AUDITOR" | "VIEWER";
}): void {
  grantMembership(params);
}

export function hostMembershipRevokeCli(params: {
  hostDir: string;
  username: string;
  workspaceId: string;
  role: "OWNER" | "OPERATOR" | "AUDITOR" | "VIEWER";
}): void {
  revokeMembershipRole(params);
}

export function hostListCli(hostDir: string): {
  users: ReturnType<typeof listHostUsers>;
  workspaces: ReturnType<typeof listWorkspaceRecords>;
} {
  return {
    users: listHostUsers(hostDir),
    workspaces: listWorkspaceRecords(hostDir)
  };
}

export function hostMigrateCli(params: {
  fromWorkspaceDir: string;
  hostDir: string;
  workspaceId: string;
  move?: boolean;
  username?: string;
  workspaceName?: string;
}): { workspaceId: string; workspaceDir: string } {
  const workspaceId = normalizeWorkspaceId(params.workspaceId);
  const from = params.fromWorkspaceDir;
  if (!pathExists(join(from, ".amc"))) {
    throw new Error(`Not an AMC workspace: ${from}`);
  }
  createWorkspaceRecord({
    hostDir: params.hostDir,
    workspaceId,
    name: params.workspaceName?.trim() || workspaceId
  });
  const target = hostWorkspaceDir(params.hostDir, workspaceId);
  if (pathExists(target)) {
    throw new Error(`Target workspace already exists: ${target}`);
  }
  if (params.move) {
    renameSync(from, target);
  } else {
    cpSync(from, target, { recursive: true, force: false });
  }
  if (params.username && params.username.trim().length > 0) {
    grantMembership({
      hostDir: params.hostDir,
      username: params.username.trim(),
      workspaceId,
      role: "OWNER"
    });
    grantMembership({
      hostDir: params.hostDir,
      username: params.username.trim(),
      workspaceId,
      role: "AUDITOR"
    });
  }
  appendHostAudit(params.hostDir, "WORKSPACE_MIGRATED", params.username?.trim() || null, {
    workspaceId,
    fromWorkspaceDir: from,
    moved: Boolean(params.move)
  });
  return {
    workspaceId,
    workspaceDir: target
  };
}
