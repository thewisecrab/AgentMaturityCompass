import { randomUUID } from "node:crypto";
import { join, resolve } from "node:path";
import Database from "better-sqlite3";
import { ensureDir } from "../utils/fs.js";

export interface DiagAnswerRecord {
  value: number;
  notes?: string;
}

export interface DiagSession {
  id: string;
  agentId: string;
  answers: Record<string, DiagAnswerRecord>;
  createdAt: string;
  completedAt?: string;
}

const stores = new Map<string, Database.Database>();

function normalizedWorkspace(workspace?: string): string {
  const raw = workspace && workspace.trim().length > 0 ? workspace : process.cwd();
  return resolve(raw);
}

function scoreDbPath(workspace: string): string {
  return join(workspace, ".amc", "score_sessions.sqlite");
}

function openDb(workspace?: string): Database.Database {
  const root = normalizedWorkspace(workspace);
  const existing = stores.get(root);
  if (existing) {
    return existing;
  }

  ensureDir(join(root, ".amc"));
  const db = new Database(scoreDbPath(root));
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS score_sessions (
      session_id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      answers_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      completed_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_score_sessions_created_at ON score_sessions(created_at);
    CREATE INDEX IF NOT EXISTS idx_score_sessions_completed_at ON score_sessions(completed_at);
  `);

  stores.set(root, db);
  return db;
}

function parseAnswers(raw: string): Record<string, DiagAnswerRecord> {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, DiagAnswerRecord> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value !== "object" || value === null) {
        continue;
      }
      const row = value as Record<string, unknown>;
      if (typeof row.value !== "number") {
        continue;
      }
      out[key] = {
        value: row.value,
        notes: typeof row.notes === "string" ? row.notes : undefined
      };
    }
    return out;
  } catch {
    return {};
  }
}

function hydrateSession(row: {
  session_id: string;
  agent_id: string;
  answers_json: string;
  created_at: string;
  completed_at: string | null;
}): DiagSession {
  return {
    id: row.session_id,
    agentId: row.agent_id,
    answers: parseAnswers(row.answers_json),
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined
  };
}

export function createScoreSession(workspace: string | undefined, agentId: string): DiagSession {
  const db = openDb(workspace);
  const nowIso = new Date().toISOString();
  const session: DiagSession = {
    id: randomUUID(),
    agentId,
    answers: {},
    createdAt: nowIso
  };
  db.prepare(
    `INSERT INTO score_sessions(session_id, agent_id, answers_json, created_at, completed_at)
     VALUES(@sessionId, @agentId, @answersJson, @createdAt, NULL)`
  ).run({
    sessionId: session.id,
    agentId: session.agentId,
    answersJson: JSON.stringify(session.answers),
    createdAt: session.createdAt
  });
  return session;
}

export function getScoreSession(workspace: string | undefined, sessionId: string): DiagSession | null {
  const db = openDb(workspace);
  const row = db
    .prepare(
      `SELECT session_id, agent_id, answers_json, created_at, completed_at
       FROM score_sessions
       WHERE session_id = ?`
    )
    .get(sessionId) as
    | {
        session_id: string;
        agent_id: string;
        answers_json: string;
        created_at: string;
        completed_at: string | null;
      }
    | undefined;
  if (!row) {
    return null;
  }
  return hydrateSession(row);
}

export function recordScoreAnswer(params: {
  workspace?: string;
  sessionId: string;
  questionId: string;
  value: number;
  notes?: string;
}): DiagSession | null {
  const session = getScoreSession(params.workspace, params.sessionId);
  if (!session) {
    return null;
  }
  session.answers[params.questionId] = {
    value: params.value,
    notes: params.notes
  };
  const db = openDb(params.workspace);
  db.prepare(
    `UPDATE score_sessions
     SET answers_json = @answersJson
     WHERE session_id = @sessionId`
  ).run({
    sessionId: session.id,
    answersJson: JSON.stringify(session.answers)
  });
  return session;
}

export function markScoreSessionCompleted(workspace: string | undefined, sessionId: string): void {
  const db = openDb(workspace);
  db.prepare(
    `UPDATE score_sessions
     SET completed_at = COALESCE(completed_at, @completedAt)
     WHERE session_id = @sessionId`
  ).run({
    sessionId,
    completedAt: new Date().toISOString()
  });
}

export function countActiveScoreSessions(workspace: string | undefined): number {
  const db = openDb(workspace);
  const row = db
    .prepare("SELECT COUNT(*) AS c FROM score_sessions WHERE completed_at IS NULL")
    .get() as { c: number };
  return Number(row.c ?? 0);
}

export function scoreDbHealthy(workspace: string | undefined): boolean {
  try {
    const db = openDb(workspace);
    db.prepare("SELECT 1").get();
    return true;
  } catch {
    return false;
  }
}

export function closeScoreSessionStores(workspace?: string): void {
  if (workspace && workspace.trim().length > 0) {
    const root = normalizedWorkspace(workspace);
    const db = stores.get(root);
    if (db) {
      db.close();
      stores.delete(root);
    }
    return;
  }
  for (const [root, db] of stores.entries()) {
    db.close();
    stores.delete(root);
  }
}
