import { afterEach, describe, expect, test } from "vitest";
import {
  resetWiringState,
  gatewayOverheadHook,
  gatewayOverheadBudgetCheck,
  bridgeResidencyHook,
  diagnosticOperatorHook,
  insiderRiskHook,
  labSignalBridge,
  fpTrackerHook,
  getWiringDiagnostics,
  getOverheadMeasurements,
  getResidencyChecks,
  getInsiderCaptures,
  getLabBridgeResults,
  renderWiringDiagnosticsMarkdown,
} from "../src/ops/productionWiring.js";
import type { AuditEventInput } from "../src/ops/productionWiring.js";

afterEach(() => {
  resetWiringState();
});

// Collect audit events for inspection
function mockAppendEvidence(): { events: AuditEventInput[]; fn: (input: AuditEventInput) => void } {
  const events: AuditEventInput[] = [];
  return {
    events,
    fn: (input) => events.push(input),
  };
}

// ---------------------------------------------------------------------------
// Gateway Overhead Hook
// ---------------------------------------------------------------------------
describe("gateway overhead hook", () => {
  test("records overhead measurement", () => {
    const mock = mockAppendEvidence();
    gatewayOverheadHook(mock.fn, {
      featureName: "gateway_signing",
      durationMs: 15,
      tokenCount: 100,
      requestId: "req-1",
      agentId: "agent-1",
      ts: Date.now(),
    });

    expect(mock.events.length).toBe(1);
    expect(mock.events[0]!.eventType).toBe("metric");
    const payload = JSON.parse(mock.events[0]!.payload);
    expect(payload.auditType).toBe("OVERHEAD_COST_RECORDED");
    expect(payload.durationMs).toBe(15);
  });

  test("records to state for diagnostics", () => {
    const mock = mockAppendEvidence();
    gatewayOverheadHook(mock.fn, {
      featureName: "policy_eval",
      durationMs: 5,
      tokenCount: 0,
      requestId: "req-2",
      agentId: "agent-1",
      ts: Date.now(),
    });

    const measurements = getOverheadMeasurements();
    expect(measurements.length).toBe(1);
    expect(measurements[0]!.featureName).toBe("policy_eval");
  });

  test("budget check returns true when within budget", () => {
    const mock = mockAppendEvidence();
    const ok = gatewayOverheadBudgetCheck(mock.fn, {
      featureName: "signing",
      durationMs: 10,
      budgetMs: 50,
      requestId: "req-1",
      agentId: "a1",
    });
    expect(ok).toBe(true);
    expect(mock.events.length).toBe(0); // no audit for OK
  });

  test("budget check returns false and emits audit when over budget", () => {
    const mock = mockAppendEvidence();
    const ok = gatewayOverheadBudgetCheck(mock.fn, {
      featureName: "signing",
      durationMs: 100,
      budgetMs: 50,
      requestId: "req-1",
      agentId: "a1",
    });
    expect(ok).toBe(false);
    expect(mock.events.length).toBe(1);
    const payload = JSON.parse(mock.events[0]!.payload);
    expect(payload.auditType).toBe("OVERHEAD_COST_BUDGET_EXCEEDED");
    expect(payload.severity).toBe("HIGH");
  });
});

// ---------------------------------------------------------------------------
// Bridge Residency Hook
// ---------------------------------------------------------------------------
describe("bridge residency hook", () => {
  test("allows request in permitted region", () => {
    const mock = mockAppendEvidence();
    const result = bridgeResidencyHook(mock.fn, {
      requestRegion: "us-east",
      allowedRegions: ["us-east", "us-west", "eu-west"],
      agentId: "a1",
      requestId: "req-1",
      policyId: "pol-1",
    });

    expect(result.allowed).toBe(true);
    expect(result.violations.length).toBe(0);
    expect(mock.events.length).toBe(1);
    const payload = JSON.parse(mock.events[0]!.payload);
    expect(payload.auditType).toBe("DATA_RESIDENCY_CONSTRAINT_APPLIED");
  });

  test("blocks request in forbidden region", () => {
    const mock = mockAppendEvidence();
    const result = bridgeResidencyHook(mock.fn, {
      requestRegion: "cn-north",
      allowedRegions: ["us-east", "eu-west"],
      agentId: "a1",
      requestId: "req-2",
    });

    expect(result.allowed).toBe(false);
    expect(result.violations.length).toBe(1);
    expect(result.violations[0]).toContain("cn-north");
    const payload = JSON.parse(mock.events[0]!.payload);
    expect(payload.auditType).toBe("DATA_RESIDENCY_VIOLATION_DETECTED");
    expect(payload.severity).toBe("CRITICAL");
  });

  test("records to state", () => {
    const mock = mockAppendEvidence();
    bridgeResidencyHook(mock.fn, {
      requestRegion: "us-east",
      allowedRegions: ["us-east"],
      agentId: "a1",
      requestId: "req-1",
    });
    expect(getResidencyChecks().length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Diagnostic Operator Hook
// ---------------------------------------------------------------------------
describe("diagnostic operator hook", () => {
  test("emits operator context audit", () => {
    const mock = mockAppendEvidence();
    diagnosticOperatorHook(mock.fn, {
      role: "executive",
      agentId: "a1",
      reportId: "rpt-1",
    });

    expect(mock.events.length).toBe(1);
    const payload = JSON.parse(mock.events[0]!.payload);
    expect(payload.auditType).toBe("OPERATOR_CONTEXT_APPLIED");
    expect(payload.role).toBe("executive");
  });

  test("supports all roles", () => {
    const mock = mockAppendEvidence();
    const roles = ["operator", "executive", "auditor"] as const;
    for (const role of roles) {
      diagnosticOperatorHook(mock.fn, { role, agentId: "a1", reportId: "r1" });
    }
    expect(mock.events.length).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Insider Risk Hook
// ---------------------------------------------------------------------------
describe("insider risk hook", () => {
  test("captures approval event", () => {
    const mock = mockAppendEvidence();
    insiderRiskHook(mock.fn, {
      actorId: "user-1",
      eventType: "approval",
      action: "approve_deploy",
      ts: Date.now(),
      metadata: { deployId: "d1" },
    });

    expect(mock.events.length).toBe(1);
    const payload = JSON.parse(mock.events[0]!.payload);
    expect(payload.auditType).toBe("INSIDER_RISK_SIGNAL_DETECTED");
    expect(payload.actorId).toBe("user-1");
  });

  test("captures policy change event", () => {
    const mock = mockAppendEvidence();
    insiderRiskHook(mock.fn, {
      actorId: "admin-1",
      eventType: "policy_change",
      action: "modify_action_policy",
      ts: Date.now(),
      metadata: {},
    });

    expect(getInsiderCaptures().length).toBe(1);
  });

  test("captures tool usage event", () => {
    const mock = mockAppendEvidence();
    insiderRiskHook(mock.fn, {
      actorId: "agent-1",
      eventType: "tool_usage",
      action: "exec_shell",
      ts: Date.now(),
      metadata: { toolId: "t1" },
    });

    const captures = getInsiderCaptures();
    expect(captures.length).toBe(1);
    expect(captures[0]!.eventType).toBe("tool_usage");
  });
});

// ---------------------------------------------------------------------------
// Lab Signal Bridge
// ---------------------------------------------------------------------------
describe("lab signal bridge", () => {
  test("bridges production-safe high-confidence signal", () => {
    const mock = mockAppendEvidence();
    const result = labSignalBridge(mock.fn, {
      importId: "msi_001",
      signalName: "attention_score",
      signalValue: 0.85,
      confidence: 0.9,
      boundaryMarker: "PRODUCTION_SAFE",
      experimentId: "exp-1",
    });

    expect(result.bridged).toBe(true);
    expect(result.auditType).toBe("LAB_SIGNAL_IMPORTED");
    expect(mock.events[0]!.eventType).toBe("metric");
  });

  test("does not bridge research-only signal", () => {
    const mock = mockAppendEvidence();
    const result = labSignalBridge(mock.fn, {
      importId: "msi_002",
      signalName: "self_knowledge_loss",
      signalValue: 0.7,
      confidence: 0.95,
      boundaryMarker: "RESEARCH_ONLY",
      experimentId: "exp-2",
    });

    expect(result.bridged).toBe(false);
    expect(result.auditType).toBe("LAB_SIGNAL_RESEARCH_ONLY");
    expect(mock.events[0]!.eventType).toBe("audit"); // logged but not as metric
  });

  test("does not bridge low-confidence signal", () => {
    const mock = mockAppendEvidence();
    const result = labSignalBridge(mock.fn, {
      importId: "msi_003",
      signalName: "trace_memory",
      signalValue: 0.5,
      confidence: 0.3,
      boundaryMarker: "PRODUCTION_SAFE",
      experimentId: "exp-3",
    });

    expect(result.bridged).toBe(false);
    expect(result.auditType).toBe("LAB_SIGNAL_LOW_CONFIDENCE");
  });

  test("respects custom confidence threshold", () => {
    const mock = mockAppendEvidence();
    const result = labSignalBridge(mock.fn, {
      importId: "msi_004",
      signalName: "activation",
      signalValue: 0.6,
      confidence: 0.7,
      boundaryMarker: "PRODUCTION_SAFE",
      experimentId: "exp-4",
      confidenceThreshold: 0.6,
    });

    expect(result.bridged).toBe(true);
  });

  test("records to state", () => {
    const mock = mockAppendEvidence();
    labSignalBridge(mock.fn, {
      importId: "msi_005",
      signalName: "s",
      signalValue: 0.5,
      confidence: 0.9,
      boundaryMarker: "PRODUCTION_SAFE",
      experimentId: "exp-5",
    });
    expect(getLabBridgeResults().length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// FP Tracker Hook
// ---------------------------------------------------------------------------
describe("fp tracker hook", () => {
  test("records open FP event", () => {
    const mock = mockAppendEvidence();
    fpTrackerHook(mock.fn, {
      scenarioId: "chain-read-then-exfil",
      packId: "chainEscalation",
      reportId: "fp_001",
      status: "open",
    });

    expect(mock.events.length).toBe(1);
    const payload = JSON.parse(mock.events[0]!.payload);
    expect(payload.auditType).toBe("FALSE_POSITIVE_RECORDED");
  });

  test("records confirmed FP event", () => {
    const mock = mockAppendEvidence();
    fpTrackerHook(mock.fn, {
      scenarioId: "s1",
      packId: "p1",
      reportId: "fp_002",
      status: "confirmed",
    });

    const payload = JSON.parse(mock.events[0]!.payload);
    expect(payload.auditType).toBe("FALSE_POSITIVE_CONFIRMED");
    expect(payload.severity).toBe("MEDIUM");
  });

  test("records rejected FP event", () => {
    const mock = mockAppendEvidence();
    fpTrackerHook(mock.fn, {
      scenarioId: "s1",
      packId: "p1",
      reportId: "fp_003",
      status: "rejected",
    });

    const payload = JSON.parse(mock.events[0]!.payload);
    expect(payload.auditType).toBe("FALSE_POSITIVE_REJECTED");
  });
});

// ---------------------------------------------------------------------------
// Wiring Diagnostics
// ---------------------------------------------------------------------------
describe("wiring diagnostics", () => {
  test("returns all 6 modules", () => {
    const diags = getWiringDiagnostics();
    expect(diags.length).toBe(6);
    const names = diags.map((d) => d.moduleName);
    expect(names).toContain("overheadAccounting");
    expect(names).toContain("dataResidency");
    expect(names).toContain("operatorUx");
    expect(names).toContain("insiderRisk");
    expect(names).toContain("cognitionLab");
    expect(names).toContain("fpTracker");
  });

  test("initially no modules are wired", () => {
    const diags = getWiringDiagnostics();
    for (const d of diags) {
      expect(d.wired).toBe(false);
      expect(d.hookCount).toBe(0);
    }
  });

  test("marks module as wired after hook activation", () => {
    const mock = mockAppendEvidence();
    gatewayOverheadHook(mock.fn, {
      featureName: "test",
      durationMs: 1,
      tokenCount: 0,
      requestId: "r",
      agentId: "a",
      ts: Date.now(),
    });

    const diags = getWiringDiagnostics();
    const overhead = diags.find((d) => d.moduleName === "overheadAccounting")!;
    expect(overhead.wired).toBe(true);
    expect(overhead.hookCount).toBe(1);
    expect(overhead.eventCount).toBe(1);
  });

  test("tracks multiple activations", () => {
    const mock = mockAppendEvidence();
    for (let i = 0; i < 5; i++) {
      gatewayOverheadHook(mock.fn, {
        featureName: `f-${i}`,
        durationMs: i,
        tokenCount: 0,
        requestId: `r-${i}`,
        agentId: "a",
        ts: Date.now(),
      });
    }

    const diags = getWiringDiagnostics();
    const overhead = diags.find((d) => d.moduleName === "overheadAccounting")!;
    expect(overhead.hookCount).toBe(5);
    expect(overhead.eventCount).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// Markdown rendering
// ---------------------------------------------------------------------------
describe("wiring diagnostics markdown", () => {
  test("renders empty state", () => {
    const md = renderWiringDiagnosticsMarkdown();
    expect(md).toContain("# Production Wiring Diagnostics");
    expect(md).toContain("0/6");
    expect(md).toContain("Modules wired");
    expect(md).toContain("Total hook activations");
  });

  test("renders active state", () => {
    const mock = mockAppendEvidence();
    gatewayOverheadHook(mock.fn, {
      featureName: "t",
      durationMs: 1,
      tokenCount: 0,
      requestId: "r",
      agentId: "a",
      ts: Date.now(),
    });
    insiderRiskHook(mock.fn, {
      actorId: "u1",
      eventType: "approval",
      action: "approve",
      ts: Date.now(),
      metadata: {},
    });

    const md = renderWiringDiagnosticsMarkdown();
    expect(md).toContain("2/6");
    expect(md).toContain("Modules wired");
    expect(md).toContain("Total hook activations");
    expect(md).toContain("YES");
    expect(md).toContain("NO");
  });
});

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------
describe("reset", () => {
  test("clears all wiring state", () => {
    const mock = mockAppendEvidence();
    gatewayOverheadHook(mock.fn, { featureName: "t", durationMs: 1, tokenCount: 0, requestId: "r", agentId: "a", ts: Date.now() });
    insiderRiskHook(mock.fn, { actorId: "u1", eventType: "approval", action: "a", ts: Date.now(), metadata: {} });

    resetWiringState();

    expect(getOverheadMeasurements().length).toBe(0);
    expect(getInsiderCaptures().length).toBe(0);
    const diags = getWiringDiagnostics();
    expect(diags.every((d) => !d.wired)).toBe(true);
  });
});
