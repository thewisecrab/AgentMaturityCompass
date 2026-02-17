import { randomUUID } from "node:crypto";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { latestAssuranceByPack } from "../assurance/assuranceRunner.js";
import { openLedger } from "../ledger/ledger.js";
import type { ActionClass, DiagnosticReport } from "../types.js";
import { getAgentPaths, resolveAgentId } from "../fleet/paths.js";
import { pathExists, readUtf8, writeFileAtomic } from "../utils/fs.js";
import { sha256Hex } from "../utils/hash.js";
import { createFreezeIncident, listIncidents } from "./freezeEngine.js";
import { dispatchAlert, loadAlertsConfig, verifyAlertsConfigSignature } from "./alerts.js";
import { evaluateDriftRules } from "./driftRules.js";

function loadRuns(workspace: string, agentId: string): DiagnosticReport[] {
  const runsDir = getAgentPaths(workspace, agentId).runsDir;
  if (!pathExists(runsDir)) {
    return [];
  }
  return readdirSync(runsDir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => {
      try {
        return JSON.parse(readUtf8(join(runsDir, name))) as DiagnosticReport;
      } catch {
        return null;
      }
    })
    .filter((row): row is DiagnosticReport => row !== null)
    .sort((a, b) => a.ts - b.ts);
}

export interface DriftCheckResult {
  agentId: string;
  triggered: boolean;
  ruleId: string | null;
  reasons: string[];
  previousRunId: string | null;
  currentRunId: string | null;
  incidentId: string | null;
}

export async function runDriftCheck(params: {
  workspace: string;
  agentId?: string;
  currentRunId?: string;
}): Promise<DriftCheckResult> {
  const agentId = resolveAgentId(params.workspace, params.agentId);
  const runs = loadRuns(params.workspace, agentId);
  if (runs.length < 2) {
    return {
      agentId,
      triggered: false,
      ruleId: null,
      reasons: ["not enough runs for drift comparison"],
      previousRunId: null,
      currentRunId: runs[runs.length - 1]?.runId ?? null,
      incidentId: null
    };
  }

  const current =
    (params.currentRunId ? runs.find((run) => run.runId === params.currentRunId) : runs[runs.length - 1]) ?? runs[runs.length - 1]!;
  const previousCandidates = runs.filter((run) => run.ts < current.ts);
  const previous = previousCandidates[previousCandidates.length - 1]!;
  const alertsSig = verifyAlertsConfigSignature(params.workspace);
  if (!alertsSig.valid) {
    return {
      agentId,
      triggered: false,
      ruleId: null,
      reasons: [`alerts config invalid: ${alertsSig.reason ?? "unknown"}`],
      previousRunId: previous.runId,
      currentRunId: current.runId,
      incidentId: null
    };
  }
  const alertsConfig = loadAlertsConfig(params.workspace);
  const assurance = latestAssuranceByPack({
    workspace: params.workspace,
    agentId,
    windowStartTs: current.windowStartTs,
    windowEndTs: current.windowEndTs
  });
  const evaluated = evaluateDriftRules({
    config: alertsConfig,
    previousRun: previous,
    currentRun: current,
    assuranceByPack: assurance
  });

  if (!evaluated.triggered || !evaluated.ruleId) {
    return {
      agentId,
      triggered: false,
      ruleId: null,
      reasons: evaluated.reasons,
      previousRunId: previous.runId,
      currentRunId: current.runId,
      incidentId: null
    };
  }

  const rule = alertsConfig.alerts.rules.find((item) => item.id === evaluated.ruleId)!;
  const freezeClasses: ActionClass[] = rule.freezeActionClasses ?? ["DEPLOY", "WRITE_HIGH", "SECURITY"];
  const incident = createFreezeIncident({
    workspace: params.workspace,
    agentId,
    ruleId: evaluated.ruleId,
    previousRunId: previous.runId,
    currentRunId: current.runId,
    deltas: evaluated.deltas,
    actionClasses: rule.actions.includes("FREEZE_EXECUTE") ? freezeClasses : [],
    reason: evaluated.reasons.join("; ")
  });

  const ledger = openLedger(params.workspace);
  const sessionId = `drift-${randomUUID()}`;
  try {
    ledger.startSession({
      sessionId,
      runtime: "unknown",
      binaryPath: "amc-drift-check",
      binarySha256: sha256Hex("amc-drift-check")
    });
    ledger.appendEvidence({
      sessionId,
      runtime: "unknown",
      eventType: "audit",
      payload: JSON.stringify({
        auditType: "DRIFT_REGRESSION_DETECTED",
        severity: "HIGH",
        agentId,
        ruleId: evaluated.ruleId,
        previousRunId: previous.runId,
        currentRunId: current.runId,
        incidentId: incident.incidentId,
        reasons: evaluated.reasons
      }),
      payloadExt: "json",
      inline: true,
      meta: {
        auditType: "DRIFT_REGRESSION_DETECTED",
        severity: "HIGH",
        agentId,
        incidentId: incident.incidentId,
        ruleId: evaluated.ruleId,
        trustTier: "OBSERVED"
      }
    });
    if (incident.freeze.actionClasses.length > 0) {
      ledger.appendEvidence({
        sessionId,
        runtime: "unknown",
        eventType: "audit",
        payload: JSON.stringify({
          auditType: "EXECUTE_FROZEN_ACTIVE",
          severity: "HIGH",
          agentId,
          incidentId: incident.incidentId,
          actionClasses: incident.freeze.actionClasses
        }),
        payloadExt: "json",
        inline: true,
        meta: {
          auditType: "EXECUTE_FROZEN_ACTIVE",
          severity: "HIGH",
          agentId,
          incidentId: incident.incidentId,
          actionClasses: incident.freeze.actionClasses,
          trustTier: "OBSERVED"
        }
      });
    }
    ledger.sealSession(sessionId);
  } finally {
    ledger.close();
  }

  if (rule.actions.includes("ALERT_OWNER")) {
    await dispatchAlert(params.workspace, {
      type: "AMC_ALERT",
      ruleId: rule.id,
      agentId,
      runId: current.runId,
      summary: `Drift/regression detected: ${evaluated.reasons.join(" | ")}`,
      links: {
        dashboard: "http://127.0.0.1:4173",
        report: `.amc/agents/${agentId}/reports/${current.runId}.md`
      },
      hashes: {
        reportSha256: current.reportJsonSha256,
        bundleSha256: sha256Hex(`${agentId}:${current.runId}`)
      }
    });
  }

  return {
    agentId,
    triggered: true,
    ruleId: evaluated.ruleId,
    reasons: evaluated.reasons,
    previousRunId: previous.runId,
    currentRunId: current.runId,
    incidentId: incident.incidentId
  };
}

export function lastDriftCheckSummary(workspace: string, agentId?: string): {
  incidentId: string | null;
  activeFreeze: boolean;
} {
  const incidents = listIncidents(workspace, resolveAgentId(workspace, agentId));
  const latest = incidents[0];
  return {
    incidentId: latest?.incidentId ?? null,
    activeFreeze: Boolean(latest?.freeze.active)
  };
}

export function writeDriftCheckReport(params: {
  workspace: string;
  agentId?: string;
  outFile: string;
  result: DriftCheckResult;
}): string {
  const out = join(params.workspace, params.outFile);
  const lines = [
    `# Drift Report (${params.result.agentId})`,
    "",
    `triggered: ${params.result.triggered ? "yes" : "no"}`,
    `ruleId: ${params.result.ruleId ?? "none"}`,
    `previousRunId: ${params.result.previousRunId ?? "n/a"}`,
    `currentRunId: ${params.result.currentRunId ?? "n/a"}`,
    `incidentId: ${params.result.incidentId ?? "none"}`,
    "",
    "## Reasons",
    ...params.result.reasons.map((reason) => `- ${reason}`)
  ];
  writeFileAtomic(out, `${lines.join("\n")}\n`, 0o644);
  return out;
}
