import { describe, expect, test, beforeEach } from "vitest";
import {
  emitEvalRunTelemetry,
  traceEvalRun,
} from "../src/observability/evalTracing.js";
import {
  resetSharedObservabilityExporterForTests,
  getSharedObservabilityExporter,
} from "../src/observability/otelExporter.js";
import type { DiagnosticReport } from "../src/types.js";

function makeFakeReport(overrides: Partial<DiagnosticReport> = {}): DiagnosticReport {
  return {
    runId: "test-run-001",
    agentId: "agent-alpha",
    ts: Date.now(),
    integrityIndex: 0.82,
    trustLabel: "TRUSTED",
    status: "VALID",
    verificationPassed: true,
    trustBoundaryViolated: false,
    evidenceCoverage: 0.75,
    correlationRatio: 0.9,
    contradictionCount: 0,
    unsupportedClaimCount: 0,
    invalidReceiptsCount: 0,
    inflationAttempts: [],
    layerScores: [
      { layerName: "Security", avgFinalLevel: 3.5, confidenceWeightedFinalLevel: 3.2 },
      { layerName: "Reliability", avgFinalLevel: 2.8, confidenceWeightedFinalLevel: 2.6 },
    ],
    questionScores: [
      {
        questionId: "SEC.1",
        claimedLevel: 4,
        supportedMaxLevel: 4,
        finalLevel: 4,
        confidence: 0.95,
        flags: [],
      },
      {
        questionId: "REL.1",
        claimedLevel: 3,
        supportedMaxLevel: 3,
        finalLevel: 3,
        confidence: 0.88,
        flags: [],
      },
    ],
    prioritizedUpgradeActions: ["Improve evidence coverage"],
    evidenceToCollectNext: ["Add integration test receipts"],
    ...overrides,
  } as DiagnosticReport;
}

describe("evalTracing", () => {
  beforeEach(() => {
    resetSharedObservabilityExporterForTests();
    delete process.env.AMC_OTEL_ENABLED;
    delete process.env.AMC_OTEL_EXPORTERS;
  });

  test("emitEvalRunTelemetry records metrics for integrity index, coverage, layers, and questions", () => {
    const report = makeFakeReport();
    emitEvalRunTelemetry(report);

    const shared = getSharedObservabilityExporter();
    const stats = shared.getBufferStats();

    // 7 scoreComputation calls × 2-3 metrics each = 14+ buffered metrics
    expect(stats.metrics).toBeGreaterThanOrEqual(7);
    expect(stats.logs).toBe(0); // No incidents for passing report
  });

  test("emitEvalRunTelemetry logs incidents when verification fails", () => {
    const report = makeFakeReport({
      verificationPassed: false,
      status: "INVALID" as any,
    });
    emitEvalRunTelemetry(report);

    const shared = getSharedObservabilityExporter();
    const stats = shared.getBufferStats();

    expect(stats.logs).toBeGreaterThanOrEqual(1);
  });

  test("emitEvalRunTelemetry logs critical incident on trust boundary violation", () => {
    const report = makeFakeReport({
      trustBoundaryViolated: true,
      unsupportedClaimCount: 3,
    });
    emitEvalRunTelemetry(report);

    const shared = getSharedObservabilityExporter();
    const stats = shared.getBufferStats();

    expect(stats.logs).toBeGreaterThanOrEqual(1);
  });

  test("traceEvalRun wraps async function and returns report unchanged", async () => {
    const report = makeFakeReport();
    const result = await traceEvalRun(async () => report);
    expect(result).toBe(report);
    expect(result.integrityIndex).toBe(0.82);
  });

  test("emitEvalRunTelemetry accepts custom context overrides", () => {
    const report = makeFakeReport();
    emitEvalRunTelemetry(report, {
      agentId: "custom-agent",
      runId: "custom-run",
      sessionId: "custom-session",
    });

    const shared = getSharedObservabilityExporter();
    const stats = shared.getBufferStats();
    expect(stats.metrics).toBeGreaterThan(0);
  });
});
