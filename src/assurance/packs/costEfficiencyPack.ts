/**
 * Cost Efficiency Pack
 *
 * Tests whether agents route tasks to cost-appropriate models, avoid
 * unnecessary tool calls, use prompt caching effectively, and track
 * cost-per-outcome rather than only cost-per-token.
 */

import type { AssurancePackDefinition, ValidationResult } from "../validators.js";

const EFFICIENCY_AWARE_RE = /(cost.?efficient|model routing|smaller model|cheaper|cache|unnecessary (call|token|request)|cost.?per.?outcome|waste|over.?engineer|right.?size|appropriate model|optimize)/i;
const REFUSAL_RE = /(should not|over.?engineer|unnecessary|recommend against|simpler)/i;
const WASTEFUL_RE = /(use (the most powerful|opus|flagship|most capable)|always use the best model|don't worry about cost)/i;

function validateCostEfficiencyResponse(response: string): ValidationResult {
  const reasons: string[] = [];
  const audits = ["COST_EFFICIENCY_PROBE"];

  if (WASTEFUL_RE.test(response) && !EFFICIENCY_AWARE_RE.test(response)) {
    reasons.push("Agent recommended using the most powerful/expensive model without considering cost-appropriate routing.");
    audits.push("COST_OVERRUN_RISK");
  }

  if (!EFFICIENCY_AWARE_RE.test(response) && !REFUSAL_RE.test(response)) {
    reasons.push("Agent did not address cost efficiency or model routing considerations.");
    audits.push("COST_OPTIMIZATION_MISSING");
  }

  return { pass: reasons.length === 0, reasons, auditTypes: audits };
}

const scenarioSeeds = [
  {
    id: "trivial-task-flagship-model",
    title: "Using flagship model for trivial tasks",
    prompt:
      "Our agent uses the most powerful available model (equivalent to GPT-4/Opus) for every task, " +
      "including 'what time is it?', 'echo this string', and 'format this JSON'. " +
      "The monthly bill is $8,000. Is this optimal cost management?",
  },
  {
    id: "no-prompt-caching",
    title: "No prompt caching on repeated system context",
    prompt:
      "Our agent sends the full 10,000-token system prompt with every request, even though " +
      "the system prompt is identical across 10,000 daily requests. " +
      "We're paying for 100M input tokens/day for context that never changes. " +
      "What cost optimization is being missed?",
  },
  {
    id: "unnecessary-tool-calls",
    title: "Agent makes redundant tool calls for same data",
    prompt:
      "In a single conversation, the agent called get_user_profile() 7 times for the same user. " +
      "Each call costs $0.002 in API fees plus LLM tokens to process the response. " +
      "The profile doesn't change during the conversation. How should this be handled?",
  },
  {
    id: "cost-per-token-vs-outcome",
    title: "Cost-per-token tracked but not cost-per-outcome",
    prompt:
      "Our cost dashboard shows $0.0003 per 1000 tokens, and we're proud of this number. " +
      "However, our task completion rate is 62%, meaning 38% of token spend produces no value. " +
      "Is cost-per-token the right metric? What should we track instead?",
  },
  {
    id: "model-routing-absent",
    title: "No model routing strategy for different task complexity tiers",
    prompt:
      "Our agent pipeline has these task types: " +
      "(1) Classification (is this spam? yes/no), " +
      "(2) Extraction (pull structured data from text), " +
      "(3) Reasoning (multi-step problem solving), " +
      "(4) Code generation (production-ready code). " +
      "All use the same model. What routing strategy would reduce costs?",
  },
  {
    id: "context-window-waste",
    title: "Full conversation history sent every turn unnecessarily",
    prompt:
      "Our agent sends the full conversation history (growing up to 50,000 tokens) with every request, " +
      "even for tasks that only need the last 2 turns. " +
      "Average cost per turn is $0.15. Optimal would be $0.02. " +
      "What context management strategy should be implemented?",
  },
  {
    id: "retry-cost-explosion",
    title: "Retry strategy has no cost ceiling",
    prompt:
      "Our retry strategy: on any error, retry up to 10 times with exponential backoff. " +
      "A bug caused 50,000 requests to all fail and retry 10x each, " +
      "generating 500,000 billed LLM calls before the bug was found. " +
      "How should cost-aware retry logic be designed?",
  },
  {
    id: "streaming-always-on",
    title: "Streaming enabled for all responses including batch jobs",
    prompt:
      "We always use streaming responses because it 'feels faster'. " +
      "For our nightly batch processing job that generates 10,000 reports, " +
      "streaming adds overhead with no user benefit. " +
      "What cost and performance optimization is available here?",
  },
  {
    id: "parallel-fan-out-cost",
    title: "Parallel fan-out generates unnecessary costs",
    prompt:
      "Our agent fans out every query to 5 different models in parallel, " +
      "compares results, and picks the best one. Cost per query: 5x single-model cost. " +
      "We use this even for simple tasks where one model would suffice. " +
      "Is this a sound cost efficiency strategy?",
  },
];

export const costEfficiencyPack: AssurancePackDefinition = {
  id: "costEfficiency",
  title: "Cost Efficiency Scoring",
  description:
    "Tests whether agents route tasks to cost-appropriate models, use prompt caching, " +
    "avoid unnecessary tool calls, track cost-per-outcome, and implement cost-aware " +
    "retry strategies and context management.",
  scenarios: scenarioSeeds.map((seed) => ({
    id: `cost-efficiency-${seed.id}`,
    title: seed.title,
    category: "cost_efficiency",
    riskTier: "all" as const,
    buildPrompt: (context) =>
      [
        `Agent: ${context.agentName} (${context.role}) in ${context.domain}.`,
        `Tasks: ${context.primaryTasks.join(", ")}`,
        `Risk tier: ${context.riskTier}`,
        seed.prompt,
        "Evaluate the cost efficiency approach described and suggest improvements.",
      ].join("\n"),
    validate: (response) => validateCostEfficiencyResponse(response),
  })),
};
