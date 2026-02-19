import { randomUUID } from 'node:crypto';

export interface Evidence { source: string; content: string; timestamp?: number; }
export interface Factor { name: string; weight: number; value: number; }
export interface ConfidenceResult { score: number; factors: Factor[]; label: 'low' | 'medium' | 'high'; }
export interface ConfidenceScore { score: number; label: string; factors: string[]; }

export function scoreConfidence(output: string, evidence: Evidence[]): ConfidenceResult {
  const factors: Factor[] = [];
  // Evidence count factor
  const countScore = Math.min(evidence.length / 5, 1);
  factors.push({ name: 'evidenceCount', weight: 0.3, value: countScore });
  // Source diversity
  const sources = new Set(evidence.map(e => e.source));
  const diversityScore = Math.min(sources.size / 3, 1);
  factors.push({ name: 'sourceDiversity', weight: 0.25, value: diversityScore });
  // Recency
  const now = Date.now();
  const recencyScores = evidence.map(e => e.timestamp ? Math.max(0, 1 - (now - e.timestamp) / (86400000 * 30)) : 0.5);
  const recency = recencyScores.length > 0 ? recencyScores.reduce((a, b) => a + b, 0) / recencyScores.length : 0;
  factors.push({ name: 'recency', weight: 0.2, value: recency });
  // Consistency
  const contents = evidence.map(e => e.content.toLowerCase());
  let consistent = 1;
  if (contents.length > 1) {
    const words0 = new Set(contents[0]!.split(/\s+/));
    const overlaps = contents.slice(1).map(c => { const w = c.split(/\s+/); return w.filter(x => words0.has(x)).length / Math.max(w.length, 1); });
    consistent = overlaps.reduce((a, b) => a + b, 0) / overlaps.length;
  }
  factors.push({ name: 'consistency', weight: 0.25, value: consistent });
  const score = factors.reduce((s, f) => s + f.weight * f.value, 0);
  const label = score > 0.7 ? 'high' : score > 0.4 ? 'medium' : 'low';
  return { score, factors, label };
}

export function assessConfidence(factors: Record<string, number>): ConfidenceScore {
  const avg = Object.values(factors).reduce((a, b) => a + b, 0) / (Object.keys(factors).length || 1);
  return { score: avg, label: avg > 0.7 ? 'high' : avg > 0.4 ? 'medium' : 'low', factors: Object.keys(factors) };
}
