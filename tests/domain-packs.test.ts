import { describe, expect, test } from "vitest";
import {
  getDomainPackQuestions,
  listDomainPacks,
  scoreDomainPack,
  type DomainPack
} from "../src/score/domainPacks.js";

function scoreAllAtLevel(pack: DomainPack, level: number) {
  const answers: Record<string, number> = {};
  for (const question of getDomainPackQuestions(pack)) {
    answers[question.id] = level;
  }
  return scoreDomainPack(pack, answers);
}

describe("domain packs", () => {
  test("exactly 7 domain packs registered", () => {
    const packs = listDomainPacks();
    expect(packs.length).toBe(7);
    expect(packs.map((pack) => pack.pack)).toEqual([
      "health",
      "education",
      "environment",
      "mobility",
      "governance",
      "technology",
      "wealth"
    ]);
  });

  test("health pack contains extended questions (HC-7, HC-8, HC-9)", () => {
    const ids = new Set(getDomainPackQuestions("health").map((q) => q.id));
    expect(ids.has("HC-1")).toBe(true);
    expect(ids.has("HC-7")).toBe(true);
    expect(ids.has("HC-8")).toBe(true);
    expect(ids.has("HC-9")).toBe(true);
  });

  test("wealth pack absorbs financial questions (FIN-1 through FIN-8)", () => {
    const ids = new Set(getDomainPackQuestions("wealth").map((q) => q.id));
    expect(ids.has("WLT-1")).toBe(true);
    expect(ids.has("FIN-1")).toBe(true);
    expect(ids.has("FIN-6")).toBe(true);
    expect(ids.has("FIN-8")).toBe(true);
    expect(getDomainPackQuestions("wealth").length).toBeGreaterThan(6);
  });

  test("mobility pack absorbs safety-critical questions (SC-1 through SC-8)", () => {
    const ids = new Set(getDomainPackQuestions("mobility").map((q) => q.id));
    expect(ids.has("MOB-1")).toBe(true);
    expect(ids.has("SC-1")).toBe(true);
    expect(ids.has("SC-6")).toBe(true);
    expect(ids.has("SC-8")).toBe(true);
    expect(getDomainPackQuestions("mobility").length).toBeGreaterThan(6);
  });

  test("education, environment, governance, technology each expose 6 questions", () => {
    expect(getDomainPackQuestions("education").length).toBe(6);
    expect(getDomainPackQuestions("environment").length).toBe(6);
    expect(getDomainPackQuestions("governance").length).toBe(6);
    expect(getDomainPackQuestions("technology").length).toBe(6);
  });

  test("pack scoring reflects maturity and certification thresholds", () => {
    const low = scoreAllAtLevel("technology", 1);
    expect(low.level).toBe("L1");
    expect(low.certificationReadiness).toBe(false);

    const high = scoreAllAtLevel("education", 5);
    expect(high.level).toBe("L5");
    expect(high.score).toBe(100);
    expect(high.certificationReadiness).toBe(true);
  });

  test("mobility certification threshold is higher (safety-critical absorbed)", () => {
    // mobility threshold is 80 (stricter due to SIL requirements)
    const midLevel = scoreAllAtLevel("mobility", 3);
    // scoring 3/5 on everything should not reach certification
    expect(midLevel.certificationReadiness).toBe(false);
  });
});
