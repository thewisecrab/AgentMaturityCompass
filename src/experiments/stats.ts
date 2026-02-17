function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}

function sampleWithReplacement(values: number[], rng: () => number): number[] {
  if (values.length === 0) {
    return [];
  }
  const out: number[] = [];
  for (let i = 0; i < values.length; i += 1) {
    const idx = Math.floor(rng() * values.length);
    out.push(values[idx] ?? values[values.length - 1]!);
  }
  return out;
}

function mean(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

export function bootstrapDifferenceCI(params: {
  baseline: number[];
  candidate: number[];
  seed: number;
  iterations?: number;
}): [number, number] {
  const rng = seeded(params.seed);
  const iterations = Math.max(100, params.iterations ?? 1500);
  const diffs: number[] = [];
  for (let i = 0; i < iterations; i += 1) {
    const a = sampleWithReplacement(params.baseline, rng);
    const b = sampleWithReplacement(params.candidate, rng);
    diffs.push(mean(b) - mean(a));
  }
  diffs.sort((x, y) => x - y);
  const low = diffs[Math.floor(iterations * 0.025)] ?? 0;
  const high = diffs[Math.floor(iterations * 0.975)] ?? 0;
  return [Number(low.toFixed(6)), Number(high.toFixed(6))];
}

export function effectSizeDifference(baseline: number[], candidate: number[]): number {
  return Number((mean(candidate) - mean(baseline)).toFixed(6));
}

export function deterministicSeed(parts: Array<string | number>): number {
  const text = parts.map((part) => String(part)).join("|");
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
