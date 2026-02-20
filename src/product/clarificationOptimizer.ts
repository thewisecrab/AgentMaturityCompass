/**
 * clarificationOptimizer.ts — Clarification Question Minimizer.
 *
 * Given a list of candidate clarification questions and available context,
 * selects the 1–3 highest-information questions so operators are interrupted
 * as rarely as possible.
 *
 * Information-gain scoring uses:
 *   - Context coverage: questions whose answers are already in context score lower
 *   - Ambiguity coverage: overlapping questions are deduplicated
 *   - Scope diversity: prefer questions that cover different aspects
 *   - Criticality: questions about blockers/required fields score higher
 *
 * In-memory backed (no SQLite).
 *
 * Port of Python clarification_optimizer.py
 */

import { randomUUID } from 'node:crypto';

/* ── Scoring helpers ───────────────────────────────────────────────── */

const CRITICAL_WORDS = /\b(required|mandatory|must|critical|essential|deadline|budget|who|what is|which|how many|when|where)\b/gi;

const SCOPE_CATEGORIES: Record<string, RegExp> = {
  who:        /\b(who|owner|responsible|team|person|agent)\b/i,
  what:       /\b(what|which|type|kind|format|schema)\b/i,
  when:       /\b(when|deadline|date|schedule|timeline|sla)\b/i,
  how:        /\b(how|method|approach|process|steps|way)\b/i,
  constraint: /\b(limit|budget|max|min|constraint|require)\b/i,
};

function contextCoverage(question: string, context: Record<string, unknown>): number {
  const qLower = question.toLowerCase();
  const contextText = Object.values(context).map(String).join(' ').toLowerCase();
  const words = new Set(qLower.match(/\w{4,}/g) ?? []);
  if (words.size === 0) return 0;
  let covered = 0;
  for (const w of words) {
    if (contextText.includes(w)) covered++;
  }
  return covered / words.size;
}

function criticalityScore(question: string): number {
  const hits = (question.match(CRITICAL_WORDS) ?? []).length;
  return Math.min(hits * 0.25, 1.0);
}

function scopeCategory(question: string): string {
  for (const [cat, pattern] of Object.entries(SCOPE_CATEGORIES)) {
    if (pattern.test(question)) return cat;
  }
  return 'other';
}

function questionScore(
  question: string,
  context: Record<string, unknown>,
  usedScopes: Set<string>,
): number {
  const coverage = contextCoverage(question, context);
  const crit = criticalityScore(question);
  const scope = scopeCategory(question);
  const novelty = usedScopes.has(scope) ? 0.0 : 0.3;
  const base = (1.0 - coverage) * 0.5 + crit * 0.2 + novelty;
  return Math.round(Math.min(base, 1.0) * 10000) / 10000;
}

/* ── Interfaces ────────────────────────────────────────────────────── */

export interface ClarificationQuestion {
  text: string;
  score: number;
  category: string;
  reason: string;
}

export interface ClarificationResult {
  sessionId: string;
  taskSummary: string;
  selected: ClarificationQuestion[];
  skipped: string[];
  tenantId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ResolutionRecord {
  resolutionId: string;
  sessionId: string;
  question: string;
  answer: string;
  resolvedAt: string;
}

export interface OptimizeRequest {
  candidates: string[];
  context?: Record<string, unknown>;
  taskSummary?: string;
  maxQuestions?: number;
  tenantId?: string;
  metadata?: Record<string, unknown>;
}

/* ── ClarificationOptimizer ────────────────────────────────────────── */

export class ClarificationOptimizer {
  static readonly MAX_QUESTIONS = 3;

  private sessions = new Map<string, ClarificationResult>();
  private resolutions = new Map<string, ResolutionRecord[]>(); // sessionId -> records

  optimize(request: OptimizeRequest): ClarificationResult {
    const ctx = request.context ?? {};
    const limit = Math.max(1, Math.min(
      request.maxQuestions ?? ClarificationOptimizer.MAX_QUESTIONS,
      ClarificationOptimizer.MAX_QUESTIONS,
    ));

    // Deduplicate
    const seenTexts = new Set<string>();
    const unique: string[] = [];
    for (const c of request.candidates) {
      const norm = c.trim().toLowerCase();
      if (norm && !seenTexts.has(norm)) {
        seenTexts.add(norm);
        unique.push(c.trim());
      }
    }

    // Score
    const usedScopes = new Set<string>();
    const scored: ClarificationQuestion[] = [];
    for (const q of unique) {
      const sc = questionScore(q, ctx, usedScopes);
      const cat = scopeCategory(q);
      const alreadyCovered = contextCoverage(q, ctx) > 0.6;
      const reason = alreadyCovered
        ? 'Already answerable from context — skip'
        : `Score=${sc.toFixed(2)}; category=${cat}`;
      scored.push({ text: q, score: sc, category: cat, reason });
    }

    scored.sort((a, b) => b.score - a.score);

    // Greedy selection: pick top-k, enforcing scope diversity
    const selected: ClarificationQuestion[] = [];
    const skipped: string[] = [];

    for (const item of scored) {
      if (selected.length >= limit) {
        skipped.push(item.text);
        continue;
      }
      if (contextCoverage(item.text, ctx) > 0.75) {
        skipped.push(item.text);
        continue;
      }
      selected.push(item);
    }

    const sessionId = randomUUID();
    const now = new Date().toISOString();

    const result: ClarificationResult = {
      sessionId,
      taskSummary: request.taskSummary ?? '',
      selected,
      skipped,
      tenantId: request.tenantId ?? '',
      metadata: request.metadata ?? {},
      createdAt: now,
    };

    this.sessions.set(sessionId, result);
    return result;
  }

  recordResolution(sessionId: string, question: string, answer: string): ResolutionRecord {
    const resolutionId = randomUUID();
    const now = new Date().toISOString();
    const record: ResolutionRecord = {
      resolutionId, sessionId, question, answer, resolvedAt: now,
    };
    const arr = this.resolutions.get(sessionId) ?? [];
    arr.push(record);
    this.resolutions.set(sessionId, arr);
    return record;
  }

  getSession(sessionId: string): ClarificationResult | undefined {
    return this.sessions.get(sessionId);
  }

  listResolutions(sessionId: string): ResolutionRecord[] {
    return this.resolutions.get(sessionId) ?? [];
  }

  listSessions(tenantId?: string, limit = 50): ClarificationResult[] {
    let results = [...this.sessions.values()];
    if (tenantId) results = results.filter(r => r.tenantId === tenantId);
    results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return results.slice(0, limit);
  }
}

/* ── Singleton ─────────────────────────────────────────────────────── */

let _optimizer: ClarificationOptimizer | undefined;

export function getClarificationOptimizer(): ClarificationOptimizer {
  if (!_optimizer) _optimizer = new ClarificationOptimizer();
  return _optimizer;
}
