import { describe, it, expect } from "vitest";
import { assessMemoryMaturity, scoreMemoryDimension } from "../src/score/memoryMaturity.js";

describe("assessMemoryMaturity", () => {
  it("returns a result with required fields", () => {
    const result = assessMemoryMaturity({});
    expect(result).toHaveProperty("agentId");
    expect(result).toHaveProperty("persistenceLevel");
    expect(result).toHaveProperty("continuityLevel");
    expect(result).toHaveProperty("integrityLevel");
    expect(result).toHaveProperty("overallScore");
    expect(result).toHaveProperty("gaps");
  });

  it("overall score is within 0–100 range", () => {
    const result = assessMemoryMaturity({});
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
  });

  it("gaps is an array", () => {
    const result = assessMemoryMaturity({});
    expect(Array.isArray(result.gaps)).toBe(true);
  });

  it("handles zero scores producing gaps", () => {
    const result = assessMemoryMaturity({
      'memory-persistence': 0,
      'context-survival': 0,
      'memory-integrity': 0,
    });
    expect(result.gaps.length).toBeGreaterThan(0);
    expect(result.overallScore).toBeLessThan(50);
  });

  it("handles high scores with no gaps", () => {
    const result = assessMemoryMaturity({
      'memory-persistence': 5,
      'context-survival': 5,
      'memory-integrity': 5,
    });
    expect(result.overallScore).toBeGreaterThan(50);
    expect(result.gaps.length).toBe(0);
  });

  it("persistence level maps correctly", () => {
    const low = assessMemoryMaturity({ 'memory-persistence': 1 });
    const high = assessMemoryMaturity({ 'memory-persistence': 5 });
    expect(low.persistenceLevel).toBeLessThan(high.persistenceLevel);
  });

  it("continuity level maps correctly", () => {
    const low = assessMemoryMaturity({ 'context-survival': 0 });
    const high = assessMemoryMaturity({ 'context-survival': 5 });
    expect(low.continuityLevel).toBeLessThan(high.continuityLevel);
  });

  it("integrity level maps correctly", () => {
    const low = assessMemoryMaturity({ 'memory-integrity': 0 });
    const high = assessMemoryMaturity({ 'memory-integrity': 5 });
    expect(low.integrityLevel).toBeLessThan(high.integrityLevel);
  });

  it("tamperEvidence true when integrity >= 3", () => {
    const result = assessMemoryMaturity({ 'memory-integrity': 3 });
    expect(result.tamperEvidence).toBe(true);
  });

  it("tamperEvidence false when integrity < 3", () => {
    const result = assessMemoryMaturity({ 'memory-integrity': 1 });
    expect(result.tamperEvidence).toBe(false);
  });
});

describe("scoreMemoryDimension", () => {
  it("returns 0 for empty input", () => {
    expect(scoreMemoryDimension({})).toBe(0);
  });

  it("returns 100 for all-5 scores", () => {
    expect(scoreMemoryDimension({ a: 5, b: 5, c: 5 })).toBe(100);
  });

  it("returns value between 0 and 100", () => {
    const score = scoreMemoryDimension({ a: 3, b: 2 });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
