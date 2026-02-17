import { initUsersConfig, addUser, listUsers, revokeUser, setUserRoles, verifyUsersConfigSignature } from "./authApi.js";
import { parseUserRoles, type UserRole } from "./roles.js";

export function parseRolesCsv(raw: string): UserRole[] {
  const roles = parseUserRoles(raw.split(",").map((value) => value.trim()));
  if (roles.length === 0) {
    throw new Error("at least one valid role is required");
  }
  return roles;
}

export function userInitCli(params: {
  workspace: string;
  username: string;
  password: string;
}): { username: string; roles: UserRole[]; path: string; sigPath: string } {
  const out = initUsersConfig({
    workspace: params.workspace,
    username: params.username,
    password: params.password
  });
  return {
    username: out.owner.username,
    roles: out.owner.roles,
    path: out.path,
    sigPath: out.sigPath
  };
}

export function userAddCli(params: {
  workspace: string;
  username: string;
  roles: UserRole[];
  password: string;
}): { username: string; roles: UserRole[] } {
  const user = addUser(params);
  return {
    username: user.username,
    roles: user.roles
  };
}

export function userListCli(workspace: string): Array<{
  username: string;
  roles: UserRole[];
  status: "ACTIVE" | "REVOKED";
  createdTs: number;
}> {
  return listUsers(workspace).map((user) => ({
    username: user.username,
    roles: user.roles,
    status: user.status,
    createdTs: user.createdTs
  }));
}

export function userRevokeCli(params: {
  workspace: string;
  username: string;
}): { username: string; status: "ACTIVE" | "REVOKED" } {
  const user = revokeUser(params);
  return {
    username: user.username,
    status: user.status
  };
}

export function userRoleSetCli(params: {
  workspace: string;
  username: string;
  roles: UserRole[];
}): { username: string; roles: UserRole[] } {
  const user = setUserRoles(params);
  return {
    username: user.username,
    roles: user.roles
  };
}

export function userVerifyCli(workspace: string): ReturnType<typeof verifyUsersConfigSignature> {
  return verifyUsersConfigSignature(workspace);
}
