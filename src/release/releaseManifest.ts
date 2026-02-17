import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { releaseManifestSchema, type ReleaseManifest } from "./releaseSchema.js";

export interface GitInfo {
  commit: string;
  tag: string | null;
  dirty: boolean;
}

function git(cmd: string[], cwd: string): string | null {
  const out = spawnSync("git", cmd, {
    cwd,
    encoding: "utf8"
  });
  if (out.status !== 0) {
    return null;
  }
  return (out.stdout ?? "").trim() || null;
}

export function detectGitInfo(workspace: string): GitInfo {
  const commit = git(["rev-parse", "HEAD"], workspace) ?? "unknown";
  const tag = git(["describe", "--tags", "--exact-match"], workspace);
  const status = git(["status", "--porcelain"], workspace);
  return {
    commit,
    tag,
    dirty: !!(status && status.length > 0)
  };
}

export function packageMeta(workspace: string): { name: string; version: string; node: string } {
  const pkgPath = join(workspace, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
    name: string;
    version: string;
    engines?: { node?: string };
  };
  return {
    name: pkg.name,
    version: pkg.version,
    node: pkg.engines?.node ?? ">=20"
  };
}

export function buildReleaseManifest(params: {
  workspace: string;
  generatedTs: number;
  artifactHashes: {
    npmTgzSha256: string;
    sbomSha256: string;
    licensesSha256: string;
    provenanceSha256: string;
    secretScanSha256: string;
    dockerImageSha256: string;
  };
  pubkeyFingerprint: string;
}): ReleaseManifest {
  const pkg = packageMeta(params.workspace);
  const manifest: ReleaseManifest = {
    v: 1,
    package: {
      name: pkg.name as "agent-maturity-compass",
      version: pkg.version,
      node: pkg.node,
      git: detectGitInfo(params.workspace)
    },
    generatedTs: params.generatedTs,
    artifacts: params.artifactHashes,
    signing: {
      algorithm: "ed25519",
      pubkeyFingerprint: params.pubkeyFingerprint
    }
  };
  return releaseManifestSchema.parse(manifest);
}
