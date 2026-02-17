import { randomUUID } from "node:crypto";
import { appendTransparencyEntry } from "../transparency/logChain.js";
import { dispatchIntegrationEvent } from "../integrations/integrationDispatcher.js";
import { sha256Hex } from "../utils/hash.js";
import { loadTrustConfig, checkNotaryTrust } from "../trust/trustConfig.js";
import { latestAssuranceRun } from "../assurance/assuranceStore.js";
import { collectForecastSignals } from "../forecast/forecastSignals.js";
import { evaluateValueEvidenceGates } from "./valueEvidenceGates.js";
import { attributeValue } from "./valueAttribution.js";
import { collectObservedValueEvents } from "./valueCollector.js";
import { scoreValueDimensions } from "./valueScoring.js";
import { computeEconomicSignificance, detectValueRegression } from "./valueRisk.js";
import {
  appendValueEvents,
  listValueReports,
  loadValueContract,
  loadValuePolicy,
  loadValueSnapshot,
  readValueEvents,
  saveValueReport,
  saveValueSnapshot
} from "./valueStore.js";
import { valueReportSchema, valueSnapshotSchema, type ValueReport, type ValueSnapshot } from "./valueSchema.js";

function scopeIdHash(scope: { type: "WORKSPACE" | "NODE" | "AGENT"; id: string }): string {
  return sha256Hex(`${scope.type}:${scope.id}`).slice(0, 16);
}

function summaryTrust(events: Array<{ source: { trustKind: "OBSERVED" | "ATTESTED" | "SELF_REPORTED" } }>): {
  observed: number;
  attested: number;
  selfReported: number;
} {
  if (events.length === 0) {
    return { observed: 0, attested: 0, selfReported: 0 };
  }
  const observed = events.filter((event) => event.source.trustKind === "OBSERVED").length;
  const attested = events.filter((event) => event.source.trustKind === "ATTESTED").length;
  const self = events.filter((event) => event.source.trustKind === "SELF_REPORTED").length;
  return {
    observed: Number((observed / events.length).toFixed(6)),
    attested: Number((attested / events.length).toFixed(6)),
    selfReported: Number((self / events.length).toFixed(6))
  };
}

function nowWindow(days: number, nowTs: number): {
  startTs: number;
  endTs: number;
} {
  const duration = Math.max(1, days) * 24 * 60 * 60 * 1000;
  return {
    startTs: nowTs - duration,
    endTs: nowTs
  };
}

function previousWindow(days: number, nowTs: number): {
  startTs: number;
  endTs: number;
} {
  const duration = Math.max(1, days) * 24 * 60 * 60 * 1000;
  return {
    startTs: nowTs - duration * 2,
    endTs: nowTs - duration
  };
}

function nullifySnapshotNumbers(snapshot: ValueSnapshot): ValueSnapshot {
  return valueSnapshotSchema.parse({
    ...snapshot,
    kpis: snapshot.kpis.map((kpi) => ({
      ...kpi,
      normalizedScore: null,
      delta: null
    })),
    valueDimensions: {
      emotional: null,
      functional: null,
      economic: null,
      brand: null,
      lifetime: null,
      valueScore: null
    },
    economicSignificance: {
      score: null,
      risk: snapshot.economicSignificance.risk,
      reasons: snapshot.economicSignificance.reasons
    }
  });
}

export async function createValueSnapshot(params: {
  workspace: string;
  scopeType: "WORKSPACE" | "NODE" | "AGENT";
  scopeId: string;
  windowDays?: number;
  nowTs?: number;
}): Promise<{
  snapshot: ValueSnapshot;
  saved: ReturnType<typeof saveValueSnapshot>;
  transparencyHash: string;
  regressionDetected: boolean;
}> {
  const nowTs = params.nowTs ?? Date.now();
  const scope = {
    type: params.scopeType,
    id: params.scopeType === "WORKSPACE" ? "workspace" : params.scopeId
  } as const;

  const policy = loadValuePolicy(params.workspace);
  const contract = loadValueContract({
    workspace: params.workspace,
    agentId: scope.type === "AGENT" ? scope.id : null
  });

  const windowDays = Math.max(1, params.windowDays ?? contract.valueContract.baselines.baselineWindowDays);
  const currentWindow = nowWindow(windowDays, nowTs);
  const baselineWindow = previousWindow(windowDays, nowTs);

  const observed = collectObservedValueEvents({
    workspace: params.workspace,
    scopeType: scope.type,
    scopeId: scope.id,
    contract,
    startTs: currentWindow.startTs,
    endTs: currentWindow.endTs
  });
  if (observed.length > 0) {
    appendValueEvents(params.workspace, observed);
  }

  const idHash = scopeIdHash(scope);
  const currentEvents = readValueEvents({
    workspace: params.workspace,
    scope,
    startTs: currentWindow.startTs,
    endTs: currentWindow.endTs,
    idHash
  });
  const baselineEvents = readValueEvents({
    workspace: params.workspace,
    scope,
    startTs: baselineWindow.startTs,
    endTs: baselineWindow.endTs,
    idHash
  });

  const scoring = scoreValueDimensions({
    contract,
    policy,
    currentEvents,
    baselineEvents
  });

  const trustSummary = summaryTrust(currentEvents);
  const forecastSignals = collectForecastSignals({
    workspace: params.workspace,
    scope,
    lookbackDays: Math.max(30, windowDays)
  });
  const trustMode = loadTrustConfig(params.workspace).trust.mode;
  const notaryRequired = trustMode === "NOTARY";
  const notaryState = notaryRequired ? await checkNotaryTrust(params.workspace).catch(() => ({ ok: false })) : { ok: true };
  const gates = evaluateValueEvidenceGates(policy, {
    integrityIndex: forecastSignals.evidence.latestIntegrityIndex,
    correlationRatio: forecastSignals.evidence.latestCorrelationRatio,
    observedShare: trustSummary.observed,
    selfReportedShare: trustSummary.selfReported,
    notaryRequired,
    notaryHealthy: notaryState.ok
  });

  const assurance = latestAssuranceRun(params.workspace);
  const costKpi = scoring.kpis.find((row) => row.kpiId === "cost_usd") ?? null;
  const economic = computeEconomicSignificance({
    policy,
    valueScore: scoring.dimensions.valueScore,
    economicValue: scoring.dimensions.economic,
    costScore: costKpi?.normalizedScore ?? null,
    assuranceScore: assurance?.score.riskAssuranceScore ?? null,
    insufficientEvidence: !gates.ok,
    valueRegressing: false,
    costRising: typeof costKpi?.delta === "number" && costKpi.delta > 0,
    noValueEventsLast30d: currentEvents.length === 0
  });

  const attributionEntries = contract.valueContract.kpis.map((kpi) =>
    attributeValue({
      contract,
      kpiId: kpi.kpiId,
      events: currentEvents,
      startTs: currentWindow.startTs,
      endTs: currentWindow.endTs
    })
  );

  const snapshotBase = valueSnapshotSchema.parse({
    v: 1,
    generatedTs: nowTs,
    scope,
    status: gates.ok ? "OK" : "INSUFFICIENT_EVIDENCE",
    reasons: gates.ok ? [] : gates.reasons,
    gates: {
      integrityIndex: Number(forecastSignals.evidence.latestIntegrityIndex.toFixed(6)),
      correlationRatio: Number(forecastSignals.evidence.latestCorrelationRatio.toFixed(6)),
      observedShare: trustSummary.observed,
      selfReportedShare: trustSummary.selfReported
    },
    baselines: {
      windowDays,
      startTs: currentWindow.startTs,
      endTs: currentWindow.endTs
    },
    kpis: scoring.kpis,
    valueDimensions: {
      emotional: scoring.dimensions.emotional,
      functional: scoring.dimensions.functional,
      economic: scoring.dimensions.economic,
      brand: scoring.dimensions.brand,
      lifetime: scoring.dimensions.lifetime,
      valueScore: scoring.dimensions.valueScore
    },
    economicSignificance: economic,
    attributionSummary: {
      status: attributionEntries.some((row) => row.status === "OK") ? "OK" : "INSUFFICIENT_EVIDENCE",
      method: contract.valueContract.constraints.attributionMethod,
      entries: attributionEntries.map((row) => ({
        kpiId: row.kpiId,
        attributedTo: row.attributedTo
      }))
    },
    notes: scoring.notes
  });

  const previousSnapshot = loadValueSnapshot(params.workspace, scope);
  const regression = detectValueRegression({
    previousValueScore: previousSnapshot?.valueDimensions.valueScore ?? null,
    nextValueScore: snapshotBase.valueDimensions.valueScore,
    previousEconomicValue: previousSnapshot?.valueDimensions.economic ?? null,
    nextEconomicValue: snapshotBase.valueDimensions.economic,
    previousCost: previousSnapshot?.kpis.find((row) => row.kpiId === "cost_usd")?.currentValue ?? null,
    nextCost: snapshotBase.kpis.find((row) => row.kpiId === "cost_usd")?.currentValue ?? null
  });

  const finalized = gates.ok ? snapshotBase : nullifySnapshotNumbers(snapshotBase);
  const saved = saveValueSnapshot(params.workspace, finalized);
  const created = appendTransparencyEntry({
    workspace: params.workspace,
    type: "VALUE_SNAPSHOT_CREATED",
    agentId: scope.type === "AGENT" ? scope.id : "workspace",
    artifact: {
      kind: "policy",
      sha256: saved.sha256,
      id: `${scope.type}:${scope.id}`
    }
  });

  if (!gates.ok) {
    appendTransparencyEntry({
      workspace: params.workspace,
      type: "VALUE_EVIDENCE_INSUFFICIENT",
      agentId: scope.type === "AGENT" ? scope.id : "workspace",
      artifact: {
        kind: "policy",
        sha256: saved.sha256,
        id: `${scope.type}:${scope.id}`
      }
    });
    void dispatchIntegrationEvent({
      workspace: params.workspace,
      eventName: "VALUE_EVIDENCE_INSUFFICIENT",
      agentId: scope.type === "AGENT" ? scope.id : "workspace",
      summary: "Value strong-claim evidence gates failed",
      details: {
        scope,
        reasons: gates.reasons
      }
    }).catch(() => undefined);
  }

  if (regression.regressed) {
    appendTransparencyEntry({
      workspace: params.workspace,
      type: "VALUE_REGRESSION_DETECTED",
      agentId: scope.type === "AGENT" ? scope.id : "workspace",
      artifact: {
        kind: "policy",
        sha256: saved.sha256,
        id: `${scope.type}:${scope.id}`
      }
    });
    void dispatchIntegrationEvent({
      workspace: params.workspace,
      eventName: "VALUE_REGRESSION_DETECTED",
      agentId: scope.type === "AGENT" ? scope.id : "workspace",
      summary: "Value regression detected",
      details: {
        scope,
        reasons: regression.reasons,
        previousValueScore: previousSnapshot?.valueDimensions.valueScore ?? null,
        currentValueScore: finalized.valueDimensions.valueScore
      }
    }).catch(() => undefined);
  }

  return {
    snapshot: finalized,
    saved,
    transparencyHash: created.hash,
    regressionDetected: regression.regressed
  };
}

export async function createValueReport(params: {
  workspace: string;
  scopeType: "WORKSPACE" | "NODE" | "AGENT";
  scopeId: string;
  windowDays?: number;
  nowTs?: number;
}): Promise<{
  report: ValueReport;
  saved: ReturnType<typeof saveValueReport>;
  snapshot: ValueSnapshot;
  transparencyHash: string;
}> {
  const nowTs = params.nowTs ?? Date.now();
  const snapshotRun = await createValueSnapshot(params);
  const scope = {
    type: params.scopeType,
    id: params.scopeType === "WORKSPACE" ? "workspace" : params.scopeId
  } as const;
  const reports = listValueReports(params.workspace, scope);
  const history = reports
    .slice(-29)
    .map((row) => ({
      ts: row.generatedTs,
      value: row.snapshot.valueDimensions.valueScore
    }))
    .filter((row): row is { ts: number; value: number } => typeof row.value === "number");

  const report = valueReportSchema.parse({
    v: 1,
    reportId: `vr_${randomUUID().replace(/-/g, "")}`,
    generatedTs: nowTs,
    windowDays: params.windowDays ?? snapshotRun.snapshot.baselines.windowDays,
    scope,
    snapshot: snapshotRun.snapshot,
    series: {
      valueScore: [...history, ...(typeof snapshotRun.snapshot.valueDimensions.valueScore === "number" ? [{ ts: nowTs, value: snapshotRun.snapshot.valueDimensions.valueScore }] : [])],
      economic: [
        ...reports
          .slice(-29)
          .map((row) => ({ ts: row.generatedTs, value: row.snapshot.valueDimensions.economic }))
          .filter((row): row is { ts: number; value: number } => typeof row.value === "number"),
        ...(typeof snapshotRun.snapshot.valueDimensions.economic === "number" ? [{ ts: nowTs, value: snapshotRun.snapshot.valueDimensions.economic }] : [])
      ],
      risk: [
        ...reports
          .slice(-29)
          .map((row) => ({ ts: row.generatedTs, value: row.snapshot.economicSignificance.risk }))
          .filter((row): row is { ts: number; value: number } => typeof row.value === "number"),
        ...(typeof snapshotRun.snapshot.economicSignificance.risk === "number" ? [{ ts: nowTs, value: snapshotRun.snapshot.economicSignificance.risk }] : [])
      ]
    }
  });

  const saved = saveValueReport(params.workspace, report);
  const entry = appendTransparencyEntry({
    workspace: params.workspace,
    type: "VALUE_REPORT_CREATED",
    agentId: scope.type === "AGENT" ? scope.id : "workspace",
    artifact: {
      kind: "policy",
      sha256: saved.sha256,
      id: report.reportId
    }
  });

  return {
    report,
    saved,
    snapshot: snapshotRun.snapshot,
    transparencyHash: entry.hash
  };
}
