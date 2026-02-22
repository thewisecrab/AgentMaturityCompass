import { openLedger } from "../ledger/ledger.js";
import { amcVersion } from "../version.js";
import { scoreDbHealthy } from "./scoreStore.js";

export interface HealthPayload {
  status: "ok" | "degraded";
  version: string;
  uptime: number;
  dbStatus: "ok" | "degraded";
}

export function buildHealthPayload(workspace?: string): HealthPayload {
  const root = workspace && workspace.trim().length > 0 ? workspace : process.cwd();
  const scoreDbOk = scoreDbHealthy(root);
  let ledgerDbOk = true;

  try {
    const ledger = openLedger(root);
    try {
      ledger.db.prepare("SELECT 1").get();
    } finally {
      ledger.close();
    }
  } catch {
    ledgerDbOk = false;
  }

  const dbStatus: "ok" | "degraded" = scoreDbOk && ledgerDbOk ? "ok" : "degraded";
  return {
    status: dbStatus === "ok" ? "ok" : "degraded",
    version: amcVersion,
    uptime: Number(process.uptime().toFixed(3)),
    dbStatus
  };
}
