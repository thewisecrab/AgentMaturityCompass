import { describe, expect, test } from "vitest";
import type { EvidenceEvent } from "../src/types.js";
import {
  ObservabilityOTELExporter,
  type ScoreComputationMetric
} from "../src/observability/otelExporter.js";

function makeEvidenceEvent(overrides: Partial<EvidenceEvent> = {}): EvidenceEvent {
  return {
    id: overrides.id ?? "ev-1",
    ts: overrides.ts ?? 1_700_000_000_000,
    session_id: overrides.session_id ?? "session-a",
    runtime: overrides.runtime ?? "gateway",
    event_type: overrides.event_type ?? "audit",
    payload_path: overrides.payload_path ?? null,
    payload_inline: overrides.payload_inline ?? null,
    payload_sha256: overrides.payload_sha256 ?? "a".repeat(64),
    meta_json: overrides.meta_json ?? JSON.stringify({ agentId: "agent-1", trustTier: "ATTESTED", severity: "HIGH" }),
    prev_event_hash: overrides.prev_event_hash ?? "b".repeat(64),
    event_hash: overrides.event_hash ?? "c".repeat(64),
    writer_sig: overrides.writer_sig ?? "sig"
  };
}

describe("observability otel exporter", () => {
  test("exports evidence events as OTLP spans", () => {
    const exporter = new ObservabilityOTELExporter({
      enabled: false,
      targets: [{ kind: "otlp", endpoint: "http://127.0.0.1:4318" }]
    });

    exporter.recordEvidenceEvent(makeEvidenceEvent({
      event_type: "tool_result",
      meta_json: JSON.stringify({
        agentId: "agent-1",
        trustTier: "OBSERVED",
        questionId: "AMC-2.3",
        dimension: "autonomy",
        severity: "medium"
      })
    }));

    const requests = exporter.previewRequests();
    expect(requests).toHaveLength(1);
    expect(requests[0]!.signal).toBe("traces");
    const payload = requests[0]!.payload as {
      resourceSpans: Array<{ scopeSpans: Array<{ spans: Array<{ name: string; attributes: Array<{ key: string }> }> }> }>;
    };
    const span = payload.resourceSpans[0]!.scopeSpans[0]!.spans[0]!;
    expect(span.name).toBe("amc.evidence.tool_result");
    const keys = span.attributes.map((attr) => attr.key);
    expect(keys).toContain("amc.trust.tier");
    expect(keys).toContain("amc.question.id");
  });

  test("exports score computations as OTLP metrics", () => {
    const exporter = new ObservabilityOTELExporter({
      enabled: false,
      targets: [{ kind: "otlp", endpoint: "http://127.0.0.1:4318" }]
    });

    const metric: ScoreComputationMetric = {
      agentId: "agent-metric",
      runId: "run-1",
      score: 76,
      maxScore: 100,
      level: 4,
      ts: 1_700_000_000_500
    };
    exporter.recordScoreComputation(metric);

    const requests = exporter.previewRequests();
    expect(requests).toHaveLength(1);
    expect(requests[0]!.signal).toBe("metrics");
    const payload = requests[0]!.payload as {
      resourceMetrics: Array<{ scopeMetrics: Array<{ metrics: Array<{ name: string }> }> }>;
    };
    const names = payload.resourceMetrics[0]!.scopeMetrics[0]!.metrics.map((row) => row.name);
    expect(names).toContain("amc.score.value");
    expect(names).toContain("amc.score.percentage");
    expect(names).toContain("amc.score.level");
  });

  test("exports incidents as OTLP logs", () => {
    const exporter = new ObservabilityOTELExporter({
      enabled: false,
      targets: [{ kind: "otlp", endpoint: "http://127.0.0.1:4318" }]
    });

    exporter.recordIncident({
      incidentId: "incident-1",
      agentId: "agent-incident",
      severity: "CRITICAL",
      state: "OPEN",
      title: "Policy violation spike",
      description: "Unexpected action path"
    });

    const requests = exporter.previewRequests();
    expect(requests).toHaveLength(1);
    expect(requests[0]!.signal).toBe("logs");
    const payload = requests[0]!.payload as {
      resourceLogs: Array<{ scopeLogs: Array<{ logRecords: Array<{ severityText: string; body: { stringValue: string } }> }> }>;
    };
    const log = payload.resourceLogs[0]!.scopeLogs[0]!.logRecords[0]!;
    expect(log.severityText).toBe("CRITICAL");
    expect(log.body.stringValue).toContain("Policy violation spike");
  });

  test("supports Zipkin exporter by converting all signals to spans", () => {
    const exporter = new ObservabilityOTELExporter({
      enabled: false,
      targets: [{ kind: "zipkin", endpoint: "http://127.0.0.1:9411" }]
    });

    exporter.recordEvidenceEvent(makeEvidenceEvent());
    exporter.recordScoreComputation({
      agentId: "agent-z",
      score: 85,
      maxScore: 100
    });
    exporter.recordIncident({
      incidentId: "incident-z",
      agentId: "agent-z",
      severity: "WARN",
      state: "OPEN",
      title: "warning"
    });

    const requests = exporter.previewRequests();
    expect(requests).toHaveLength(1);
    expect(requests[0]!.endpoint).toContain("/api/v2/spans");
    const spans = requests[0]!.payload as Array<{ name: string; tags?: Record<string, string> }>;
    expect(spans.length).toBeGreaterThanOrEqual(3);
    expect(spans.some((span) => span.name.includes("amc.metric"))).toBe(true);
    expect(spans.some((span) => span.tags?.["amc.log.severity"] === "WARN")).toBe(true);
  });

  test("supports Jaeger OTLP endpoints for traces, metrics, and logs", () => {
    const exporter = new ObservabilityOTELExporter({
      enabled: false,
      targets: [{ kind: "jaeger", endpoint: "http://127.0.0.1:4318" }]
    });

    exporter.recordEvidenceEvent(makeEvidenceEvent());
    exporter.recordScoreComputation({ agentId: "agent-j", score: 50, maxScore: 100 });
    exporter.recordIncident({
      incidentId: "incident-j",
      agentId: "agent-j",
      severity: "INFO",
      state: "OPEN",
      title: "debug event"
    });

    const requests = exporter.previewRequests();
    const endpoints = requests.map((request) => request.endpoint);
    expect(endpoints).toContain("http://127.0.0.1:4318/v1/traces");
    expect(endpoints).toContain("http://127.0.0.1:4318/v1/metrics");
    expect(endpoints).toContain("http://127.0.0.1:4318/v1/logs");
  });
});
