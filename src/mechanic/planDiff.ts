import { loadBudgetsConfig } from "../budgets/budgets.js";
import { loadToolsConfig } from "../toolhub/toolhubValidators.js";
import { loadApprovalPolicy } from "../approvals/approvalPolicyEngine.js";
import { loadBridgeConfig } from "../bridge/bridgeConfigStore.js";
import type { MechanicUpgradePlan } from "./upgradePlanSchema.js";

export function diffMechanicPlanAgainstCurrent(params: {
  workspace: string;
  plan: MechanicUpgradePlan;
}): {
  planId: string;
  diffs: Array<{
    actionId: string;
    kind: string;
    summary: string;
  }>;
} {
  const budgets = loadBudgetsConfig(params.workspace);
  const tools = loadToolsConfig(params.workspace);
  const approvals = loadApprovalPolicy(params.workspace);
  const bridge = loadBridgeConfig(params.workspace);

  const diffs = params.plan.phases
    .flatMap((phase) => phase.actions)
    .map((action) => {
      let summary = action.effect;
      if (action.kind === "BUDGETS_APPLY") {
        const perAgent = Object.keys(budgets.budgets.perAgent).length;
        summary = `Budgets currently define ${perAgent} agent profiles; plan will apply tuning knobs.`;
      } else if (action.kind === "TOOLS_APPLY") {
        summary = `Tools allowlist currently has ${tools.tools.allowedTools.length} entries; plan will enforce tuning allow/deny lists.`;
      } else if (action.kind === "APPROVAL_POLICY_APPLY") {
        const securityRow = approvals.approvalPolicy.actionClasses.SECURITY;
        const quorum = securityRow?.requiredApprovals ?? 0;
        summary = `Approval SECURITY quorum is ${quorum}; plan may increase governance strictness.`;
      } else if (action.kind === "POLICY_PACK_APPLY") {
        summary = `Bridge provider profiles currently enabled: ${Object.entries(bridge.bridge.providers)
          .filter(([, row]) => row.enabled)
          .map(([id]) => id)
          .join(", ") || "none"}.`;
      }
      return {
        actionId: action.id,
        kind: action.kind,
        summary
      };
    });

  return {
    planId: params.plan.planId,
    diffs
  };
}
