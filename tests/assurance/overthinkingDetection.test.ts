import { describe, it, expect } from "vitest";
import {
  detectLoopPatterns,
  pearsonCorrelation,
  analyzeOverthinking,
  getCalibrationTestCases,
  type OverthinkingResponse,
} from "../../src/assurance/packs/overthinkingDetectionPack.js";

describe("overthinking detection pack", () => {
  describe("detectLoopPatterns", () => {
    it("detects no loops in clean response", () => {
      const result = detectLoopPatterns("The answer is 42. This is a straightforward calculation.");
      expect(result.hasLoops).toBe(false);
      expect(result.repeatedPhrases).toHaveLength(0);
    });

    it("detects repeated phrases", () => {
      const response = "let me think about this problem. let me think about this problem. let me think about this problem. let me think about this problem.";
      const result = detectLoopPatterns(response);
      expect(result.hasLoops).toBe(true);
      expect(result.repeatedPhrases.length).toBeGreaterThan(0);
    });

    it("detects circular references", () => {
      const response = "As I mentioned earlier, the answer is 5. But wait, as I mentioned earlier, we need to reconsider. As I mentioned earlier, let me go back to the start.";
      const result = detectLoopPatterns(response);
      expect(result.circularReferences).toBeGreaterThanOrEqual(3);
      expect(result.hasLoops).toBe(true);
    });

    it("ignores common phrases", () => {
      const response = "In order to solve this, in order to find x, in order to verify, in order to confirm the result.";
      const result = detectLoopPatterns(response);
      expect(result.repeatedPhrases).not.toContain("in order to");
    });
  });

  describe("pearsonCorrelation", () => {
    it("returns 1.0 for perfect positive correlation", () => {
      const r = pearsonCorrelation([1, 2, 3, 4, 5], [2, 4, 6, 8, 10]);
      expect(r).toBeCloseTo(1.0, 5);
    });

    it("returns -1.0 for perfect negative correlation", () => {
      const r = pearsonCorrelation([1, 2, 3, 4, 5], [10, 8, 6, 4, 2]);
      expect(r).toBeCloseTo(-1.0, 5);
    });

    it("returns ~0 for uncorrelated data", () => {
      const r = pearsonCorrelation([1, 2, 3, 4, 5], [5, 1, 3, 2, 4]);
      expect(Math.abs(r)).toBeLessThan(0.5);
    });

    it("returns NaN for arrays of different length", () => {
      const r = pearsonCorrelation([1, 2], [1, 2, 3]);
      expect(r).toBeNaN();
    });

    it("returns NaN for zero-variance array", () => {
      const r = pearsonCorrelation([5, 5, 5], [1, 2, 3]);
      expect(r).toBeNaN();
    });
  });

  describe("analyzeOverthinking", () => {
    it("detects overthinking when longer answers are wrong", () => {
      const responses: OverthinkingResponse[] = [
        { testCaseId: "easy-001", response: "4", tokenCount: 10, isCorrect: true, reasoningTraceLength: 10, containsLoopPatterns: false },
        { testCaseId: "easy-002", response: "correct short", tokenCount: 20, isCorrect: true, reasoningTraceLength: 20, containsLoopPatterns: false },
        { testCaseId: "medium-001", response: "wrong long answer ".repeat(50), tokenCount: 500, isCorrect: false, reasoningTraceLength: 500, containsLoopPatterns: false },
        { testCaseId: "medium-002", response: "another wrong long ".repeat(60), tokenCount: 600, isCorrect: false, reasoningTraceLength: 600, containsLoopPatterns: false },
        { testCaseId: "hard-001", response: "very wrong very long ".repeat(80), tokenCount: 800, isCorrect: false, reasoningTraceLength: 800, containsLoopPatterns: false },
      ];

      const result = analyzeOverthinking(responses);
      expect(result.accuracyLengthCorrelation).toBeLessThan(-0.3);
      expect(result.overthinkingDetected).toBe(true);
      expect(result.passed).toBe(false);
      expect(result.findings.some(f => f.category === "overthinking")).toBe(true);
    });

    it("passes when accuracy is independent of length", () => {
      const responses: OverthinkingResponse[] = [
        { testCaseId: "easy-001", response: "short correct", tokenCount: 50, isCorrect: true, reasoningTraceLength: 50, containsLoopPatterns: false },
        { testCaseId: "easy-002", response: "medium correct ".repeat(10), tokenCount: 200, isCorrect: true, reasoningTraceLength: 200, containsLoopPatterns: false },
        { testCaseId: "medium-001", response: "long correct ".repeat(30), tokenCount: 500, isCorrect: true, reasoningTraceLength: 500, containsLoopPatterns: false },
        { testCaseId: "hard-001", response: "short wrong", tokenCount: 30, isCorrect: false, reasoningTraceLength: 30, containsLoopPatterns: false },
        { testCaseId: "hard-002", response: "medium wrong ".repeat(15), tokenCount: 300, isCorrect: false, reasoningTraceLength: 300, containsLoopPatterns: false },
      ];

      const result = analyzeOverthinking(responses);
      expect(result.overthinkingDetected).toBe(false);
    });

    it("flags verbosity on trivial tasks", () => {
      const responses: OverthinkingResponse[] = [
        { testCaseId: "trivial-001", response: "verbose ".repeat(100), tokenCount: 500, isCorrect: true, reasoningTraceLength: 500, containsLoopPatterns: false },
        { testCaseId: "trivial-002", response: "also verbose ".repeat(80), tokenCount: 400, isCorrect: true, reasoningTraceLength: 400, containsLoopPatterns: false },
      ];

      const result = analyzeOverthinking(responses);
      expect(result.verbosityOnTrivialTasks).toBeGreaterThan(200);
      expect(result.findings.some(f => f.category === "trivial-verbosity")).toBe(true);
    });

    it("flags when incorrect answers are systematically longer", () => {
      const responses: OverthinkingResponse[] = [
        { testCaseId: "easy-001", response: "correct", tokenCount: 20, isCorrect: true, reasoningTraceLength: 20, containsLoopPatterns: false },
        { testCaseId: "easy-002", response: "correct", tokenCount: 30, isCorrect: true, reasoningTraceLength: 30, containsLoopPatterns: false },
        { testCaseId: "easy-003", response: "correct", tokenCount: 25, isCorrect: true, reasoningTraceLength: 25, containsLoopPatterns: false },
        { testCaseId: "medium-001", response: "wrong ".repeat(50), tokenCount: 300, isCorrect: false, reasoningTraceLength: 300, containsLoopPatterns: false },
        { testCaseId: "medium-002", response: "wrong ".repeat(40), tokenCount: 250, isCorrect: false, reasoningTraceLength: 250, containsLoopPatterns: false },
        { testCaseId: "hard-001", response: "wrong ".repeat(60), tokenCount: 400, isCorrect: false, reasoningTraceLength: 400, containsLoopPatterns: false },
      ];

      const result = analyzeOverthinking(responses);
      expect(result.findings.some(f => f.category === "wrong-answers-longer")).toBe(true);
    });
  });

  describe("getCalibrationTestCases", () => {
    it("returns test cases across all difficulty levels", () => {
      const cases = getCalibrationTestCases();
      expect(cases.length).toBeGreaterThanOrEqual(8);
      expect(cases.some(c => c.difficulty === "trivial")).toBe(true);
      expect(cases.some(c => c.difficulty === "easy")).toBe(true);
      expect(cases.some(c => c.difficulty === "medium")).toBe(true);
      expect(cases.some(c => c.difficulty === "hard")).toBe(true);
    });

    it("has reasonable maxReasonableTokens scaling with difficulty", () => {
      const cases = getCalibrationTestCases();
      const trivialMax = Math.max(...cases.filter(c => c.difficulty === "trivial").map(c => c.maxReasonableTokens));
      const hardMin = Math.min(...cases.filter(c => c.difficulty === "hard").map(c => c.maxReasonableTokens));
      expect(hardMin).toBeGreaterThan(trivialMax);
    });
  });
});
