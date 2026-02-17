import { median } from "./robustStats.js";
import type { ForecastDrift } from "./forecastSchema.js";

export function detectDrift(params: {
  metricId: string;
  points: Array<{ ts: number; value: number; runId?: string }>;
  window: number;
  warnThreshold: number;
  criticalThreshold: number;
}): ForecastDrift | null {
  const points = [...params.points].sort((a, b) => a.ts - b.ts);
  if (points.length < Math.max(3, params.window)) {
    return null;
  }
  const window = Math.max(2, params.window);
  const slice = points.slice(-window);
  const previous = slice.slice(0, -1).map((point) => point.value);
  const latest = slice[slice.length - 1]!;
  const baseline = median(previous);
  const delta = Number((baseline - latest.value).toFixed(6));
  if (delta < params.warnThreshold) {
    return null;
  }
  return {
    metricId: params.metricId,
    severity: delta >= params.criticalThreshold ? "CRITICAL" : "WARN",
    delta,
    window,
    evidenceRefs: {
      runIds: slice.map((point) => point.runId).filter((value): value is string => Boolean(value)),
      eventHashes: []
    }
  };
}
