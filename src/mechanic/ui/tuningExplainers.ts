export function explainTuningKey(key: string): string {
  switch (key) {
    case "knobs.maxTokensPerRun":
      return "Upper token budget per run. Higher values increase flexibility and cost risk.";
    case "knobs.maxCostPerDayUsd":
      return "Daily budget cap used by governance checks and lease enforcement.";
    case "knobs.maxToolCallsPerRun":
      return "Maximum tool executions per run before enforcement blocks further actions.";
    case "knobs.maxNetworkCallsPerRun":
      return "Network call cap for safety and exfiltration risk control.";
    case "knobs.requireTruthguardForFinalOutputs":
      return "When enabled, final outputs must pass deterministic claim/evidence validation.";
    case "knobs.minObservedEvidenceShareForScoreIncrease":
      return "Minimum OBSERVED evidence share required before scores can increase.";
    case "knobs.forbidSelfReportScoreIncrease":
      return "Prevents self-reported telemetry from inflating measured maturity scores.";
    default:
      return "Signed tuning intent. Changes are applied through approval-gated plan execution.";
  }
}

