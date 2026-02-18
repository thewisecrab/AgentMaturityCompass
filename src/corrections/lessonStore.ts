/**
 * Lesson Learned Database
 *
 * Aggregates corrections into transferable lessons.
 * When a correction pattern recurs, promotes to reusable remediation template.
 */

import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { sha256Hex } from "../utils/hash.js";
import { canonicalize } from "../utils/json.js";
import { signHexDigest, getPrivateKeyPem } from "../crypto/keys.js";
import { ensureDir, pathExists, readUtf8, writeFileAtomic } from "../utils/fs.js";
import type { CorrectionEvent } from "./correctionTypes.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Lesson {
  lessonId: string;
  patternDescription: string;
  affectedQuestions: string[];
  remediationSteps: string[];
  effectivenessScore: number;    // average effectiveness of source corrections
  occurrenceCount: number;
  agentsAffected: string[];
  sourceCorrectionIds: string[];
  createdTs: number;
  updatedTs: number;
  prev_lesson_hash: string;
  lesson_hash: string;
  signature: string;
}

export interface LessonPromotionResult {
  lesson: Lesson;
  isNew: boolean;
  merged: boolean;
}

// ---------------------------------------------------------------------------
// File-based Lesson Store (.amc/corrections/lessons/)
// ---------------------------------------------------------------------------

function lessonsDir(workspace: string): string {
  return join(workspace, ".amc", "corrections", "lessons");
}

function lessonFilePath(workspace: string, lessonId: string): string {
  return join(lessonsDir(workspace), `${lessonId}.json`);
}

export function loadAllLessons(workspace: string): Lesson[] {
  const dir = lessonsDir(workspace);
  if (!pathExists(dir)) return [];
  const { readdirSync } = require("node:fs") as typeof import("node:fs");
  const files = readdirSync(dir).filter((f: string) => f.endsWith(".json"));
  return files.map((f: string) => {
    const content = readUtf8(join(dir, f));
    return JSON.parse(content) as Lesson;
  });
}

export function loadLesson(workspace: string, lessonId: string): Lesson | null {
  const file = lessonFilePath(workspace, lessonId);
  if (!pathExists(file)) return null;
  return JSON.parse(readUtf8(file)) as Lesson;
}

function getLastLessonHash(workspace: string): string {
  const lessons = loadAllLessons(workspace);
  if (lessons.length === 0) return "GENESIS_LESSONS";
  const sorted = lessons.sort((a, b) => a.createdTs - b.createdTs);
  return sorted[sorted.length - 1]!.lesson_hash;
}

function computeLessonHash(lesson: Omit<Lesson, "lesson_hash" | "signature">): string {
  return sha256Hex(canonicalize({
    lessonId: lesson.lessonId,
    patternDescription: lesson.patternDescription,
    affectedQuestions: lesson.affectedQuestions,
    remediationSteps: lesson.remediationSteps,
    effectivenessScore: lesson.effectivenessScore,
    occurrenceCount: lesson.occurrenceCount,
    agentsAffected: lesson.agentsAffected,
    sourceCorrectionIds: lesson.sourceCorrectionIds,
    createdTs: lesson.createdTs,
    updatedTs: lesson.updatedTs,
    prev_lesson_hash: lesson.prev_lesson_hash,
  }));
}

function saveLesson(workspace: string, lesson: Lesson): void {
  const dir = lessonsDir(workspace);
  ensureDir(dir);
  writeFileAtomic(lessonFilePath(workspace, lesson.lessonId), JSON.stringify(lesson, null, 2), 0o644);
}

// ---------------------------------------------------------------------------
// Promotion: Correction → Lesson
// ---------------------------------------------------------------------------

/**
 * Promote a correction into a lesson (or merge with existing lesson if pattern matches).
 */
export function promoteCorrection(
  db: Database.Database,
  correctionId: string,
  workspace: string,
): LessonPromotionResult {
  const stmt = db.prepare("SELECT * FROM corrections WHERE correction_id = ?");
  const row = stmt.get(correctionId) as Record<string, unknown> | undefined;
  if (!row) {
    throw new Error(`Correction not found: ${correctionId}`);
  }

  const correction: CorrectionEvent = {
    correctionId: row.correction_id as string,
    agentId: row.agent_id as string,
    triggerType: row.trigger_type as any,
    triggerId: row.trigger_id as string,
    questionIds: JSON.parse(row.question_ids_json as string),
    correctionDescription: row.correction_description as string,
    appliedAction: row.applied_action as string,
    status: row.status as any,
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
    signature: row.signature as string,
  };

  // Check if an existing lesson covers similar questions
  const existingLessons = loadAllLessons(workspace);
  const matchingLesson = existingLessons.find((l) => {
    const overlap = l.affectedQuestions.filter((q) => correction.questionIds.includes(q));
    return overlap.length > 0 && l.patternDescription.includes(correction.triggerType);
  });

  if (matchingLesson) {
    // Merge into existing lesson
    const now = Date.now();
    const newQuestions = [...new Set([...matchingLesson.affectedQuestions, ...correction.questionIds])];
    const newAgents = [...new Set([...matchingLesson.agentsAffected, correction.agentId])];
    const newCorrectionIds = [...new Set([...matchingLesson.sourceCorrectionIds, correctionId])];
    const newEffectiveness = correction.effectivenessScore !== null
      ? (matchingLesson.effectivenessScore * matchingLesson.occurrenceCount + correction.effectivenessScore) / (matchingLesson.occurrenceCount + 1)
      : matchingLesson.effectivenessScore;

    const updated: Omit<Lesson, "lesson_hash" | "signature"> = {
      ...matchingLesson,
      affectedQuestions: newQuestions,
      agentsAffected: newAgents,
      sourceCorrectionIds: newCorrectionIds,
      occurrenceCount: matchingLesson.occurrenceCount + 1,
      effectivenessScore: Number(newEffectiveness.toFixed(4)),
      updatedTs: now,
    };

    const lessonHash = computeLessonHash(updated);
    let signature = "unsigned";
    try {
      signature = signHexDigest(lessonHash, getPrivateKeyPem(workspace, "monitor"));
    } catch { /* no key */ }

    const lesson: Lesson = { ...updated, lesson_hash: lessonHash, signature };
    saveLesson(workspace, lesson);
    return { lesson, isNew: false, merged: true };
  }

  // Create new lesson
  const now = Date.now();
  const lessonId = `les_${randomUUID().slice(0, 12)}`;
  const prevHash = getLastLessonHash(workspace);

  const base: Omit<Lesson, "lesson_hash" | "signature"> = {
    lessonId,
    patternDescription: `[${correction.triggerType}] ${correction.correctionDescription}`,
    affectedQuestions: correction.questionIds,
    remediationSteps: [correction.appliedAction],
    effectivenessScore: correction.effectivenessScore ?? 0,
    occurrenceCount: 1,
    agentsAffected: [correction.agentId],
    sourceCorrectionIds: [correctionId],
    createdTs: now,
    updatedTs: now,
    prev_lesson_hash: prevHash,
  };

  const lessonHash = computeLessonHash(base);
  let signature = "unsigned";
  try {
    signature = signHexDigest(lessonHash, getPrivateKeyPem(workspace, "monitor"));
  } catch { /* no key */ }

  const lesson: Lesson = { ...base, lesson_hash: lessonHash, signature };
  saveLesson(workspace, lesson);
  return { lesson, isNew: true, merged: false };
}

// ---------------------------------------------------------------------------
// Fleet-wide Lesson Queries
// ---------------------------------------------------------------------------

export function listLessons(
  workspace: string,
  scope: "fleet" | "agent",
  agentId?: string,
): Lesson[] {
  const all = loadAllLessons(workspace);
  if (scope === "fleet") return all.sort((a, b) => b.occurrenceCount - a.occurrenceCount);
  if (agentId) {
    return all.filter((l) => l.agentsAffected.includes(agentId)).sort((a, b) => b.occurrenceCount - a.occurrenceCount);
  }
  return all;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

export function renderLessonsMarkdown(lessons: Lesson[], scope: string): string {
  const lines: string[] = [
    "# Lessons Learned",
    "",
    `Scope: ${scope}`,
    `Total lessons: ${lessons.length}`,
    "",
  ];

  if (lessons.length === 0) {
    lines.push("No lessons found.");
    return lines.join("\n");
  }

  for (const l of lessons) {
    lines.push(`## ${l.lessonId}`);
    lines.push(`- Pattern: ${l.patternDescription}`);
    lines.push(`- Questions: ${l.affectedQuestions.join(", ")}`);
    lines.push(`- Agents: ${l.agentsAffected.join(", ")}`);
    lines.push(`- Occurrences: ${l.occurrenceCount}`);
    lines.push(`- Effectiveness: ${(l.effectivenessScore * 100).toFixed(1)}%`);
    lines.push(`- Remediation: ${l.remediationSteps.join("; ")}`);
    lines.push("");
  }

  return lines.join("\n");
}
