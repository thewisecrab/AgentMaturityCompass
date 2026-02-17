import {
  loadAssurancePolicy,
  loadAssuranceSchedulerState,
  saveAssuranceSchedulerState,
  verifyAssurancePolicySignature,
  verifyAssuranceSchedulerSignature
} from "./assurancePolicyStore.js";
import { runAssuranceLab } from "./assuranceEngine.js";
import { issueAssuranceCertificate } from "./assuranceCertificates.js";
import type { AssuranceScopeType, AssurancePackId } from "./assuranceSchema.js";
import type { AssuranceSchedulerState, AssuranceStatus } from "./assuranceSchema.js";

function nextRunTs(nowTs: number, defaultRunHours: number): number {
  const hours = Math.max(1, defaultRunHours);
  return nowTs + hours * 60 * 60 * 1000;
}

function toSchedulerCertStatus(status: AssuranceStatus, pass: boolean): AssuranceSchedulerState["lastCertStatus"] {
  if (status === "INSUFFICIENT_EVIDENCE") {
    return "INSUFFICIENT_EVIDENCE";
  }
  if (status === "PASS") {
    return "PASS";
  }
  if (status === "FAIL") {
    return "FAIL";
  }
  return pass ? "PASS" : "FAIL";
}

export function assuranceSchedulerStatus(workspace: string) {
  return {
    state: loadAssuranceSchedulerState(workspace),
    signature: verifyAssuranceSchedulerSignature(workspace)
  };
}

export function assuranceSchedulerSetEnabled(params: {
  workspace: string;
  enabled: boolean;
}) {
  const current = loadAssuranceSchedulerState(params.workspace);
  const next = {
    ...current,
    enabled: params.enabled
  };
  const saved = saveAssuranceSchedulerState(params.workspace, next);
  return {
    state: next,
    ...saved
  };
}

export async function assuranceSchedulerRunNow(params: {
  workspace: string;
  scopeType?: AssuranceScopeType;
  scopeId?: string;
  selectedPack?: AssurancePackId | "all";
}) {
  const policySig = verifyAssurancePolicySignature(params.workspace);
  if (!policySig.valid) {
    throw new Error(`assurance policy signature invalid: ${policySig.reason ?? "unknown"}`);
  }
  const currentState = loadAssuranceSchedulerState(params.workspace);
  const policy = loadAssurancePolicy(params.workspace);
  const run = await runAssuranceLab({
    workspace: params.workspace,
    scopeType: params.scopeType ?? "WORKSPACE",
    scopeId: params.scopeId,
    selectedPack: params.selectedPack ?? "all"
  });

  let cert:
    | Awaited<ReturnType<typeof issueAssuranceCertificate>>
    | null = null;
  if (run.run.score.status !== "INSUFFICIENT_EVIDENCE") {
    try {
      cert = await issueAssuranceCertificate({
        workspace: params.workspace,
        runId: run.run.runId
      });
    } catch {
      cert = null;
    }
  }

  const nowTs = Date.now();
  const next = {
    enabled: currentState.enabled,
    lastRunTs: nowTs,
    nextRunTs: nextRunTs(nowTs, policy.assurancePolicy.cadence.defaultRunHours),
    lastOutcome: {
      status: "OK" as const,
      reason: ""
    },
    lastCertStatus: toSchedulerCertStatus(run.run.score.status, run.run.score.pass)
  };
  saveAssuranceSchedulerState(params.workspace, next);

  return {
    run,
    cert,
    scheduler: next
  };
}

export async function assuranceSchedulerTick(params: {
  workspace: string;
  workspaceReady: boolean;
  eventType?: string;
}): Promise<
  | { ran: false; reason: "disabled" | "workspace_not_ready" | "policy_untrusted" | "not_due" }
  | { ran: true; runId: string; certIssued: boolean }
> {
  const state = loadAssuranceSchedulerState(params.workspace);
  if (!state.enabled) {
    return { ran: false, reason: "disabled" };
  }
  if (!params.workspaceReady) {
    const next = {
      ...state,
      lastOutcome: {
        status: "SKIPPED" as const,
        reason: "workspace not ready"
      }
    };
    saveAssuranceSchedulerState(params.workspace, next);
    return { ran: false, reason: "workspace_not_ready" };
  }

  const policySig = verifyAssurancePolicySignature(params.workspace);
  if (!policySig.valid) {
    const next = {
      ...state,
      lastOutcome: {
        status: "ERROR" as const,
        reason: `assurance policy invalid: ${policySig.reason ?? "unknown"}`
      }
    };
    saveAssuranceSchedulerState(params.workspace, next);
    return { ran: false, reason: "policy_untrusted" };
  }

  const policy = loadAssurancePolicy(params.workspace);
  const nowTs = Date.now();
  const eventTriggered = Boolean(params.eventType && policy.assurancePolicy.cadence.runAfterEvents.includes(params.eventType as never));
  const due = !state.nextRunTs || state.nextRunTs <= nowTs;
  if (!eventTriggered && !due) {
    return { ran: false, reason: "not_due" };
  }

  const result = await assuranceSchedulerRunNow({
    workspace: params.workspace,
    scopeType: "WORKSPACE",
    selectedPack: "all"
  });
  return {
    ran: true,
    runId: result.run.run.runId,
    certIssued: Boolean(result.cert)
  };
}
