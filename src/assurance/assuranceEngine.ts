import { randomUUID } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getAgentPaths, resolveAgentId } from "../fleet/paths.js";
import type { DiagnosticReport, EvidenceEvent } from "../types.js";
import { openLedger } from "../ledger/ledger.js";
import { appendTransparencyEntry, tailTransparencyEntries } from "../transparency/logChain.js";
import { sha256Hex } from "../utils/hash.js";
import { pathExists, readUtf8 } from "../utils/fs.js";
import {
  assuranceFindingsDocSchema,
  assurancePackRunSchema,
  assuranceRunSchema,
  assuranceScenarioResultSchema,
  assuranceTraceRefsSchema,
  type AssuranceFindingsDoc,
  type AssurancePackId,
  type AssuranceRun,
  type AssuranceScopeType,
  type AssuranceTraceRefs
} from "./assuranceSchema.js";
import { loadAssurancePolicy, saveAssuranceRunArtifacts, verifyAssurancePolicySignature, assurancePolicyPath } from "./assurancePolicyStore.js";
import { findingsFromScenarioResults } from "./assuranceFindings.js";
import { evaluateAssuranceEvidenceGates, scoreAssuranceRun } from "./assuranceScoring.js";
import { loadAssurancePackContext, normalizePackSelection, scenariosForPack } from "./assurancePacks.js";
import type { AssurancePolicy } from "./assurancePolicySchema.js";

interface DiagnosticEvidenceSnapshot {
  integrityIndex: number;
  correlationRatio: number;
  observedShare: number;
}

function scopeToAgentId(workspace: string, scope: { type: AssuranceScopeType; id: string }): string {
  if (scope.type === "AGENT") {
    return resolveAgentId(workspace, scope.id);
  }
  return resolveAgentId(workspace, "default");
}

function loadLatestDiagnosticForAgent(workspace: string, agentId: string): DiagnosticReport | null {
  const paths = getAgentPaths(workspace, agentId);
  if (!pathExists(paths.runsDir)) {
    return null;
  }
  const rows = readdirSync(paths.runsDir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => join(paths.runsDir, name));
  const parsed: DiagnosticReport[] = [];
  for (const file of rows) {
    try {
      parsed.push(JSON.parse(readUtf8(file)) as DiagnosticReport);
    } catch {
      // skip malformed rows
    }
  }
  parsed.sort((a, b) => b.ts - a.ts);
  return parsed[0] ?? null;
}

function diagnosticEvidenceSnapshot(workspace: string, scope: { type: AssuranceScopeType; id: string }): DiagnosticEvidenceSnapshot {
  const report = loadLatestDiagnosticForAgent(workspace, scopeToAgentId(workspace, scope));
  if (!report) {
    return {
      integrityIndex: 0,
      correlationRatio: 0,
      observedShare: 0
    };
  }
  return {
    integrityIndex: Number((report.integrityIndex ?? 0).toFixed(6)),
    correlationRatio: Number((report.correlationRatio ?? 0).toFixed(6)),
    observedShare: Number((report.evidenceTrustCoverage?.observed ?? 0).toFixed(6))
  };
}

function collectEvidenceStats(params: {
  workspace: string;
  sinceTs: number;
  untilTs: number;
}): {
  auditCounts: Record<string, number>;
  transparencyCounts: Record<string, number>;
  recentEventHashes: string[];
} {
  const auditCounts: Record<string, number> = {};
  const recentEventHashes: string[] = [];
  const ledger = openLedger(params.workspace);
  try {
    const events = ledger.getEventsBetween(params.sinceTs, params.untilTs);
    for (const event of events) {
      recentEventHashes.push(event.event_hash);
      const meta = safeMeta(event);
      if (event.event_type === "audit") {
        const auditType = typeof meta.auditType === "string" ? meta.auditType : null;
        if (auditType) {
          auditCounts[auditType] = (auditCounts[auditType] ?? 0) + 1;
          if (auditType === "OUTPUT_VALIDATED" && String(meta.status ?? "") === "FAIL") {
            auditCounts.OUTPUT_VALIDATED_FAIL = (auditCounts.OUTPUT_VALIDATED_FAIL ?? 0) + 1;
          }
        }
      }
      if ((event.event_type === "tool_result" || event.event_type === "tool_action") && String(meta.decision ?? "").toUpperCase() === "DENIED") {
        auditCounts.TOOL_DENIED = (auditCounts.TOOL_DENIED ?? 0) + 1;
      }
    }
  } finally {
    ledger.close();
  }

  const transparencyCounts: Record<string, number> = {};
  for (const entry of tailTransparencyEntries(params.workspace, 2000)) {
    if (entry.ts < params.sinceTs || entry.ts > params.untilTs) {
      continue;
    }
    transparencyCounts[entry.type] = (transparencyCounts[entry.type] ?? 0) + 1;
    recentEventHashes.push(entry.hash);
  }

  return {
    auditCounts,
    transparencyCounts,
    recentEventHashes: [...new Set(recentEventHashes)].slice(-200)
  };
}

function safeMeta(event: EvidenceEvent): Record<string, unknown> {
  try {
    return JSON.parse(event.meta_json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function policySha(workspace: string): string {
  const path = assurancePolicyPath(workspace);
  if (!pathExists(path)) {
    return "0".repeat(64);
  }
  return sha256Hex(readFileSync(path));
}

export interface AssuranceRunOutput {
  run: AssuranceRun;
  findings: AssuranceFindingsDoc;
  traceRefs: AssuranceTraceRefs;
  saved: ReturnType<typeof saveAssuranceRunArtifacts>;
  transparency: {
    startedHash: string;
    findingHashes: string[];
    completedHash: string;
    thresholdBreachHash: string | null;
  };
}

export async function runAssuranceLab(params: {
  workspace: string;
  scopeType: AssuranceScopeType;
  scopeId?: string;
  selectedPack?: AssurancePackId | "all";
  windowDays?: number;
  runId?: string;
  nowTs?: number;
}): Promise<AssuranceRunOutput> {
  const policySig = verifyAssurancePolicySignature(params.workspace);
  if (!policySig.valid) {
    throw new Error(`assurance policy signature invalid: ${policySig.reason ?? "unknown"}`);
  }
  const policy = loadAssurancePolicy(params.workspace);
  return runAssuranceLabWithPolicy({
    ...params,
    policy
  });
}

export async function runAssuranceLabWithPolicy(params: {
  workspace: string;
  policy: AssurancePolicy;
  scopeType: AssuranceScopeType;
  scopeId?: string;
  selectedPack?: AssurancePackId | "all";
  windowDays?: number;
  runId?: string;
  nowTs?: number;
}): Promise<AssuranceRunOutput> {
  const nowTs = params.nowTs ?? Date.now();
  const runId = params.runId ?? `run_${randomUUID().replace(/-/g, "")}`;
  const scope = {
    type: params.scopeType,
    id: params.scopeType === "WORKSPACE" ? "workspace" : (params.scopeId ?? "default")
  } as const;

  const started = appendTransparencyEntry({
    workspace: params.workspace,
    type: "ASSURANCE_RUN_STARTED",
    agentId: scope.type === "AGENT" ? scope.id : "workspace",
    artifact: {
      kind: "policy",
      sha256: policySha(params.workspace),
      id: runId
    }
  });

  const diagnostic = diagnosticEvidenceSnapshot(params.workspace, scope);
  const windowDays = Math.max(1, params.windowDays ?? 30);
  const sinceTs = nowTs - windowDays * 24 * 60 * 60 * 1000;
  const evidenceStats = collectEvidenceStats({
    workspace: params.workspace,
    sinceTs,
    untilTs: nowTs
  });
  const packContext = await loadAssurancePackContext({
    workspace: params.workspace,
    scope,
    nowTs,
    policy: params.policy,
    policySha256: policySha(params.workspace),
    evidence: evidenceStats
  });

  const selectedPacks = normalizePackSelection({
    policy: params.policy,
    selected: params.selectedPack ?? "all"
  });

  const scenarioResults = [] as Array<ReturnType<typeof assuranceScenarioResultSchema.parse>>;
  const packRuns = [] as Array<ReturnType<typeof assurancePackRunSchema.parse>>;

  for (const packId of selectedPacks) {
    const scenarios = scenariosForPack(packId);
    const scenarioRows = scenarios.map((scenario) => {
      const evaluated = scenario.evaluate(packContext);
      const requestId = `req_${sha256Hex(`${runId}:${scenario.scenarioId}`).slice(0, 24)}`;
      const outputDigestInput = JSON.stringify({
        passed: evaluated.passed,
        reasons: evaluated.reasons,
        decision: evaluated.decision,
        counters: evaluated.counters ?? {}
      });
      return assuranceScenarioResultSchema.parse({
        scenarioId: scenario.scenarioId,
        packId,
        category: scenario.category,
        passed: evaluated.passed,
        reasons: evaluated.reasons,
        severityOnFailure: scenario.severityOnFailure,
        evidenceRefs: {
          runId,
          eventHashes: evaluated.evidenceEventHashes.slice(0, 8),
          receiptIds: []
        },
        traceRef: {
          scenarioId: scenario.scenarioId,
          requestId,
          runId,
          agentIdHash: sha256Hex(scope.id).slice(0, 16),
          inputHash: sha256Hex(`${packId}:${scenario.scenarioId}`),
          outputHash: sha256Hex(outputDigestInput),
          decision: evaluated.decision,
          policyHashes: {
            assurancePolicySha256: packContext.policySha256,
            promptPolicySha256: packContext.promptPolicySha256,
            toolsSha256: packContext.toolsSha256,
            budgetsSha256: packContext.budgetsSha256
          },
          evidenceEventHashes: evaluated.evidenceEventHashes.slice(0, 8),
          timingMs: 0,
          counters: evaluated.counters ?? {}
        }
      });
    });
    const passCount = scenarioRows.filter((row) => row.passed).length;
    const failedCount = scenarioRows.length - passCount;
    packRuns.push(
      assurancePackRunSchema.parse({
        packId,
        enabled: true,
        scenarioCount: scenarioRows.length,
        passedCount: passCount,
        failedCount,
        scenarios: scenarioRows
      })
    );
    scenarioResults.push(...scenarioRows);
  }

  const findings = findingsFromScenarioResults({
    runId,
    generatedTs: nowTs,
    scenarios: scenarioResults
  });

  const score = scoreAssuranceRun({
    policy: params.policy,
    findings: findings.findings,
    gates: diagnostic
  });

  const run = assuranceRunSchema.parse({
    v: 1,
    runId,
    generatedTs: nowTs,
    scope,
    policySha256: packContext.policySha256,
    selectedPacks,
    evidenceGates: {
      integrityIndex: diagnostic.integrityIndex,
      correlationRatio: diagnostic.correlationRatio,
      observedShare: diagnostic.observedShare
    },
    packRuns,
    score,
    notes: score.status === "INSUFFICIENT_EVIDENCE" ? score.reasons : []
  });

  const traceRefs = assuranceTraceRefsSchema.parse({
    v: 1,
    runId,
    generatedTs: nowTs,
    refs: scenarioResults.map((row) => row.traceRef)
  });

  const saved = saveAssuranceRunArtifacts({
    workspace: params.workspace,
    run,
    findings,
    traceRefs
  });

  const findingHashes: string[] = [];
  for (const finding of findings.findings) {
    const entry = appendTransparencyEntry({
      workspace: params.workspace,
      type: "ASSURANCE_FINDING_RECORDED",
      agentId: scope.type === "AGENT" ? scope.id : "workspace",
      artifact: {
        kind: "policy",
        sha256: sha256Hex(Buffer.from(JSON.stringify(finding), "utf8")),
        id: finding.findingId
      }
    });
    findingHashes.push(entry.hash);
  }

  let thresholdBreachHash: string | null = null;
  if (
    params.policy.assurancePolicy.thresholds.failClosedIfBelowThresholds &&
    (run.score.status === "FAIL" || run.score.status === "INSUFFICIENT_EVIDENCE")
  ) {
    const entry = appendTransparencyEntry({
      workspace: params.workspace,
      type: "ASSURANCE_THRESHOLD_BREACH",
      agentId: scope.type === "AGENT" ? scope.id : "workspace",
      artifact: {
        kind: "policy",
        sha256: sha256Hex(Buffer.from(`${run.runId}:${run.score.status}`, "utf8")),
        id: run.runId
      }
    });
    thresholdBreachHash = entry.hash;
  }

  const completed = appendTransparencyEntry({
    workspace: params.workspace,
    type: "ASSURANCE_RUN_COMPLETED",
    agentId: scope.type === "AGENT" ? scope.id : "workspace",
    artifact: {
      kind: "policy",
      sha256: sha256Hex(readFileSync(saved.runPath)),
      id: runId
    }
  });

  return {
    run,
    findings: assuranceFindingsDocSchema.parse(findings),
    traceRefs,
    saved,
    transparency: {
      startedHash: started.hash,
      findingHashes,
      completedHash: completed.hash,
      thresholdBreachHash
    }
  };
}
