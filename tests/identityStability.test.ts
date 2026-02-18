import { describe, expect, test } from "vitest";
import {
  computeIdentityStability,
  renderIdentityStabilityMarkdown,
  renderAnomaliesMarkdown,
  type BehavioralTrace,
} from "../src/diagnostic/identityStability.js";

function makeTrace(
  id: string,
  sessionId: string,
  ts: number,
  overrides: Partial<BehavioralTrace> = {},
): BehavioralTrace {
  return {
    traceId: id,
    sessionId,
    timestamp: ts,
    communicationStyle: {
      formality: 0.7,
      verbosity: 0.6,
      assertiveness: 0.55,
      empathy: 0.65,
    },
    decisionPattern: {
      riskTolerance: 0.4,
      autonomy: 0.6,
      consistency: 0.75,
      transparency: 0.8,
    },
    valueExpression: {
      safetyPriority: 0.9,
      helpfulness: 0.85,
      honesty: 0.9,
      harmAvoidance: 0.92,
    },
    isAdversarial: false,
    modelId: "model-a",
    ...overrides,
  };
}

describe("identity stability", () => {
  test("returns a high stability index for consistent behavior", () => {
    const now = Date.UTC(2026, 1, 18);
    const traces: BehavioralTrace[] = [
      makeTrace("t1", "s1", now - 3 * 86_400_000),
      makeTrace("t2", "s1", now - 2 * 86_400_000, {
        communicationStyle: { formality: 0.69, verbosity: 0.61, assertiveness: 0.56, empathy: 0.65 },
      }),
      makeTrace("t3", "s2", now - 1 * 86_400_000, {
        decisionPattern: { riskTolerance: 0.41, autonomy: 0.59, consistency: 0.74, transparency: 0.8 },
      }),
    ];

    const report = computeIdentityStability("agent-consistent", traces, undefined, now);

    expect(report.stabilityIndex).toBeGreaterThan(0.85);
    expect(report.communicationConsistency).toBeGreaterThan(0.95);
    expect(report.decisionConsistency).toBeGreaterThan(0.95);
    expect(report.valueConsistency).toBeGreaterThan(0.99);
    expect(report.anomalies).toHaveLength(0);
  });

  test("detects persona drift, safety drift, and lowers stability", () => {
    const now = Date.UTC(2026, 1, 18);
    const traces: BehavioralTrace[] = [
      makeTrace("t1", "s1", now - 4 * 86_400_000, { modelId: "model-a" }),
      makeTrace("t2", "s2", now - 3 * 86_400_000, {
        communicationStyle: { formality: 0.2, verbosity: 0.2, assertiveness: 0.95, empathy: 0.1 },
        decisionPattern: { riskTolerance: 0.95, autonomy: 0.95, consistency: 0.2, transparency: 0.15 },
        valueExpression: { safetyPriority: 0.25, helpfulness: 0.45, honesty: 0.4, harmAvoidance: 0.3 },
        isAdversarial: true,
        modelId: "model-b",
      }),
      makeTrace("t3", "s3", now - 2 * 86_400_000, {
        communicationStyle: { formality: 0.15, verbosity: 0.25, assertiveness: 0.95, empathy: 0.08 },
        decisionPattern: { riskTolerance: 0.9, autonomy: 0.9, consistency: 0.15, transparency: 0.1 },
        valueExpression: { safetyPriority: 0.2, helpfulness: 0.5, honesty: 0.35, harmAvoidance: 0.25 },
        isAdversarial: true,
        modelId: "model-b",
      }),
    ];

    const report = computeIdentityStability("agent-drifted", traces, undefined, now);

    expect(report.stabilityIndex).toBeLessThan(0.8);
    expect(report.crossSessionDrift).toBeGreaterThan(0.1);
    expect(report.crossModelDrift).toBeGreaterThan(0.05);
    expect(report.adversarialResilience).toBeLessThan(0.9);

    const anomalyTypes = new Set(report.anomalies.map((a) => a.type));
    expect(report.anomalies.length).toBeGreaterThanOrEqual(2);
    expect(anomalyTypes.has("STYLE_SHIFT")).toBe(true);
    expect(anomalyTypes.has("SAFETY_DRIFT")).toBe(true);
  });

  test("windowing excludes stale traces", () => {
    const now = Date.UTC(2026, 1, 18);
    const traces: BehavioralTrace[] = [
      makeTrace("fresh-1", "s1", now - 1 * 86_400_000),
      makeTrace("fresh-2", "s1", now - 2 * 86_400_000),
      makeTrace("stale", "s0", now - 60 * 86_400_000, {
        communicationStyle: { formality: 0.05, verbosity: 0.95, assertiveness: 0.95, empathy: 0.05 },
      }),
    ];

    const report = computeIdentityStability("agent-window", traces, undefined, now);
    expect(report.anomalies).toHaveLength(0);
    expect(report.stabilityIndex).toBeGreaterThan(0.9);
  });

  test("markdown renderers include key identity stability sections", () => {
    const now = Date.UTC(2026, 1, 18);
    const traces = [
      makeTrace("t1", "s1", now - 2 * 86_400_000),
      makeTrace("t2", "s2", now - 1 * 86_400_000, {
        communicationStyle: { formality: 0.25, verbosity: 0.2, assertiveness: 0.9, empathy: 0.1 },
      }),
    ];

    const report = computeIdentityStability("agent-md", traces, undefined, now);
    const stableMd = renderIdentityStabilityMarkdown(report);
    const anomaliesMd = renderAnomaliesMarkdown(report);

    expect(stableMd).toContain("# Identity Stability — agent-md");
    expect(stableMd).toContain("## Stability Index");
    expect(stableMd).toContain("Cross-Session Drift");

    expect(anomaliesMd).toContain("# Identity Anomalies — agent-md");
    expect(anomaliesMd).toContain("**Total:**");
  });
});
