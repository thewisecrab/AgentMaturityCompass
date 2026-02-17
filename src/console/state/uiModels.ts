export interface ConsoleHomeModel {
  running: boolean;
  vaultLocked: boolean;
  agentCount: number;
  freezeCount: number;
}

export interface ConsoleAgentModel {
  agentId: string;
  latestRunId: string | null;
  trustLabel: string | null;
  integrityIndex: number | null;
}

export interface ConsoleApprovalModel {
  approvalId: string;
  agentId: string;
  intentId: string;
  actionClass: string;
  status: string;
}

