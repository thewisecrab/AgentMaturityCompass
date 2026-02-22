import { describe, expect, test } from "vitest";
import { questionBank } from "../src/diagnostic/questionBank.js";

const NEW_AGENTIC_IDS = [
  "AMC-5.18",
  "AMC-5.19",
  "AMC-5.20",
  "AMC-5.21",
  "AMC-5.22",
  "AMC-5.23",
  "AMC-5.24",
  "AMC-5.25"
] as const;

const EXPECTED_LEVEL3_METRICS: Record<(typeof NEW_AGENTIC_IDS)[number], string> = {
  "AMC-5.18": "react_trace_coverage",
  "AMC-5.19": "plan_step_verification_rate",
  "AMC-5.20": "handoff_success_rate",
  "AMC-5.21": "tool_budget_breach_rate",
  "AMC-5.22": "grounded_citation_rate",
  "AMC-5.23": "goal_drift_detection_rate",
  "AMC-5.24": "metric_gaming_detection_rate",
  "AMC-5.25": "runaway_prevention_rate"
};

const EXPECTED_LEVEL4_AUDITS: Record<(typeof NEW_AGENTIC_IDS)[number], string> = {
  "AMC-5.18": "REACT_TRACE_VERIFIED",
  "AMC-5.19": "PLAN_CONTRACT_VERIFIED",
  "AMC-5.20": "HANDOFF_CONTRACT_VERIFIED",
  "AMC-5.21": "TOOL_BUDGET_CHECK",
  "AMC-5.22": "RAG_GROUNDING_CHECK",
  "AMC-5.23": "GOAL_DRIFT_ALERT",
  "AMC-5.24": "REWARD_INTEGRITY_CHECK",
  "AMC-5.25": "RUNAWAY_GUARD_TRIGGERED"
};

describe("agentic ecosystem diagnostic questions", () => {
  test("question bank includes new agentic ecosystem IDs in Skills layer", () => {
    const lookup = new Map(questionBank.map((row) => [row.id, row]));
    for (const id of NEW_AGENTIC_IDS) {
      const question = lookup.get(id);
      expect(question).toBeDefined();
      expect(question?.layerName).toBe("Skills");
    }
  });

  test("new questions have L1-L4 rubric labels and observed trust requirements at higher levels", () => {
    const lookup = new Map(questionBank.map((row) => [row.id, row]));
    for (const id of NEW_AGENTIC_IDS) {
      const question = lookup.get(id);
      if (!question) {
        throw new Error(`missing question ${id}`);
      }

      const optionByLevel = new Map(question.options.map((option) => [option.level, option]));
      for (const level of [1, 2, 3, 4] as const) {
        expect(optionByLevel.get(level)?.label.trim().length).toBeGreaterThan(0);
      }

      const level4 = question.gates.find((gate) => gate.level === 4);
      const level5 = question.gates.find((gate) => gate.level === 5);
      expect(level4?.requiredTrustTier).toBe("OBSERVED");
      expect(level4?.acceptedTrustTiers).toEqual(["OBSERVED"]);
      expect(level5?.requiredTrustTier).toBe("OBSERVED");
      expect(level5?.acceptedTrustTiers).toEqual(["OBSERVED"]);
    }
  });

  test("new questions require runtime agentic telemetry at L3+ with targeted metrics/audits", () => {
    const lookup = new Map(questionBank.map((row) => [row.id, row]));
    for (const id of NEW_AGENTIC_IDS) {
      const question = lookup.get(id);
      if (!question) {
        throw new Error(`missing question ${id}`);
      }

      const level3 = question.gates.find((gate) => gate.level === 3);
      const level4 = question.gates.find((gate) => gate.level === 4);
      expect(level3?.requiredEvidenceTypes.includes("tool_action")).toBe(true);
      expect(level3?.requiredEvidenceTypes.includes("tool_result")).toBe(true);
      expect(level3?.requiredEvidenceTypes.includes("audit")).toBe(true);
      expect(level3?.requiredEvidenceTypes.includes("metric")).toBe(true);
      expect(level3?.mustInclude.metricKeys?.includes(EXPECTED_LEVEL3_METRICS[id])).toBe(true);
      expect(level4?.mustInclude.auditTypes?.includes(EXPECTED_LEVEL4_AUDITS[id])).toBe(true);
    }
  });
});
