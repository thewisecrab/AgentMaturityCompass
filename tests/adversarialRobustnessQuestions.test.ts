import { describe, expect, test } from "vitest";
import { questionBank } from "../src/diagnostic/questionBank.js";

function getQuestion(id: string) {
  const question = questionBank.find((row) => row.id === id);
  expect(question).toBeDefined();
  return question!;
}

describe("adversarial robustness diagnostic questions", () => {
  test("registers iterative probing detection with TAP/PAIR progression", () => {
    const question = getQuestion("AMC-5.18");
    expect(question.layerName).toBe("Skills");
    expect(question.promptTemplate).toContain("iterative adversarial probing");
    expect(question.options[1]?.label).toBe("No Detection");
    expect(question.options[2]?.label).toBe("Basic Rate Limiting");
    expect(question.options[3]?.label).toBe("Pattern Detection + Alerting");
    expect(question.options[4]?.label).toContain("TAP/PAIR");

    const gate4 = question.gates.find((gate) => gate.level === 4);
    expect(gate4?.mustInclude.auditTypes ?? []).toContain("ITERATIVE_PROBING_DETECTED");
    expect(gate4?.mustInclude.metricKeys ?? []).toContain("iterative_probe_block_rate");
  });

  test("registers inference parameter lockdown with explicit policy and audit controls", () => {
    const question = getQuestion("AMC-5.19");
    expect(question.promptTemplate).toContain("temperature");
    expect(question.promptTemplate).toContain("top-p");
    expect(question.options[1]?.label).toBe("Fully User-Controlled");
    expect(question.options[2]?.label).toBe("Some Limits");
    expect(question.options[3]?.label).toBe("Locked with Documented Policy");
    expect(question.options[4]?.label).toContain("Cryptographically Enforced");

    const gate4 = question.gates.find((gate) => gate.level === 4);
    expect(gate4?.mustInclude.auditTypes ?? []).toContain("INFERENCE_PARAM_POLICY_ENFORCED");
    expect(gate4?.mustInclude.metaKeys ?? []).toContain("temperature");
    expect(gate4?.mustInclude.metaKeys ?? []).toContain("top_p");
  });

  test("registers Best-of-N resistance with statistical evidence requirements", () => {
    const question = getQuestion("AMC-5.20");
    expect(question.promptTemplate).toContain("Best-of-N");
    expect(question.options[1]?.label).toBe("No Consistency Testing");
    expect(question.options[2]?.label).toBe("Manual Spot Checks");
    expect(question.options[3]?.label).toBe("Automated Consistency Testing in CI");
    expect(question.options[4]?.label).toContain("Statistical Consistency Guarantees");

    const gate3 = question.gates.find((gate) => gate.level === 3);
    const gate5 = question.gates.find((gate) => gate.level === 5);
    expect(gate3?.mustInclude.metricKeys ?? []).toContain("best_of_n_consistency_rate");
    expect(gate5?.mustInclude.artifactPatterns ?? []).toContain("best-of-n-statistical-report");
  });
});

