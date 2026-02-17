import { readdirSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { ensureDir, pathExists } from "../../utils/fs.js";

function pruneFilesOlderThan(dir: string, olderThanMs: number, extensions?: string[]): string[] {
  if (!pathExists(dir)) {
    return [];
  }
  const removed: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      removed.push(...pruneFilesOlderThan(join(dir, entry.name), olderThanMs, extensions));
      continue;
    }
    if (!entry.isFile()) {
      continue;
    }
    if (extensions && extensions.length > 0 && !extensions.some((ext) => entry.name.endsWith(ext))) {
      continue;
    }
    const full = join(dir, entry.name);
    const stat = statSync(full);
    if (stat.mtimeMs < olderThanMs) {
      unlinkSync(full);
      removed.push(full);
    }
  }
  return removed;
}

export function pruneOpsCaches(params: {
  workspace: string;
  pruneConsoleSnapshotsDays: number;
  pruneTransformSnapshotsDays: number;
}): {
  removedConsoleSnapshots: string[];
  removedTransformSnapshots: string[];
  removedGenericCacheFiles: string[];
} {
  const now = Date.now();
  const consoleCutoff = now - Math.max(1, params.pruneConsoleSnapshotsDays) * 24 * 60 * 60 * 1000;
  const transformCutoff = now - Math.max(1, params.pruneTransformSnapshotsDays) * 24 * 60 * 60 * 1000;

  const studioDir = join(params.workspace, ".amc", "studio");
  const consoleSnapshotsDir = studioDir;
  ensureDir(studioDir);
  const removedConsoleSnapshots = pruneFilesOlderThan(consoleSnapshotsDir, consoleCutoff, [".json", ".sig"]);

  const agentsDir = join(params.workspace, ".amc", "agents");
  const removedTransformSnapshots: string[] = [];
  if (pathExists(agentsDir)) {
    for (const entry of readdirSync(agentsDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }
      const snapshotsDir = join(agentsDir, entry.name, "transform", "snapshots");
      removedTransformSnapshots.push(...pruneFilesOlderThan(snapshotsDir, transformCutoff, [".json", ".sig"]));
    }
  }

  const genericCacheDir = join(params.workspace, ".amc", "cache");
  const removedGenericCacheFiles = pruneFilesOlderThan(genericCacheDir, consoleCutoff);
  return {
    removedConsoleSnapshots,
    removedTransformSnapshots,
    removedGenericCacheFiles
  };
}

