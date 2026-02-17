import type { ExperimentReport } from "../types.js";

export function experimentReadyForRelease(report: ExperimentReport): {
  ready: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  if (report.upliftSuccessRate < 0) {
    reasons.push("success rate regressed");
  }
  if (report.upliftValuePoints < 0) {
    reasons.push("value points regressed");
  }
  if (report.candidateCostPerSuccess > report.baselineCostPerSuccess * 1.15) {
    reasons.push("cost per success increased by more than 15%");
  }
  return {
    ready: reasons.length === 0,
    reasons
  };
}

export function summarizeExperiment(report: ExperimentReport): {
  upliftSuccessRate: number;
  upliftValuePoints: number;
  costRatio: number;
  ci95: [number, number];
  effectSize: number;
} {
  const costRatio = report.baselineCostPerSuccess > 0 ? report.candidateCostPerSuccess / report.baselineCostPerSuccess : 1;
  return {
    upliftSuccessRate: report.upliftSuccessRate,
    upliftValuePoints: report.upliftValuePoints,
    costRatio: Number(costRatio.toFixed(6)),
    ci95: report.confidenceInterval95,
    effectSize: report.effectSize
  };
}
