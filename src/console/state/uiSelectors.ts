import type { ConsoleAgentModel, ConsoleApprovalModel, ConsoleHomeModel } from "./uiModels.js";

export function selectHomeModel(raw: Record<string, unknown>): ConsoleHomeModel {
  return {
    running: !!raw.running,
    vaultLocked: !!raw.vaultLocked,
    agentCount: Number(raw.agentCount ?? 0),
    freezeCount: Number(raw.freezeCount ?? 0)
  };
}

export function selectAgentModel(raw: Record<string, unknown>): ConsoleAgentModel {
  return {
    agentId: String(raw.agentId ?? "unknown"),
    latestRunId: typeof raw.latestRunId === "string" ? raw.latestRunId : null,
    trustLabel: typeof raw.trustLabel === "string" ? raw.trustLabel : null,
    integrityIndex: typeof raw.integrityIndex === "number" ? raw.integrityIndex : null
  };
}

export function selectApprovalModel(raw: Record<string, unknown>): ConsoleApprovalModel {
  return {
    approvalId: String(raw.approvalId ?? ""),
    agentId: String(raw.agentId ?? ""),
    intentId: String(raw.intentId ?? ""),
    actionClass: String(raw.actionClass ?? ""),
    status: String(raw.status ?? "PENDING")
  };
}

