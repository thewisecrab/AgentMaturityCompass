export interface MemoryMaturityProfile {
  agentId: string;
  persistenceLevel: 0 | 1 | 2 | 3 | 4 | 5;
  continuityLevel: 0 | 1 | 2 | 3 | 4 | 5;
  integrityLevel: 0 | 1 | 2 | 3 | 4 | 5;
  overallScore: number;
  retrievalAccuracy?: number;
  continuityScore?: number;
  tamperEvidence: boolean;
  gaps: string[];
  recommendations: string[];
}

export function assessMemoryMaturity(scores: Record<string, number>): MemoryMaturityProfile {
  const persistence = Math.min(5, Math.max(0, Math.round(scores['AMC-MEM-1.1'] ?? scores['memory-persistence'] ?? 0))) as 0|1|2|3|4|5;
  const continuity = Math.min(5, Math.max(0, Math.round(scores['AMC-MEM-1.2'] ?? scores['context-survival'] ?? 0))) as 0|1|2|3|4|5;
  const integrity = Math.min(5, Math.max(0, Math.round(scores['AMC-MEM-2.1'] ?? scores['memory-integrity'] ?? 0))) as 0|1|2|3|4|5;
  const overallScore = Math.round(((persistence + continuity + integrity) / 15) * 100);
  const gaps: string[] = [];
  const recommendations: string[] = [];
  if (persistence < 3) {
    gaps.push('Memory persistence below L3');
    recommendations.push('Implement indexed, searchable memory with consistent schema');
  }
  if (continuity < 3) {
    gaps.push('Context continuity below L3');
    recommendations.push('Add pre-compression checkpointing before context limit');
  }
  if (integrity < 3) {
    gaps.push('Memory integrity below L3');
    recommendations.push('Implement hash-chained memory entries');
  }
  return {
    agentId: scores['agentId'] ? String(scores['agentId']) : 'unknown',
    persistenceLevel: persistence,
    continuityLevel: continuity,
    integrityLevel: integrity,
    overallScore,
    retrievalAccuracy: scores['retrievalAccuracy'],
    continuityScore: scores['continuityScore'],
    tamperEvidence: integrity >= 3,
    gaps,
    recommendations,
  };
}

export function scoreMemoryDimension(questionScores: Record<string, number>): number {
  const vals = Object.values(questionScores).filter(v => typeof v === 'number' && !isNaN(v));
  if (vals.length === 0) return 0;
  return Math.round((vals.reduce((a, b) => a + b, 0) / (vals.length * 5)) * 100);
}
