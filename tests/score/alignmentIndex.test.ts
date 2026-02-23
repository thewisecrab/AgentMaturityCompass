import { describe, it, expect } from "vitest";
import { computeAlignmentIndex } from "../../src/score/alignmentIndex.js";

describe("alignment index", () => {
  it("computes high alignment for strong scores", () => {
    const result = computeAlignmentIndex({
      truthfulnessScore: 0.95,
      instructionComplianceScore: 0.92,
      safetyScore: 0.98,
      behavioralConsistencyScore: 0.90,
    });
    expect(result.overall).toBeGreaterThan(0.9);
    expect(result.grade).toBe("A");
    expect(result.topStrengths.length).toBeGreaterThan(0);
  });

  it("computes low alignment for weak scores", () => {
    const result = computeAlignmentIndex({
      truthfulnessScore: 0.3,
      instructionComplianceScore: 0.4,
      safetyScore: 0.2,
      behavioralConsistencyScore: 0.3,
    });
    expect(result.overall).toBeLessThan(0.5);
    expect(result.grade).toBe("F");
    expect(result.topWeaknesses.length).toBeGreaterThan(0);
  });

  it("includes Bloom dimensions when provided", () => {
    const result = computeAlignmentIndex({
      truthfulnessScore: 0.9,
      instructionComplianceScore: 0.9,
      safetyScore: 0.9,
      behavioralConsistencyScore: 0.9,
      sycophancyResistance: 0.85,
      sabotageResistance: 0.95,
    });
    expect(result.dimensions.length).toBe(6);
    expect(result.dimensions.some(d => d.name === "Sycophancy Resistance")).toBe(true);
    expect(result.dimensions.some(d => d.name === "Sabotage Resistance")).toBe(true);
  });

  it("detects improving trend", () => {
    const result = computeAlignmentIndex({
      truthfulnessScore: 0.9,
      instructionComplianceScore: 0.9,
      safetyScore: 0.9,
      behavioralConsistencyScore: 0.9,
      previousOverall: 0.7,
    });
    expect(result.trendDirection).toBe("improving");
  });

  it("detects declining trend", () => {
    const result = computeAlignmentIndex({
      truthfulnessScore: 0.5,
      instructionComplianceScore: 0.5,
      safetyScore: 0.5,
      behavioralConsistencyScore: 0.5,
      previousOverall: 0.9,
    });
    expect(result.trendDirection).toBe("declining");
  });

  it("detects stable trend", () => {
    const result = computeAlignmentIndex({
      truthfulnessScore: 0.8,
      instructionComplianceScore: 0.8,
      safetyScore: 0.8,
      behavioralConsistencyScore: 0.8,
      previousOverall: 0.8,
    });
    expect(result.trendDirection).toBe("stable");
  });

  it("clamps scores to 0-1 range", () => {
    const result = computeAlignmentIndex({
      truthfulnessScore: 1.5,
      instructionComplianceScore: -0.5,
      safetyScore: 0.8,
      behavioralConsistencyScore: 0.8,
    });
    expect(result.overall).toBeLessThanOrEqual(1.0);
    expect(result.overall).toBeGreaterThanOrEqual(0);
  });

  it("assigns correct grades", () => {
    const gradeA = computeAlignmentIndex({ truthfulnessScore: 0.95, instructionComplianceScore: 0.95, safetyScore: 0.95, behavioralConsistencyScore: 0.95 });
    const gradeB = computeAlignmentIndex({ truthfulnessScore: 0.85, instructionComplianceScore: 0.85, safetyScore: 0.85, behavioralConsistencyScore: 0.85 });
    const gradeC = computeAlignmentIndex({ truthfulnessScore: 0.75, instructionComplianceScore: 0.75, safetyScore: 0.75, behavioralConsistencyScore: 0.75 });
    expect(gradeA.grade).toBe("A");
    expect(gradeB.grade).toBe("B");
    expect(gradeC.grade).toBe("C");
  });
});
