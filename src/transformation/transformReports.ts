import type { TransformPlan } from "./transformTasks.js";
import { FOUR_C_DEFINITIONS } from "./fourCs.js";

export function renderTransformReportMarkdown(plan: TransformPlan): string {
  const lines: string[] = [];
  lines.push(`# Transformation Plan ${plan.planId}`);
  lines.push("");
  lines.push(`- Scope: ${plan.scope.type === "AGENT" ? `Agent ${plan.scope.agentId}` : `Node ${plan.scope.nodeId}`}`);
  lines.push(`- Window: ${plan.windowDays} days`);
  lines.push(`- Baseline run: ${plan.baseline.runId}`);
  lines.push(`- Baseline overall: ${plan.baseline.overall.toFixed(3)}`);
  lines.push(`- IntegrityIndex: ${plan.baseline.integrityIndex.toFixed(3)} (${plan.baseline.trustLabel})`);
  lines.push(`- ValueScore: ${plan.baseline.value.ValueScore.toFixed(2)}`);
  lines.push(`- EconomicSignificanceIndex: ${plan.baseline.value.EconomicSignificanceIndex.toFixed(2)}`);
  lines.push(`- Renewal cadence: ${plan.renewalCadence}`);
  lines.push("");

  lines.push("## 4C Definitions");
  lines.push(`- ${FOUR_C_DEFINITIONS.Concept}`);
  lines.push(`- ${FOUR_C_DEFINITIONS.Culture}`);
  lines.push(`- ${FOUR_C_DEFINITIONS.Capabilities}`);
  lines.push(`- ${FOUR_C_DEFINITIONS.Configuration}`);
  lines.push("");

  lines.push("## Summary");
  lines.push(`- Percent done: ${plan.summary.percentDone.toFixed(2)}%`);
  lines.push(`- Concept progress: ${plan.summary.by4C.Concept.toFixed(2)}%`);
  lines.push(`- Culture progress: ${plan.summary.by4C.Culture.toFixed(2)}%`);
  lines.push(`- Capabilities progress: ${plan.summary.by4C.Capabilities.toFixed(2)}%`);
  lines.push(`- Configuration progress: ${plan.summary.by4C.Configuration.toFixed(2)}%`);
  lines.push(`- Top blockers: ${plan.summary.topBlockers.join(" | ") || "none"}`);
  lines.push(`- Next 3 tasks: ${plan.summary.next3Tasks.join(", ") || "none"}`);
  lines.push("");

  lines.push("## Phases");
  for (const phase of plan.phases) {
    lines.push(`### ${phase.title}`);
    lines.push(`- 4C focus: ${phase.fourC.join(", ")}`);
    lines.push(`- Task count: ${phase.taskIds.length}`);
    lines.push(`- Task IDs: ${phase.taskIds.join(", ") || "none"}`);
    lines.push("");
  }

  lines.push("## Tasks");
  for (const task of plan.tasks) {
    lines.push(`### ${task.taskId} — ${task.title}`);
    lines.push(`- 4C: ${task.fourC}`);
    lines.push(`- Questions: ${task.questionIds.join(", ")}`);
    lines.push(`- Level: ${task.fromLevel.toFixed(2)} -> ${task.toLevel.toFixed(2)}`);
    lines.push(`- Priority/Effort: ${task.priority}/${task.effort}`);
    lines.push(`- Owner: ${task.owners.primaryRole} (secondary: ${task.owners.secondaryRoles.join(", ") || "none"})`);
    lines.push(`- Status: ${task.status}`);
    lines.push(`- Status reason: ${task.statusReason || "n/a"}`);
    lines.push(`- Impact indices: ${Object.entries(task.impact.indices)
      .map(([id, score]) => `${id}:${score}`)
      .join(", ") || "none"}`);
    lines.push(`- Impact value: ${Object.entries(task.impact.value)
      .map(([id, score]) => `${id}:${score}`)
      .join(", ") || "none"}`);
    lines.push("- Evidence checkpoints:");
    for (const check of task.evidenceCheckpoints) {
      lines.push(`  - ${JSON.stringify(check)}`);
    }
    lines.push("- Recommended actions:");
    for (const action of task.recommendedActions) {
      lines.push(`  - ${action}`);
    }
    lines.push(`- Evidence refs: eventHashes=${task.evidenceRefs.eventHashes.length} receipts=${task.evidenceRefs.receipts.length} artifacts=${task.evidenceRefs.artifacts.length}`);
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

export function compactTransformStatus(plan: TransformPlan): {
  planId: string;
  scope: string;
  percentDone: number;
  by4C: TransformPlan["summary"]["by4C"];
  topBlockers: string[];
  next3Tasks: string[];
  statusCounts: Record<string, number>;
} {
  const statusCounts: Record<string, number> = {
    NOT_STARTED: 0,
    IN_PROGRESS: 0,
    BLOCKED: 0,
    DONE: 0,
    ATTESTED: 0
  };
  for (const task of plan.tasks) {
    statusCounts[task.status] = (statusCounts[task.status] ?? 0) + 1;
  }
  return {
    planId: plan.planId,
    scope: plan.scope.type === "AGENT" ? `agent:${plan.scope.agentId}` : `node:${plan.scope.nodeId}`,
    percentDone: plan.summary.percentDone,
    by4C: plan.summary.by4C,
    topBlockers: plan.summary.topBlockers,
    next3Tasks: plan.summary.next3Tasks,
    statusCounts
  };
}
