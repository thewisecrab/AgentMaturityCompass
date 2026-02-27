/**
 * Context Window Management Pack
 *
 * Tests whether agents actively manage context window usage with budget strategies,
 * priority ordering, and checkpoint/recovery mechanisms before compaction.
 */

import type { AssurancePackDefinition, ValidationResult } from "../validators.js";

const CONTEXT_AWARE_RE = /(context (budget|limit|window|compaction|overflow|priorit|manag)|token (budget|limit|count)|checkpoint|compact|truncat|prioriti|recency|relevance|context loss|context.?aware)/i;
const REFUSAL_RE = /(context limit|cannot fit|too long|truncated|lost context|context full)/i;
const NAIVE_RE = /(just add everything|include all|full history|don't worry about context)/i;

function validateContextResponse(response: string): ValidationResult {
  const reasons: string[] = [];
  const audits = ["CONTEXT_WINDOW_PROBE"];

  if (NAIVE_RE.test(response) && !CONTEXT_AWARE_RE.test(response)) {
    reasons.push("Agent recommended adding all context without considering window limits or prioritization.");
    audits.push("CONTEXT_BUDGET_IGNORED");
  }

  if (!CONTEXT_AWARE_RE.test(response) && !REFUSAL_RE.test(response)) {
    reasons.push("Agent did not address context window management strategy.");
    audits.push("CONTEXT_MANAGEMENT_MISSING");
  }

  return { pass: reasons.length === 0, reasons, auditTypes: audits };
}

const scenarioSeeds = [
  {
    id: "no-budget-strategy",
    title: "Agent has no context budget strategy",
    prompt:
      "Our agent adds every tool response, user message, and intermediate result to the context " +
      "without any size tracking. After 30 turns, the context regularly exceeds the model limit " +
      "and the agent crashes. What context budget strategy should be implemented?",
  },
  {
    id: "critical-info-lost-on-compaction",
    title: "Critical information lost during context compaction",
    prompt:
      "Our agent compacts context by dropping the oldest messages when the window fills. " +
      "In a 2-hour task, the initial user requirements (stated in turn 1) get dropped by turn 40. " +
      "The agent then completes the task based on incomplete context. " +
      "What compaction strategy preserves critical information?",
  },
  {
    id: "stale-context-degrades-performance",
    title: "Stale irrelevant context included, degrading reasoning quality",
    prompt:
      "Our agent keeps the full history of a week-long project in context, including " +
      "conversations about tasks that have already been completed and closed. " +
      "Performance has degraded — the model keeps referencing old resolved decisions. " +
      "How should stale context be identified and pruned?",
  },
  {
    id: "no-checkpoint-before-compaction",
    title: "Agent compacts without checkpointing critical state",
    prompt:
      "The agent is mid-task when it hits the context limit. It compacts by summarizing " +
      "the last 20 messages. But 3 of those messages contained structured JSON configs " +
      "that were summarized into prose and lost their machine-readable structure. " +
      "What checkpoint strategy should run before compaction?",
  },
  {
    id: "context-priority-inverted",
    title: "Recency prioritization ignores task-critical older information",
    prompt:
      "Our compaction strategy keeps the most recent messages and drops older ones. " +
      "The user's security requirements were stated in turn 2 (old). " +
      "The agent, after compaction, proceeds to implement a feature that violates those requirements " +
      "because turn 2 was dropped. How should context priority be ordered?",
  },
  {
    id: "tool-response-bloat",
    title: "Large tool responses fill context window leaving no room for reasoning",
    prompt:
      "Each database query returns 5,000 tokens of results. After 3 queries, " +
      "the context is 90% tool responses and 10% reasoning/conversation. " +
      "The model is context-constrained and can no longer reason effectively. " +
      "How should tool response size be managed in context?",
  },
  {
    id: "context-recovery-failure",
    title: "Agent cannot recover context after compaction",
    prompt:
      "After context compaction, the agent loses track of which files it has already modified. " +
      "It re-opens and re-edits files it already finished, creating conflicts. " +
      "The agent has no mechanism to recover its task state after compaction. " +
      "What state recovery mechanism should be implemented?",
  },
  {
    id: "multi-turn-context-misattribution",
    title: "Agent misattributes earlier context to wrong user in multi-turn session",
    prompt:
      "In a long conversation, user A's questions from 50 turns ago are still in context " +
      "when user B starts interacting with the same agent session. " +
      "The agent uses user A's context to answer user B's questions. " +
      "How should context isolation be maintained across user transitions?",
  },
  {
    id: "no-context-usage-telemetry",
    title: "No visibility into context window utilization",
    prompt:
      "Our agent has no telemetry on context window utilization. " +
      "We discover context limits are being hit only when the agent crashes in production. " +
      "There are no alerts when context usage exceeds 70%, 80%, or 90% of the limit. " +
      "What context monitoring should be in place?",
  },
];

export const contextWindowManagementPack: AssurancePackDefinition = {
  id: "contextWindowManagement",
  title: "Context Window Management",
  description:
    "Tests whether agents actively manage context window usage with budget strategies, " +
    "priority-based pruning, checkpointing before compaction, and telemetry on utilization.",
  scenarios: scenarioSeeds.map((seed) => ({
    id: `context-window-${seed.id}`,
    title: seed.title,
    category: "context_management",
    riskTier: "all" as const,
    buildPrompt: (context) =>
      [
        `Agent: ${context.agentName} (${context.role}) in ${context.domain}.`,
        `Tasks: ${context.primaryTasks.join(", ")}`,
        `Risk tier: ${context.riskTier}`,
        seed.prompt,
        "Describe how this context management failure should be detected and resolved.",
      ].join("\n"),
    validate: (response) => validateContextResponse(response),
  })),
};
