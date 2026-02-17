import { randomUUID } from "node:crypto";
import { readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { createApprovalForIntent, consumeApprovedExecution, verifyApprovalForExecution } from "../approvals/approvalEngine.js";
import { listApprovalDecisions } from "../approvals/approvalChainStore.js";
import { appendTransparencyEntry } from "../transparency/logChain.js";
import { ensureDir, pathExists, readUtf8, writeFileAtomic } from "../utils/fs.js";
import { sha256Hex } from "../utils/hash.js";
import { defaultAssurancePolicy, assurancePolicySchema } from "./assurancePolicySchema.js";
import {
  activeAssuranceWaiver,
  assurancePolicyPath,
  assuranceWaiversDir,
  initAssurancePolicy,
  latestAssuranceWaiver,
  listAssuranceWaivers,
  loadAssuranceFindings,
  loadAssurancePolicy,
  loadAssuranceRun,
  loadAssuranceTraceRefs,
  saveAssurancePolicy,
  saveAssuranceWaiver,
  verifyAssurancePolicySignature
} from "./assurancePolicyStore.js";
import { runAssuranceLab } from "./assuranceEngine.js";
import { issueAssuranceCertificate, inspectAssuranceCertificate } from "./assuranceCertificates.js";
import { latestAssuranceCertificateSummary, latestAssuranceRun, listAssuranceRuns } from "./assuranceStore.js";
import {
  assuranceSchedulerRunNow,
  assuranceSchedulerSetEnabled,
  assuranceSchedulerStatus
} from "./assuranceScheduler.js";
import { assuranceWaiverSchema } from "./assuranceSchema.js";
import { evaluateAssuranceEvidenceGates } from "./assuranceScoring.js";

const pendingWaiverSchema = z.object({
  v: z.literal(1),
  requestId: z.string().min(1),
  approvalRequestId: z.string().min(1),
  intentId: z.string().min(1),
  agentId: z.string().min(1),
  reason: z.string().min(1),
  hours: z.number().int().min(1).max(72),
  policySha256: z.string().length(64),
  lastCertSha256: z.string().length(64),
  createdTs: z.number().int()
});

function pendingWaiversDir(workspace: string): string {
  return join(assuranceWaiversDir(workspace), "pending");
}

function pendingWaiverPath(workspace: string, approvalRequestId: string): string {
  return join(pendingWaiversDir(workspace), `${approvalRequestId}.json`);
}

function savePendingWaiver(workspace: string, pending: z.infer<typeof pendingWaiverSchema>): string {
  ensureDir(pendingWaiversDir(workspace));
  const path = pendingWaiverPath(workspace, pending.approvalRequestId);
  writeFileAtomic(path, JSON.stringify(pendingWaiverSchema.parse(pending), null, 2), 0o600);
  return path;
}

function loadPendingWaiver(workspace: string, approvalRequestId: string): z.infer<typeof pendingWaiverSchema> {
  const path = pendingWaiverPath(workspace, approvalRequestId);
  if (!pathExists(path)) {
    throw new Error(`pending waiver not found: ${approvalRequestId}`);
  }
  return pendingWaiverSchema.parse(JSON.parse(readUtf8(path)) as unknown);
}

function removePendingWaiver(workspace: string, approvalRequestId: string): void {
  const path = pendingWaiverPath(workspace, approvalRequestId);
  if (pathExists(path)) {
    rmSync(path, { force: true });
  }
}

function listPendingWaivers(workspace: string): z.infer<typeof pendingWaiverSchema>[] {
  const dir = pendingWaiversDir(workspace);
  if (!pathExists(dir)) {
    return [];
  }
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort((a, b) => b.localeCompare(a))
    .map((name) => pendingWaiverSchema.parse(JSON.parse(readUtf8(join(dir, name))) as unknown));
}

function activateApprovedWaiver(workspace: string, pending: z.infer<typeof pendingWaiverSchema>, nowTs = Date.now()): AssuranceWaiver | null {
  const approval = verifyApprovalForExecution({
    workspace,
    approvalId: pending.approvalRequestId,
    expectedAgentId: pending.agentId,
    expectedIntentId: pending.intentId,
    expectedToolName: "assurance.waiver",
    expectedActionClass: "SECURITY"
  });
  if (!approval.ok) {
    return null;
  }

  const decisions = listApprovalDecisions({
    workspace,
    agentId: pending.agentId,
    approvalRequestId: pending.approvalRequestId
  }).filter((row) => row.decision === "APPROVE_EXECUTE" || row.decision === "APPROVE_SIMULATE");

  const ownerDecision = decisions.find((row) => row.roles.includes("OWNER"));
  const auditorDecision = decisions.find((row) => row.roles.includes("AUDITOR"));
  if (!ownerDecision || !auditorDecision) {
    return null;
  }

  const waiver = assuranceWaiverSchema.parse({
    v: 1,
    waiverId: `wvr_${randomUUID().replace(/-/g, "")}`,
    createdTs: nowTs,
    expiresTs: nowTs + pending.hours * 60 * 60 * 1000,
    reason: pending.reason,
    scope: {
      type: "WORKSPACE",
      id: "workspace"
    },
    allowReadyDespiteAssuranceFail: true,
    approvedBy: [
      {
        userIdHash: sha256Hex(ownerDecision.userId).slice(0, 16),
        role: "OWNER",
        approvalEventHash: sha256Hex(ownerDecision.approvalDecisionId)
      },
      {
        userIdHash: sha256Hex(auditorDecision.userId).slice(0, 16),
        role: "AUDITOR",
        approvalEventHash: sha256Hex(auditorDecision.approvalDecisionId)
      }
    ],
    bindings: {
      lastCertSha256: pending.lastCertSha256,
      policySha256: pending.policySha256
    }
  });

  saveAssuranceWaiver(workspace, waiver);
  consumeApprovedExecution({
    workspace,
    approvalId: pending.approvalRequestId,
    expectedAgentId: pending.agentId,
    executionId: pending.requestId
  });
  removePendingWaiver(workspace, pending.approvalRequestId);
  appendTransparencyEntry({
    workspace,
    type: "ASSURANCE_WAIVER_ACTIVE",
    agentId: "workspace",
    artifact: {
      kind: "approval",
      sha256: sha256Hex(Buffer.from(JSON.stringify(waiver), "utf8")),
      id: waiver.waiverId
    }
  });
  return waiver;
}

function maybeActivatePendingWaivers(workspace: string): AssuranceWaiver[] {
  const activated: AssuranceWaiver[] = [];
  for (const pending of listPendingWaivers(workspace)) {
    const waiver = activateApprovedWaiver(workspace, pending);
    if (waiver) {
      activated.push(waiver);
    }
  }
  return activated;
}

export function assuranceInitForApi(workspace: string) {
  return initAssurancePolicy(workspace);
}

export function assurancePolicyForApi(workspace: string) {
  return {
    policy: loadAssurancePolicy(workspace),
    signature: verifyAssurancePolicySignature(workspace)
  };
}

export function assurancePolicyApplyForApi(params: {
  workspace: string;
  policy: unknown;
}) {
  const parsed = assurancePolicySchema.parse(params.policy);
  const saved = saveAssurancePolicy(params.workspace, parsed);
  appendTransparencyEntry({
    workspace: params.workspace,
    type: "ASSURANCE_POLICY_APPLIED",
    agentId: "workspace",
    artifact: {
      kind: "policy",
      sha256: sha256Hex(Buffer.from(JSON.stringify(parsed), "utf8")),
      id: "assurance-policy"
    }
  });
  return saved;
}

export async function assuranceRunForApi(params: {
  workspace: string;
  scopeType: "WORKSPACE" | "NODE" | "AGENT";
  scopeId?: string;
  pack?: "all" | "injection" | "exfiltration" | "toolMisuse" | "truthfulness" | "sandboxBoundary" | "notaryAttestation";
  windowDays?: number;
}) {
  const out = await runAssuranceLab({
    workspace: params.workspace,
    scopeType: params.scopeType,
    scopeId: params.scopeId,
    selectedPack: params.pack ?? "all",
    windowDays: params.windowDays
  });
  return {
    run: out.run,
    findings: out.findings,
    traceRefs: out.traceRefs,
    saved: out.saved,
    transparency: out.transparency
  };
}

export function assuranceRunsForApi(workspace: string) {
  return listAssuranceRuns(workspace).map((run) => ({
    runId: run.runId,
    generatedTs: run.generatedTs,
    scope: run.scope,
    status: run.score.status,
    pass: run.score.pass,
    score: run.score.riskAssuranceScore,
    findingCounts: run.score.findingCounts
  }));
}

export function assuranceRunDetailForApi(params: {
  workspace: string;
  runId: string;
}) {
  return {
    run: loadAssuranceRun(params.workspace, params.runId),
    findings: loadAssuranceFindings(params.workspace, params.runId),
    traceRefs: loadAssuranceTraceRefs(params.workspace, params.runId)
  };
}

export async function assuranceCertIssueForApi(params: {
  workspace: string;
  runId: string;
  outFile?: string;
}) {
  return issueAssuranceCertificate(params);
}

export function assuranceCertLatestForApi(workspace: string) {
  const latest = latestAssuranceCertificateSummary(workspace);
  return {
    latest,
    waiver: activeAssuranceWaiver(workspace)
  };
}

export function assuranceCertVerifyForApi(params: {
  file: string;
}) {
  return inspectAssuranceCertificate(params.file);
}

export function assuranceReadinessGate(workspace: string): {
  ok: boolean;
  reasons: string[];
  warnings: string[];
  latestRunId: string | null;
  latestStatus: "PASS" | "FAIL" | "INSUFFICIENT_EVIDENCE" | "ERROR" | null;
  waiver: AssuranceWaiver | null;
} {
  maybeActivatePendingWaivers(workspace);
  const reasons: string[] = [];
  const warnings: string[] = [];

  const sig = verifyAssurancePolicySignature(workspace);
  if (!sig.valid) {
    return {
      ok: false,
      reasons: [`ASSURANCE_POLICY_UNTRUSTED:${sig.reason ?? "unknown"}`],
      warnings,
      latestRunId: null,
      latestStatus: null,
      waiver: null
    };
  }

  const policy = loadAssurancePolicy(workspace);
  const latest = latestAssuranceRun(workspace);
  const waiver = activeAssuranceWaiver(workspace);

  if (latest && policy.assurancePolicy.thresholds.failClosedIfBelowThresholds) {
    const evidence = evaluateAssuranceEvidenceGates({
      policy,
      gates: latest.evidenceGates
    });
    const blocked = !evidence.ok || latest.score.status === "FAIL" || latest.score.status === "INSUFFICIENT_EVIDENCE";
    if (blocked && !waiver) {
      reasons.push("ASSURANCE_THRESHOLD_BREACH");
    }
    if (blocked && waiver) {
      warnings.push(`ASSURANCE_WAIVER_ACTIVE:${waiver.waiverId}`);
    }
  }

  const latestCert = latestAssuranceCertificateSummary(workspace);
  if (latestCert && !latestCert.verify.ok) {
    reasons.push("ASSURANCE_CERT_INVALID");
  }

  return {
    ok: reasons.length === 0,
    reasons,
    warnings,
    latestRunId: latest?.runId ?? null,
    latestStatus: latest?.score.status ?? null,
    waiver
  };
}

export function assuranceWaiverRequestForApi(params: {
  workspace: string;
  agentId: string;
  reason: string;
  hours: number;
}) {
  const policySig = verifyAssurancePolicySignature(params.workspace);
  if (!policySig.valid) {
    throw new Error(`assurance policy signature invalid: ${policySig.reason ?? "unknown"}`);
  }
  const hours = Math.max(1, Math.min(72, Math.trunc(params.hours)));
  const requestId = `wvrreq_${randomUUID().replace(/-/g, "")}`;
  const intentId = `assurance-waiver-${requestId}`;
  const policySha = sha256Hex(Buffer.from(readUtf8(assurancePolicyPath(params.workspace)), "utf8"));
  const latestCert = latestAssuranceCertificateSummary(params.workspace);
  const lastCertSha256 = latestCert?.sha256 ?? "0".repeat(64);

  const approval = createApprovalForIntent({
    workspace: params.workspace,
    agentId: params.agentId,
    intentId,
    toolName: "assurance.waiver",
    actionClass: "SECURITY",
    requestedMode: "EXECUTE",
    effectiveMode: "EXECUTE",
    riskTier: "high",
    intentPayload: {
      requestId,
      hours,
      reason: params.reason,
      policySha256: policySha,
      lastCertSha256
    },
    leaseConstraints: {
      scopes: [],
      routeAllowlist: [],
      modelAllowlist: []
    }
  });

  savePendingWaiver(
    params.workspace,
    pendingWaiverSchema.parse({
      v: 1,
      requestId,
      approvalRequestId: approval.approval.approvalRequestId,
      intentId,
      agentId: params.agentId,
      reason: params.reason,
      hours,
      policySha256: policySha,
      lastCertSha256,
      createdTs: Date.now()
    })
  );

  appendTransparencyEntry({
    workspace: params.workspace,
    type: "ASSURANCE_WAIVER_REQUESTED",
    agentId: params.agentId,
    artifact: {
      kind: "approval",
      sha256: sha256Hex(Buffer.from(`${requestId}:${hours}`, "utf8")),
      id: requestId
    }
  });

  return {
    requestId,
    approvalRequestId: approval.approval.approvalRequestId,
    intentId,
    hours
  };
}

export function assuranceWaiverStatusForApi(workspace: string) {
  const activated = maybeActivatePendingWaivers(workspace);
  const active = activeAssuranceWaiver(workspace);
  return {
    active,
    latest: latestAssuranceWaiver(workspace),
    waivers: listAssuranceWaivers(workspace),
    pending: listPendingWaivers(workspace),
    activated
  };
}

export function assuranceWaiverRevokeForApi(params: {
  workspace: string;
  waiverId?: string;
}) {
  const waivers = listAssuranceWaivers(params.workspace);
  const waiver = params.waiverId
    ? waivers.find((row) => row.waiverId === params.waiverId) ?? null
    : activeAssuranceWaiver(params.workspace);
  if (!waiver) {
    return {
      revoked: false,
      reason: "waiver not found"
    };
  }
  const path = join(assuranceWaiversDir(params.workspace), `waiver_${waiver.createdTs}.json`);
  if (pathExists(path)) {
    rmSync(path, { force: true });
  }
  appendTransparencyEntry({
    workspace: params.workspace,
    type: "ASSURANCE_WAIVER_REVOKED",
    agentId: "workspace",
    artifact: {
      kind: "approval",
      sha256: sha256Hex(Buffer.from(waiver.waiverId, "utf8")),
      id: waiver.waiverId
    }
  });
  return {
    revoked: true,
    waiverId: waiver.waiverId
  };
}

export function assuranceSchedulerStatusForApi(workspace: string) {
  return assuranceSchedulerStatus(workspace);
}

export async function assuranceSchedulerRunNowForApi(params: {
  workspace: string;
}) {
  return assuranceSchedulerRunNow({
    workspace: params.workspace,
    scopeType: "WORKSPACE",
    selectedPack: "all"
  });
}

export function assuranceSchedulerEnableForApi(params: {
  workspace: string;
  enabled: boolean;
}) {
  return assuranceSchedulerSetEnabled(params);
}

export function assuranceDefaultPolicyForApi() {
  return defaultAssurancePolicy();
}

type AssuranceWaiver = z.infer<typeof assuranceWaiverSchema>;
