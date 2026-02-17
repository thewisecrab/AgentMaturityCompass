import { readdirSync } from "node:fs";
import { join } from "node:path";
import { verifySignedFileWithAuditor } from "../org/orgSigner.js";
import { openLedger } from "../ledger/ledger.js";
import { latestRunForAgent } from "../governor/actionPolicyEngine.js";
import { latestAssuranceByPack } from "../assurance/assuranceRunner.js";
import { loadLatestTransformPlan, transformPlanSchema, type TransformPlan, type TransformTask, writeSignedTransformPlan, writeSignedTransformSnapshot, summarizeBy4C } from "./transformTasks.js";
import { percentDone, topBlockers, nextTasks } from "./transformScoring.js";
import { findLatestAttestationForTask } from "./transformAttestations.js";
import { resolveAgentId } from "../fleet/paths.js";
import { readUtf8, pathExists } from "../utils/fs.js";
import { computeOrgScorecard } from "../org/orgEngine.js";
import { appendTransparencyEntry } from "../transparency/logChain.js";
import { sha256Hex } from "../utils/hash.js";
import { dispatchIntegrationEvent } from "../integrations/integrationDispatcher.js";

interface CheckResult {
  ok: boolean;
  reason: string;
  eventHashes: string[];
}

function compareTrustTier(current: "SELF_REPORTED" | "ATTESTED" | "OBSERVED" | "OBSERVED_HARDENED", required: string): boolean {
  const rank: Record<string, number> = {
    SELF_REPORTED: 0,
    ATTESTED: 1,
    OBSERVED: 2,
    OBSERVED_HARDENED: 3
  };
  return (rank[current] ?? 0) >= (rank[required] ?? 0);
}

function inferTrustTierFromRun(run: ReturnType<typeof latestRunForAgent>): "SELF_REPORTED" | "ATTESTED" | "OBSERVED" | "OBSERVED_HARDENED" {
  if (!run) {
    return "SELF_REPORTED";
  }
  const observed = run.evidenceTrustCoverage?.observed ?? 0;
  const attested = run.evidenceTrustCoverage?.attested ?? 0;
  if (observed >= 0.85 && run.correlationRatio >= 0.95 && (run.invalidReceiptsCount ?? 0) === 0) {
    return "OBSERVED_HARDENED";
  }
  if (observed >= 0.5) {
    return "OBSERVED";
  }
  if (attested >= 0.5) {
    return "ATTESTED";
  }
  return "SELF_REPORTED";
}

function evaluateCheckpoint(params: {
  workspace: string;
  scope: { type: "AGENT"; agentId: string } | { type: "NODE"; nodeId: string };
  checkpoint: Record<string, unknown>;
  run: ReturnType<typeof latestRunForAgent>;
  events: ReturnType<ReturnType<typeof openLedger>["getEventsBetween"]>;
  assurance: Map<string, { score0to100: number }>;
}): CheckResult {
  const kind = String(params.checkpoint.kind ?? "");
  if (kind === "audit_absent") {
    const deny = Array.isArray(params.checkpoint.auditTypes) ? params.checkpoint.auditTypes.map((value) => String(value)) : [];
    const hits: string[] = [];
    const hitHashes: string[] = [];
    for (const event of params.events) {
      if (event.event_type !== "audit") {
        continue;
      }
      try {
        const meta = JSON.parse(event.meta_json) as Record<string, unknown>;
        const auditType = String(meta.auditType ?? "");
        if (deny.includes(auditType)) {
          hits.push(auditType);
          hitHashes.push(event.event_hash);
        }
      } catch {
        continue;
      }
    }
    if (hits.length > 0) {
      return {
        ok: false,
        reason: `forbidden audits present: ${hits.join(", ")}`,
        eventHashes: hitHashes
      };
    }
    return {
      ok: true,
      reason: "forbidden audits absent",
      eventHashes: []
    };
  }

  if (kind === "assurance_pack_min") {
    const packId = String(params.checkpoint.packId ?? "");
    const minScore = Number(params.checkpoint.minScore ?? 0);
    const row = params.assurance.get(packId);
    if (!row) {
      return {
        ok: false,
        reason: `assurance pack ${packId} missing`,
        eventHashes: []
      };
    }
    if (row.score0to100 < minScore) {
      return {
        ok: false,
        reason: `assurance pack ${packId} score ${row.score0to100.toFixed(2)} < ${minScore.toFixed(2)}`,
        eventHashes: []
      };
    }
    return {
      ok: true,
      reason: `assurance pack ${packId} score ${row.score0to100.toFixed(2)} >= ${minScore.toFixed(2)}`,
      eventHashes: []
    };
  }

  if (kind === "config_signature_valid") {
    const rawPath = String(params.checkpoint.path ?? "");
    const abs = rawPath.startsWith(".amc/") ? join(params.workspace, rawPath) : join(params.workspace, rawPath);
    const verify = verifySignedFileWithAuditor(params.workspace, abs);
    return {
      ok: verify.valid,
      reason: verify.valid ? `${rawPath} signature valid` : `${rawPath} signature invalid (${verify.reason ?? "unknown"})`,
      eventHashes: []
    };
  }

  if (kind === "metric_min") {
    const metric = String(params.checkpoint.metric ?? "");
    const min = Number(params.checkpoint.min ?? 0);
    const value = (() => {
      if (metric === "correlation_ratio") {
        return Number(params.run?.correlationRatio ?? 0);
      }
      if (metric === "integrity_index") {
        return Number(params.run?.integrityIndex ?? 0);
      }
      if (metric === "value_score") {
        const reportDir = params.scope.type === "AGENT"
          ? join(params.workspace, ".amc", "agents", params.scope.agentId, "outcomes", "reports")
          : null;
        if (!reportDir || !pathExists(reportDir)) {
          return 0;
        }
        const files = readdirSync(reportDir).filter((name: string) => name.endsWith(".json")).sort((a: string, b: string) => a.localeCompare(b));
        if (files.length === 0) {
          return 0;
        }
        try {
          const parsed = JSON.parse(readUtf8(join(reportDir, files[files.length - 1]!))) as { valueScore?: number };
          return Number(parsed.valueScore ?? 0);
        } catch {
          return 0;
        }
      }
      return 0;
    })();
    return {
      ok: value >= min,
      reason: `${metric} ${value.toFixed(3)} ${value >= min ? ">=" : "<"} ${min.toFixed(3)}`,
      eventHashes: []
    };
  }

  if (kind === "trust_tier_at_least") {
    const required = String(params.checkpoint.trustTier ?? "SELF_REPORTED");
    const current = inferTrustTierFromRun(params.run);
    const ok = compareTrustTier(current, required);
    return {
      ok,
      reason: `trust tier ${current} ${ok ? ">=" : "<"} ${required}`,
      eventHashes: []
    };
  }

  return {
    ok: false,
    reason: `unknown checkpoint kind: ${kind}`,
    eventHashes: []
  };
}

function recalcPlanSummary(plan: TransformPlan): TransformPlan {
  const tasks = plan.tasks;
  const by4C = summarizeBy4C(tasks);
  const summary = {
    percentDone: percentDone(tasks),
    by4C,
    topBlockers: topBlockers(tasks, 8),
    next3Tasks: nextTasks(tasks, 3)
  };
  return transformPlanSchema.parse({
    ...plan,
    summary
  });
}

export function runTransformTracker(params: {
  workspace: string;
  scope: { type: "AGENT"; agentId: string } | { type: "NODE"; nodeId: string };
  window?: string;
}): {
  before: TransformPlan;
  after: TransformPlan;
  changed: boolean;
  written: {
    planPath: string;
    sigPath: string;
    latestPath: string;
    latestSigPath: string;
  };
  snapshot: {
    path: string;
    sigPath: string;
  };
  missingEvidence: string[];
} {
  const scope = params.scope.type === "AGENT"
    ? { type: "AGENT" as const, agentId: resolveAgentId(params.workspace, params.scope.agentId) }
    : params.scope;
  const before = loadLatestTransformPlan(params.workspace, scope);
  if (!before) {
    throw new Error("No transformation plan found for scope. Generate one with `amc transform plan`.");
  }

  const run = scope.type === "AGENT" ? latestRunForAgent(params.workspace, scope.agentId) : null;
  const windowStartTs = run?.windowStartTs ?? Date.now() - 14 * 86_400_000;
  const windowEndTs = run?.windowEndTs ?? Date.now();

  const ledger = openLedger(params.workspace);
  const events = ledger.getEventsBetween(windowStartTs, windowEndTs);
  ledger.close();

  const assurance = scope.type === "AGENT"
    ? latestAssuranceByPack({
        workspace: params.workspace,
        agentId: scope.agentId,
        windowStartTs,
        windowEndTs
      })
    : new Map<string, { score0to100: number }>();

  const tasks: TransformTask[] = before.tasks.map((task) => {
    const checks = task.evidenceCheckpoints.map((checkpoint) =>
      evaluateCheckpoint({
        workspace: params.workspace,
        scope,
        checkpoint,
        run,
        events,
        assurance
      })
    );
    const failed = checks.filter((check) => !check.ok);
    const passedEventHashes = checks.flatMap((check) => check.eventHashes);

    if (failed.length === 0) {
      return {
        ...task,
        status: "DONE",
        statusReason: "All evidence checkpoints satisfied.",
        evidenceRefs: {
          ...task.evidenceRefs,
          eventHashes: [...new Set([...task.evidenceRefs.eventHashes, ...passedEventHashes])]
        }
      };
    }

    const attestation = findLatestAttestationForTask(params.workspace, scope, task.taskId);
    if (attestation) {
      return {
        ...task,
        status: "ATTESTED",
        statusReason: `Attested by ${attestation.createdByUser} (${attestation.role})`,
        evidenceRefs: {
          ...task.evidenceRefs,
          artifacts: [
            ...task.evidenceRefs.artifacts,
            {
              kind: "attestation",
              sha256: sha256Hex(JSON.stringify(attestation))
            }
          ]
        }
      };
    }

    return {
      ...task,
      status: "BLOCKED",
      statusReason: failed.map((item) => item.reason).join("; "),
      evidenceRefs: {
        ...task.evidenceRefs,
        eventHashes: [...new Set([...task.evidenceRefs.eventHashes, ...passedEventHashes])]
      }
    };
  });

  const after = recalcPlanSummary({
    ...before,
    tasks
  });

  const changed = JSON.stringify(before.tasks.map((task) => ({ id: task.taskId, status: task.status, reason: task.statusReason }))) !==
    JSON.stringify(after.tasks.map((task) => ({ id: task.taskId, status: task.status, reason: task.statusReason })));

  const written = writeSignedTransformPlan(params.workspace, after);
  const snapshot = writeSignedTransformSnapshot(params.workspace, scope, after);

  appendTransparencyEntry({
    workspace: params.workspace,
    type: "TRANSFORM_PLAN_UPDATED",
    agentId: scope.type === "AGENT" ? scope.agentId : `node:${scope.nodeId}`,
    artifact: {
      kind: "policy",
      sha256: sha256Hex(readUtf8(written.planPath)),
      id: after.planId
    }
  });

  const blockedTasks = after.tasks.filter((task) => task.status === "BLOCKED");
  if (blockedTasks.length > 0) {
    void dispatchIntegrationEvent({
      workspace: params.workspace,
      eventName: "TRANSFORM_TASK_BLOCKED",
      agentId: scope.type === "AGENT" ? scope.agentId : `node:${scope.nodeId}`,
      summary: `Transformation tracker found ${blockedTasks.length} blocked tasks`,
      details: {
        scope,
        planId: after.planId,
        blockedTaskIds: blockedTasks.slice(0, 10).map((task) => task.taskId)
      }
    }).catch(() => undefined);
  }

  const doneTasks = after.tasks.filter((task) => task.status === "DONE");
  if (doneTasks.length > 0) {
    void dispatchIntegrationEvent({
      workspace: params.workspace,
      eventName: "TRANSFORM_TASK_DONE",
      agentId: scope.type === "AGENT" ? scope.agentId : `node:${scope.nodeId}`,
      summary: `Transformation tracker reports ${doneTasks.length} done tasks`,
      details: {
        scope,
        planId: after.planId,
        doneTaskIds: doneTasks.slice(0, 10).map((task) => task.taskId)
      }
    }).catch(() => undefined);
  }

  return {
    before,
    after,
    changed,
    written,
    snapshot,
    missingEvidence: blockedTasks.map((task) => `${task.taskId}: ${task.statusReason}`)
  };
}
