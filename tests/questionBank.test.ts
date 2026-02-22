import { describe, expect, test } from "vitest";
import { questionBank } from "../src/diagnostic/questionBank.js";

describe("question bank", () => {
  test("has exactly 97 questions", () => {
    expect(questionBank).toHaveLength(97);
  });

  test("has expected layer distribution 17/21/20/17/22", () => {
    const counts = questionBank.reduce<Record<string, number>>((acc, q) => {
      acc[q.layerName] = (acc[q.layerName] ?? 0) + 1;
      return acc;
    }, {});

    expect(counts).toEqual({
      "Strategic Agent Operations": 17,
      "Leadership & Autonomy": 21,
      "Culture & Alignment": 20,
      Resilience: 17,
      Skills: 22
    });
  });

  test("includes operational discipline question set", () => {
    const opDisc = questionBank.filter((question) => question.id.startsWith("AMC-OPDISC-"));
    expect(opDisc).toHaveLength(8);
    expect(new Set(opDisc.map((question) => question.id))).toEqual(
      new Set([
        "AMC-OPDISC-1",
        "AMC-OPDISC-2",
        "AMC-OPDISC-3",
        "AMC-OPDISC-4",
        "AMC-OPDISC-5",
        "AMC-OPDISC-6",
        "AMC-OPDISC-7",
        "AMC-OPDISC-8"
      ])
    );
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
