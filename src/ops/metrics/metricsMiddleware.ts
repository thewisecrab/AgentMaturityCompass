import { incCounter, observeHistogram, setGauge, stableAgentHash } from "./metricsRegistry.js";

const HTTP_BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10];

export function ensureMetricsBaseline(): void {
  incCounter("amc_http_requests_total", "Total Studio HTTP requests", { route: "bootstrap", method: "GET", status: "200" }, 0);
  observeHistogram("amc_http_request_duration_seconds", "Studio HTTP request duration seconds", { route: "bootstrap", method: "GET" }, 0, HTTP_BUCKETS);
  incCounter("amc_leases_issued_total", "Leases issued by Studio", { agentIdHash: "bootstrap", routeFamily: "unknown" }, 0);
  incCounter("amc_toolhub_intents_total", "ToolHub intents", { agentIdHash: "bootstrap", actionClass: "READ_ONLY", mode: "SIMULATE" }, 0);
  incCounter(
    "amc_toolhub_exec_total",
    "ToolHub executions",
    { agentIdHash: "bootstrap", toolName: "none", actionClass: "READ_ONLY", status: "ok" },
    0
  );
  incCounter("amc_approvals_requests_total", "Approval requests", { actionClass: "READ_ONLY", riskTier: "low" }, 0);
  incCounter("amc_approvals_decisions_total", "Approval decisions", { decision: "APPROVED", actionClass: "READ_ONLY" }, 0);
  setGauge("amc_retention_segments_total", "Retention segments total", {}, 0);
  setGauge("amc_blobs_total", "Blob object count", {}, 0);
  setGauge("amc_blobs_bytes_total", "Blob object bytes", {}, 0);
  setGauge("amc_db_size_bytes", "SQLite DB file size", {}, 0);
  incCounter("amc_transparency_root_changes_total", "Transparency root updates", {}, 0);
  setGauge("amc_integrity_index_gauge", "Integrity index gauge", { scope: "fleet", idHash: "bootstrap" }, 0);
}

export function recordHttpRequestMetric(route: string, method: string, status: number, durationMs: number): void {
  const labels = {
    route,
    method: method.toUpperCase(),
    status: String(status)
  };
  incCounter("amc_http_requests_total", "Total Studio HTTP requests", labels, 1);
  observeHistogram(
    "amc_http_request_duration_seconds",
    "Studio HTTP request duration seconds",
    { route, method: method.toUpperCase() },
    Math.max(0, durationMs) / 1000,
    HTTP_BUCKETS
  );
}

export function recordLeaseIssuedMetric(agentId: string, routeFamily: string): void {
  incCounter("amc_leases_issued_total", "Leases issued by Studio", { agentIdHash: stableAgentHash(agentId), routeFamily }, 1);
}

export function recordToolhubIntentMetric(agentId: string, actionClass: string, mode: string): void {
  incCounter(
    "amc_toolhub_intents_total",
    "ToolHub intents",
    { agentIdHash: stableAgentHash(agentId), actionClass, mode },
    1
  );
}

export function recordToolhubExecMetric(agentId: string, toolName: string, actionClass: string, status: string): void {
  incCounter(
    "amc_toolhub_exec_total",
    "ToolHub executions",
    { agentIdHash: stableAgentHash(agentId), toolName, actionClass, status },
    1
  );
}

export function recordApprovalRequestMetric(actionClass: string, riskTier: string): void {
  incCounter("amc_approvals_requests_total", "Approval requests", { actionClass, riskTier }, 1);
}

export function recordApprovalDecisionMetric(decision: string, actionClass: string): void {
  incCounter("amc_approvals_decisions_total", "Approval decisions", { decision, actionClass }, 1);
}

export function setRetentionSegmentsMetric(total: number): void {
  setGauge("amc_retention_segments_total", "Retention segments total", {}, total);
}

export function setBlobMetrics(total: number, bytes: number): void {
  setGauge("amc_blobs_total", "Blob object count", {}, total);
  setGauge("amc_blobs_bytes_total", "Blob object bytes", {}, bytes);
}

export function setDbSizeMetric(bytes: number): void {
  setGauge("amc_db_size_bytes", "SQLite DB file size", {}, bytes);
}

export function incrementTransparencyRootChanges(): void {
  incCounter("amc_transparency_root_changes_total", "Transparency root updates", {}, 1);
}

export function setIntegrityGauge(scope: "fleet" | "enterprise" | "agent", id: string, value: number): void {
  setGauge(
    "amc_integrity_index_gauge",
    "Integrity index gauge",
    {
      scope,
      idHash: stableAgentHash(id)
    },
    value
  );
}

