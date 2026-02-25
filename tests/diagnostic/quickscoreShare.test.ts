import { describe, it, expect } from "vitest";
import { generateShareableSummary, formatPostQuickscoreFlow } from "../../src/diagnostic/quickscoreShare.js";
import type { RapidQuickscoreResult } from "../../src/diagnostic/rapidQuickscore.js";

const mockResult: RapidQuickscoreResult = {
  questionCount: 5,
  totalScore: 12,
  maxScore: 25,
  percentage: 48,
  preliminaryLevel: "L2",
  questionScores: [
    { questionId: "AMC-1.1", title: "Agent Charter & Scope", layerName: "Strategic Agent Operations", level: 3 },
    { questionId: "AMC-2.1", title: "Aspiration Surfacing", layerName: "Leadership & Autonomy", level: 2 },
    { questionId: "AMC-3.1.1", title: "Integrity", layerName: "Culture & Alignment", level: 3 },
    { questionId: "AMC-4.1", title: "Accountability", layerName: "Resilience", level: 2 },
    { questionId: "AMC-5.1", title: "Design Thinking", layerName: "Skills", level: 2 },
  ],
  recommendations: [
    {
      questionId: "AMC-2.1",
      title: "Aspiration Surfacing",
      currentLevel: 2,
      targetLevel: 3,
      whyItMatters: "It controls when the agent can act alone.",
      howToImprove: "Implement explicit aspiration checks.",
    },
    {
      questionId: "AMC-4.1",
      title: "Accountability",
      currentLevel: 2,
      targetLevel: 3,
      whyItMatters: "It prevents fragile behavior.",
      howToImprove: "Add consequence management.",
    },
  ],
};

describe("quickscore share", () => {
  describe("generateShareableSummary", () => {
    it("generates markdown with badge and table", () => {
      const summary = generateShareableSummary(mockResult, "TestBot");
      expect(summary.markdown).toContain("TestBot");
      expect(summary.markdown).toContain("L2");
      expect(summary.markdown).toContain("48%");
      expect(summary.markdown).toContain("img.shields.io");
      expect(summary.markdown).toContain("| Dimension |");
      expect(summary.markdown).toContain("Agent Maturity Compass");
    });

    it("generates plain text summary", () => {
      const summary = generateShareableSummary(mockResult);
      expect(summary.plainText).toContain("L2");
      expect(summary.plainText).toContain("48%");
      expect(summary.plainText).toContain("AMC");
    });

    it("uses default agent name when not provided", () => {
      const summary = generateShareableSummary(mockResult);
      expect(summary.markdown).toContain("My Agent");
    });

    it("includes badge", () => {
      const summary = generateShareableSummary(mockResult);
      expect(summary.badge).toContain("img.shields.io");
    });
  });

  describe("formatPostQuickscoreFlow", () => {
    it("shows current level and improvement path", () => {
      const output = formatPostQuickscoreFlow(mockResult);
      expect(output).toContain("scored L2");
      expect(output).toContain("L3 requires");
    });

    it("lists top recommendations with why and how", () => {
      const output = formatPostQuickscoreFlow(mockResult);
      expect(output).toContain("Aspiration Surfacing");
      expect(output).toContain("Accountability");
      expect(output).toContain("Why:");
      expect(output).toContain("How:");
    });

    it("handles L5 with no recommendations", () => {
      const l5Result: RapidQuickscoreResult = {
        ...mockResult,
        preliminaryLevel: "L5",
        percentage: 100,
        recommendations: [],
      };
      const output = formatPostQuickscoreFlow(l5Result);
      expect(output).toContain("scored L5");
      expect(output).toContain("top tier");
    });

    it("includes share CTA", () => {
      const output = formatPostQuickscoreFlow(mockResult);
      expect(output).toContain("quickscore --share");
    });
  });
});
