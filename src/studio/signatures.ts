import { randomUUID } from "node:crypto";
import { verifyGatewayConfigSignature, signGatewayConfig } from "../gateway/config.js";
import { signActionPolicy, verifyActionPolicySignature } from "../governor/actionPolicyEngine.js";
import { signToolsConfig, verifyToolsConfigSignature } from "../toolhub/toolhubValidators.js";
import {
  resolveAgentId
} from "../fleet/paths.js";
import {
  signAgentConfig,
  signFleetConfig,
  verifyAgentConfigSignature,
  verifyFleetConfigSignature
} from "../fleet/registry.js";
import { openLedger } from "../ledger/ledger.js";
import { sha256Hex } from "../utils/hash.js";

export interface SignatureStatusRow {
  kind: "gateway" | "fleet" | "agent" | "action-policy" | "tools";
  valid: boolean;
  reason: string | null;
  path: string;
  sigPath: string;
}

export interface FixSignaturesResult {
  agentId: string;
  statuses: SignatureStatusRow[];
  resigned: Array<{ kind: "gateway" | "fleet" | "agent" | "action-policy" | "tools"; sigPath: string }>;
  auditEventId: string | null;
}

export function inspectSignatures(workspace: string, agentId?: string): FixSignaturesResult {
  const resolvedAgentId = resolveAgentId(workspace, agentId);
  const gateway = verifyGatewayConfigSignature(workspace);
  const actionPolicy = verifyActionPolicySignature(workspace);
  const tools = verifyToolsConfigSignature(workspace);
  const fleet = verifyFleetConfigSignature(workspace);
  const agent = verifyAgentConfigSignature(workspace, resolvedAgentId);
  return {
    agentId: resolvedAgentId,
    statuses: [
      {
        kind: "gateway",
        valid: gateway.valid,
        reason: gateway.reason,
        path: gateway.configPath,
        sigPath: gateway.sigPath
      },
      {
        kind: "action-policy",
        valid: actionPolicy.valid,
        reason: actionPolicy.reason,
        path: actionPolicy.path,
        sigPath: actionPolicy.sigPath
      },
      {
        kind: "tools",
        valid: tools.valid,
        reason: tools.reason,
        path: tools.path,
        sigPath: tools.sigPath
      },
      {
        kind: "fleet",
        valid: fleet.valid,
        reason: fleet.reason,
        path: fleet.path,
        sigPath: fleet.sigPath
      },
      {
        kind: "agent",
        valid: agent.valid,
        reason: agent.reason,
        path: agent.configPath,
        sigPath: agent.sigPath
      }
    ],
    resigned: [],
    auditEventId: null
  };
}

export function fixSignatures(workspace: string, agentId?: string): FixSignaturesResult {
  const inspected = inspectSignatures(workspace, agentId);
  const resigned: Array<{ kind: "gateway" | "fleet" | "agent" | "action-policy" | "tools"; sigPath: string }> = [];

  for (const row of inspected.statuses) {
    if (row.valid) {
      continue;
    }
    if (row.kind === "gateway") {
      resigned.push({ kind: "gateway", sigPath: signGatewayConfig(workspace) });
    } else if (row.kind === "action-policy") {
      resigned.push({ kind: "action-policy", sigPath: signActionPolicy(workspace) });
    } else if (row.kind === "tools") {
      resigned.push({ kind: "tools", sigPath: signToolsConfig(workspace) });
    } else if (row.kind === "fleet") {
      resigned.push({ kind: "fleet", sigPath: signFleetConfig(workspace).sigPath });
    } else {
      resigned.push({ kind: "agent", sigPath: signAgentConfig(workspace, inspected.agentId).sigPath });
    }
  }

  let auditEventId: string | null = null;
  if (resigned.length > 0) {
    const ledger = openLedger(workspace);
    const sessionId = randomUUID();
    const payload = JSON.stringify({
      auditType: "CONFIG_RESIGNED",
      severity: "LOW",
      agentId: inspected.agentId,
      resigned,
      ts: Date.now()
    });
    try {
      ledger.startSession({
        sessionId,
        runtime: "unknown",
        binaryPath: "amc-fix-signatures",
        binarySha256: sha256Hex("amc-fix-signatures")
      });
      const appended = ledger.appendEvidenceWithReceipt({
        sessionId,
        runtime: "unknown",
        eventType: "audit",
        payload,
        payloadExt: "json",
        inline: true,
        meta: {
          auditType: "CONFIG_RESIGNED",
          severity: "LOW",
          agentId: inspected.agentId,
          resigned,
          trustTier: "OBSERVED"
        },
        receipt: {
          kind: "guard_check",
          agentId: inspected.agentId,
          providerId: "unknown",
          model: null,
          bodySha256: sha256Hex(Buffer.from(payload, "utf8"))
        }
      });
      auditEventId = appended.id;
      ledger.sealSession(sessionId);
    } finally {
      ledger.close();
    }
  }

  const refreshed = inspectSignatures(workspace, inspected.agentId);
  return {
    ...refreshed,
    resigned,
    auditEventId
  };
}
