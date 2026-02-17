import type { Ledger } from "../ledger/ledger.js";
import { sha256Hex } from "../utils/hash.js";
import type { CorrelationMetrics } from "./correlate.js";

export function persistCorrelationAudits(params: {
  ledger: Ledger;
  runId: string;
  agentId: string;
  metrics: CorrelationMetrics;
}): string[] {
  const ids: string[] = [];
  for (const issue of params.metrics.issues) {
    const payloadObj = {
      auditType: issue.auditType,
      severity: issue.severity,
      message: issue.message,
      relatedEventIds: issue.relatedEventIds,
      runId: params.runId,
      agentId: params.agentId,
      correlationRatio: Number(params.metrics.correlationRatio.toFixed(4)),
      invalidReceipts: params.metrics.invalidReceipts,
      totalTracesWithReceipt: params.metrics.totalTracesWithReceipt,
      totalTraces: params.metrics.totalTraces
    };
    const payload = JSON.stringify(payloadObj);
    const event = params.ledger.appendEvidenceWithReceipt({
      sessionId: params.runId,
      runtime: "unknown",
      eventType: "audit",
      payload,
      payloadExt: "json",
      inline: true,
      meta: {
        ...payloadObj,
        source: "correlation",
        trustTier: "OBSERVED"
      },
      receipt: {
        kind: "guard_check",
        agentId: params.agentId,
        providerId: "unknown",
        model: null,
        bodySha256: sha256Hex(Buffer.from(payload, "utf8"))
      }
    });
    ids.push(event.id);
  }
  return ids;
}
