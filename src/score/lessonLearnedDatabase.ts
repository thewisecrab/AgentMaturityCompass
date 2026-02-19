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
}

export interface LessonDatabase {
  lessons: Lesson[];
  applicationRate: number;
  recurrenceRate: number;
  learningVelocity: number;
  maturityScore: number;
}

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

export function getLearningMaturityScore(db: LessonDatabase): number {
  if (db.lessons.length === 0) return 0;
  const applicationRate =
    db.lessons.filter(l => l.appliedInFutureRun).length / db.lessons.length;
  const failures = db.lessons.filter(l => l.category === 'failure');
  const recurrenceRate = failures.length > 1 ? 0.2 : 0; // simplified
  const velocity = Math.min(1, db.lessons.length / 50);
  return Math.round(applicationRate * 40 + (1 - recurrenceRate) * 30 + velocity * 30);
}
