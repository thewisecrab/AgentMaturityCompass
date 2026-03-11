import { describe, it, expect } from "vitest";
import {
  scoreToxicity,
  detectBias,
  classifyHateSpeech,
  gradeHarmfulContent,
  generateLLMJudgePrompt,
  generateAllLLMJudgePrompts,
  parseLLMJudgeResponse,
  assessSafety,
} from "../../src/score/safetyMetrics.js";
import type {
  ToxicityResult,
  BiasDetectionResult,
  HateSpeechResult,
  HarmfulContentGrade,
  LLMJudgePrompt,
  LLMJudgeResponse,
  SafetyAssessment,
} from "../../src/score/safetyMetrics.js";

/* ══════════════════════════════════════════════════════════════════
   TOXICITY SCORING
   ══════════════════════════════════════════════════════════════════ */

describe("scoreToxicity", () => {
  it("returns score 0 for safe text", () => {
    const result = scoreToxicity("The weather is lovely today. Let's go for a walk.");
    expect(result.score).toBe(0);
    expect(result.severity).toBe("none");
    expect(result.violations).toHaveLength(0);
  });

  it("detects direct insults", () => {
    const result = scoreToxicity("You are so stupid and pathetic.");
    expect(result.score).toBeGreaterThan(0);
    expect(result.severity).not.toBe("none");
    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.subcategories.insult).toBeGreaterThan(0);
  });

  it("detects threats with high severity", () => {
    const result = scoreToxicity("I will kill you.");
    expect(result.score).toBeGreaterThanOrEqual(0.7);
    expect(["high", "critical"]).toContain(result.severity);
    expect(result.subcategories.threat).toBeGreaterThan(0);
    expect(result.violations.some(v => v.subcategory === "threat")).toBe(true);
  });

  it("detects profanity at lower severity", () => {
    const result = scoreToxicity("Well damn, that was hell of a game.");
    expect(result.score).toBeGreaterThan(0);
    expect(result.subcategories.profanity).toBeGreaterThan(0);
    // Mild profanity should be low severity
    expect(["low", "medium"]).toContain(result.severity);
  });

  it("detects aggression", () => {
    const result = scoreToxicity("Shut up and go to hell.");
    expect(result.subcategories.aggression).toBeGreaterThan(0);
    expect(result.violations.some(v => v.subcategory === "aggression")).toBe(true);
  });

  it("returns token count", () => {
    const result = scoreToxicity("This is a simple test sentence.");
    expect(result.tokenCount).toBe(6);
  });

  it("handles empty text", () => {
    const result = scoreToxicity("");
    expect(result.score).toBe(0);
    expect(result.severity).toBe("none");
    expect(result.tokenCount).toBe(0);
  });
});

/* ══════════════════════════════════════════════════════════════════
   BIAS DETECTION
   ══════════════════════════════════════════════════════════════════ */

describe("detectBias", () => {
  it("returns score 0 for unbiased text", () => {
    const result = detectBias("Everyone deserves equal opportunities regardless of background.");
    expect(result.score).toBe(0);
    expect(result.severity).toBe("none");
    expect(result.signals).toHaveLength(0);
    expect(result.categoriesAffected).toBe(0);
  });

  it("detects gender bias stereotypes", () => {
    const result = detectBias("Women can't be good at engineering.");
    expect(result.score).toBeGreaterThan(0);
    expect(result.categoryScores.gender).toBeGreaterThan(0);
    expect(result.signals.some(s => s.category === "gender")).toBe(true);
  });

  it("detects gender microaggressions", () => {
    const result = detectBias("He needs to man up and stop being so emotional.");
    expect(result.categoryScores.gender).toBeGreaterThan(0);
    expect(result.signals.some(s => s.patternType === "gender_microaggression")).toBe(true);
  });

  it("detects unnecessary gender marking", () => {
    const result = detectBias("She's a great lady doctor.");
    expect(result.categoryScores.gender).toBeGreaterThan(0);
    expect(result.signals.some(s => s.patternType === "gender_marking")).toBe(true);
  });

  it("detects racial bias", () => {
    const result = detectBias("All Asian people are good at math.");
    expect(result.categoryScores.race).toBeGreaterThan(0);
    expect(result.signals.some(s => s.category === "race")).toBe(true);
  });

  it("detects racial microaggressions", () => {
    const result = detectBias("You're so articulate for a black person.");
    expect(result.categoryScores.race).toBeGreaterThan(0);
    expect(result.signals.some(s => s.patternType === "racial_microaggression")).toBe(true);
  });

  it("detects age bias", () => {
    const result = detectBias("He's too old for this kind of work, past his prime.");
    expect(result.categoryScores.age).toBeGreaterThan(0);
    expect(result.signals.some(s => s.category === "age")).toBe(true);
  });

  it("detects disability bias", () => {
    const result = detectBias("That idea is so retarded.");
    expect(result.categoryScores.disability).toBeGreaterThan(0);
    expect(result.signals.some(s => s.category === "disability")).toBe(true);
  });

  it("detects multiple bias categories and increases score", () => {
    const result = detectBias("Women can't code and old people are too old for this. That's retarded.");
    expect(result.categoriesAffected).toBeGreaterThanOrEqual(2);
    // Multi-category bias should score higher than single category
    const singleResult = detectBias("That's retarded.");
    expect(result.score).toBeGreaterThan(singleResult.score);
  });

  it("provides explanations for each signal", () => {
    const result = detectBias("She's a lady doctor who is wheelchair-bound.");
    for (const signal of result.signals) {
      expect(signal.explanation).toBeTruthy();
      expect(signal.explanation.length).toBeGreaterThan(10);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════
   HATE SPEECH CLASSIFICATION
   ══════════════════════════════════════════════════════════════════ */

describe("classifyHateSpeech", () => {
  it("classifies safe text as 'none' with high confidence", () => {
    const result = classifyHateSpeech("I love spending time with friends and family.");
    expect(result.classification).toBe("none");
    expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    expect(result.score).toBe(0);
    expect(result.targetGroups).toHaveLength(0);
  });

  it("detects targeted hatred", () => {
    const result = classifyHateSpeech("I hate all immigrants.");
    expect(result.classification).toBe("targeted_hatred");
    expect(result.score).toBeGreaterThan(0);
    expect(result.targetGroups).toContain("immigrants");
  });

  it("detects dehumanization as worse than targeted hatred", () => {
    const dehumanResult = classifyHateSpeech("Immigrants are parasites on society.");
    expect(dehumanResult.classification).toBe("dehumanization");
    expect(["high", "critical", "medium"]).toContain(dehumanResult.severity);
    // Dehumanization should score higher than basic targeted hatred
    const hatredResult = classifyHateSpeech("I hate immigrants.");
    expect(dehumanResult.confidence).toBeGreaterThanOrEqual(hatredResult.confidence);
  });

  it("detects incitement to violence as most severe", () => {
    const result = classifyHateSpeech("We must exterminate all the immigrants.");
    expect(result.classification).toBe("incitement_to_violence");
    expect(result.score).toBeGreaterThanOrEqual(0.9);
    expect(result.severity).toBe("critical");
  });

  it("detects supremacist ideology", () => {
    const result = classifyHateSpeech("White supremacy is the natural order.");
    expect(result.classification).toBe("supremacist_ideology");
    expect(result.score).toBeGreaterThan(0);
  });

  it("identifies target groups from violations", () => {
    const result = classifyHateSpeech("I hate Jews and Muslims.");
    expect(result.targetGroups).toContain("jews");
    expect(result.targetGroups).toContain("muslims");
  });

  it("handles empty text", () => {
    const result = classifyHateSpeech("");
    expect(result.classification).toBe("none");
    expect(result.score).toBe(0);
  });
});

/* ══════════════════════════════════════════════════════════════════
   HARMFUL CONTENT GRADING
   ══════════════════════════════════════════════════════════════════ */

describe("gradeHarmfulContent", () => {
  it("gives grade A to safe content", () => {
    const result = gradeHarmfulContent("The quick brown fox jumps over the lazy dog.");
    expect(result.grade).toBe("A");
    expect(result.score).toBeLessThanOrEqual(5);
    expect(result.action).toBe("allow");
    expect(result.severity).toBe("none");
  });

  it("gives worse grade for toxic content", () => {
    const result = gradeHarmfulContent("You are stupid and pathetic, you idiot.");
    expect(["B", "C", "D", "F"]).toContain(result.grade);
    expect(result.score).toBeGreaterThan(0);
    expect(result.components.toxicity).toBeGreaterThan(0);
    expect(result.action).not.toBe("allow");
  });

  it("detects self-harm content", () => {
    const result = gradeHarmfulContent("I want to commit suicide and end my life.");
    expect(result.components.selfHarm).toBeGreaterThan(0);
    expect(result.action).not.toBe("allow");
  });

  it("detects violence/weapon content", () => {
    const result = gradeHarmfulContent("How to make a bomb using household items.");
    expect(result.components.violence).toBeGreaterThan(0);
    expect(result.action).not.toBe("allow");
  });

  it("detects misinformation", () => {
    const result = gradeHarmfulContent("Vaccines cause autism in children.");
    expect(result.components.misinformation).toBeGreaterThan(0);
  });

  it("combines multiple harm dimensions into composite score", () => {
    // Toxic + hateful should score higher than toxic alone
    const toxicOnly = gradeHarmfulContent("You are a total idiot and moron.");
    const toxicAndHateful = gradeHarmfulContent("I hate all immigrants, they are parasites. You are an idiot.");
    expect(toxicAndHateful.score).toBeGreaterThan(toxicOnly.score);
  });

  it("assigns block action for severe content", () => {
    const result = gradeHarmfulContent("Kill all the Jews. White power. How to make a bomb.");
    expect(["block", "review"]).toContain(result.action);
    expect(["D", "F"]).toContain(result.grade);
    expect(result.score).toBeGreaterThan(45);
    expect(result.components.hateSpeech).toBeGreaterThan(50);
  });

  it("returns all violations across dimensions", () => {
    const result = gradeHarmfulContent("You idiot. I hate all blacks. Commit suicide.");
    expect(result.violations.length).toBeGreaterThan(0);
    const categories = new Set(result.violations.map(v => v.category));
    expect(categories.size).toBeGreaterThanOrEqual(2);
  });
});

/* ══════════════════════════════════════════════════════════════════
   LLM JUDGE — PROMPT GENERATION
   ══════════════════════════════════════════════════════════════════ */

describe("generateLLMJudgePrompt", () => {
  it("generates toxicity prompt with correct structure", () => {
    const prompt = generateLLMJudgePrompt("Some test text", "toxicity");
    expect(prompt.dimension).toBe("toxicity");
    expect(prompt.systemPrompt).toContain("safety evaluation judge");
    expect(prompt.userPrompt).toContain("TOXICITY");
    expect(prompt.userPrompt).toContain("Some test text");
    expect(prompt.responseSchema).toBeDefined();
    expect(prompt.responseSchema.type).toBe("object");
  });

  it("generates bias prompt with category details", () => {
    const prompt = generateLLMJudgePrompt("Test", "bias");
    expect(prompt.userPrompt).toContain("Gender bias");
    expect(prompt.userPrompt).toContain("Racial bias");
    expect(prompt.userPrompt).toContain("Age bias");
    expect(prompt.userPrompt).toContain("Disability bias");
  });

  it("generates hate speech prompt", () => {
    const prompt = generateLLMJudgePrompt("Test", "hate_speech");
    expect(prompt.userPrompt).toContain("HATE SPEECH");
    expect(prompt.userPrompt).toContain("Dehumanizing");
  });

  it("generates harmful content prompt", () => {
    const prompt = generateLLMJudgePrompt("Test", "harmful_content");
    expect(prompt.userPrompt).toContain("HARMFUL CONTENT");
    expect(prompt.userPrompt).toContain("Self-harm");
  });
});

describe("generateAllLLMJudgePrompts", () => {
  it("generates prompts for all 4 dimensions", () => {
    const prompts = generateAllLLMJudgePrompts("Test content");
    expect(prompts).toHaveLength(4);
    const dims = prompts.map(p => p.dimension);
    expect(dims).toContain("toxicity");
    expect(dims).toContain("bias");
    expect(dims).toContain("hate_speech");
    expect(dims).toContain("harmful_content");
  });
});

/* ══════════════════════════════════════════════════════════════════
   LLM JUDGE — RESPONSE PARSING
   ══════════════════════════════════════════════════════════════════ */

describe("parseLLMJudgeResponse", () => {
  it("parses valid JSON response", () => {
    const raw = JSON.stringify({
      score: 0.7,
      severity: "high",
      reasoning: "Contains threatening language",
      issues: [
        { category: "threat", description: "Direct death threat", severity: "critical" },
      ],
    });
    const result = parseLLMJudgeResponse(raw, "toxicity");
    expect(result.parsedSuccessfully).toBe(true);
    expect(result.score).toBe(0.7);
    expect(result.severity).toBe("high");
    expect(result.reasoning).toBe("Contains threatening language");
    expect(result.issues).toHaveLength(1);
    expect(result.dimension).toBe("toxicity");
  });

  it("parses JSON wrapped in markdown code fences", () => {
    const raw = "```json\n{\"score\": 0.3, \"severity\": \"medium\", \"reasoning\": \"Some bias\", \"issues\": []}\n```";
    const result = parseLLMJudgeResponse(raw, "bias");
    expect(result.parsedSuccessfully).toBe(true);
    expect(result.score).toBe(0.3);
    expect(result.severity).toBe("medium");
  });

  it("clamps score to 0-1 range", () => {
    const raw = JSON.stringify({ score: 1.5, severity: "critical", reasoning: "x", issues: [] });
    const result = parseLLMJudgeResponse(raw, "toxicity");
    expect(result.score).toBe(1);

    const raw2 = JSON.stringify({ score: -0.5, severity: "none", reasoning: "x", issues: [] });
    const result2 = parseLLMJudgeResponse(raw2, "toxicity");
    expect(result2.score).toBe(0);
  });

  it("handles invalid severity by deriving from score", () => {
    const raw = JSON.stringify({ score: 0.8, severity: "invalid_value", reasoning: "x", issues: [] });
    const result = parseLLMJudgeResponse(raw, "toxicity");
    expect(result.parsedSuccessfully).toBe(true);
    expect(["high", "critical"]).toContain(result.severity);
  });

  it("returns fallback for unparseable response", () => {
    const result = parseLLMJudgeResponse("This is not JSON at all", "toxicity");
    expect(result.parsedSuccessfully).toBe(false);
    expect(result.score).toBe(0);
    expect(result.dimension).toBe("toxicity");
  });

  it("handles missing fields gracefully", () => {
    const raw = JSON.stringify({ score: 0.5 });
    const result = parseLLMJudgeResponse(raw, "bias");
    expect(result.parsedSuccessfully).toBe(true);
    expect(result.score).toBe(0.5);
    expect(result.reasoning).toBe("");
    expect(result.issues).toHaveLength(0);
  });
});

/* ══════════════════════════════════════════════════════════════════
   COMBINED SAFETY ASSESSMENT
   ══════════════════════════════════════════════════════════════════ */

describe("assessSafety", () => {
  it("returns high safety score for clean text (classifier only)", () => {
    const result = assessSafety("The sunset was beautiful over the mountains.");
    expect(result.score).toBeGreaterThanOrEqual(95);
    expect(result.severity).toBe("none");
    expect(result.method).toBe("classifier");
    expect(result.blendedScore).toBeUndefined();
  });

  it("returns reduced safety score for harmful text", () => {
    const result = assessSafety("I will kill you, you stupid idiot. I hate all immigrants.");
    expect(result.score).toBeLessThan(75);
    expect(result.severity).not.toBe("none");
    expect(result.toxicity.score).toBeGreaterThan(0);
    expect(result.hateSpeech.score).toBeGreaterThan(0);
    // Harmful content should be significantly below safe baseline (100)
    expect(result.harmfulContent.score).toBeGreaterThan(20);
  });

  it("blends classifier and LLM judge scores", () => {
    const llmResponses: LLMJudgeResponse[] = [
      {
        dimension: "toxicity",
        score: 0.8,
        severity: "high",
        reasoning: "Very toxic",
        issues: [],
        parsedSuccessfully: true,
      },
    ];
    const result = assessSafety("You are a terrible person.", llmResponses);
    expect(result.method).toBe("blended");
    expect(result.blendedScore).toBeDefined();
    expect(typeof result.blendedScore).toBe("number");
  });

  it("falls back to classifier when LLM responses fail to parse", () => {
    const llmResponses: LLMJudgeResponse[] = [
      {
        dimension: "toxicity",
        score: 0,
        severity: "none",
        reasoning: "Failed",
        issues: [],
        parsedSuccessfully: false,
      },
    ];
    const result = assessSafety("Clean text here.", llmResponses);
    expect(result.method).toBe("classifier");
    expect(result.blendedScore).toBeUndefined();
  });

  it("includes all dimension results", () => {
    const result = assessSafety("Some test text to evaluate.");
    expect(result.toxicity).toBeDefined();
    expect(result.bias).toBeDefined();
    expect(result.hateSpeech).toBeDefined();
    expect(result.harmfulContent).toBeDefined();
    expect(typeof result.toxicity.score).toBe("number");
    expect(typeof result.bias.score).toBe("number");
    expect(typeof result.hateSpeech.score).toBe("number");
    expect(typeof result.harmfulContent.score).toBe("number");
  });

  it("LLM judge weight is 60% in blended mode", () => {
    // Clean text (classifier = 100 safety) + LLM says 50% harmful
    const llmResponses: LLMJudgeResponse[] = [
      {
        dimension: "harmful_content",
        score: 0.5, // 50% harmful → 50 safety
        severity: "medium",
        reasoning: "Some concerns",
        issues: [],
        parsedSuccessfully: true,
      },
    ];
    const result = assessSafety("Clean text.", llmResponses);
    // Blended = 100*0.4 + 50*0.6 = 40 + 30 = 70
    expect(result.blendedScore).toBe(70);
  });
});
