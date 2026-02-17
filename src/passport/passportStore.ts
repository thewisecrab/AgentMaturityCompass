import { join } from "node:path";
import { readdirSync } from "node:fs";
import YAML from "yaml";
import { ensureDir, pathExists, readUtf8, writeFileAtomic } from "../utils/fs.js";
import { verifySignedFileWithAuditor, signFileWithAuditor } from "../org/orgSigner.js";
import { defaultPassportPolicy, passportPolicySchema, type PassportPolicy } from "./passportPolicySchema.js";
import { passportJsonSchema, type PassportJson } from "./passportSchema.js";

function scopeSegment(scopeType: "WORKSPACE" | "NODE" | "AGENT"): string {
  if (scopeType === "WORKSPACE") return "workspace";
  if (scopeType === "NODE") return "node";
  return "agent";
}

export function passportRoot(workspace: string): string {
  return join(workspace, ".amc", "passport");
}

export function passportPolicyPath(workspace: string): string {
  return join(passportRoot(workspace), "policy.yaml");
}

export function passportPolicySigPath(workspace: string): string {
  return `${passportPolicyPath(workspace)}.sig`;
}

export function passportExportsDir(workspace: string): string {
  return join(passportRoot(workspace), "exports");
}

export function passportCacheDir(workspace: string): string {
  return join(passportRoot(workspace), "cache");
}

export function passportLatestCachePath(
  workspace: string,
  scopeType: "WORKSPACE" | "NODE" | "AGENT",
  scopeId: string
): string {
  return join(passportCacheDir(workspace), `latest_${scopeSegment(scopeType)}_${scopeId}.json`);
}

export function passportLatestCacheSigPath(
  workspace: string,
  scopeType: "WORKSPACE" | "NODE" | "AGENT",
  scopeId: string
): string {
  return `${passportLatestCachePath(workspace, scopeType, scopeId)}.sig`;
}

export function passportExportsScopeDir(
  workspace: string,
  scopeType: "WORKSPACE" | "NODE" | "AGENT",
  scopeId: string
): string {
  return join(passportExportsDir(workspace), scopeSegment(scopeType), scopeId);
}

export function ensurePassportDirs(workspace: string): void {
  ensureDir(passportRoot(workspace));
  ensureDir(passportExportsDir(workspace));
  ensureDir(passportCacheDir(workspace));
}

export function savePassportPolicy(workspace: string, policy: PassportPolicy): {
  path: string;
  sigPath: string;
} {
  ensurePassportDirs(workspace);
  const path = passportPolicyPath(workspace);
  writeFileAtomic(path, YAML.stringify(passportPolicySchema.parse(policy)), 0o644);
  const sigPath = signFileWithAuditor(workspace, path);
  return {
    path,
    sigPath
  };
}

export function initPassportPolicy(workspace: string): {
  path: string;
  sigPath: string;
  policy: PassportPolicy;
} {
  const policy = defaultPassportPolicy();
  const saved = savePassportPolicy(workspace, policy);
  return {
    ...saved,
    policy
  };
}

export function loadPassportPolicy(workspace: string): PassportPolicy {
  const path = passportPolicyPath(workspace);
  if (!pathExists(path)) {
    return initPassportPolicy(workspace).policy;
  }
  return passportPolicySchema.parse(YAML.parse(readUtf8(path)) as unknown);
}

export function verifyPassportPolicySignature(workspace: string): ReturnType<typeof verifySignedFileWithAuditor> {
  return verifySignedFileWithAuditor(workspace, passportPolicyPath(workspace));
}

export function savePassportCache(params: {
  workspace: string;
  scopeType: "WORKSPACE" | "NODE" | "AGENT";
  scopeId: string;
  passport: PassportJson;
}): {
  path: string;
  sigPath: string;
} {
  ensurePassportDirs(params.workspace);
  const path = passportLatestCachePath(params.workspace, params.scopeType, params.scopeId);
  writeFileAtomic(path, JSON.stringify(passportJsonSchema.parse(params.passport), null, 2), 0o644);
  const sigPath = signFileWithAuditor(params.workspace, path);
  return {
    path,
    sigPath
  };
}

export function loadPassportCache(params: {
  workspace: string;
  scopeType: "WORKSPACE" | "NODE" | "AGENT";
  scopeId: string;
}): PassportJson | null {
  const path = passportLatestCachePath(params.workspace, params.scopeType, params.scopeId);
  if (!pathExists(path)) {
    return null;
  }
  return passportJsonSchema.parse(JSON.parse(readUtf8(path)) as unknown);
}

export function verifyPassportCacheSignature(params: {
  workspace: string;
  scopeType: "WORKSPACE" | "NODE" | "AGENT";
  scopeId: string;
}): ReturnType<typeof verifySignedFileWithAuditor> | {
  valid: true;
  signatureExists: false;
  reason: null;
  path: string;
  sigPath: string;
} {
  const path = passportLatestCachePath(params.workspace, params.scopeType, params.scopeId);
  if (!pathExists(path)) {
    return {
      valid: true,
      signatureExists: false,
      reason: null,
      path,
      sigPath: `${path}.sig`
    };
  }
  return verifySignedFileWithAuditor(params.workspace, path);
}

export function listPassportExportFiles(workspace: string): string[] {
  const root = passportExportsDir(workspace);
  if (!pathExists(root)) {
    return [];
  }
  const out: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith(".amcpass")) {
        out.push(full);
      }
    }
  };
  walk(root);
  return out.sort((a, b) => b.localeCompare(a));
}
