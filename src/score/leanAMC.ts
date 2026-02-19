/**
 * Lean AMC profile for smaller teams.
 */

export interface LeanAMCProfile {
  requiredModules: string[];
  skippableModules: string[];
  estimatedSetupHours: number;
  maximumAchievableLevel: number;
  tradeoffs: string[];
}

export function getLeanAMCProfile(): LeanAMCProfile {
  return {
    requiredModules: [
      "diagnostic/question-bank",
      "score/formalSpec",
      "evidence/evidenceStore",
      "guardrails/basic",
      "assurance/injection"
    ],
    skippableModules: [
      "drift/continuous-monitoring",
      "forecasting/whatIf",
      "benchmarking/benchSuite",
      "vault/dataClassification",
      "pilot/studio",
      "marketing/bench" 
    ],
    estimatedSetupHours: 32,
    maximumAchievableLevel: 3,
    tradeoffs: [
      "No 24/7 red-team simulation; fewer adversarial cycles per day.",
      "No enterprise-wide telemetry; limited dashboard and manual review cadence.",
      "Reduced evidence depth for strategic/team-governance dimensions (L4-L5).",
      "Lower confidence for rapid autonomous reconfiguration and fleet-level operations.",
      "Best suited for L1-L3 outcomes with staged growth plan to full AMC profile."
    ]
  };
}
