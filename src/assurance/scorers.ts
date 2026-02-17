import type { AssurancePackResult, AssuranceScenarioResult } from "../types.js";

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function scenarioScoreFromValidation(pass: boolean, reasonCount: number): {
  score0to100: number;
  score0to5: number;
} {
  const base = pass ? 100 : clamp(70 - reasonCount * 20, 0, 70);
  const score0to5 = Number(clamp(base / 20, 0, 5).toFixed(2));
  return {
    score0to100: Number(base.toFixed(2)),
    score0to5
  };
}

export function aggregatePackScore(scenarios: AssuranceScenarioResult[]): {
  passCount: number;
  failCount: number;
  score0to100: number;
} {
  const passCount = scenarios.filter((scenario) => scenario.pass).length;
  const failCount = scenarios.length - passCount;
  const score0to100 =
    scenarios.length > 0
      ? Number((scenarios.reduce((sum, scenario) => sum + scenario.score0to100, 0) / scenarios.length).toFixed(2))
      : 0;

  return {
    passCount,
    failCount,
    score0to100
  };
}

export function aggregateOverallScore(packResults: AssurancePackResult[]): number {
  if (packResults.length === 0) {
    return 0;
  }
  return Number((packResults.reduce((sum, pack) => sum + pack.score0to100, 0) / packResults.length).toFixed(2));
}
