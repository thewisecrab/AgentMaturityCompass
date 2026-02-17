import { sha256Hex } from "../utils/hash.js";
import type { ValueContract } from "./valueContracts.js";
import type { ValueEvent } from "./valueEventSchema.js";

export interface AttributionEntry {
  agentIdHash: string;
  share: number;
  runIds: string[];
  evidenceRefs: string[];
}

export interface AttributionResult {
  kpiId: string;
  window: {
    startTs: number;
    endTs: number;
  };
  status: "OK" | "INSUFFICIENT_EVIDENCE";
  attributedTo: AttributionEntry[];
  reasons: string[];
}

function normalizeShares(rows: AttributionEntry[]): AttributionEntry[] {
  const total = rows.reduce((sum, row) => sum + row.share, 0);
  if (total <= 0) {
    return rows;
  }
  return rows.map((row) => ({
    ...row,
    share: Number((row.share / total).toFixed(6))
  }));
}

function hashAgentId(agentId: string): string {
  return sha256Hex(agentId).slice(0, 16);
}

export function attributeValue(params: {
  contract: ValueContract;
  kpiId: string;
  events: ValueEvent[];
  startTs: number;
  endTs: number;
}): AttributionResult {
  const method = params.contract.valueContract.constraints.attributionMethod;
  const attributionWindowMs = params.contract.valueContract.constraints.attributionWindowHours * 60 * 60 * 1000;
  const scoped = params.events.filter((event) => event.kpiId === params.kpiId && event.ts >= params.startTs && event.ts <= params.endTs);
  if (scoped.length === 0) {
    return {
      kpiId: params.kpiId,
      window: {
        startTs: params.startTs,
        endTs: params.endTs
      },
      status: "INSUFFICIENT_EVIDENCE",
      attributedTo: [],
      reasons: ["no kpi events in window"]
    };
  }

  const rows = new Map<string, AttributionEntry>();
  const reasons: string[] = [];

  for (const event of scoped) {
    const runIds = event.evidenceRefs.runIds ?? [];
    const correlationIds = event.evidenceRefs.correlationIds ?? [];
    const refs = [...(event.evidenceRefs.eventHashes ?? []), ...(event.evidenceRefs.receiptIds ?? [])];
    const candidateAgentRaw = (() => {
      const firstRun = runIds[0];
      if (firstRun && firstRun.includes(":")) {
        return firstRun.split(":")[0] ?? "unknown";
      }
      const firstCorrelation = correlationIds[0];
      if (firstCorrelation && firstCorrelation.includes("@")) {
        return firstCorrelation.split("@")[0] ?? "unknown";
      }
      return "unknown";
    })();
    const agentHash = hashAgentId(candidateAgentRaw);
    const existing = rows.get(agentHash);
    if (!existing) {
      rows.set(agentHash, {
        agentIdHash: agentHash,
        share: 0,
        runIds: [...new Set(runIds)],
        evidenceRefs: [...new Set(refs)]
      });
    } else {
      existing.runIds = [...new Set([...existing.runIds, ...runIds])];
      existing.evidenceRefs = [...new Set([...existing.evidenceRefs, ...refs])];
    }

    const row = rows.get(agentHash)!;
    if (method === "LAST_TOUCH") {
      const latestRunTs = runIds
        .map((runId) => {
          const parts = runId.split("#");
          const maybeTs = Number(parts[parts.length - 1] ?? 0);
          return Number.isFinite(maybeTs) ? maybeTs : 0;
        })
        .sort((a, b) => b - a)[0] ?? 0;
      if (latestRunTs > 0 && event.ts - latestRunTs <= attributionWindowMs) {
        row.share += 1;
      } else {
        row.share += 0.5;
        reasons.push("some events lacked fresh run correlation");
      }
    } else {
      row.share += Math.max(1, runIds.length);
      if (runIds.length === 0) {
        reasons.push("events missing run correlation IDs");
      }
    }
  }

  const attributedTo = normalizeShares([...rows.values()].sort((a, b) => a.agentIdHash.localeCompare(b.agentIdHash)));
  const insufficient = attributedTo.length === 0 || attributedTo.every((row) => row.agentIdHash === hashAgentId("unknown"));

  return {
    kpiId: params.kpiId,
    window: {
      startTs: params.startTs,
      endTs: params.endTs
    },
    status: insufficient ? "INSUFFICIENT_EVIDENCE" : "OK",
    attributedTo,
    reasons: insufficient ? ["missing usable correlation IDs"] : [...new Set(reasons)]
  };
}
