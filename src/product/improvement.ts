/**
 * improvement.ts — Configurable performance improvement suggestions
 * with threshold management and before/after impact tracking.
 */

import { randomUUID } from 'node:crypto';

export interface PerformanceData {
  errorRate?: number;
  latencyMs?: number;
  throughput?: number;
  costPerCall?: number;
}

export interface Suggestion {
  id: string;
  area: string;
  suggestion: string;
  priority: 'low' | 'medium' | 'high';
  expectedImpact: number;
}

export interface Improvement {
  improvementId: string;
  area: string;
  suggestion: string;
}

export interface ImpactRecord {
  id: string;
  applied: boolean;
  before?: PerformanceData;
  after?: PerformanceData;
  improvement?: number; // percentage improvement
  appliedAt?: number;
  measuredAt?: number;
}

export interface ImprovementThresholds {
  maxErrorRate: number;
  maxLatencyMs: number;
  minThroughput: number;
  maxCostPerCall: number;
}

/* ── Default and configurable thresholds ─────────────────────────── */

const DEFAULT_THRESHOLDS: ImprovementThresholds = {
  maxErrorRate: 0.1,
  maxLatencyMs: 1000,
  minThroughput: 10,
  maxCostPerCall: 0.1,
};

const areaThresholds = new Map<string, ImprovementThresholds>();

export function setThresholds(area: string, thresholds: Partial<ImprovementThresholds>): void {
  const existing = areaThresholds.get(area) ?? { ...DEFAULT_THRESHOLDS };
  areaThresholds.set(area, { ...existing, ...thresholds });
}

export function getThresholds(area?: string): ImprovementThresholds {
  return area ? (areaThresholds.get(area) ?? DEFAULT_THRESHOLDS) : DEFAULT_THRESHOLDS;
}

/* ── Impact tracking store ───────────────────────────────────────── */

const improvements = new Map<string, ImpactRecord>();

/* ── Suggest improvements ────────────────────────────────────────── */

export function suggestImprovement(data: PerformanceData | string, suggestion?: string): Suggestion[] | Improvement {
  if (typeof data === 'string') {
    return { improvementId: randomUUID(), area: data, suggestion: suggestion ?? '' };
  }

  const t = DEFAULT_THRESHOLDS;
  const suggestions: Suggestion[] = [];

  if ((data.errorRate ?? 0) > t.maxErrorRate) {
    const severity = (data.errorRate ?? 0) > t.maxErrorRate * 3 ? 'high' : 'high';
    suggestions.push({
      id: randomUUID(), area: 'reliability',
      suggestion: 'Add retry logic with exponential backoff and circuit breaker',
      priority: severity, expectedImpact: 0.7,
    });
  }

  if ((data.latencyMs ?? 0) > t.maxLatencyMs) {
    suggestions.push({
      id: randomUUID(), area: 'performance',
      suggestion: 'Implement caching layer for repeated queries and batch requests',
      priority: (data.latencyMs ?? 0) > t.maxLatencyMs * 5 ? 'high' : 'medium',
      expectedImpact: 0.5,
    });
  }

  if ((data.throughput ?? Infinity) < t.minThroughput) {
    suggestions.push({
      id: randomUUID(), area: 'scalability',
      suggestion: 'Enable parallel processing of independent tasks with work-stealing queue',
      priority: 'medium', expectedImpact: 0.6,
    });
  }

  if ((data.costPerCall ?? 0) > t.maxCostPerCall) {
    suggestions.push({
      id: randomUUID(), area: 'cost',
      suggestion: 'Use smaller model for simple queries, route complex ones to larger model',
      priority: 'low', expectedImpact: 0.4,
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      id: randomUUID(), area: 'general',
      suggestion: 'Performance is within acceptable ranges',
      priority: 'low', expectedImpact: 0.1,
    });
  }

  return suggestions;
}

/* ── Apply and track ─────────────────────────────────────────────── */

export function applyImprovement(agentId: string, suggestion: Suggestion, before?: PerformanceData): string {
  const id = randomUUID();
  improvements.set(id, { id, applied: true, before, appliedAt: Date.now() });
  return id;
}

export function recordAfter(improvementId: string, after: PerformanceData): ImpactRecord | undefined {
  const record = improvements.get(improvementId);
  if (!record) return undefined;
  record.after = after;
  record.measuredAt = Date.now();

  // Calculate improvement percentage if before data exists
  if (record.before) {
    const metrics: (keyof PerformanceData)[] = ['errorRate', 'latencyMs', 'costPerCall'];
    let totalImprovement = 0;
    let count = 0;
    for (const m of metrics) {
      const b = record.before[m];
      const a = record.after[m];
      if (b !== undefined && a !== undefined && b > 0) {
        totalImprovement += (b - a) / b;
        count++;
      }
    }
    if (record.before.throughput !== undefined && record.after.throughput !== undefined && record.before.throughput > 0) {
      totalImprovement += (record.after.throughput - record.before.throughput) / record.before.throughput;
      count++;
    }
    record.improvement = count > 0 ? totalImprovement / count : 0;
  }

  return record;
}

export function trackImpact(improvementId: string): ImpactRecord | undefined {
  return improvements.get(improvementId);
}

export function listImprovements(): ImpactRecord[] {
  return [...improvements.values()];
}
