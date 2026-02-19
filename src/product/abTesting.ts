import { randomUUID } from 'node:crypto';
import { createHash } from 'node:crypto';

export interface Experiment { id: string; name: string; variants: string[]; results: Map<string, number[]>; }
export interface VariantStats { variant: string; count: number; mean: number; }
export interface AnalysisResult { experimentId: string; stats: VariantStats[]; best: string; }
export interface ABTest { testId: string; variant: string; control: string; }

export class ABTestManager {
  private experiments = new Map<string, Experiment>();

  createExperiment(name: string, variants: string[]): Experiment {
    const exp: Experiment = { id: randomUUID(), name, variants, results: new Map() };
    for (const v of variants) exp.results.set(v, []);
    this.experiments.set(exp.id, exp);
    return exp;
  }

  assignVariant(experimentId: string, userId: string): string {
    const exp = this.experiments.get(experimentId);
    if (!exp) throw new Error(`Experiment ${experimentId} not found`);
    const hash = createHash('sha256').update(`${experimentId}:${userId}`).digest();
    const idx = hash.readUInt32BE(0) % exp.variants.length;
    return exp.variants[idx]!;
  }

  recordResult(expId: string, variant: string, outcome: number): void {
    const exp = this.experiments.get(expId);
    if (!exp) throw new Error(`Experiment ${expId} not found`);
    const arr = exp.results.get(variant);
    if (!arr) throw new Error(`Variant ${variant} not found`);
    arr.push(outcome);
  }

  analyze(expId: string): AnalysisResult {
    const exp = this.experiments.get(expId);
    if (!exp) throw new Error(`Experiment ${expId} not found`);
    const stats: VariantStats[] = [];
    for (const [variant, outcomes] of exp.results) {
      const count = outcomes.length;
      const mean = count > 0 ? outcomes.reduce((a, b) => a + b, 0) / count : 0;
      stats.push({ variant, count, mean });
    }
    const best = stats.reduce((a, b) => (b?.mean ?? 0) > (a?.mean ?? 0) ? b : a, stats[0])?.variant ?? '';
    return { experimentId: expId, stats, best };
  }
}

export function createABTest(name: string, variants: string[]): ABTest {
  return { testId: randomUUID(), variant: variants[0] ?? 'A', control: 'baseline' };
}
