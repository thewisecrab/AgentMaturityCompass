import { afterEach, describe, expect, test } from "vitest";
import {
  resetFPTrackerState,
  configureFPCostModel,
  getFPCostModel,
  submitFPReport,
  resolveFPReport,
  getFPReport,
  listFPReports,
  computeFPCostSummary,
  generateTuningRecommendations,
  generateFPTuningReport,
  renderFPTuningReportMarkdown,
} from "../src/assurance/falsePositiveTracker.js";

afterEach(() => {
  resetFPTrackerState();
});

// ---------------------------------------------------------------------------
// Cost model
// ---------------------------------------------------------------------------
describe("cost model configuration", () => {
  test("default cost model has sensible defaults", () => {
    const model = getFPCostModel();
    expect(model.devMinutesPerFP).toBe(15);
    expect(model.costPerDevMinute).toBe(2.5);
    expect(model.frictionMultiplier).toBe(1.0);
    expect(model.throughputLossPerBlock).toBe(5);
  });

  test("configure cost model partially", () => {
    configureFPCostModel({ devMinutesPerFP: 30 });
    const model = getFPCostModel();
    expect(model.devMinutesPerFP).toBe(30);
    expect(model.costPerDevMinute).toBe(2.5); // unchanged
  });

  test("configure cost model fully", () => {
    configureFPCostModel({
      devMinutesPerFP: 20,
      costPerDevMinute: 5.0,
      frictionMultiplier: 1.5,
      throughputLossPerBlock: 10,
    });
    const model = getFPCostModel();
    expect(model.devMinutesPerFP).toBe(20);
    expect(model.costPerDevMinute).toBe(5.0);
    expect(model.frictionMultiplier).toBe(1.5);
    expect(model.throughputLossPerBlock).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// FP report CRUD
// ---------------------------------------------------------------------------
describe("FP report management", () => {
  test("submit FP report", () => {
    const report = submitFPReport({
      scenarioId: "chain-read-then-exfil",
      packId: "chainEscalation",
      assuranceRunId: "run-001",
      response: "Some response",
      justification: "The response was safe but flagged incorrectly",
      reportedBy: "developer@example.com",
    });
    expect(report.reportId).toMatch(/^fp_/);
    expect(report.status).toBe("open");
    expect(report.scenarioId).toBe("chain-read-then-exfil");
  });

  test("get FP report by ID", () => {
    const report = submitFPReport({
      scenarioId: "s1",
      packId: "p1",
      assuranceRunId: "run-1",
      response: "r",
      justification: "j",
      reportedBy: "dev",
    });
    const found = getFPReport(report.reportId);
    expect(found).not.toBeNull();
    expect(found!.reportId).toBe(report.reportId);
  });

  test("returns null for unknown report", () => {
    expect(getFPReport("fp_nonexistent")).toBeNull();
  });

  test("resolve FP report as confirmed", () => {
    const report = submitFPReport({
      scenarioId: "s1",
      packId: "p1",
      assuranceRunId: "run-1",
      response: "r",
      justification: "j",
      reportedBy: "dev",
    });
    const resolved = resolveFPReport(report.reportId, {
      status: "confirmed",
      reason: "Validator regex too strict for this case",
    });
    expect(resolved).not.toBeNull();
    expect(resolved!.status).toBe("confirmed");
    expect(resolved!.resolution).toContain("too strict");
  });

  test("resolve FP report as rejected", () => {
    const report = submitFPReport({
      scenarioId: "s1",
      packId: "p1",
      assuranceRunId: "run-1",
      response: "r",
      justification: "j",
      reportedBy: "dev",
    });
    const resolved = resolveFPReport(report.reportId, {
      status: "rejected",
      reason: "The flag was correct — response was actually unsafe",
    });
    expect(resolved!.status).toBe("rejected");
  });

  test("cannot resolve already-resolved report", () => {
    const report = submitFPReport({
      scenarioId: "s1",
      packId: "p1",
      assuranceRunId: "run-1",
      response: "r",
      justification: "j",
      reportedBy: "dev",
    });
    resolveFPReport(report.reportId, { status: "confirmed", reason: "ok" });
    const second = resolveFPReport(report.reportId, { status: "rejected", reason: "changed mind" });
    expect(second).toBeNull();
  });

  test("list FP reports with filters", () => {
    submitFPReport({ scenarioId: "s1", packId: "p1", assuranceRunId: "r1", response: "r", justification: "j", reportedBy: "dev" });
    submitFPReport({ scenarioId: "s2", packId: "p1", assuranceRunId: "r1", response: "r", justification: "j", reportedBy: "dev" });
    submitFPReport({ scenarioId: "s1", packId: "p2", assuranceRunId: "r1", response: "r", justification: "j", reportedBy: "dev" });

    expect(listFPReports().length).toBe(3);
    expect(listFPReports({ packId: "p1" }).length).toBe(2);
    expect(listFPReports({ scenarioId: "s1" }).length).toBe(2);
    expect(listFPReports({ packId: "p2", scenarioId: "s1" }).length).toBe(1);
    expect(listFPReports({ status: "open" }).length).toBe(3);
    expect(listFPReports({ status: "confirmed" }).length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Cost computation
// ---------------------------------------------------------------------------
describe("FP cost computation", () => {
  test("empty state returns empty summaries", () => {
    expect(computeFPCostSummary().length).toBe(0);
  });

  test("computes cost for confirmed FPs", () => {
    const r1 = submitFPReport({ scenarioId: "s1", packId: "p1", assuranceRunId: "r1", response: "r", justification: "j", reportedBy: "dev" });
    const r2 = submitFPReport({ scenarioId: "s2", packId: "p1", assuranceRunId: "r1", response: "r", justification: "j", reportedBy: "dev" });
    submitFPReport({ scenarioId: "s1", packId: "p1", assuranceRunId: "r1", response: "r", justification: "j", reportedBy: "dev" });

    resolveFPReport(r1.reportId, { status: "confirmed", reason: "ok" });
    resolveFPReport(r2.reportId, { status: "rejected", reason: "no" });

    const summaries = computeFPCostSummary();
    expect(summaries.length).toBe(1);
    const summary = summaries[0]!;
    expect(summary.packId).toBe("p1");
    expect(summary.totalFPReports).toBe(3);
    expect(summary.confirmedFPs).toBe(1);
    expect(summary.rejectedFPs).toBe(1);
    expect(summary.openFPs).toBe(1);
    // Default cost: 15 min * $2.50 * 1.0 = $37.50 per FP
    expect(summary.totalCostUsd).toBe(37.5);
    expect(summary.totalDevMinutes).toBe(15);
  });

  test("computes cost with custom cost model", () => {
    configureFPCostModel({ devMinutesPerFP: 10, costPerDevMinute: 5.0, frictionMultiplier: 2.0 });
    const r = submitFPReport({ scenarioId: "s1", packId: "p1", assuranceRunId: "r1", response: "r", justification: "j", reportedBy: "dev" });
    resolveFPReport(r.reportId, { status: "confirmed", reason: "ok" });

    const summaries = computeFPCostSummary();
    // 10 * 5.0 * 2.0 = $100
    expect(summaries[0]!.totalCostUsd).toBe(100);
  });

  test("filter by pack", () => {
    submitFPReport({ scenarioId: "s1", packId: "p1", assuranceRunId: "r1", response: "r", justification: "j", reportedBy: "dev" });
    submitFPReport({ scenarioId: "s1", packId: "p2", assuranceRunId: "r1", response: "r", justification: "j", reportedBy: "dev" });

    expect(computeFPCostSummary("p1").length).toBe(1);
    expect(computeFPCostSummary("p2").length).toBe(1);
    expect(computeFPCostSummary("p3").length).toBe(0);
  });

  test("FP rate computed correctly", () => {
    // 3 confirmed + 1 rejected = 4 resolved, FP rate = 3/4 = 0.75
    for (let i = 0; i < 3; i++) {
      const r = submitFPReport({ scenarioId: "s1", packId: "p1", assuranceRunId: "r1", response: "r", justification: "j", reportedBy: "dev" });
      resolveFPReport(r.reportId, { status: "confirmed", reason: "ok" });
    }
    const r4 = submitFPReport({ scenarioId: "s1", packId: "p1", assuranceRunId: "r1", response: "r", justification: "j", reportedBy: "dev" });
    resolveFPReport(r4.reportId, { status: "rejected", reason: "no" });

    const summary = computeFPCostSummary()[0]!;
    expect(summary.fpRate).toBe(0.75);
  });
});

// ---------------------------------------------------------------------------
// Tuning recommendations
// ---------------------------------------------------------------------------
describe("tuning recommendations", () => {
  test("empty state returns no recommendations", () => {
    expect(generateTuningRecommendations().length).toBe(0);
  });

  test("recommends relax for high FP rate", () => {
    // 4 confirmed, 1 rejected = 80% FP rate
    for (let i = 0; i < 4; i++) {
      const r = submitFPReport({ scenarioId: "s1", packId: "p1", assuranceRunId: "r1", response: "r", justification: "j", reportedBy: "dev" });
      resolveFPReport(r.reportId, { status: "confirmed", reason: "ok" });
    }
    const r5 = submitFPReport({ scenarioId: "s1", packId: "p1", assuranceRunId: "r1", response: "r", justification: "j", reportedBy: "dev" });
    resolveFPReport(r5.reportId, { status: "rejected", reason: "no" });

    const recs = generateTuningRecommendations({ minReportsForRecommendation: 3 });
    expect(recs.length).toBe(1);
    expect(recs[0]!.recommendation).toBe("relax");
    expect(recs[0]!.fpRate).toBe(0.8);
    expect(recs[0]!.estimatedCostSaved).toBeGreaterThan(0);
  });

  test("recommends tighten for very low FP rate", () => {
    // 0 confirmed, 5 rejected = 0% FP rate
    for (let i = 0; i < 5; i++) {
      const r = submitFPReport({ scenarioId: "s1", packId: "p1", assuranceRunId: "r1", response: "r", justification: "j", reportedBy: "dev" });
      resolveFPReport(r.reportId, { status: "rejected", reason: "no" });
    }

    const recs = generateTuningRecommendations({ minReportsForRecommendation: 3 });
    expect(recs.length).toBe(1);
    expect(recs[0]!.recommendation).toBe("tighten");
    expect(recs[0]!.fpRate).toBe(0);
  });

  test("recommends keep for moderate FP rate", () => {
    // 1 confirmed, 3 rejected = 25% FP rate (below 30% threshold)
    const r1 = submitFPReport({ scenarioId: "s1", packId: "p1", assuranceRunId: "r1", response: "r", justification: "j", reportedBy: "dev" });
    resolveFPReport(r1.reportId, { status: "confirmed", reason: "ok" });
    for (let i = 0; i < 3; i++) {
      const r = submitFPReport({ scenarioId: "s1", packId: "p1", assuranceRunId: "r1", response: "r", justification: "j", reportedBy: "dev" });
      resolveFPReport(r.reportId, { status: "rejected", reason: "no" });
    }

    const recs = generateTuningRecommendations({ minReportsForRecommendation: 3 });
    expect(recs.length).toBe(1);
    expect(recs[0]!.recommendation).toBe("keep");
  });

  test("respects minimum report threshold", () => {
    // Only 2 resolved reports — below default minimum of 3
    const r1 = submitFPReport({ scenarioId: "s1", packId: "p1", assuranceRunId: "r1", response: "r", justification: "j", reportedBy: "dev" });
    resolveFPReport(r1.reportId, { status: "confirmed", reason: "ok" });
    const r2 = submitFPReport({ scenarioId: "s1", packId: "p1", assuranceRunId: "r1", response: "r", justification: "j", reportedBy: "dev" });
    resolveFPReport(r2.reportId, { status: "confirmed", reason: "ok" });

    const recs = generateTuningRecommendations(); // default min 3
    expect(recs.length).toBe(0);
  });

  test("sorts relax before tighten before keep", () => {
    // Scenario 1: high FP rate (relax)
    for (let i = 0; i < 4; i++) {
      const r = submitFPReport({ scenarioId: "s1", packId: "p1", assuranceRunId: "r1", response: "r", justification: "j", reportedBy: "dev" });
      resolveFPReport(r.reportId, { status: "confirmed", reason: "ok" });
    }
    const rr = submitFPReport({ scenarioId: "s1", packId: "p1", assuranceRunId: "r1", response: "r", justification: "j", reportedBy: "dev" });
    resolveFPReport(rr.reportId, { status: "rejected", reason: "no" });

    // Scenario 2: zero FP rate (tighten)
    for (let i = 0; i < 4; i++) {
      const r = submitFPReport({ scenarioId: "s2", packId: "p1", assuranceRunId: "r1", response: "r", justification: "j", reportedBy: "dev" });
      resolveFPReport(r.reportId, { status: "rejected", reason: "no" });
    }

    const recs = generateTuningRecommendations({ minReportsForRecommendation: 3 });
    expect(recs.length).toBe(2);
    expect(recs[0]!.recommendation).toBe("relax");
    expect(recs[1]!.recommendation).toBe("tighten");
  });
});

// ---------------------------------------------------------------------------
// FP Tuning Report
// ---------------------------------------------------------------------------
describe("FP tuning report", () => {
  test("generates report with no data", () => {
    const report = generateFPTuningReport();
    expect(report.reportId).toMatch(/^fpt_/);
    expect(report.totalFPReports).toBe(0);
    expect(report.totalConfirmed).toBe(0);
    expect(report.totalCostUsd).toBe(0);
    expect(report.packSummaries.length).toBe(0);
    expect(report.recommendations.length).toBe(0);
    expect(report.reportHash.length).toBe(64);
  });

  test("generates report with data", () => {
    for (let i = 0; i < 5; i++) {
      const r = submitFPReport({ scenarioId: "s1", packId: "p1", assuranceRunId: "r1", response: "r", justification: "j", reportedBy: "dev" });
      resolveFPReport(r.reportId, { status: "confirmed", reason: "ok" });
    }

    const report = generateFPTuningReport();
    expect(report.totalFPReports).toBe(5);
    expect(report.totalConfirmed).toBe(5);
    expect(report.totalCostUsd).toBeGreaterThan(0);
    expect(report.packSummaries.length).toBe(1);
  });

  test("report has valid hash", () => {
    const report = generateFPTuningReport();
    expect(report.reportHash.length).toBe(64);
    expect(report.reportHash).toMatch(/^[0-9a-f]+$/);
  });
});

// ---------------------------------------------------------------------------
// Markdown rendering
// ---------------------------------------------------------------------------
describe("FP tuning report markdown", () => {
  test("renders empty report", () => {
    const report = generateFPTuningReport();
    const md = renderFPTuningReportMarkdown(report);
    expect(md).toContain("# False Positive Tuning Report");
    expect(md).toContain("No false positive reports filed");
    expect(md).toContain("No tuning recommendations");
  });

  test("renders report with data and recommendations", () => {
    for (let i = 0; i < 5; i++) {
      const r = submitFPReport({ scenarioId: "s1", packId: "p1", assuranceRunId: "r1", response: "r", justification: "j", reportedBy: "dev" });
      resolveFPReport(r.reportId, { status: "confirmed", reason: "ok" });
    }

    const report = generateFPTuningReport();
    const md = renderFPTuningReportMarkdown(report);
    expect(md).toContain("# False Positive Tuning Report");
    expect(md).toContain("## Pack Cost Summaries");
    expect(md).toContain("p1");
    expect(md).toContain("Report Hash");
  });
});

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------
describe("reset", () => {
  test("clears all FP tracker state", () => {
    submitFPReport({ scenarioId: "s1", packId: "p1", assuranceRunId: "r1", response: "r", justification: "j", reportedBy: "dev" });
    configureFPCostModel({ devMinutesPerFP: 99 });

    resetFPTrackerState();
    expect(listFPReports().length).toBe(0);
    expect(getFPCostModel().devMinutesPerFP).toBe(15); // back to default
  });
});
