import type { DiagnosticReport, LayerName } from "../types.js";
import type { AssurancePackResult } from "../types.js";
import type { AlertsConfig } from "./alerts.js";

function overall(report: DiagnosticReport): number {
  if (report.layerScores.length === 0) {
    return 0;
  }
  return report.layerScores.reduce((sum, row) => sum + row.avgFinalLevel, 0) / report.layerScores.length;
}

function layerMap(report: DiagnosticReport): Map<LayerName, number> {
  return new Map(report.layerScores.map((row) => [row.layerName, row.avgFinalLevel]));
}

export interface DriftEvaluation {
  triggered: boolean;
  ruleId: string | null;
  reasons: string[];
  deltas: {
    overallDrop: number;
    integrityDrop: number;
    correlationDrop: number;
    maxLayerDrop: number;
  };
}

export function evaluateDriftRules(params: {
  config: AlertsConfig;
  previousRun: DiagnosticReport;
  currentRun: DiagnosticReport;
  assuranceByPack: Map<string, AssurancePackResult>;
}): DriftEvaluation {
  const previousOverall = overall(params.previousRun);
  const currentOverall = overall(params.currentRun);
  const overallDrop = Number((previousOverall - currentOverall).toFixed(4));
  const integrityDrop = Number((params.previousRun.integrityIndex - params.currentRun.integrityIndex).toFixed(4));
  const correlationDrop = Number((params.previousRun.correlationRatio - params.currentRun.correlationRatio).toFixed(4));
  const previousLayers = layerMap(params.previousRun);
  const currentLayers = layerMap(params.currentRun);
  let maxLayerDrop = 0;
  for (const [layer, prevValue] of previousLayers.entries()) {
    const currValue = currentLayers.get(layer) ?? 0;
    maxLayerDrop = Math.max(maxLayerDrop, Number((prevValue - currValue).toFixed(4)));
  }

  for (const rule of params.config.alerts.rules) {
    const reasons: string[] = [];
    if (overallDrop >= rule.when.overallDropGte) {
      reasons.push(`overall drop ${overallDrop} >= ${rule.when.overallDropGte}`);
    }
    if (maxLayerDrop >= rule.when.layerDropGte) {
      reasons.push(`layer drop ${maxLayerDrop} >= ${rule.when.layerDropGte}`);
    }
    if (integrityDrop >= rule.when.integrityDropGte) {
      reasons.push(`integrity drop ${integrityDrop} >= ${rule.when.integrityDropGte}`);
    }
    if (params.currentRun.correlationRatio < rule.when.correlationDropBelow) {
      reasons.push(`correlation ${params.currentRun.correlationRatio} < ${rule.when.correlationDropBelow}`);
    }
    for (const [packId, minScore] of Object.entries(rule.when.assuranceDropBelow)) {
      const pack = params.assuranceByPack.get(packId);
      if (!pack || pack.score0to100 < minScore) {
        reasons.push(`assurance ${packId} score ${(pack?.score0to100 ?? 0).toFixed(1)} < ${minScore}`);
      }
    }
    if (reasons.length > 0) {
      return {
        triggered: true,
        ruleId: rule.id,
        reasons,
        deltas: {
          overallDrop,
          integrityDrop,
          correlationDrop,
          maxLayerDrop
        }
      };
    }
  }

  return {
    triggered: false,
    ruleId: null,
    reasons: [],
    deltas: {
      overallDrop,
      integrityDrop,
      correlationDrop,
      maxLayerDrop
    }
  };
}
