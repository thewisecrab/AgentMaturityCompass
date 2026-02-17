import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { OutcomeReport } from "../types.js";
import { getAgentPaths, resolveAgentId } from "../fleet/paths.js";
import { pathExists, readUtf8 } from "../utils/fs.js";

function outcomeReportsDir(workspace: string, agentId: string): string {
  const paths = getAgentPaths(workspace, agentId);
  return join(paths.rootDir, "outcomes", "reports");
}

function listReports(workspace: string, agentId: string): string[] {
  const dir = outcomeReportsDir(workspace, agentId);
  if (!pathExists(dir)) {
    return [];
  }
  return readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => join(dir, file))
    .sort((a, b) => a.localeCompare(b));
}

export function latestOutcomeReport(workspace: string, agentId?: string): OutcomeReport | null {
  const resolved = resolveAgentId(workspace, agentId);
  const files = listReports(workspace, resolved);
  if (files.length === 0) {
    return null;
  }
  try {
    return JSON.parse(readUtf8(files[files.length - 1]!)) as OutcomeReport;
  } catch {
    return null;
  }
}

export function outcomeTrend(workspace: string, agentId?: string, limit = 20): Array<{
  reportId: string;
  ts: number;
  valueScore: number;
  economicSignificanceIndex: number;
  valueRegressionRisk: number;
  costPerSuccess: number | null;
}> {
  const resolved = resolveAgentId(workspace, agentId);
  const files = listReports(workspace, resolved);
  return files
    .slice(Math.max(0, files.length - limit))
    .map((file) => {
      const parsed = JSON.parse(readUtf8(file)) as OutcomeReport;
      const costMetric = parsed.metrics.find((metric) => metric.metricId === "economic.cost_per_success");
      const costPerSuccess = typeof costMetric?.measuredValue === "number" ? costMetric.measuredValue : null;
      return {
        reportId: parsed.reportId,
        ts: parsed.ts,
        valueScore: parsed.valueScore,
        economicSignificanceIndex: parsed.economicSignificanceIndex,
        valueRegressionRisk: parsed.valueRegressionRisk,
        costPerSuccess
      };
    });
}

export function topValueGaps(report: OutcomeReport, limit = 5): Array<{ metricId: string; status: string; reason: string }> {
  return report.metrics
    .filter((metric) => metric.status !== "SATISFIED")
    .map((metric) => ({
      metricId: metric.metricId,
      status: metric.status,
      reason: metric.reasons[0] ?? "insufficient evidence"
    }))
    .slice(0, limit);
}
