import { randomUUID } from 'node:crypto';

export interface PerformanceData { errorRate?: number; latencyMs?: number; throughput?: number; costPerCall?: number; }
export interface Suggestion { id: string; area: string; suggestion: string; priority: 'low' | 'medium' | 'high'; expectedImpact: number; }
export interface Improvement { improvementId: string; area: string; suggestion: string; }
export interface ImpactRecord { id: string; applied: boolean; before?: PerformanceData; after?: PerformanceData; }

const improvements = new Map<string, ImpactRecord>();

export function suggestImprovement(data: PerformanceData | string, suggestion?: string): Suggestion[] | Improvement {
  if (typeof data === 'string') return { improvementId: randomUUID(), area: data, suggestion: suggestion ?? '' };
  const suggestions: Suggestion[] = [];
  if ((data.errorRate ?? 0) > 0.1) suggestions.push({ id: randomUUID(), area: 'reliability', suggestion: 'Add retry logic with exponential backoff', priority: 'high', expectedImpact: 0.7 });
  if ((data.latencyMs ?? 0) > 1000) suggestions.push({ id: randomUUID(), area: 'performance', suggestion: 'Implement caching layer for repeated queries', priority: 'medium', expectedImpact: 0.5 });
  if ((data.throughput ?? Infinity) < 10) suggestions.push({ id: randomUUID(), area: 'scalability', suggestion: 'Enable parallel processing of independent tasks', priority: 'medium', expectedImpact: 0.6 });
  if ((data.costPerCall ?? 0) > 0.1) suggestions.push({ id: randomUUID(), area: 'cost', suggestion: 'Use smaller model for simple queries, route complex ones to larger model', priority: 'low', expectedImpact: 0.4 });
  if (suggestions.length === 0) suggestions.push({ id: randomUUID(), area: 'general', suggestion: 'Performance is within acceptable ranges', priority: 'low', expectedImpact: 0.1 });
  return suggestions;
}

export function applyImprovement(agentId: string, suggestion: Suggestion): string {
  const id = randomUUID();
  improvements.set(id, { id, applied: true });
  return id;
}

export function trackImpact(improvementId: string): ImpactRecord | undefined { return improvements.get(improvementId); }
