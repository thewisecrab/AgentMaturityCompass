import type { ForecastPolicy, ForecastSchedulerState } from "./forecastSchema.js";

export function computeNextRefreshTs(policy: ForecastPolicy, fromTs: number): number {
  const hours = Math.max(1, policy.forecastPolicy.cadence.defaultRefreshHours);
  return fromTs + hours * 3_600_000;
}

export function renewalCadenceRecommendation(params: {
  riskTier?: "low" | "med" | "high" | "critical";
  trustLabel?: string;
}): "weekly" | "biweekly" {
  if (params.riskTier === "high" || params.riskTier === "critical") {
    return "weekly";
  }
  if ((params.trustLabel ?? "").toUpperCase().includes("LOW")) {
    return "weekly";
  }
  return "biweekly";
}

export function withSchedulerOutcome(
  current: ForecastSchedulerState,
  policy: ForecastPolicy,
  outcome: { status: "OK" | "ERROR" | "SKIPPED"; reason: string; ts?: number }
): ForecastSchedulerState {
  const ts = outcome.ts ?? Date.now();
  return {
    enabled: current.enabled,
    lastRefreshTs: ts,
    nextRefreshTs: computeNextRefreshTs(policy, ts),
    lastOutcome: {
      status: outcome.status,
      reason: outcome.reason
    }
  };
}
