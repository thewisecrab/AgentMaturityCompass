import { describe, expect, test } from "vitest";
import {
  detectEvidenceRateDrop,
  detectTrustTierRegression,
  detectScoreVolatilitySpike,
  detectEvidenceStreamAnomalies,
  type EvidenceSignalPoint,
  type ScoreSignalPoint
} from "../src/observability/anomalyDetector.js";

describe("observability anomaly detector", () => {
  test("detects evidence rate drops above 50%", () => {
    const now = 1_700_000_000_000;
    const windowMs = 60_000;
    const points: EvidenceSignalPoint[] = [];

    // Baseline windows: 10 events each.
    for (let win = 2; win <= 5; win += 1) {
      for (let i = 0; i < 10; i += 1) {
        points.push({ ts: now - win * windowMs + i * 1000, trustTier: "OBSERVED" });
      }
    }
    // Recent window: 2 events only.
    points.push({ ts: now - 20_000, trustTier: "OBSERVED" });
    points.push({ ts: now - 5_000, trustTier: "OBSERVED" });

    const anomaly = detectEvidenceRateDrop(points, {
      nowTs: now,
      windowMs,
      baselineWindows: 4,
      dropThreshold: 0.5
    });
    expect(anomaly).not.toBeNull();
    expect(anomaly?.type).toBe("EVIDENCE_RATE_DROP");
    expect(anomaly?.dropRatio).toBeGreaterThan(0.5);
  });

  test("detects trust tier regression", () => {
    const points: EvidenceSignalPoint[] = [
      { ts: 1, trustTier: "OBSERVED_HARDENED" },
      { ts: 2, trustTier: "OBSERVED" },
      { ts: 3, trustTier: "ATTESTED" },
      { ts: 4, trustTier: "SELF_REPORTED" }
    ];

    const anomaly = detectTrustTierRegression(points, {
      minRankDrop: 1
    });
    expect(anomaly).not.toBeNull();
    expect(anomaly?.type).toBe("TRUST_TIER_REGRESSION");
    expect(anomaly?.fromTier).toBe("OBSERVED_HARDENED");
    expect(anomaly?.toTier).toBe("SELF_REPORTED");
  });

  test("detects score volatility spike", () => {
    const points: ScoreSignalPoint[] = [
      { ts: 1, score: 70 },
      { ts: 2, score: 70.5 },
      { ts: 3, score: 71 },
      { ts: 4, score: 70.8 },
      { ts: 5, score: 60 },
      { ts: 6, score: 92 },
      { ts: 7, score: 58 },
      { ts: 8, score: 95 }
    ];

    const anomaly = detectScoreVolatilitySpike(points, {
      minPoints: 8,
      spikeThreshold: 2
    });
    expect(anomaly).not.toBeNull();
    expect(anomaly?.type).toBe("SCORE_VOLATILITY_SPIKE");
    expect(anomaly?.spikeRatio).toBeGreaterThan(2);
  });

  test("returns no anomalies for stable evidence and scores", () => {
    const evidence: EvidenceSignalPoint[] = [];
    for (let i = 0; i < 50; i += 1) {
      evidence.push({
        ts: 1_700_000_000_000 - i * 30_000,
        trustTier: "OBSERVED"
      });
    }
    const scores: ScoreSignalPoint[] = [
      { ts: 1, score: 80 },
      { ts: 2, score: 80.1 },
      { ts: 3, score: 80.2 },
      { ts: 4, score: 80.15 },
      { ts: 5, score: 80.1 },
      { ts: 6, score: 80.2 },
      { ts: 7, score: 80.25 },
      { ts: 8, score: 80.2 }
    ];
    const anomalies = detectEvidenceStreamAnomalies({
      evidencePoints: evidence,
      scorePoints: scores,
      nowTs: 1_700_000_000_000
    });
    expect(anomalies).toEqual([]);
  });
});
