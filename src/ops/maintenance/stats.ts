import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { openLedger } from "../../ledger/ledger.js";
import { pathExists } from "../../utils/fs.js";
import { listRetentionSegments } from "../retention/retentionArchive.js";

function dirSizeBytes(path: string): number {
  if (!pathExists(path)) {
    return 0;
  }
  let total = 0;
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const full = join(path, entry.name);
    if (entry.isDirectory()) {
      total += dirSizeBytes(full);
    } else if (entry.isFile()) {
      total += statSync(full).size;
    }
  }
  return total;
}

export function maintenanceStats(workspace: string): {
  dbSizeBytes: number;
  dbPath: string;
  tables: Record<string, number>;
  blobs: { count: number; bytes: number };
  archive: { segmentCount: number; bytes: number };
  cacheBytes: number;
  logsBytes: number;
} {
  const ledger = openLedger(workspace);
  try {
    const dbPath = join(workspace, ".amc", "evidence.sqlite");
    const dbSizeBytes = pathExists(dbPath) ? statSync(dbPath).size : ledger.dbSizeBytes();
    const tableCount = (table: string): number => {
      const row = ledger.db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get() as { c: number };
      return Number(row?.c ?? 0);
    };
    const blobDir = join(workspace, ".amc", "blobs");
    const blobs = pathExists(blobDir)
      ? readdirSync(blobDir).filter((name) => name.endsWith(".blob"))
      : [];
    const blobBytes = blobs.reduce((sum, name) => sum + readFileSync(join(blobDir, name)).byteLength, 0);
    const archiveDir = join(workspace, ".amc", "archive", "ledger");
    const archiveBytes = dirSizeBytes(archiveDir);
    const cacheBytes = dirSizeBytes(join(workspace, ".amc", "cache"));
    const logsBytes = dirSizeBytes(join(workspace, ".amc", "studio", "logs"));
    return {
      dbSizeBytes,
      dbPath,
      tables: {
        evidence_events: tableCount("evidence_events"),
        sessions: tableCount("sessions"),
        runs: tableCount("runs"),
        assurance_runs: tableCount("assurance_runs"),
        outcome_events: tableCount("outcome_events"),
        outcome_contracts: tableCount("outcome_contracts")
      },
      blobs: {
        count: blobs.length,
        bytes: blobBytes
      },
      archive: {
        segmentCount: listRetentionSegments(workspace).length,
        bytes: archiveBytes
      },
      cacheBytes,
      logsBytes
    };
  } finally {
    ledger.close();
  }
}
