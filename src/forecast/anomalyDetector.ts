import type { ForecastAnomaly } from "./forecastSchema.js";
import { mad, median, robustZ } from "./robustStats.js";

export function detectSuspiciousMaturityJump(params: {
  maturityPoints: Array<{ ts: number; value: number; runId?: string }>;
  integrityPoints: Array<{ ts: number; value: number; runId?: string }>;
  correlationPoints: Array<{ ts: number; value: number; runId?: string }>;
  observedShare: number;
  thresholdRobustZ: number;
}): ForecastAnomaly | null {
  const maturity = [...params.maturityPoints].sort((a, b) => a.ts - b.ts);
  if (maturity.length < 4) {
    return null;
  }
  const values = maturity.map((point) => point.value);
  const last = values[values.length - 1]!;
  const prior = values.slice(0, -1);
  const center = median(prior);
  const sigma = Math.max(1e-6, 1.4826 * mad(prior));
  const jumpZ = robustZ(last, center, sigma);
  if (jumpZ < params.thresholdRobustZ) {
    return null;
  }
  const integrity = [...params.integrityPoints].sort((a, b) => a.ts - b.ts);
  const correlation = [...params.correlationPoints].sort((a, b) => a.ts - b.ts);
  const integrityDelta =
    integrity.length >= 2 ? integrity[integrity.length - 1]!.value - integrity[integrity.length - 2]!.value : 0;
  const correlationDelta =
    correlation.length >= 2 ? correlation[correlation.length - 1]!.value - correlation[correlation.length - 2]!.value : 0;

  const suspicious = params.observedShare < 0.5 && integrityDelta < 0.01 && correlationDelta < 0.01;
  if (!suspicious) {
    return null;
  }
  return {
    type: "SUSPICIOUS_MATURITY_JUMP",
    severity: "CRITICAL",
    explanationTemplateId: "ANOMALY_SUSPICIOUS_JUMP_V1",
    evidenceRefs: {
      runIds: maturity.map((point) => point.runId).filter((value): value is string => Boolean(value)),
      eventHashes: []
    }
  };
}
