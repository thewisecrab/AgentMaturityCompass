import { randomUUID } from 'node:crypto';

export interface QualityReport { completeness: number; consistency: number; uniqueness: number; score: number; issues: string[]; passed: boolean; }
export interface DataQualityReport { score: number; issues: string[]; passed: boolean; }
export interface Anomaly { field: string; value: unknown; reason: string; }

export function assessQuality(dataset: Record<string, unknown>[]): QualityReport {
  if (dataset.length === 0) return { completeness: 0, consistency: 0, uniqueness: 0, score: 0, issues: ['Empty dataset'], passed: false };
  const fields = Object.keys(dataset[0]!);
  // Completeness
  let totalCells = 0, nonNull = 0;
  for (const row of dataset) for (const f of fields) { totalCells++; if (row[f] != null && row[f] !== '') nonNull++; }
  const completeness = nonNull / totalCells;
  // Consistency: type uniformity per field
  let consistentFields = 0;
  for (const f of fields) {
    const types = new Set(dataset.map(r => typeof r[f]));
    if (types.size <= 1) consistentFields++;
  }
  const consistency = consistentFields / Math.max(fields.length, 1);
  // Uniqueness
  const serialized = dataset.map(r => JSON.stringify(r));
  const uniqueness = new Set(serialized).size / dataset.length;
  const issues: string[] = [];
  if (completeness < 0.9) issues.push(`Low completeness: ${(completeness * 100).toFixed(1)}%`);
  if (consistency < 0.9) issues.push('Inconsistent field types detected');
  if (uniqueness < 0.95) issues.push(`${dataset.length - new Set(serialized).size} duplicate rows`);
  const score = (completeness + consistency + uniqueness) / 3 * 100;
  return { completeness, consistency, uniqueness, score, issues, passed: issues.length === 0 };
}

export function flagAnomalies(data: Record<string, unknown>[]): Anomaly[] {
  if (data.length < 3) return [];
  const anomalies: Anomaly[] = [];
  const fields = Object.keys(data[0]!);
  for (const f of fields) {
    const nums = data.map(r => r[f]).filter((v): v is number => typeof v === 'number');
    if (nums.length < 3) continue;
    const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
    const std = Math.sqrt(nums.reduce((s, v) => s + (v - mean) ** 2, 0) / nums.length);
    if (std === 0) continue;
    for (const v of nums) { if (Math.abs(v - mean) > 3 * std) anomalies.push({ field: f, value: v, reason: 'Outlier (>3σ)' }); }
  }
  return anomalies;
}

export function checkDataQuality(records: unknown[]): DataQualityReport {
  const issues: string[] = [];
  if (records.length === 0) issues.push('Empty dataset');
  return { score: issues.length === 0 ? 100 : 50, issues, passed: issues.length === 0 };
}
