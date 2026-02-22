import { describe, expect, test } from "vitest";
import { questionBank } from "../src/diagnostic/questionBank.js";

describe("question bank", () => {
  test("has exactly 92 questions", () => {
    expect(questionBank).toHaveLength(92);
  });

  test("has expected layer distribution 15/18/20/19/20", () => {
    const counts = questionBank.reduce<Record<string, number>>((acc, q) => {
      acc[q.layerName] = (acc[q.layerName] ?? 0) + 1;
      return acc;
    }, {});

    expect(counts).toEqual({
      "Strategic Agent Operations": 15,
      "Leadership & Autonomy": 18,
      "Culture & Alignment": 20,
      Resilience: 19,
      Skills: 20
    });
  });

  test("includes multi-turn threat questions for Crescendo/TopicAttack, Skeleton Key, and Siren vectors", () => {
    const byId = new Map(questionBank.map((question) => [question.id, question]));
    const sessionEscalation = byId.get("AMC-THR-1");
    const skeletonKey = byId.get("AMC-THR-2");
    const siren = byId.get("AMC-THR-3");

    expect(sessionEscalation).toBeDefined();
    expect(skeletonKey).toBeDefined();
    expect(siren).toBeDefined();

    expect(sessionEscalation?.promptTemplate.toLowerCase()).toContain("topicattack");
    expect(skeletonKey?.promptTemplate.toLowerCase()).toContain("skeleton key");
    expect(siren?.promptTemplate.toLowerCase()).toContain("social engineering");

    expect(sessionEscalation?.options[0]?.label).toContain("No Session Tracking");
    expect(skeletonKey?.options[3]?.label).toContain("Immutable Safety Policy");
    expect(siren?.options[1]?.label).toContain("Basic Adversarial Testing");
  });

  test("each question has six options levels 0..5 and six gates", () => {
    for (const question of questionBank) {
      expect(question.options).toHaveLength(6);
      expect(question.gates).toHaveLength(6);

      const optionLevels = question.options.map((o) => o.level);
      const gateLevels = question.gates.map((g) => g.level);

      expect(optionLevels).toEqual([0, 1, 2, 3, 4, 5]);
      expect(gateLevels).toEqual([0, 1, 2, 3, 4, 5]);

      for (const gate of question.gates) {
        expect(gate.minEvents).toBeGreaterThanOrEqual(0);
        expect(gate.minSessions).toBeGreaterThanOrEqual(0);
        expect(gate.minDistinctDays).toBeGreaterThanOrEqual(0);
        expect((gate.acceptedTrustTiers ?? []).length).toBeGreaterThan(0);
        if (gate.level >= 4) {
          expect(gate.acceptedTrustTiers?.includes("SELF_REPORTED")).toBe(false);
        }
        if (gate.level === 5) {
          expect(gate.requiredTrustTier).toBe("OBSERVED");
        }
      }
    }
  });
});
