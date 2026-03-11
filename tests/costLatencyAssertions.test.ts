/**
 * Tests for eval/costLatencyAssertions.ts
 * Issue: AMC-74 — Cost & Latency Tracking Assertions
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  EvalMetricsTracker,
  CostThresholdError,
  LatencyThresholdError,
  TokenThresholdError,
  assertEvalCostBelow,
  assertEvalLatencyBelow,
  assertEvalTokensBelow,
} from "../src/eval/costLatencyAssertions.js";

describe("EvalMetricsTracker", () => {
  let tracker: EvalMetricsTracker;

  beforeEach(() => {
    tracker = new EvalMetricsTracker();
  });

  // -- Recording ----------------------------------------------------------

  it("records eval metrics", () => {
    tracker.recordEval({ evalId: "e1", costUsd: 0.05, latencyMs: 500, tokensUsed: 2000 });
    tracker.recordEval({ evalId: "e2", costUsd: 0.10, latencyMs: 800, tokensUsed: 4000 });
    expect(tracker.getRecords()).toHaveLength(2);
  });

  it("handles non-finite numbers gracefully", () => {
    tracker.recordEval({ evalId: "e1", costUsd: NaN, latencyMs: Infinity, tokensUsed: -5 });
    const recs = tracker.getRecords();
    expect(recs[0]!.costUsd).toBe(0);
    expect(recs[0]!.latencyMs).toBe(0);
    // negative gets clamped only if we wanted, but safeNum returns -5 as-is. Let's check:
    // Actually safeNum returns the value if finite, so -5 is fine. The assertion would never trigger for negative.
  });

  // -- Per-eval cost assertion --------------------------------------------

  it("assertCostBelow passes when all evals are under threshold", () => {
    tracker.recordEval({ evalId: "e1", costUsd: 0.01, latencyMs: 100, tokensUsed: 500 });
    tracker.recordEval({ evalId: "e2", costUsd: 0.02, latencyMs: 200, tokensUsed: 800 });
    expect(() => tracker.assertCostBelow(0.05)).not.toThrow();
  });

  it("assertCostBelow throws CostThresholdError when exceeded", () => {
    tracker.recordEval({ evalId: "e1", costUsd: 0.01, latencyMs: 100, tokensUsed: 500 });
    tracker.recordEval({ evalId: "e2", costUsd: 0.15, latencyMs: 200, tokensUsed: 800 });
    try {
      tracker.assertCostBelow(0.10);
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(CostThresholdError);
      const cte = err as CostThresholdError;
      expect(cte.violations).toHaveLength(1);
      expect(cte.violations[0]!.evalId).toBe("e2");
      expect(cte.violations[0]!.observed).toBe(0.15);
      expect(cte.violations[0]!.threshold).toBe(0.10);
    }
  });

  it("assertCostBelow reports multiple violations", () => {
    tracker.recordEval({ evalId: "e1", costUsd: 0.20, latencyMs: 100, tokensUsed: 500 });
    tracker.recordEval({ evalId: "e2", costUsd: 0.30, latencyMs: 200, tokensUsed: 800 });
    try {
      tracker.assertCostBelow(0.10);
      expect.unreachable("should have thrown");
    } catch (err) {
      const cte = err as CostThresholdError;
      expect(cte.violations).toHaveLength(2);
    }
  });

  // -- Per-eval latency assertion -----------------------------------------

  it("assertLatencyBelow passes when all evals are under threshold", () => {
    tracker.recordEval({ evalId: "e1", costUsd: 0.01, latencyMs: 100, tokensUsed: 500 });
    tracker.recordEval({ evalId: "e2", costUsd: 0.02, latencyMs: 900, tokensUsed: 800 });
    expect(() => tracker.assertLatencyBelow(1000)).not.toThrow();
  });

  it("assertLatencyBelow throws LatencyThresholdError when exceeded", () => {
    tracker.recordEval({ evalId: "e1", costUsd: 0.01, latencyMs: 1500, tokensUsed: 500 });
    try {
      tracker.assertLatencyBelow(1000);
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(LatencyThresholdError);
      const lte = err as LatencyThresholdError;
      expect(lte.violations[0]!.observed).toBe(1500);
    }
  });

  // -- Per-eval token assertion -------------------------------------------

  it("assertTokenUsageBelow passes when all evals are under threshold", () => {
    tracker.recordEval({ evalId: "e1", costUsd: 0.01, latencyMs: 100, tokensUsed: 3000 });
    expect(() => tracker.assertTokenUsageBelow(5000)).not.toThrow();
  });

  it("assertTokenUsageBelow throws TokenThresholdError when exceeded", () => {
    tracker.recordEval({ evalId: "e1", costUsd: 0.01, latencyMs: 100, tokensUsed: 8000 });
    try {
      tracker.assertTokenUsageBelow(5000);
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(TokenThresholdError);
      const tte = err as TokenThresholdError;
      expect(tte.violations[0]!.observed).toBe(8000);
    }
  });

  // -- Aggregate assertions -----------------------------------------------

  it("assertTotalCostBelow passes when total is under threshold", () => {
    tracker.recordEval({ evalId: "e1", costUsd: 0.30, latencyMs: 100, tokensUsed: 500 });
    tracker.recordEval({ evalId: "e2", costUsd: 0.40, latencyMs: 200, tokensUsed: 800 });
    expect(() => tracker.assertTotalCostBelow(1.00)).not.toThrow();
  });

  it("assertTotalCostBelow throws when total exceeds threshold", () => {
    tracker.recordEval({ evalId: "e1", costUsd: 0.60, latencyMs: 100, tokensUsed: 500 });
    tracker.recordEval({ evalId: "e2", costUsd: 0.60, latencyMs: 200, tokensUsed: 800 });
    expect(() => tracker.assertTotalCostBelow(1.00)).toThrow(CostThresholdError);
  });

  it("assertTotalTokensBelow throws when total exceeds threshold", () => {
    tracker.recordEval({ evalId: "e1", costUsd: 0.01, latencyMs: 100, tokensUsed: 6000 });
    tracker.recordEval({ evalId: "e2", costUsd: 0.01, latencyMs: 200, tokensUsed: 5000 });
    expect(() => tracker.assertTotalTokensBelow(10000)).toThrow(TokenThresholdError);
  });

  it("assertP95LatencyBelow passes when P95 is under threshold", () => {
    // 20 evals at 100ms, 1 at 900ms — P95 should be around 900ms
    for (let i = 0; i < 20; i++) {
      tracker.recordEval({ evalId: `e${i}`, costUsd: 0.01, latencyMs: 100, tokensUsed: 500 });
    }
    tracker.recordEval({ evalId: "e20", costUsd: 0.01, latencyMs: 900, tokensUsed: 500 });
    expect(() => tracker.assertP95LatencyBelow(1000)).not.toThrow();
  });

  it("assertP95LatencyBelow throws when P95 exceeds threshold", () => {
    // 15 evals at 100ms, 5 at 2000ms — P95 should be 2000ms
    for (let i = 0; i < 15; i++) {
      tracker.recordEval({ evalId: `e${i}`, costUsd: 0.01, latencyMs: 100, tokensUsed: 500 });
    }
    for (let i = 15; i < 20; i++) {
      tracker.recordEval({ evalId: `e${i}`, costUsd: 0.01, latencyMs: 2000, tokensUsed: 500 });
    }
    expect(() => tracker.assertP95LatencyBelow(1000)).toThrow(LatencyThresholdError);
  });

  it("assertAvgCostBelow works", () => {
    tracker.recordEval({ evalId: "e1", costUsd: 0.05, latencyMs: 100, tokensUsed: 500 });
    tracker.recordEval({ evalId: "e2", costUsd: 0.15, latencyMs: 200, tokensUsed: 800 });
    // avg = 0.10
    expect(() => tracker.assertAvgCostBelow(0.10)).not.toThrow(); // exactly at threshold = ok
    expect(() => tracker.assertAvgCostBelow(0.09)).toThrow(CostThresholdError);
  });

  // -- Violations accumulate across assertions ----------------------------

  it("violations accumulate across multiple assertion calls", () => {
    tracker.recordEval({ evalId: "e1", costUsd: 0.50, latencyMs: 5000, tokensUsed: 50000 });
    try { tracker.assertCostBelow(0.10); } catch { /* expected */ }
    try { tracker.assertLatencyBelow(1000); } catch { /* expected */ }
    try { tracker.assertTokenUsageBelow(10000); } catch { /* expected */ }
    expect(tracker.getViolations()).toHaveLength(3);
  });

  // -- Summary report -----------------------------------------------------

  it("summary returns correct aggregate metrics", () => {
    tracker.recordEval({ evalId: "e1", costUsd: 0.02, latencyMs: 100, tokensUsed: 1000, inputTokens: 800, outputTokens: 200, model: "gpt-4o" });
    tracker.recordEval({ evalId: "e2", costUsd: 0.08, latencyMs: 300, tokensUsed: 3000, inputTokens: 2000, outputTokens: 1000, model: "gpt-4o" });
    tracker.recordEval({ evalId: "e3", costUsd: 0.01, latencyMs: 50, tokensUsed: 500, model: "gemini-flash" });

    const s = tracker.summary();
    expect(s.evalCount).toBe(3);
    expect(s.totalCostUsd).toBeCloseTo(0.11, 4);
    expect(s.totalTokens).toBe(4500);
    expect(s.totalInputTokens).toBe(2800);
    expect(s.totalOutputTokens).toBe(1200);
    expect(s.avgLatencyMs).toBeCloseTo(150, 0);
    expect(Object.keys(s.byModel)).toHaveLength(2);
    expect(s.byModel["gpt-4o"]!.evalCount).toBe(2);
    expect(s.byModel["gemini-flash"]!.evalCount).toBe(1);
  });

  it("summary handles empty tracker", () => {
    const s = tracker.summary();
    expect(s.evalCount).toBe(0);
    expect(s.totalCostUsd).toBe(0);
  });

  // -- Render report ------------------------------------------------------

  it("renderReport produces markdown", () => {
    tracker.recordEval({ evalId: "e1", costUsd: 0.05, latencyMs: 200, tokensUsed: 2000, model: "gpt-4o" });
    const report = tracker.renderReport();
    expect(report).toContain("# Eval Cost & Latency Report");
    expect(report).toContain("gpt-4o");
    expect(report).toContain("$0.0500");
  });

  // -- Reset --------------------------------------------------------------

  it("reset clears all data", () => {
    tracker.recordEval({ evalId: "e1", costUsd: 0.05, latencyMs: 200, tokensUsed: 2000 });
    try { tracker.assertCostBelow(0.01); } catch { /* expected */ }
    tracker.reset();
    expect(tracker.getRecords()).toHaveLength(0);
    expect(tracker.getViolations()).toHaveLength(0);
  });

  // -- trackEval wrapper --------------------------------------------------

  it("trackEval measures latency and records metrics", async () => {
    const result = await tracker.trackEval("e1", async () => {
      await new Promise((r) => setTimeout(r, 50));
      return { result: "ok", costUsd: 0.01, tokensUsed: 500, model: "gpt-4o" };
    });
    expect(result).toBe("ok");
    const recs = tracker.getRecords();
    expect(recs).toHaveLength(1);
    expect(recs[0]!.latencyMs).toBeGreaterThanOrEqual(40); // allow some jitter
    expect(recs[0]!.costUsd).toBe(0.01);
    expect(recs[0]!.model).toBe("gpt-4o");
  });
});

// -- Standalone assertion functions ---------------------------------------

describe("standalone assertions", () => {
  it("assertEvalCostBelow passes under threshold", () => {
    expect(() => assertEvalCostBelow("e1", 0.05, 0.10)).not.toThrow();
  });

  it("assertEvalCostBelow throws above threshold", () => {
    expect(() => assertEvalCostBelow("e1", 0.15, 0.10)).toThrow(CostThresholdError);
  });

  it("assertEvalLatencyBelow passes under threshold", () => {
    expect(() => assertEvalLatencyBelow("e1", 500, 1000)).not.toThrow();
  });

  it("assertEvalLatencyBelow throws above threshold", () => {
    expect(() => assertEvalLatencyBelow("e1", 1500, 1000)).toThrow(LatencyThresholdError);
  });

  it("assertEvalTokensBelow passes under threshold", () => {
    expect(() => assertEvalTokensBelow("e1", 3000, 5000)).not.toThrow();
  });

  it("assertEvalTokensBelow throws above threshold", () => {
    expect(() => assertEvalTokensBelow("e1", 8000, 5000)).toThrow(TokenThresholdError);
  });
});
