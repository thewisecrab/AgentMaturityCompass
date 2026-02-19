export interface DeterminismResult { deterministic: boolean; variance: number; }

export function checkDeterminism(results: string[]): DeterminismResult {
  const unique = new Set(results).size;
  return { deterministic: unique === 1, variance: unique / Math.max(results.length, 1) };
}
