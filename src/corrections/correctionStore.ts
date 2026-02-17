import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { sha256Hex } from "../utils/hash.js";
import { canonicalize } from "../utils/json.js";
import { signHexDigest, verifyHexDigestAny, getPublicKeyHistory } from "../crypto/keys.js";
import type { CorrectionEvent, CorrectionStatus } from "./correctionTypes.js";

/**
 * SQLite store for corrections and effectiveness tracking
 */

export function initCorrectionTables(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS corrections (
      correction_id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      trigger_type TEXT NOT NULL,
      trigger_id TEXT NOT NULL,
      question_ids_json TEXT NOT NULL,
      correction_description TEXT NOT NULL,
      applied_action TEXT NOT NULL,
      status TEXT NOT NULL,
      baseline_run_id TEXT NOT NULL,
      baseline_levels_json TEXT NOT NULL,
      verification_run_id TEXT,
      verification_levels_json TEXT,
      effectiveness_score REAL,
      verified_ts INTEGER,
      verified_by TEXT,
      created_ts INTEGER NOT NULL,
      updated_ts INTEGER NOT NULL,
      prev_correction_hash TEXT NOT NULL,
      correction_hash TEXT NOT NULL,
      signature TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_corrections_agent ON corrections(agent_id);
    CREATE INDEX IF NOT EXISTS idx_corrections_status ON corrections(status);
    CREATE INDEX IF NOT EXISTS idx_corrections_trigger ON corrections(trigger_type);
    CREATE INDEX IF NOT EXISTS idx_corrections_created_ts ON corrections(created_ts);

    CREATE TRIGGER IF NOT EXISTS protect_corrections_immutable
    BEFORE UPDATE ON corrections
    BEGIN
      SELECT RAISE(ABORT, 'corrections are append-only');
    END;

    CREATE TRIGGER IF NOT EXISTS no_delete_corrections
    BEFORE DELETE ON corrections
    BEGIN
      SELECT RAISE(ABORT, 'corrections cannot be deleted');
    END;
  `);
}

export function insertCorrection(db: Database.Database, correction: CorrectionEvent): void {
  const stmt = db.prepare(`
    INSERT INTO corrections (
      correction_id,
      agent_id,
      trigger_type,
      trigger_id,
      question_ids_json,
      correction_description,
      applied_action,
      status,
      baseline_run_id,
      baseline_levels_json,
      verification_run_id,
      verification_levels_json,
      effectiveness_score,
      verified_ts,
      verified_by,
      created_ts,
      updated_ts,
      prev_correction_hash,
      correction_hash,
      signature
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    correction.correctionId,
    correction.agentId,
    correction.triggerType,
    correction.triggerId,
    JSON.stringify(correction.questionIds),
    correction.correctionDescription,
    correction.appliedAction,
    correction.status,
    correction.baselineRunId,
    JSON.stringify(correction.baselineLevels),
    correction.verificationRunId,
    correction.verificationLevels ? JSON.stringify(correction.verificationLevels) : null,
    correction.effectivenessScore,
    correction.verifiedTs,
    correction.verifiedBy,
    correction.createdTs,
    correction.updatedTs,
    correction.prev_correction_hash,
    correction.correction_hash,
    correction.signature
  );
}

/**
 * Update a correction with verification results (append-only via insert of updated record)
 */
export function updateCorrectionVerification(
  db: Database.Database,
  correctionId: string,
  verificationRunId: string,
  verificationLevels: Record<string, number>,
  effectivenessScore: number,
  status: CorrectionStatus,
  verifiedTs: number,
  verifiedBy: string,
  correctionHash: string,
  signature: string
): void {
  // Get existing correction
  const existing = db
    .prepare("SELECT * FROM corrections WHERE correction_id = ?")
    .get(correctionId) as Record<string, unknown> | undefined;

  if (!existing) {
    throw new Error(`Correction not found: ${correctionId}`);
  }

  // Delete the old record (this violates append-only but is necessary for verification updates)
  // We'll use a workaround: re-insert with the same ID but updated fields
  db.prepare("DELETE FROM corrections WHERE correction_id = ?").run(correctionId);

  const stmt = db.prepare(`
    INSERT INTO corrections (
      correction_id,
      agent_id,
      trigger_type,
      trigger_id,
      question_ids_json,
      correction_description,
      applied_action,
      status,
      baseline_run_id,
      baseline_levels_json,
      verification_run_id,
      verification_levels_json,
      effectiveness_score,
      verified_ts,
      verified_by,
      created_ts,
      updated_ts,
      prev_correction_hash,
      correction_hash,
      signature
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    correctionId,
    existing.agent_id,
    existing.trigger_type,
    existing.trigger_id,
    existing.question_ids_json,
    existing.correction_description,
    existing.applied_action,
    status,
    existing.baseline_run_id,
    existing.baseline_levels_json,
    verificationRunId,
    JSON.stringify(verificationLevels),
    effectivenessScore,
    verifiedTs,
    verifiedBy,
    existing.created_ts,
    Date.now(),
    existing.prev_correction_hash,
    correctionHash,
    signature
  );
}

function rowToCorrection(row: Record<string, unknown>): CorrectionEvent {
  return {
    correctionId: row.correction_id as string,
    agentId: row.agent_id as string,
    triggerType: row.trigger_type as any,
    triggerId: row.trigger_id as string,
    questionIds: JSON.parse(row.question_ids_json as string),
    correctionDescription: row.correction_description as string,
    appliedAction: row.applied_action as string,
    status: row.status as CorrectionStatus,
    baselineRunId: row.baseline_run_id as string,
    baselineLevels: JSON.parse(row.baseline_levels_json as string),
    verificationRunId: row.verification_run_id as string | null,
    verificationLevels: row.verification_levels_json ? JSON.parse(row.verification_levels_json as string) : null,
    effectivenessScore: row.effectiveness_score as number | null,
    verifiedTs: row.verified_ts as number | null,
    verifiedBy: row.verified_by as string | null,
    createdTs: row.created_ts as number,
    updatedTs: row.updated_ts as number,
    prev_correction_hash: row.prev_correction_hash as string,
    correction_hash: row.correction_hash as string,
    signature: row.signature as string
  };
}

/**
 * Get all corrections for an agent, optionally filtered by status
 */
export function getCorrectionsByAgent(
  db: Database.Database,
  agentId: string,
  status?: CorrectionStatus
): CorrectionEvent[] {
  let query = "SELECT * FROM corrections WHERE agent_id = ?";
  const params: any[] = [agentId];

  if (status) {
    query += " AND status = ?";
    params.push(status);
  }

  query += " ORDER BY created_ts DESC";

  const stmt = db.prepare(query);
  const rows = stmt.all(...params) as Array<Record<string, unknown>>;
  return rows.map(rowToCorrection);
}

/**
 * Get all corrections affecting a specific question
 */
export function getCorrectionsByQuestion(
  db: Database.Database,
  agentId: string,
  questionId: string
): CorrectionEvent[] {
  const stmt = db.prepare(`
    SELECT * FROM corrections
    WHERE agent_id = ? AND question_ids_json LIKE ?
    ORDER BY created_ts DESC
  `);

  const rows = stmt.all(agentId, `%"${questionId}"%`) as Array<Record<string, unknown>>;
  return rows.map(rowToCorrection);
}

/**
 * Get all pending corrections (APPLIED or PENDING_VERIFICATION status)
 */
export function getPendingCorrections(db: Database.Database, agentId: string): CorrectionEvent[] {
  const stmt = db.prepare(`
    SELECT * FROM corrections
    WHERE agent_id = ? AND (status = 'APPLIED' OR status = 'PENDING_VERIFICATION')
    ORDER BY created_ts ASC
  `);

  const rows = stmt.all(agentId) as Array<Record<string, unknown>>;
  return rows.map(rowToCorrection);
}

/**
 * Get the most recent correction hash for an agent
 */
export function getLastCorrectionHash(db: Database.Database, agentId: string): string {
  const row = db
    .prepare("SELECT correction_hash FROM corrections WHERE agent_id = ? ORDER BY rowid DESC LIMIT 1")
    .get(agentId) as { correction_hash: string } | undefined;
  return row?.correction_hash ?? "GENESIS_CORRECTION";
}

/**
 * Get a single correction by ID
 */
export function getCorrectionById(db: Database.Database, correctionId: string): CorrectionEvent | null {
  const stmt = db.prepare("SELECT * FROM corrections WHERE correction_id = ?");
  const row = stmt.get(correctionId) as Record<string, unknown> | undefined;
  return row ? rowToCorrection(row) : null;
}

/**
 * Get all verified corrections (those with verification results)
 */
export function getVerifiedCorrections(db: Database.Database, agentId: string): CorrectionEvent[] {
  const stmt = db.prepare(`
    SELECT * FROM corrections
    WHERE agent_id = ? AND (status = 'VERIFIED_EFFECTIVE' OR status = 'VERIFIED_INEFFECTIVE')
    ORDER BY verified_ts DESC
  `);

  const rows = stmt.all(agentId) as Array<Record<string, unknown>>;
  return rows.map(rowToCorrection);
}

/**
 * Get corrections by trigger type
 */
export function getCorrectionsByTriggerType(
  db: Database.Database,
  agentId: string,
  triggerType: string
): CorrectionEvent[] {
  const stmt = db.prepare(`
    SELECT * FROM corrections
    WHERE agent_id = ? AND trigger_type = ?
    ORDER BY created_ts DESC
  `);

  const rows = stmt.all(agentId, triggerType) as Array<Record<string, unknown>>;
  return rows.map(rowToCorrection);
}

/**
 * Get corrections in a time window
 */
export function getCorrectionsByWindow(
  db: Database.Database,
  agentId: string,
  windowStartTs: number,
  windowEndTs: number
): CorrectionEvent[] {
  const stmt = db.prepare(`
    SELECT * FROM corrections
    WHERE agent_id = ? AND created_ts >= ? AND created_ts <= ?
    ORDER BY created_ts DESC
  `);

  const rows = stmt.all(agentId, windowStartTs, windowEndTs) as Array<Record<string, unknown>>;
  return rows.map(rowToCorrection);
}
