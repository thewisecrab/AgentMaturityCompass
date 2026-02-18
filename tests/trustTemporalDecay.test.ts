import { describe, expect, test } from "vitest";
import {
  computeDecayFactor,
  computeTemporalDecayReport,
  deriveTemporalEvidenceFromRuns,
  renderFreshnessMarkdown,
  renderTemporalDecayMarkdown,
  type TemporalDecaySourceRun,
  type TrustEvidence
} from "../src/trust/temporalDecay.js";

describe("temporal trust decay", () => {
  test("half-life decay factor is 0.5 at exactly one half-life", () => {
    const factor = computeDecayFactor(14, 14);
    expect(factor).toBeCloseTo(0.5, 6);
  });

  test("derives weighted evidence from diagnostic runs", () => {
    const runs: TemporalDecaySourceRun[] = [
      {
        runId: "r1",
        ts: Date.UTC(2026, 0, 1),
        integrityIndex: 0.8,
        evidenceTrustCoverage: {
          observed: 0.5,
          attested: 0.25,
          selfReported: 0.25
        }
      }
    ];

    const evidence = deriveTemporalEvidenceFromRuns(runs);
    expect(evidence).toHaveLength(3);
    const byId = new Map(evidence.map((row) => [row.id, row]));
    expect(byId.get("r1:observed")?.weight).toBeCloseTo(0.4, 6);
    expect(byId.get("r1:attested")?.weight).toBeCloseTo(0.2, 6);
    expect(byId.get("r1:self")?.weight).toBeCloseTo(0.2, 6);
  });

  test("report computes freshness ratio and stale alert", () => {
    const now = Date.UTC(2026, 1, 1);
    const evidence: TrustEvidence[] = [
      {
        id: "new",
        category: "behavioral",
        weight: 0.5,
        timestamp: now
      },
      {
        id: "old",
        category: "behavioral",
        weight: 0.5,
        timestamp: now - 28 * 86_400_000
      }
    ];

    const report = computeTemporalDecayReport("agent-a", evidence, undefined, now, 0.2);
    expect(report.nominalTrust).toBeCloseTo(1, 6);
    expect(report.effectiveTrust).toBeLessThan(1);
    expect(report.freshnessRatio).toBeCloseTo(report.effectiveTrust / report.nominalTrust, 6);
    expect(report.staleTrustAlert).toBe(true);
  });

  test("markdown renderers include freshness details", () => {
    const now = Date.UTC(2026, 1, 1);
    const report = computeTemporalDecayReport("agent-md", [
      {
        id: "ev1",
        category: "assurance",
        weight: 0.4,
        timestamp: now - 2 * 86_400_000
      }
    ], undefined, now);

    const summary = renderTemporalDecayMarkdown(report);
    const freshness = renderFreshnessMarkdown(report);
    expect(summary).toContain("Freshness Ratio");
    expect(freshness).toContain("Evidence Freshness");
    expect(freshness).toContain("By Category");
  });
});
