import { afterEach, describe, expect, test } from "vitest";
import {
  defaultOverheadProfile,
  setOverheadProfile,
  getOverheadProfile,
  recordOverhead,
  computeFeatureSummaries,
  computeAgentCostAttribution,
  getOverheadAnomalies,
  checkBudgetViolations,
  generateOverheadReport,
  renderOverheadReportMarkdown,
  resetOverheadAccounting,
} from "../src/ops/overheadAccounting.js";

afterEach(() => {
  resetOverheadAccounting();
});

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------
describe("overhead profiles", () => {
  test("defaultOverheadProfile returns valid profiles for all modes", () => {
    for (const mode of ["STRICT", "BALANCED", "LEAN"] as const) {
      const profile = defaultOverheadProfile(mode);
      expect(profile.mode).toBe(mode);
      expect(profile.budgets.length).toBeGreaterThan(0);
    }
  });

  test("STRICT has full sampling and no disabled features", () => {
    const p = defaultOverheadProfile("STRICT");
    expect(p.evidenceSamplingRate).toBe(1.0);
    expect(p.disabledFeatures.length).toBe(0);
  });

  test("LEAN has reduced sampling and disabled features", () => {
    const p = defaultOverheadProfile("LEAN");
    expect(p.evidenceSamplingRate).toBeLessThan(0.5);
    expect(p.disabledFeatures.length).toBeGreaterThan(0);
  });

  test("setOverheadProfile changes active profile", () => {
    setOverheadProfile("LEAN");
    expect(getOverheadProfile().mode).toBe("LEAN");
    setOverheadProfile("STRICT");
    expect(getOverheadProfile().mode).toBe("STRICT");
  });
});

// ---------------------------------------------------------------------------
// Recording measurements
// ---------------------------------------------------------------------------
describe("recording measurements", () => {
  test("records and retrieves measurements", () => {
    recordOverhead({ feature: "GATEWAY_PROXY", latencyMs: 25, costMicroUsd: 5 });
    recordOverhead({ feature: "POLICY_EVALUATION", latencyMs: 10, costMicroUsd: 2 });

    const summaries = computeFeatureSummaries();
    expect(summaries.length).toBe(2);
  });

  test("records with agent attribution", () => {
    recordOverhead({ feature: "GATEWAY_PROXY", latencyMs: 25, agentId: "agent-1", costMicroUsd: 10 });
    recordOverhead({ feature: "GATEWAY_PROXY", latencyMs: 30, agentId: "agent-2", costMicroUsd: 15 });

    const attributions = computeAgentCostAttribution();
    expect(attributions.length).toBe(2);
  });

  test("detects latency anomaly", () => {
    // GATEWAY_PROXY budget is 50ms, anomaly triggers at 3x = 150ms
    recordOverhead({ feature: "GATEWAY_PROXY", latencyMs: 200 });

    const anomalies = getOverheadAnomalies();
    expect(anomalies.length).toBe(1);
    expect(anomalies[0]!.metric).toBe("LATENCY");
    expect(anomalies[0]!.feature).toBe("GATEWAY_PROXY");
  });

  test("no anomaly for normal latency", () => {
    recordOverhead({ feature: "GATEWAY_PROXY", latencyMs: 20 });
    expect(getOverheadAnomalies().length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Feature summaries
// ---------------------------------------------------------------------------
describe("feature summaries", () => {
  test("computes correct aggregates", () => {
    for (let i = 0; i < 10; i++) {
      recordOverhead({ feature: "GATEWAY_PROXY", latencyMs: 10 + i * 5, tokenCount: 0, costMicroUsd: 5 });
    }

    const summaries = computeFeatureSummaries();
    expect(summaries.length).toBe(1);
    const s = summaries[0]!;
    expect(s.feature).toBe("GATEWAY_PROXY");
    expect(s.measurementCount).toBe(10);
    expect(s.avgLatencyMs).toBeGreaterThan(0);
    expect(s.p95LatencyMs).toBeGreaterThan(s.avgLatencyMs);
    expect(s.totalCostMicroUsd).toBe(50);
  });

  test("filters by timestamp", () => {
    recordOverhead({ feature: "GATEWAY_PROXY", latencyMs: 10 });
    const futureTs = Date.now() + 10000;
    expect(computeFeatureSummaries(futureTs).length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Agent cost attribution
// ---------------------------------------------------------------------------
describe("agent cost attribution", () => {
  test("groups costs by agent with feature breakdown", () => {
    recordOverhead({ feature: "GATEWAY_PROXY", latencyMs: 10, costMicroUsd: 5, agentId: "a1" });
    recordOverhead({ feature: "POLICY_EVALUATION", latencyMs: 5, costMicroUsd: 3, agentId: "a1" });
    recordOverhead({ feature: "GATEWAY_PROXY", latencyMs: 15, costMicroUsd: 8, agentId: "a2" });

    const attributions = computeAgentCostAttribution();
    expect(attributions.length).toBe(2);

    const a1 = attributions.find((a) => a.agentId === "a1")!;
    expect(a1.totalCostMicroUsd).toBe(8);
    expect(a1.featureBreakdown.length).toBe(2);
  });

  test("excludes measurements without agentId", () => {
    recordOverhead({ feature: "GATEWAY_PROXY", latencyMs: 10, costMicroUsd: 5 });
    recordOverhead({ feature: "GATEWAY_PROXY", latencyMs: 10, costMicroUsd: 5, agentId: "a1" });

    const attributions = computeAgentCostAttribution();
    expect(attributions.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Budget violations
// ---------------------------------------------------------------------------
describe("budget violations", () => {
  test("detects P95 latency violation", () => {
    // GATEWAY_PROXY budget: maxLatencyMs = 50
    for (let i = 0; i < 20; i++) {
      recordOverhead({ feature: "GATEWAY_PROXY", latencyMs: 60 }); // all exceed budget
    }

    const violations = checkBudgetViolations();
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0]!.metric).toBe("P95_LATENCY");
  });

  test("no violations when within budget", () => {
    for (let i = 0; i < 20; i++) {
      recordOverhead({ feature: "GATEWAY_PROXY", latencyMs: 10 });
    }
    expect(checkBudgetViolations().length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
describe("overhead report", () => {
  test("generates report with measurements", () => {
    recordOverhead({ feature: "GATEWAY_PROXY", latencyMs: 25, costMicroUsd: 5, agentId: "a1" });
    recordOverhead({ feature: "POLICY_EVALUATION", latencyMs: 10, costMicroUsd: 2, agentId: "a1" });

    const report = generateOverheadReport();
    expect(report.reportId).toMatch(/^ohr_/);
    expect(report.totalMeasurements).toBe(2);
    expect(report.totalCostMicroUsd).toBe(7);
    expect(report.featureSummaries.length).toBe(2);
    expect(report.agentAttributions.length).toBe(1);
  });

  test("generates empty report gracefully", () => {
    const report = generateOverheadReport();
    expect(report.totalMeasurements).toBe(0);
    expect(report.featureSummaries.length).toBe(0);
  });

  test("includes budget violations and anomalies in report", () => {
    for (let i = 0; i < 20; i++) {
      recordOverhead({ feature: "GATEWAY_PROXY", latencyMs: 200, costMicroUsd: 100 });
    }
    const report = generateOverheadReport();
    expect(report.budgetViolations.length).toBeGreaterThan(0);
    expect(report.anomalies.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Markdown rendering
// ---------------------------------------------------------------------------
describe("markdown rendering", () => {
  test("renders report with all sections", () => {
    recordOverhead({ feature: "GATEWAY_PROXY", latencyMs: 25, costMicroUsd: 5, agentId: "a1" });
    const report = generateOverheadReport();
    const md = renderOverheadReportMarkdown(report);
    expect(md).toContain("# Overhead Accounting Report");
    expect(md).toContain("## Summary");
    expect(md).toContain("## Per-Feature Overhead");
    expect(md).toContain("## Cost by Agent");
  });

  test("renders empty report", () => {
    const report = generateOverheadReport();
    const md = renderOverheadReportMarkdown(report);
    expect(md).toContain("# Overhead Accounting Report");
    expect(md).toContain("Total measurements | 0");
  });
});

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------
describe("reset", () => {
  test("clears all state", () => {
    setOverheadProfile("LEAN");
    recordOverhead({ feature: "GATEWAY_PROXY", latencyMs: 200 });
    resetOverheadAccounting();
    expect(getOverheadProfile().mode).toBe("BALANCED");
    expect(computeFeatureSummaries().length).toBe(0);
    expect(getOverheadAnomalies().length).toBe(0);
  });
});
