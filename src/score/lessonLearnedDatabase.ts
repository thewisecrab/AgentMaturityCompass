/**
 * lessonLearnedDatabase.ts — Enhanced with Jaccard similarity search,
 * recurrence detection, and learning velocity trending.
 */

import { randomUUID } from "node:crypto";

export interface Lesson {
  id: string;
  timestamp: string;
  category: 'failure' | 'success' | 'near-miss' | 'insight';
  description: string;
  rootCause?: string;
  resolution?: string;
  appliedInFutureRun?: boolean;
  agentId: string;
  taskType?: string;
  tags?: string[];
}

export interface LessonDatabase {
  lessons: Lesson[];
  applicationRate: number;
  recurrenceRate: number;
  learningVelocity: number;
  maturityScore: number;
}

export interface SimilarLesson {
  lesson: Lesson;
  similarity: number;
}

export interface RecurrenceReport {
  recurring: Array<{ pattern: string; count: number; lessons: Lesson[] }>;
  recurrenceRate: number;
}

export interface VelocityTrend {
  period: string;
  lessonsAdded: number;
  lessonsApplied: number;
  applicationRate: number;
}

/* ── Core operations ─────────────────────────────────────────────── */

export function addLesson(lesson: Omit<Lesson, 'id' | 'timestamp'>): Lesson {
  return { ...lesson, id: randomUUID(), timestamp: new Date().toISOString() };
}

export function queryLessons(
  db: LessonDatabase,
  taskType: string,
  category?: string,
): Lesson[] {
  return db.lessons.filter(
    l =>
      (!taskType || l.taskType === taskType) &&
      (!category || l.category === category),
  );
}

/* ── Jaccard similarity search ───────────────────────────────────── */

function tokenize(text: string): Set<string> {
  return new Set(text.toLowerCase().split(/\W+/).filter(w => w.length > 2));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  const intersection = [...a].filter(x => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

export function findSimilarLessons(
  db: LessonDatabase,
  query: string,
  limit = 5,
  minSimilarity = 0.1,
): SimilarLesson[] {
  const queryTokens = tokenize(query);
  const results: SimilarLesson[] = [];

  for (const lesson of db.lessons) {
    const lessonText = [lesson.description, lesson.rootCause ?? '', lesson.resolution ?? ''].join(' ');
    const lessonTokens = tokenize(lessonText);
    const similarity = jaccard(queryTokens, lessonTokens);
    if (similarity >= minSimilarity) {
      results.push({ lesson, similarity });
    }
  }

  return results.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
}

/* ── Recurrence detection ────────────────────────────────────────── */

export function detectRecurrence(db: LessonDatabase): RecurrenceReport {
  const failures = db.lessons.filter(l => l.category === 'failure');
  const patternMap = new Map<string, Lesson[]>();

  for (let i = 0; i < failures.length; i++) {
    for (let j = i + 1; j < failures.length; j++) {
      const tokensA = tokenize(failures[i]!.description);
      const tokensB = tokenize(failures[j]!.description);
      const sim = jaccard(tokensA, tokensB);
      if (sim > 0.4) {
        // Group by common tokens
        const commonTokens = [...tokensA].filter(t => tokensB.has(t)).sort().join(' ');
        if (commonTokens.length > 0) {
          const existing = patternMap.get(commonTokens) ?? [];
          const ids = new Set(existing.map(l => l.id));
          if (!ids.has(failures[i]!.id)) existing.push(failures[i]!);
          if (!ids.has(failures[j]!.id)) existing.push(failures[j]!);
          patternMap.set(commonTokens, existing);
        }
      }
    }
  }

  const recurring = [...patternMap.entries()]
    .filter(([, lessons]) => lessons.length >= 2)
    .map(([pattern, lessons]) => ({ pattern, count: lessons.length, lessons }))
    .sort((a, b) => b.count - a.count);

  const uniqueRecurring = new Set(recurring.flatMap(r => r.lessons.map(l => l.id)));
  const recurrenceRate = failures.length > 0 ? uniqueRecurring.size / failures.length : 0;

  return { recurring, recurrenceRate };
}

/* ── Learning velocity trending ──────────────────────────────────── */

export function learningVelocityTrend(db: LessonDatabase, windowDays = 7): VelocityTrend[] {
  if (db.lessons.length === 0) return [];

  const sorted = [...db.lessons].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const windowMs = windowDays * 24 * 3600_000;
  const trends: VelocityTrend[] = [];

  const start = new Date(sorted[0]!.timestamp).getTime();
  const end = new Date(sorted[sorted.length - 1]!.timestamp).getTime();

  let windowStart = start;
  while (windowStart <= end) {
    const windowEnd = windowStart + windowMs;
    const inWindow = sorted.filter(l => {
      const t = new Date(l.timestamp).getTime();
      return t >= windowStart && t < windowEnd;
    });

    const added = inWindow.length;
    const applied = inWindow.filter(l => l.appliedInFutureRun).length;

    trends.push({
      period: new Date(windowStart).toISOString().split('T')[0]!,
      lessonsAdded: added,
      lessonsApplied: applied,
      applicationRate: added > 0 ? applied / added : 0,
    });

    windowStart = windowEnd;
  }

  return trends;
}

/* ── Maturity score (enhanced) ───────────────────────────────────── */

export function getLearningMaturityScore(db: LessonDatabase): number {
  if (db.lessons.length === 0) return 0;

  const applicationRate = db.lessons.filter(l => l.appliedInFutureRun).length / db.lessons.length;
  const recurrence = detectRecurrence(db);
  const velocity = Math.min(1, db.lessons.length / 50);

  // Categories diversity bonus
  const categories = new Set(db.lessons.map(l => l.category));
  const diversityBonus = Math.min(1, categories.size / 4) * 0.1;

  return Math.round(
    applicationRate * 35 +
    (1 - recurrence.recurrenceRate) * 30 +
    velocity * 25 +
    diversityBonus * 10
  );
}
