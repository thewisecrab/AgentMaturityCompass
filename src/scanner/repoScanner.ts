import { execSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scanLocal, type LocalScanResult } from "./localScanner.js";

export interface RepoScanResult extends LocalScanResult {
  repoUrl: string;
  clonedTo: string;
}

export function scanRepo(repoUrl: string): RepoScanResult {
  const tmpDir = mkdtempSync(join(tmpdir(), "amc-scan-"));
  try {
    execSync(`git clone --depth 1 ${repoUrl} ${tmpDir}`, { stdio: "pipe", timeout: 60000 });
    const result = scanLocal(tmpDir);
    return { ...result, repoUrl, clonedTo: tmpDir, path: repoUrl };
  } catch (e: any) {
    // Cleanup on error
    try { rmSync(tmpDir, { recursive: true, force: true }); } catch {}
    throw new Error(`Failed to clone repo ${repoUrl}: ${e.message}`);
  }
}

export function cleanupRepoScan(result: RepoScanResult): void {
  try { rmSync(result.clonedTo, { recursive: true, force: true }); } catch {}
}
