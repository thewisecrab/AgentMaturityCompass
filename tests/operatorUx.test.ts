import { describe, expect, test } from "vitest";
import {
  computeWhyCaps,
  computeConfidenceHeatmap,
  computeActionQueue,
  computeNarrativeDiff,
  computeIncidentTimeline,
  computeTrustSummary,
  getRolePreset,
  listRolePresets,
  generateOperatorDashboard,
  renderOperatorDashboardMarkdown,
} from "../src/ops/operatorUx.js";
import type { DiagnosticReport, QuestionScore } from "../src/types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeScore(overrides: Partial<QuestionScore> & { questionId: string }): QuestionScore {
  return {
    claimedLevel: 3,
    supportedMaxLevel: 3,
    finalLevel: 3,
    confidence: 0.7,
    evidenceEventIds: ["e1"],
    flags: [],
    narrative: "Test",
    ...overrides,
  };
}

function makeReport(overrides?: Partial<DiagnosticReport>): DiagnosticReport {
  return {
    agentId: "test-agent",
    runId: "run-1",
    ts: Date.now(),
    windowStartTs: Date.now() - 86400000,
    windowEndTs: Date.now(),
    status: "VALID",
    verificationPassed: true,
    trustBoundaryViolated: false,
    trustBoundaryMessage: null,
    integrityIndex: 0.7,
    trustLabel: "HIGH TRUST",
    targetProfileId: null,
    layerScores: [
      { layerName: "Strategic Agent Operations", avgFinalLevel: 3.0, confidenceWeightedFinalLevel: 2.8 },
      { layerName: "Leadership & Autonomy", avgFinalLevel: 2.5, confidenceWeightedFinalLevel: 2.3 },
    ],
    questionScores: [
      makeScore({ questionId: "AMC-1.1", finalLevel: 3, confidence: 0.8, flags: [] }),
      makeScore({ questionId: "AMC-1.5", finalLevel: 2, confidence: 0.4, flags: ["FLAG_UNSUPPORTED_CLAIM", "FLAG_MISSING_LLM_EVIDENCE"] }),
      makeScore({ questionId: "AMC-2.3", finalLevel: 3, confidence: 0.6, flags: ["FLAG_CORRELATION_LOW"] }),
      makeScore({ questionId: "AMC-4.1", finalLevel: 1, confidence: 0.2, flags: ["FLAG_CONFIG_UNTRUSTED", "FLAG_LEDGER_INVALID"] }),
    ],
    inflationAttempts: [{ questionId: "AMC-1.5", claimed: 4, supported: 2 }],
    unsupportedClaimCount: 1,
    contradictionCount: 0,
    correlationRatio: 0.75,
    invalidReceiptsCount: 0,
    correlationWarnings: [],
    evidenceCoverage: 0.6,
    evidenceTrustCoverage: { observed: 0.5, attested: 0.3, selfReported: 0.2 },
    targetDiff: [{ questionId: "AMC-1.5", current: 2, target: 4, gap: 2 }],
    prioritizedUpgradeActions: ["AMC-1.5: Raise from 2 to 4"],
    evidenceToCollectNext: ["AMC-1.5: add LLM evidence"],
    runSealSig: "sig",
    reportJsonSha256: "hash",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Why Capped
// ---------------------------------------------------------------------------
describe("computeWhyCaps", () => {
  test("returns a view for each question score", () => {
    const report = makeReport();
    const views = computeWhyCaps(report);
    expect(views.length).toBe(report.questionScores.length);
  });

  test("includes cap reasons for flagged questions", () => {
    const report = makeReport();
    const views = computeWhyCaps(report);
    const flagged = views.find((v) => v.questionId === "AMC-1.5")!;
    expect(flagged.capReasons.length).toBe(2);
    expect(flagged.capReasons.map((r) => r.flag)).toContain("FLAG_UNSUPPORTED_CLAIM");
    expect(flagged.capReasons.map((r) => r.flag)).toContain("FLAG_MISSING_LLM_EVIDENCE");
  });

  test("provides unlock actions for each cap reason", () => {
    const report = makeReport();
    const views = computeWhyCaps(report);
    const flagged = views.find((v) => v.questionId === "AMC-1.5")!;
    for (const cr of flagged.capReasons) {
      expect(cr.unlockAction.length).toBeGreaterThan(0);
      expect(["low", "medium", "high"]).toContain(cr.effortLevel);
      expect(cr.riskReduction).toBeGreaterThan(0);
    }
  });

  test("no cap reasons for clean questions", () => {
    const report = makeReport();
    const views = computeWhyCaps(report);
    const clean = views.find((v) => v.questionId === "AMC-1.1")!;
    expect(clean.capReasons.length).toBe(0);
  });

  test("computes gap when target mapping provided", () => {
    const report = makeReport();
    const views = computeWhyCaps(report, { "AMC-1.1": 5, "AMC-1.5": 4 });
    const q1 = views.find((v) => v.questionId === "AMC-1.1")!;
    expect(q1.gap).toBe(2); // target 5, current 3
    const q5 = views.find((v) => v.questionId === "AMC-1.5")!;
    expect(q5.gap).toBe(2); // target 4, current 2
  });

  test("sorts by gap descending", () => {
    const report = makeReport();
    const views = computeWhyCaps(report, { "AMC-1.1": 5, "AMC-1.5": 4, "AMC-2.3": 3, "AMC-4.1": 5 });
    // AMC-4.1 has gap 4 (target 5, current 1), should be first
    expect(views[0]!.questionId).toBe("AMC-4.1");
  });

  test("includes next level requirements", () => {
    const report = makeReport();
    const views = computeWhyCaps(report);
    const flagged = views.find((v) => v.questionId === "AMC-4.1")!;
    expect(flagged.nextLevelRequirements.length).toBeGreaterThan(0);
  });

  test("handles unknown flags gracefully", () => {
    const report = makeReport({
      questionScores: [
        makeScore({ questionId: "AMC-1.1", flags: ["FLAG_CUSTOM_UNKNOWN"] }),
      ],
    });
    const views = computeWhyCaps(report);
    expect(views[0]!.capReasons.length).toBe(1);
    expect(views[0]!.capReasons[0]!.flag).toBe("FLAG_CUSTOM_UNKNOWN");
  });
});

// ---------------------------------------------------------------------------
// Confidence Heatmap
// ---------------------------------------------------------------------------
describe("computeConfidenceHeatmap", () => {
  test("produces cells for all questions", () => {
    const report = makeReport();
    const heatmap = computeConfidenceHeatmap(report);
    expect(heatmap.cells.length).toBe(report.questionScores.length);
  });

  test("assigns correct heat colors", () => {
    const report = makeReport();
    const heatmap = computeConfidenceHeatmap(report);
    const green = heatmap.cells.find((c) => c.questionId === "AMC-1.1")!;
    expect(green.heatColor).toBe("green"); // confidence 0.8
    const red = heatmap.cells.find((c) => c.questionId === "AMC-4.1")!;
    expect(red.heatColor).toBe("red"); // confidence 0.2
  });

  test("computes correct averages", () => {
    const report = makeReport();
    const heatmap = computeConfidenceHeatmap(report);
    expect(heatmap.avgConfidence).toBeGreaterThan(0);
    expect(heatmap.minConfidence).toBeLessThanOrEqual(heatmap.avgConfidence);
    expect(heatmap.maxConfidence).toBeGreaterThanOrEqual(heatmap.avgConfidence);
  });

  test("counts low confidence questions", () => {
    const report = makeReport();
    const heatmap = computeConfidenceHeatmap(report);
    // AMC-1.5 (0.4) and AMC-4.1 (0.2) are below 0.5
    expect(heatmap.lowConfidenceCount).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Action Queue
// ---------------------------------------------------------------------------
describe("computeActionQueue", () => {
  test("generates actions from cap reasons", () => {
    const report = makeReport();
    const whyCaps = computeWhyCaps(report);
    const queue = computeActionQueue(whyCaps);
    expect(queue.items.length).toBeGreaterThan(0);
  });

  test("sorts by priority score descending", () => {
    const report = makeReport();
    const whyCaps = computeWhyCaps(report);
    const queue = computeActionQueue(whyCaps);
    for (let i = 1; i < queue.items.length; i++) {
      expect(queue.items[i]!.priorityScore).toBeLessThanOrEqual(queue.items[i - 1]!.priorityScore);
    }
  });

  test("deduplicates identical actions", () => {
    const report = makeReport({
      questionScores: [
        makeScore({ questionId: "AMC-1.1", flags: ["FLAG_CONFIG_UNTRUSTED"] }),
        makeScore({ questionId: "AMC-1.5", flags: ["FLAG_CONFIG_UNTRUSTED"] }),
      ],
    });
    const whyCaps = computeWhyCaps(report);
    const queue = computeActionQueue(whyCaps);
    // Same flag = same action text, should be deduplicated
    const configActions = queue.items.filter((i) => i.action.includes("Sign all configuration"));
    expect(configActions.length).toBe(1);
  });

  test("assigns sequential ranks", () => {
    const report = makeReport();
    const whyCaps = computeWhyCaps(report);
    const queue = computeActionQueue(whyCaps);
    for (let i = 0; i < queue.items.length; i++) {
      expect(queue.items[i]!.rank).toBe(i + 1);
    }
  });

  test("empty queue for clean report", () => {
    const report = makeReport({
      questionScores: [makeScore({ questionId: "AMC-1.1", flags: [] })],
    });
    const whyCaps = computeWhyCaps(report);
    const queue = computeActionQueue(whyCaps);
    expect(queue.items.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Narrative Diff
// ---------------------------------------------------------------------------
describe("computeNarrativeDiff", () => {
  test("first run shows no previous", () => {
    const report = makeReport();
    const diff = computeNarrativeDiff(report, null);
    expect(diff.previousRunId).toBeNull();
    expect(diff.summary).toContain("First assessment");
    expect(diff.entries.length).toBe(0);
  });

  test("detects level improvements", () => {
    const prev = makeReport({ runId: "run-0", questionScores: [makeScore({ questionId: "AMC-1.1", finalLevel: 2 })] });
    const curr = makeReport({ runId: "run-1", questionScores: [makeScore({ questionId: "AMC-1.1", finalLevel: 3 })] });
    const diff = computeNarrativeDiff(curr, prev);
    expect(diff.improvementCount).toBeGreaterThan(0);
    const entry = diff.entries.find((e) => e.questionId === "AMC-1.1" && e.field === "finalLevel")!;
    expect(entry.direction).toBe("improved");
    expect(entry.oldValue).toBe(2);
    expect(entry.newValue).toBe(3);
  });

  test("detects level degradations", () => {
    const prev = makeReport({ runId: "run-0", questionScores: [makeScore({ questionId: "AMC-1.1", finalLevel: 4 })] });
    const curr = makeReport({ runId: "run-1", questionScores: [makeScore({ questionId: "AMC-1.1", finalLevel: 2 })] });
    const diff = computeNarrativeDiff(curr, prev);
    expect(diff.degradationCount).toBeGreaterThan(0);
  });

  test("detects confidence changes", () => {
    const prev = makeReport({ runId: "run-0", questionScores: [makeScore({ questionId: "AMC-1.1", confidence: 0.3 })] });
    const curr = makeReport({ runId: "run-1", questionScores: [makeScore({ questionId: "AMC-1.1", confidence: 0.9 })] });
    const diff = computeNarrativeDiff(curr, prev);
    const entry = diff.entries.find((e) => e.field === "confidence")!;
    expect(entry).toBeDefined();
    expect(entry.direction).toBe("improved");
  });

  test("detects flag additions as degradations", () => {
    const prev = makeReport({ runId: "run-0", questionScores: [makeScore({ questionId: "AMC-1.1", flags: [] })] });
    const curr = makeReport({ runId: "run-1", questionScores: [makeScore({ questionId: "AMC-1.1", flags: ["FLAG_CONFIG_UNTRUSTED"] })] });
    const diff = computeNarrativeDiff(curr, prev);
    const entry = diff.entries.find((e) => e.field === "flag_added")!;
    expect(entry).toBeDefined();
    expect(entry.direction).toBe("degraded");
  });

  test("detects flag removals as improvements", () => {
    const prev = makeReport({ runId: "run-0", questionScores: [makeScore({ questionId: "AMC-1.1", flags: ["FLAG_CONFIG_UNTRUSTED"] })] });
    const curr = makeReport({ runId: "run-1", questionScores: [makeScore({ questionId: "AMC-1.1", flags: [] })] });
    const diff = computeNarrativeDiff(curr, prev);
    const entry = diff.entries.find((e) => e.field === "flag_removed")!;
    expect(entry).toBeDefined();
    expect(entry.direction).toBe("improved");
  });

  test("detects global metric changes", () => {
    const prev = makeReport({ runId: "run-0", integrityIndex: 0.5 });
    const curr = makeReport({ runId: "run-1", integrityIndex: 0.8 });
    const diff = computeNarrativeDiff(curr, prev);
    const entry = diff.entries.find((e) => e.field === "integrityIndex")!;
    expect(entry).toBeDefined();
    expect(entry.direction).toBe("improved");
  });
});

// ---------------------------------------------------------------------------
// Incident Timeline
// ---------------------------------------------------------------------------
describe("computeIncidentTimeline", () => {
  test("generates incidents from flags", () => {
    const report = makeReport();
    const timeline = computeIncidentTimeline(report);
    expect(timeline.entries.length).toBeGreaterThan(0);
  });

  test("includes inflation attempts", () => {
    const report = makeReport();
    const timeline = computeIncidentTimeline(report);
    const inflationEntry = timeline.entries.find((e) => e.eventType === "INFLATION_ATTEMPT");
    expect(inflationEntry).toBeDefined();
    expect(inflationEntry!.severity).toBe("high");
  });

  test("sorts by severity then timestamp", () => {
    const report = makeReport();
    const timeline = computeIncidentTimeline(report);
    // Critical should come first
    if (timeline.criticalCount > 0) {
      expect(timeline.entries[0]!.severity).toBe("critical");
    }
  });

  test("correctly classifies critical flags", () => {
    const report = makeReport();
    const timeline = computeIncidentTimeline(report);
    const ledgerInvalid = timeline.entries.find((e) => e.eventType === "FLAG_LEDGER_INVALID");
    expect(ledgerInvalid).toBeDefined();
    expect(ledgerInvalid!.severity).toBe("critical");
  });

  test("counts severity levels", () => {
    const report = makeReport();
    const timeline = computeIncidentTimeline(report);
    expect(timeline.criticalCount).toBeGreaterThan(0); // FLAG_LEDGER_INVALID
    expect(timeline.highCount).toBeGreaterThan(0); // FLAG_UNSUPPORTED_CLAIM, etc.
  });
});

// ---------------------------------------------------------------------------
// Trust Summary
// ---------------------------------------------------------------------------
describe("computeTrustSummary", () => {
  test("generates operator summary", () => {
    const report = makeReport();
    const summary = computeTrustSummary(report, "operator");
    expect(summary.role).toBe("operator");
    expect(summary.headline.length).toBeGreaterThan(0);
    expect(summary.recommendation.length).toBeGreaterThan(0);
    expect(summary.trustLabel).toBe("HIGH TRUST");
  });

  test("generates executive summary", () => {
    const report = makeReport();
    const summary = computeTrustSummary(report, "executive");
    expect(summary.role).toBe("executive");
    expect(summary.headline).toContain("high trust");
  });

  test("generates auditor summary", () => {
    const report = makeReport();
    const summary = computeTrustSummary(report, "auditor");
    expect(summary.role).toBe("auditor");
    expect(summary.headline).toContain("inflation");
  });

  test("includes top concerns from flagged questions", () => {
    const report = makeReport();
    const summary = computeTrustSummary(report, "operator");
    expect(summary.topConcerns.length).toBeGreaterThan(0);
  });

  test("includes top strengths for high-level questions", () => {
    const report = makeReport({
      questionScores: [
        makeScore({ questionId: "AMC-1.1", finalLevel: 4, confidence: 0.9, flags: [] }),
      ],
    });
    const summary = computeTrustSummary(report, "operator");
    expect(summary.topStrengths.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Role Presets
// ---------------------------------------------------------------------------
describe("role presets", () => {
  test("getRolePreset returns valid preset for each role", () => {
    for (const role of ["operator", "executive", "auditor"] as const) {
      const preset = getRolePreset(role);
      expect(preset.role).toBe(role);
      expect(preset.label.length).toBeGreaterThan(0);
      expect(preset.showSections.length).toBeGreaterThan(0);
    }
  });

  test("listRolePresets returns all three presets", () => {
    const presets = listRolePresets();
    expect(presets.length).toBe(3);
    expect(presets.map((p) => p.role)).toEqual(["operator", "executive", "auditor"]);
  });

  test("executive preset hides detailed sections", () => {
    const preset = getRolePreset("executive");
    expect(preset.hideSections.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Full Dashboard
// ---------------------------------------------------------------------------
describe("generateOperatorDashboard", () => {
  test("generates complete dashboard", () => {
    const report = makeReport();
    const dashboard = generateOperatorDashboard(report, "operator");
    expect(dashboard.dashboardId).toMatch(/^opux_/);
    expect(dashboard.role).toBe("operator");
    expect(dashboard.whyCaps.length).toBe(report.questionScores.length);
    expect(dashboard.heatmap.cells.length).toBe(report.questionScores.length);
    expect(dashboard.trustSummary.role).toBe("operator");
    expect(dashboard.preset.role).toBe("operator");
  });

  test("generates dashboard for each role", () => {
    const report = makeReport();
    for (const role of ["operator", "executive", "auditor"] as const) {
      const dashboard = generateOperatorDashboard(report, role);
      expect(dashboard.role).toBe(role);
    }
  });

  test("includes narrative diff with previous report", () => {
    const prev = makeReport({ runId: "run-0", integrityIndex: 0.5 });
    const curr = makeReport({ runId: "run-1", integrityIndex: 0.8 });
    const dashboard = generateOperatorDashboard(curr, "operator", prev);
    expect(dashboard.narrativeDiff.previousRunId).toBe("run-0");
    expect(dashboard.narrativeDiff.entries.length).toBeGreaterThan(0);
  });

  test("includes target mapping in why caps", () => {
    const report = makeReport();
    const dashboard = generateOperatorDashboard(report, "operator", null, { "AMC-1.1": 5 });
    const cap = dashboard.whyCaps.find((w) => w.questionId === "AMC-1.1")!;
    expect(cap.targetLevel).toBe(5);
    expect(cap.gap).toBe(2); // 5 - 3
  });
});

// ---------------------------------------------------------------------------
// Markdown Rendering
// ---------------------------------------------------------------------------
describe("renderOperatorDashboardMarkdown", () => {
  test("renders operator dashboard with all sections", () => {
    const report = makeReport();
    const dashboard = generateOperatorDashboard(report, "operator");
    const md = renderOperatorDashboardMarkdown(dashboard);
    expect(md).toContain("# Operator Dashboard");
    expect(md).toContain("## Trust Summary");
    expect(md).toContain("## Why Capped");
    expect(md).toContain("## Confidence Heatmap");
    expect(md).toContain("## Action Queue");
    expect(md).toContain("## What Changed Since Last Run");
    expect(md).toContain("## Incident Timeline");
  });

  test("renders executive dashboard with fewer sections", () => {
    const report = makeReport();
    const dashboard = generateOperatorDashboard(report, "executive");
    const md = renderOperatorDashboardMarkdown(dashboard);
    expect(md).toContain("# Operator Dashboard — Executive View");
    expect(md).toContain("## Trust Summary");
    // Executive preset hides action queue and incident timeline
    expect(md).not.toContain("## Action Queue");
    expect(md).not.toContain("## Incident Timeline");
  });

  test("renders auditor dashboard with all sections", () => {
    const report = makeReport();
    const dashboard = generateOperatorDashboard(report, "auditor");
    const md = renderOperatorDashboardMarkdown(dashboard);
    expect(md).toContain("Auditor View");
    expect(md).toContain("## Trust Summary");
    expect(md).toContain("## Why Capped");
  });

  test("renders empty report gracefully", () => {
    const report = makeReport({ questionScores: [], layerScores: [], inflationAttempts: [] });
    const dashboard = generateOperatorDashboard(report, "operator");
    const md = renderOperatorDashboardMarkdown(dashboard);
    expect(md).toContain("# Operator Dashboard");
    expect(md).toContain("No questions are currently capped");
  });
});
