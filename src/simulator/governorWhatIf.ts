import { ACTION_CLASSES } from "../governor/actionCatalog.js";
import {
  defaultActionPolicy,
  evaluateActionPermission,
  loadActionPolicy,
  type GovernorAssuranceSummary,
  type GovernorTrustSummary
} from "../governor/actionPolicyEngine.js";
import { buildGovernorMatrix } from "../governor/governorReport.js";
import type { ActionClass, DiagnosticReport, RiskTier, TargetProfile } from "../types.js";
import { evaluateBudgetStatus } from "../budgets/budgets.js";
import { activeFreezeStatus } from "../drift/freezeEngine.js";

export interface GovernorWhatIfMatrixCell {
  actionClass: ActionClass;
  riskTier: RiskTier;
  simulateAllowed: boolean;
  executeAllowed: boolean;
  executeReasons: string[];
}

export function predictGovernorPermissions(params: {
  workspace: string;
  agentId: string;
  run: DiagnosticReport | null;
  targetProfile: TargetProfile | null;
  trust: GovernorTrustSummary;
  assurance: GovernorAssuranceSummary;
  policySignatureValid: boolean;
}): {
  matrix: GovernorWhatIfMatrixCell[];
  autonomyAllowanceIndex: number;
} {
  let policySignatureValid = params.policySignatureValid;
  const policy = (() => {
    try {
      return loadActionPolicy(params.workspace);
    } catch {
      policySignatureValid = false;
      return defaultActionPolicy();
    }
  })();
  const riskTiers: RiskTier[] = ["low", "med", "high", "critical"];
  const matrix: GovernorWhatIfMatrixCell[] = [];

  for (const actionClassRaw of ACTION_CLASSES) {
    const actionClass = actionClassRaw as ActionClass;
    for (const riskTier of riskTiers) {
      const simulate = evaluateActionPermission({
        agentId: params.agentId,
        actionClass,
        riskTier,
        currentDiagnosticRun: params.run,
        targetProfile: params.targetProfile,
        trustSummary: params.trust,
        assuranceSummary: params.assurance,
        requestedMode: "SIMULATE",
        hasExecTicket: false,
        policy,
        policySignatureValid,
        budgetStatus: evaluateBudgetStatus(params.workspace, params.agentId),
        freezeStatus: activeFreezeStatus(params.workspace, params.agentId)
      });
      const execute = evaluateActionPermission({
        agentId: params.agentId,
        actionClass,
        riskTier,
        currentDiagnosticRun: params.run,
        targetProfile: params.targetProfile,
        trustSummary: params.trust,
        assuranceSummary: params.assurance,
        requestedMode: "EXECUTE",
        hasExecTicket: true,
        policy,
        policySignatureValid,
        budgetStatus: evaluateBudgetStatus(params.workspace, params.agentId),
        freezeStatus: activeFreezeStatus(params.workspace, params.agentId)
      });
      matrix.push({
        actionClass,
        riskTier,
        simulateAllowed: simulate.allowed,
        executeAllowed: execute.allowed && execute.effectiveMode === "EXECUTE",
        executeReasons: execute.reasons
      });
    }
  }

  const baseRun = params.run ?? ({
    questionScores: [],
    layerScores: []
  } as unknown as DiagnosticReport);
  const matrixSummary = buildGovernorMatrix({
    policy,
    agentId: params.agentId,
    riskTier: "med",
    run: baseRun,
    targetProfile: params.targetProfile,
    trust: params.trust,
    assurance: params.assurance,
    policySignatureValid,
    budget: evaluateBudgetStatus(params.workspace, params.agentId),
    freeze: activeFreezeStatus(params.workspace, params.agentId)
  });

  return {
    matrix,
    autonomyAllowanceIndex: matrixSummary.autonomyAllowanceIndex
  };
}
