import type { ActionClass, RiskTier, TargetProfile } from "../types.js";
import { ACTION_CLASSES } from "./actionCatalog.js";
import {
  evaluateActionPermission,
  type GovernorAssuranceSummary,
  type GovernorTrustSummary
} from "./actionPolicyEngine.js";
import type { ActionPolicy } from "./actionPolicySchema.js";
import type { DiagnosticReport } from "../types.js";

export interface GovernorMatrixRow {
  actionClass: ActionClass;
  simulateAllowed: boolean;
  executeAllowed: boolean;
  reasons: string[];
}

export interface GovernorMatrix {
  rows: GovernorMatrixRow[];
  autonomyAllowanceIndex: number;
}

export function buildGovernorMatrix(params: {
  policy: ActionPolicy;
  agentId: string;
  riskTier: RiskTier;
  run: DiagnosticReport | null;
  targetProfile: TargetProfile | null;
  trust: GovernorTrustSummary;
  assurance: GovernorAssuranceSummary;
  budget: {
    ok: boolean;
    reasons: string[];
    exceededActionClasses: ActionClass[];
    budgetConfigValid: boolean;
  };
  freeze: {
    active: boolean;
    actionClasses: ActionClass[];
  };
  policySignatureValid: boolean;
}): GovernorMatrix {
  const rows: GovernorMatrixRow[] = [];
  let executeAllowedCount = 0;

  for (const actionClass of ACTION_CLASSES) {
    const simulate = evaluateActionPermission({
      agentId: params.agentId,
      actionClass,
      riskTier: params.riskTier,
      currentDiagnosticRun: params.run,
      targetProfile: params.targetProfile,
      trustSummary: params.trust,
      assuranceSummary: params.assurance,
      requestedMode: "SIMULATE",
      freezeStatus: params.freeze,
      budgetStatus: params.budget,
      policy: params.policy,
      policySignatureValid: params.policySignatureValid
    });
    const execute = evaluateActionPermission({
      agentId: params.agentId,
      actionClass,
      riskTier: params.riskTier,
      currentDiagnosticRun: params.run,
      targetProfile: params.targetProfile,
      trustSummary: params.trust,
      assuranceSummary: params.assurance,
      requestedMode: "EXECUTE",
      freezeStatus: params.freeze,
      budgetStatus: params.budget,
      policy: params.policy,
      policySignatureValid: params.policySignatureValid
    });
    const executeAllowed = execute.allowed && execute.effectiveMode === "EXECUTE";
    if (executeAllowed) {
      executeAllowedCount += 1;
    }
    rows.push({
      actionClass,
      simulateAllowed: simulate.allowed,
      executeAllowed,
      reasons: execute.reasons
    });
  }

  const autonomyAllowanceIndex = Math.round((executeAllowedCount / Math.max(1, ACTION_CLASSES.length)) * 100);
  return {
    rows,
    autonomyAllowanceIndex
  };
}

export function renderGovernorMatrixMarkdown(matrix: GovernorMatrix): string {
  const lines = [
    "| ActionClass | SIMULATE | EXECUTE | Notes |",
    "|---|---|---|---|"
  ];
  for (const row of matrix.rows) {
    lines.push(
      `| ${row.actionClass} | ${row.simulateAllowed ? "yes" : "no"} | ${row.executeAllowed ? "yes" : "no"} | ${(row.reasons[0] ?? "").replace(/\|/g, "\\|")} |`
    );
  }
  lines.push("");
  lines.push(`AutonomyAllowanceIndex: ${matrix.autonomyAllowanceIndex}`);
  return lines.join("\n");
}
