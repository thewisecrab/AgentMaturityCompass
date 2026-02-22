import { describe, expect, test } from "vitest";
import { scoreRAGMaturity, type RAGCapabilityProfile } from "../src/score/ragMaturity.js";

function makeProfile(overrides: Partial<RAGCapabilityProfile> = {}): RAGCapabilityProfile {
  return {
    hybridSearchEnabled: true,
    rerankingEnabled: true,
    retrievalAccuracyBenchmarked: true,
    retrievalHitRate: 0.88,
    chunkingStrategy: "semantic",
    chunkOverlapConfigured: true,
    metadataAttachedToChunks: true,
    chunkQualityValidated: true,
    incrementalIndexingEnabled: true,
    stalenessDetectionEnabled: true,
    dataLineageTracked: true,
    testedBeyond100Docs: true,
    latencyBenchmarked: true,
    p99LatencyMs: 320,
    failoverConfigured: true,
    sourceAttributionInAnswers: true,
    confidenceScoresProvided: true,
    groundingVerified: true,
    accessControlOnIndex: true,
    piiFilteringEnabled: true,
    indexTamperDetected: true,
    ...overrides
  };
}

describe("scoreRAGMaturity", () => {
  test("returns diagnostics even when advanced samples are not provided", () => {
    const result = scoreRAGMaturity(makeProfile());
    expect(result.diagnostics.retrievalQuality.sampleSize).toBe(0);
    expect(result.diagnostics.metadataQuality.sampleSize).toBe(0);
    expect(result.diagnostics.retrievalDrift.trend).toBe("insufficient_data");
    expect(result.diagnostics.hallucinationRisk.sampleSize).toBe(0);
    expect(result.diagnostics.citationIntegrity.sampleSize).toBe(0);
  });

  test("computes retrieval precision/recall from chunk-level evaluations", () => {
    const result = scoreRAGMaturity(
      makeProfile({
        retrievalEvaluations: [
          { queryId: "q1", retrievedChunkIds: ["a", "b", "c"], relevantChunkIds: ["a", "c", "d"] },
          { queryId: "q2", retrievedChunkIds: ["x"], relevantChunkIds: ["y"] }
        ]
      })
    );
    expect(result.diagnostics.retrievalQuality.precision).toBeCloseTo(1 / 3, 5);
    expect(result.diagnostics.retrievalQuality.recall).toBeCloseTo(1 / 3, 5);
    expect(result.diagnostics.retrievalQuality.f1).toBeCloseTo(1 / 3, 5);
  });

  test("retrieval dimension score improves with better precision/recall", () => {
    const strong = scoreRAGMaturity(
      makeProfile({
        retrievalEvaluations: [{ queryId: "q1", retrievedChunkIds: ["a", "b"], relevantChunkIds: ["a", "b"] }]
      })
    );
    const weak = scoreRAGMaturity(
      makeProfile({
        retrievalEvaluations: [{ queryId: "q1", retrievedChunkIds: ["a", "b"], relevantChunkIds: ["z"] }]
      })
    );
    expect(strong.dimensionScores.retrievalQuality).toBeGreaterThan(weak.dimensionScores.retrievalQuality);
  });

  test("scores metadata quality from attribution completeness", () => {
    const result = scoreRAGMaturity(
      makeProfile({
        chunkMetadataSamples: [
          {
            chunkId: "c1",
            sourceId: "doc-1",
            sourceUri: "kb://doc-1",
            sourceTitle: "Doc One",
            documentVersion: "v1",
            ingestedAt: "2026-01-01T00:00:00Z"
          },
          {
            chunkId: "c2",
            sourceId: "doc-2",
            sourceUri: "kb://doc-2",
            sourceTitle: "Doc Two",
            documentVersion: "v4",
            ingestedAt: "2026-01-02T00:00:00Z"
          }
        ]
      })
    );
    expect(result.diagnostics.metadataQuality.score).toBeGreaterThan(90);
  });

  test("flags poor metadata quality when chunk attribution is incomplete", () => {
    const result = scoreRAGMaturity(
      makeProfile({
        chunkMetadataSamples: [{ chunkId: "c1" }]
      })
    );
    expect(result.diagnostics.metadataQuality.score).toBeLessThan(30);
    expect(result.gaps.some((gap) => gap.includes("Chunk metadata quality is below production threshold"))).toBe(true);
  });

  test("detects degrading retrieval drift trend", () => {
    const result = scoreRAGMaturity(
      makeProfile({
        retrievalQualityHistory: [
          { ts: "2026-01-01T00:00:00Z", precision: 0.9, recall: 0.9 },
          { ts: "2026-01-02T00:00:00Z", precision: 0.85, recall: 0.85 },
          { ts: "2026-01-03T00:00:00Z", precision: 0.6, recall: 0.6 },
          { ts: "2026-01-04T00:00:00Z", precision: 0.5, recall: 0.5 }
        ]
      })
    );
    expect(result.diagnostics.retrievalDrift.trend).toBe("degrading");
    expect(result.diagnostics.retrievalDrift.driftDetected).toBe(true);
    expect(result.diagnostics.retrievalDrift.deltaF1).toBeLessThan(0);
  });

  test("detects improving retrieval drift trend", () => {
    const result = scoreRAGMaturity(
      makeProfile({
        retrievalQualityHistory: [
          { ts: 1, precision: 0.3, recall: 0.3 },
          { ts: 2, precision: 0.35, recall: 0.35 },
          { ts: 3, precision: 0.75, recall: 0.75 },
          { ts: 4, precision: 0.8, recall: 0.8 }
        ]
      })
    );
    expect(result.diagnostics.retrievalDrift.trend).toBe("improving");
    expect(result.diagnostics.retrievalDrift.driftDetected).toBe(false);
  });

  test("returns insufficient_data drift trend when history is too short", () => {
    const result = scoreRAGMaturity(
      makeProfile({
        retrievalQualityHistory: [
          { ts: 1, precision: 0.9, recall: 0.9 },
          { ts: 2, precision: 0.8, recall: 0.8 },
          { ts: 3, precision: 0.85, recall: 0.85 }
        ]
      })
    );
    expect(result.diagnostics.retrievalDrift.trend).toBe("insufficient_data");
  });

  test("scores hallucination risk from unsupported high-confidence claims", () => {
    const result = scoreRAGMaturity(
      makeProfile({
        ragOutputEvaluations: [
          {
            outputId: "o1",
            claimCount: 10,
            groundedClaimCount: 1,
            citationCount: 0,
            confidence: 0.95,
            contradictingEvidenceCount: 3
          }
        ]
      })
    );
    expect(result.diagnostics.hallucinationRisk.riskScore).toBeGreaterThan(80);
    expect(result.gaps.some((gap) => gap.includes("Hallucination risk is elevated"))).toBe(true);
  });

  test("keeps hallucination risk low for grounded and cited responses", () => {
    const result = scoreRAGMaturity(
      makeProfile({
        ragOutputEvaluations: [
          {
            outputId: "o1",
            claimCount: 8,
            groundedClaimCount: 8,
            citationCount: 8,
            confidence: 0.9,
            contradictingEvidenceCount: 0
          }
        ]
      })
    );
    expect(result.diagnostics.hallucinationRisk.riskScore).toBeLessThan(15);
  });

  test("computes citation integrity score from verifiability and source validity", () => {
    const result = scoreRAGMaturity(
      makeProfile({
        citationEvaluations: [
          { citationId: "c1", isVerifiable: true, matchesRetrievedChunk: true, pointsToValidSource: true },
          { citationId: "c2", isVerifiable: false, matchesRetrievedChunk: false, pointsToValidSource: false }
        ]
      })
    );
    expect(result.diagnostics.citationIntegrity.integrityScore).toBe(50);
  });

  test("marks deployment risk critical for severe hallucination + citation integrity failures", () => {
    const result = scoreRAGMaturity(
      makeProfile({
        ragOutputEvaluations: [
          {
            outputId: "o1",
            claimCount: 12,
            groundedClaimCount: 1,
            citationCount: 0,
            confidence: 0.99,
            contradictingEvidenceCount: 4
          }
        ],
        citationEvaluations: [
          { citationId: "x1", isVerifiable: false, matchesRetrievedChunk: false, pointsToValidSource: false },
          { citationId: "x2", isVerifiable: false, matchesRetrievedChunk: false, pointsToValidSource: false }
        ]
      })
    );
    expect(result.diagnostics.hallucinationRisk.riskScore).toBeGreaterThanOrEqual(80);
    expect(result.diagnostics.citationIntegrity.integrityScore).toBeLessThan(30);
    expect(result.deploymentRisk).toBe("critical");
  });
});
