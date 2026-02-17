import { readdirSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { ensureDir, pathExists } from "../../utils/fs.js";

export function rotateLogs(params: {
  logDir: string;
  maxDays: number;
  maxFileMb: number;
}): {
  removed: string[];
  kept: string[];
} {
  ensureDir(params.logDir);
  const removed: string[] = [];
  const kept: string[] = [];
  const cutoff = Date.now() - Math.max(1, params.maxDays) * 24 * 60 * 60 * 1000;
  const maxBytes = Math.max(1, params.maxFileMb) * 1024 * 1024;
  for (const entry of readdirSync(params.logDir, { withFileTypes: true })) {
    if (!entry.isFile()) {
      continue;
    }
    const full = join(params.logDir, entry.name);
    if (!pathExists(full)) {
      continue;
    }
    const stat = statSync(full);
    const tooOld = stat.mtimeMs < cutoff;
    const tooLarge = stat.size > maxBytes;
    if (tooOld || tooLarge) {
      unlinkSync(full);
      removed.push(full);
    } else {
      kept.push(full);
    }
  }
  return { removed, kept };
}

