import { randomUUID } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import YAML from "yaml";
import { getPrivateKeyPem, getPublicKeyHistory, signHexDigest, verifyHexDigestAny } from "../crypto/keys.js";
import { ensureDir, pathExists, readUtf8, writeFileAtomic } from "../utils/fs.js";
import { sha256Hex } from "../utils/hash.js";
import { parseCookieHeader, issueSessionToken, verifySessionToken, type SessionPayload } from "./sessionTokens.js";
import { hashPassword, verifyPassword } from "./passwordHash.js";
import { createUserRecord, usersFileSchema, type UserRecord, type UsersFile } from "./userSchema.js";
import type { UserRole } from "./roles.js";

interface UsersSignature {
  digestSha256: string;
  signature: string;
  signedTs: number;
  signer: "auditor";
}

export interface SessionStoreRecord {
  sessionId: string;
  userId: string;
  username: string;
  roles: UserRole[];
  issuedTs: number;
  expiresTs: number;
  revoked: boolean;
  revokedTs?: number;
}

function usersPath(workspace: string): string {
  return join(workspace, ".amc", "users.yaml");
}

function usersSigPath(workspace: string): string {
  return `${usersPath(workspace)}.sig`;
}

function sessionsDir(workspace: string): string {
  return join(workspace, ".amc", "studio", "sessions");
}

function sessionStorePath(workspace: string, sessionId: string): string {
  return join(sessionsDir(workspace), `${sessionId}.json`);
}

export function usersConfigPath(workspace: string): string {
  return usersPath(workspace);
}

export function usersConfigSigPath(workspace: string): string {
  return usersSigPath(workspace);
}

export function verifyUsersConfigSignature(workspace: string): {
  valid: boolean;
  signatureExists: boolean;
  reason: string | null;
  path: string;
  sigPath: string;
} {
  const path = usersPath(workspace);
  const sigPath = usersSigPath(workspace);
  if (!pathExists(path)) {
    return {
      valid: false,
      signatureExists: false,
      reason: "users config missing",
      path,
      sigPath
    };
  }
  if (!pathExists(sigPath)) {
    return {
      valid: false,
      signatureExists: false,
      reason: "users signature missing",
      path,
      sigPath
    };
  }
  try {
    const sig = JSON.parse(readUtf8(sigPath)) as UsersSignature;
    const digest = sha256Hex(readFileSync(path));
    if (digest !== sig.digestSha256) {
      return {
        valid: false,
        signatureExists: true,
        reason: "digest mismatch",
        path,
        sigPath
      };
    }
    const valid = verifyHexDigestAny(digest, sig.signature, getPublicKeyHistory(workspace, "auditor"));
    return {
      valid,
      signatureExists: true,
      reason: valid ? null : "signature verification failed",
      path,
      sigPath
    };
  } catch (error) {
    return {
      valid: false,
      signatureExists: true,
      reason: String(error),
      path,
      sigPath
    };
  }
}

export function signUsersConfig(workspace: string): string {
  const path = usersPath(workspace);
  if (!pathExists(path)) {
    throw new Error(`users config not found: ${path}`);
  }
  const digest = sha256Hex(readFileSync(path));
  const signature = signHexDigest(digest, getPrivateKeyPem(workspace, "auditor"));
  const payload: UsersSignature = {
    digestSha256: digest,
    signature,
    signedTs: Date.now(),
    signer: "auditor"
  };
  const sigPath = usersSigPath(workspace);
  writeFileAtomic(sigPath, JSON.stringify(payload, null, 2), 0o644);
  return sigPath;
}

export function loadUsersConfig(workspace: string, options?: { requireValidSignature?: boolean }): UsersFile {
  const path = usersPath(workspace);
  if (!pathExists(path)) {
    throw new Error("users config missing");
  }
  if (options?.requireValidSignature !== false) {
    const verify = verifyUsersConfigSignature(workspace);
    if (!verify.valid) {
      throw new Error(`users signature invalid: ${verify.reason ?? "unknown"}`);
    }
  }
  return usersFileSchema.parse(YAML.parse(readUtf8(path)) as unknown);
}

function saveUsersConfig(workspace: string, users: UsersFile): void {
  ensureDir(join(workspace, ".amc"));
  writeFileAtomic(usersPath(workspace), YAML.stringify(usersFileSchema.parse(users)), 0o644);
}

export function initUsersConfig(params: {
  workspace: string;
  username: string;
  password: string;
}): { path: string; sigPath: string; owner: UserRecord } {
  const owner = createUserRecord({
    username: params.username,
    roles: ["OWNER"],
    passwordHash: hashPassword(params.password)
  });
  const config: UsersFile = {
    v: 1,
    updatedTs: Date.now(),
    users: [owner]
  };
  saveUsersConfig(params.workspace, config);
  const sigPath = signUsersConfig(params.workspace);
  return {
    path: usersPath(params.workspace),
    sigPath,
    owner
  };
}

export function listUsers(workspace: string): UserRecord[] {
  return loadUsersConfig(workspace).users.slice().sort((a, b) => a.username.localeCompare(b.username));
}

export function addUser(params: {
  workspace: string;
  username: string;
  roles: UserRole[];
  password: string;
}): UserRecord {
  const config = loadUsersConfig(params.workspace);
  if (config.users.some((user) => user.username.toLowerCase() === params.username.toLowerCase())) {
    throw new Error(`user already exists: ${params.username}`);
  }
  const record = createUserRecord({
    username: params.username,
    roles: params.roles,
    passwordHash: hashPassword(params.password)
  });
  const next: UsersFile = {
    ...config,
    updatedTs: Date.now(),
    users: [...config.users, record]
  };
  saveUsersConfig(params.workspace, next);
  signUsersConfig(params.workspace);
  return record;
}

export function revokeUser(params: {
  workspace: string;
  username: string;
}): UserRecord {
  const config = loadUsersConfig(params.workspace);
  const index = config.users.findIndex((user) => user.username.toLowerCase() === params.username.toLowerCase());
  if (index < 0) {
    throw new Error(`user not found: ${params.username}`);
  }
  const updated = {
    ...config.users[index]!,
    status: "REVOKED" as const
  };
  const users = config.users.slice();
  users[index] = updated;
  saveUsersConfig(params.workspace, {
    ...config,
    updatedTs: Date.now(),
    users
  });
  signUsersConfig(params.workspace);
  return updated;
}

export function setUserRoles(params: {
  workspace: string;
  username: string;
  roles: UserRole[];
}): UserRecord {
  const config = loadUsersConfig(params.workspace);
  const index = config.users.findIndex((user) => user.username.toLowerCase() === params.username.toLowerCase());
  if (index < 0) {
    throw new Error(`user not found: ${params.username}`);
  }
  const updated = {
    ...config.users[index]!,
    roles: params.roles
  };
  const users = config.users.slice();
  users[index] = updated;
  saveUsersConfig(params.workspace, {
    ...config,
    updatedTs: Date.now(),
    users
  });
  signUsersConfig(params.workspace);
  return updated;
}

export function authenticateUser(params: {
  workspace: string;
  username: string;
  password: string;
}): { ok: boolean; user: UserRecord | null; error?: string } {
  let config: UsersFile;
  try {
    config = loadUsersConfig(params.workspace, { requireValidSignature: true });
  } catch (error) {
    return {
      ok: false,
      user: null,
      error: String(error)
    };
  }
  const user = config.users.find((row) => row.username === params.username);
  if (!user) {
    return {
      ok: false,
      user: null,
      error: "invalid credentials"
    };
  }
  if (user.status !== "ACTIVE") {
    return {
      ok: false,
      user: null,
      error: "user revoked"
    };
  }
  if (!verifyPassword(params.password, user.passwordHash)) {
    return {
      ok: false,
      user: null,
      error: "invalid credentials"
    };
  }
  return {
    ok: true,
    user
  };
}

export function createSession(params: {
  workspace: string;
  user: UserRecord;
  ttlMs?: number;
}): { token: string; payload: SessionPayload } {
  const issued = issueSessionToken({
    workspace: params.workspace,
    userId: params.user.userId,
    username: params.user.username,
    roles: params.user.roles,
    ttlMs: params.ttlMs
  });
  const sessionId = `sess_${sha256Hex(issued.token).slice(0, 24)}_${randomUUID().replace(/-/g, "").slice(0, 8)}`;
  const store: SessionStoreRecord = {
    sessionId,
    userId: issued.payload.userId,
    username: issued.payload.username,
    roles: issued.payload.roles,
    issuedTs: issued.payload.issuedTs,
    expiresTs: issued.payload.expiresTs,
    revoked: false
  };
  ensureDir(sessionsDir(params.workspace));
  writeFileAtomic(sessionStorePath(params.workspace, sessionId), JSON.stringify(store, null, 2), 0o600);
  return issued;
}

export function revokeSessionByToken(params: {
  workspace: string;
  token: string;
}): void {
  const verified = verifySessionToken({
    workspace: params.workspace,
    token: params.token
  });
  if (!verified.ok || !verified.payload) {
    return;
  }
  const dir = sessionsDir(params.workspace);
  if (!pathExists(dir)) {
    return;
  }
  const files = readdirSync(dir).filter((name) => name.endsWith(".json"));
  for (const file of files) {
    const path = join(dir, file);
    try {
      const parsed = JSON.parse(readUtf8(path)) as SessionStoreRecord;
      if (parsed.userId === verified.payload.userId && parsed.expiresTs === verified.payload.expiresTs && parsed.issuedTs === verified.payload.issuedTs) {
        writeFileAtomic(
          path,
          JSON.stringify(
            {
              ...parsed,
              revoked: true,
              revokedTs: Date.now()
            },
            null,
            2
          ),
          0o600
        );
      }
    } catch {
      continue;
    }
  }
}

export function sessionFromRequest(params: {
  workspace: string;
  req: IncomingMessage;
}): {
  ok: boolean;
  payload: SessionPayload | null;
  error?: string;
} {
  const token = parseCookieHeader(params.req.headers.cookie, "amc_session");
  if (!token) {
    return {
      ok: false,
      payload: null,
      error: "missing session cookie"
    };
  }
  return verifySessionToken({
    workspace: params.workspace,
    token
  });
}

export function clearSessionCookie(res: ServerResponse, path = "/"): void {
  res.setHeader("set-cookie", `amc_session=; HttpOnly; SameSite=Strict; Path=${path}; Max-Age=0`);
}

export function setSessionCookie(res: ServerResponse, token: string, maxAgeSeconds: number, path = "/"): void {
  res.setHeader(
    "set-cookie",
    `amc_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=${path}; Max-Age=${Math.max(60, maxAgeSeconds)}`
  );
}
