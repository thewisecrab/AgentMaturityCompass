import { openLedger } from "../../ledger/ledger.js";

export function runVacuum(workspace: string): { ok: boolean; lastVacuumTs: number } {
  const ledger = openLedger(workspace);
  try {
    ledger.db.exec("VACUUM;");
    ledger.db.exec("ANALYZE;");
    return {
      ok: true,
      lastVacuumTs: Date.now()
    };
  } finally {
    ledger.close();
  }
}

export function ensureOperationalIndexes(workspace: string): { ok: boolean } {
  const ledger = openLedger(workspace);
  try {
    ledger.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_events_agent_ts ON evidence_events(json_extract(meta_json, '$.agentId'), ts);
      CREATE INDEX IF NOT EXISTS idx_events_audit_type_ts ON evidence_events(json_extract(meta_json, '$.auditType'), ts);
      CREATE INDEX IF NOT EXISTS idx_outcome_events_agent_metric_ts ON outcome_events(agent_id, metric_id, ts);
      CREATE INDEX IF NOT EXISTS idx_runs_status_ts ON runs(status, ts);
      CREATE INDEX IF NOT EXISTS idx_assurance_runs_status_ts ON assurance_runs(status, ts);
      CREATE INDEX IF NOT EXISTS idx_sessions_runtime_started ON sessions(runtime, started_ts);
    `);
    return { ok: true };
  } finally {
    ledger.close();
  }
}

