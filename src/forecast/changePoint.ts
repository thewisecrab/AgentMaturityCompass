import { mad, median } from "./robustStats.js";

export interface ChangePoint {
  ts: number;
  direction: "UP" | "DOWN";
  magnitude: number;
}

export function detectCusumChangePoints(params: {
  points: Array<{ ts: number; value: number }>;
  thresholdMultiplier?: number;
}): ChangePoint[] {
  const points = [...params.points].sort((a, b) => a.ts - b.ts);
  if (points.length < 4) {
    return [];
  }
  const values = points.map((point) => point.value);
  const center = median(values);
  const sigma = Math.max(1e-6, 1.4826 * mad(values));
  const threshold = (params.thresholdMultiplier ?? 4) * sigma;

  let pos = 0;
  let neg = 0;
  const out: ChangePoint[] = [];
  for (let idx = 0; idx < points.length; idx += 1) {
    const delta = points[idx]!.value - center;
    pos = Math.max(0, pos + delta);
    neg = Math.min(0, neg + delta);
    if (pos >= threshold) {
      out.push({
        ts: points[idx]!.ts,
        direction: "UP",
        magnitude: Number((pos / sigma).toFixed(6))
      });
      pos = 0;
      neg = 0;
      continue;
    }
    if (Math.abs(neg) >= threshold) {
      out.push({
        ts: points[idx]!.ts,
        direction: "DOWN",
        magnitude: Number((Math.abs(neg) / sigma).toFixed(6))
      });
      pos = 0;
      neg = 0;
    }
  }
  return out;
}
