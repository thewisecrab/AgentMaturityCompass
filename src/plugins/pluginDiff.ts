import { verifyPluginPackage } from "./pluginPackage.js";

export interface PluginArtifactDiffRow {
  path: string;
  kind: string;
  beforeSha256: string | null;
  afterSha256: string | null;
  change: "added" | "removed" | "changed" | "unchanged";
}

export interface PluginArtifactDiff {
  pluginId: string;
  fromVersion: string | null;
  toVersion: string;
  added: number;
  removed: number;
  changed: number;
  unchanged: number;
  rows: PluginArtifactDiffRow[];
}

export function diffPluginPackages(params: {
  candidatePackage: string;
  currentPackage?: string | null;
}): PluginArtifactDiff {
  const candidate = verifyPluginPackage({ file: params.candidatePackage });
  if (!candidate.ok || !candidate.manifest) {
    throw new Error(`candidate plugin verification failed: ${candidate.errors.join("; ")}`);
  }
  const current = params.currentPackage
    ? verifyPluginPackage({ file: params.currentPackage })
    : null;
  if (current && (!current.ok || !current.manifest)) {
    throw new Error(`current plugin verification failed: ${current.errors.join("; ")}`);
  }
  const currentArtifacts = new Map<string, { sha256: string; kind: string }>();
  for (const row of current?.manifest?.artifacts ?? []) {
    currentArtifacts.set(row.path, { sha256: row.sha256, kind: row.kind });
  }
  const candidateArtifacts = new Map<string, { sha256: string; kind: string }>();
  for (const row of candidate.manifest.artifacts) {
    candidateArtifacts.set(row.path, { sha256: row.sha256, kind: row.kind });
  }
  const allPaths = new Set<string>([...currentArtifacts.keys(), ...candidateArtifacts.keys()]);
  const rows: PluginArtifactDiffRow[] = [...allPaths]
    .sort((a, b) => a.localeCompare(b))
    .map((path) => {
      const before = currentArtifacts.get(path);
      const after = candidateArtifacts.get(path);
      if (!before && after) {
        return {
          path,
          kind: after.kind,
          beforeSha256: null,
          afterSha256: after.sha256,
          change: "added" as const
        };
      }
      if (before && !after) {
        return {
          path,
          kind: before.kind,
          beforeSha256: before.sha256,
          afterSha256: null,
          change: "removed" as const
        };
      }
      if (!before || !after) {
        throw new Error("unexpected diff state");
      }
      return {
        path,
        kind: after.kind,
        beforeSha256: before.sha256,
        afterSha256: after.sha256,
        change: before.sha256 === after.sha256 ? "unchanged" : "changed"
      };
    });
  return {
    pluginId: candidate.manifest.plugin.id,
    fromVersion: current?.manifest?.plugin.version ?? null,
    toVersion: candidate.manifest.plugin.version,
    added: rows.filter((row) => row.change === "added").length,
    removed: rows.filter((row) => row.change === "removed").length,
    changed: rows.filter((row) => row.change === "changed").length,
    unchanged: rows.filter((row) => row.change === "unchanged").length,
    rows
  };
}
