import { describe, it, expect } from "vitest";
import { assessOversightQuality } from "../src/score/humanOversightQuality.js";

describe("assessOversightQuality", () => {
  it("returns required fields", () => {
    const result = assessOversightQuality({});
    expect(result).toHaveProperty("agentId");
    expect(result).toHaveProperty("oversightExistence");
    expect(result).toHaveProperty("contextCompleteness");
    expect(result).toHaveProperty("graduatedAutonomy");
    expect(result).toHaveProperty("overallScore");
    expect(result).toHaveProperty("gaps");
  });

  it("overall score is within 0–100", () => {
    const result = assessOversightQuality({});
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
  });

  it("contextCompleteness is between 0 and 1", () => {
    const result = assessOversightQuality({});
    expect(result.contextCompleteness).toBeGreaterThanOrEqual(0);
    expect(result.contextCompleteness).toBeLessThanOrEqual(1);
  });

  it("gaps produced when no oversight", () => {
    const result = assessOversightQuality({});
    expect(result.gaps.length).toBeGreaterThan(0);
  });

  it("high scores produce high overall and fewer gaps", () => {
    const result = assessOversightQuality({
      'AMC-HOQ-1': 5,
      'AMC-HOQ-2': 5,
    });
    expect(result.overallScore).toBeGreaterThan(60);
    expect(result.oversightExistence).toBe(true);
    expect(result.graduatedAutonomy).toBe(true);
  });

  it("graduated autonomy false when HOQ-2 < 3", () => {
    const result = assessOversightQuality({ 'AMC-HOQ-2': 1 });
    expect(result.graduatedAutonomy).toBe(false);
  });

  it("graduated autonomy true when HOQ-2 >= 3", () => {
    const result = assessOversightQuality({ 'AMC-HOQ-2': 3 });
    expect(result.graduatedAutonomy).toBe(true);
  });

  it("agentId defaults to unknown", () => {
    const result = assessOversightQuality({});
    expect(result.agentId).toBe("unknown");
  });
});
