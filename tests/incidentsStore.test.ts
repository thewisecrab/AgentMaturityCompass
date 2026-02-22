import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { getPrivateKeyPem, getPublicKeyHistory, signHexDigest } from "../src/crypto/keys.js";
import {
  computeIncidentHash,
  createIncidentStore,
  verifyIncidentSignature
} from "../src/incidents/incidentStore.js";
import type { CausalEdge, Incident, IncidentState, IncidentTransition } from "../src/incidents/incidentTypes.js";
import { openLedger } from "../src/ledger/ledger.js";
import { canonicalize } from "../src/utils/json.js";
import { sha256Hex } from "../src/utils/hash.js";
import { initWorkspace } from "../src/workspace.js";

const roots: string[] = [];

function newWorkspace(): string {
  const dir = mkdtempSync(join(tmpdir(), "amc-incidents-store-test-"));
  roots.push(dir);
  initWorkspace({ workspacePath: dir, trustBoundaryMode: "isolated" });
  return dir;
}

function makeIncident(
  workspace: string,
  store: ReturnType<typeof createIncidentStore>,
  overrides: Partial<Incident> = {}
): Incident {
  const now = Date.now();
  const agentId = overrides.agentId ?? "agent-1";
  const base: Omit<Incident, "incident_hash" | "signature"> = {
    incidentId: overrides.incidentId ?? `incident_${Math.random().toString(36).slice(2, 10)}`,
    agentId,
    severity: overrides.severity ?? "WARN",
    state: overrides.state ?? "OPEN",
    title: overrides.title ?? "incident title",
    description: overrides.description ?? "incident description",
    triggerType: overrides.triggerType ?? "MANUAL",
    triggerId: overrides.triggerId ?? `trigger_${Math.random().toString(36).slice(2, 10)}`,
    rootCauseClaimIds: overrides.rootCauseClaimIds ?? [],
    affectedQuestionIds: overrides.affectedQuestionIds ?? [],
    causalEdges: overrides.causalEdges ?? [],
    timelineEventIds: overrides.timelineEventIds ?? [],
    createdTs: overrides.createdTs ?? now,
    updatedTs: overrides.updatedTs ?? now,
    resolvedTs: overrides.resolvedTs ?? null,
    postmortemRef: overrides.postmortemRef ?? null,
    prev_incident_hash: overrides.prev_incident_hash ?? store.getLastIncidentHash(agentId)
  };
  const incidentHash = computeIncidentHash(base);
  const digest = sha256Hex(canonicalize({ ...base, incident_hash: incidentHash }));
  const signature = signHexDigest(digest, getPrivateKeyPem(workspace, "monitor"));
  return {
    ...base,
    incident_hash: incidentHash,
    signature
  };
}

function makeTransition(
  workspace: string,
  incidentId: string,
  fromState: IncidentState,
  toState: IncidentState,
  ts: number
): IncidentTransition {
  const transitionId = `itr_${Math.random().toString(36).slice(2, 10)}`;
  const digest = sha256Hex(
    canonicalize({
      transition_id: transitionId,
      incident_id: incidentId,
      from_state: fromState,
      to_state: toState,
      reason: `transition ${fromState}->${toState}`,
      ts
    })
  );
  return {
    transitionId,
    incidentId,
    fromState,
    toState,
    reason: `transition ${fromState}->${toState}`,
    ts,
    signature: signHexDigest(digest, getPrivateKeyPem(workspace, "monitor"))
  };
}

function makeEdge(workspace: string, fromEventId: string, toEventId: string, ts: number): CausalEdge {
  const edgeId = `edge_${Math.random().toString(36).slice(2, 10)}`;
  const digest = sha256Hex(
    canonicalize({
      edge_id: edgeId,
      from_event_id: fromEventId,
      to_event_id: toEventId,
      relationship: "CAUSED",
      confidence: 0.8,
      evidence: [fromEventId],
      added_ts: ts,
      added_by: "AUTO"
    })
  );
  return {
    edgeId,
    fromEventId,
    toEventId,
    relationship: "CAUSED",
    confidence: 0.8,
    evidence: [fromEventId],
    addedTs: ts,
    addedBy: "AUTO",
    signature: signHexDigest(digest, getPrivateKeyPem(workspace, "monitor"))
  };
}

afterEach(() => {
  while (roots.length > 0) {
    const dir = roots.pop();
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("incidentStore", () => {
  test("initTables is idempotent", () => {
    const workspace = newWorkspace();
    const ledger = openLedger(workspace);
    const store = createIncidentStore(ledger.db);
    store.initTables();
    store.initTables();
    expect(store.getLastIncidentHash("agent-1")).toBe("GENESIS_INCIDENT");
    ledger.close();
  });

  test("insertIncident and getIncident round-trip", () => {
    const workspace = newWorkspace();
    const ledger = openLedger(workspace);
    const store = createIncidentStore(ledger.db);
    store.initTables();

    const incident = makeIncident(workspace, store, { incidentId: "incident_roundtrip", title: "db outage" });
    store.insertIncident(incident);
    const loaded = store.getIncident("incident_roundtrip");

    expect(loaded).not.toBeNull();
    expect(loaded!.incidentId).toBe("incident_roundtrip");
    expect(loaded!.title).toBe("db outage");
    expect(loaded!.state).toBe("OPEN");
    ledger.close();
  });

  test("getIncidentsByAgent supports state filtering", () => {
    const workspace = newWorkspace();
    const ledger = openLedger(workspace);
    const store = createIncidentStore(ledger.db);
    store.initTables();

    store.insertIncident(makeIncident(workspace, store, { agentId: "agent-a", incidentId: "i-1", state: "OPEN" }));
    store.insertIncident(makeIncident(workspace, store, { agentId: "agent-a", incidentId: "i-2", state: "RESOLVED" }));
    store.insertIncident(makeIncident(workspace, store, { agentId: "agent-b", incidentId: "i-3", state: "OPEN" }));

    expect(store.getIncidentsByAgent("agent-a").length).toBe(2);
    expect(store.getIncidentsByAgent("agent-a", "OPEN").length).toBe(1);
    expect(store.getIncidentsByAgent("agent-b").length).toBe(1);
    ledger.close();
  });

  test("getOpenIncidents returns OPEN/INVESTIGATING/MITIGATED", () => {
    const workspace = newWorkspace();
    const ledger = openLedger(workspace);
    const store = createIncidentStore(ledger.db);
    store.initTables();

    store.insertIncident(makeIncident(workspace, store, { agentId: "agent-a", state: "OPEN", incidentId: "open-1" }));
    store.insertIncident(makeIncident(workspace, store, { agentId: "agent-a", state: "INVESTIGATING", incidentId: "open-2" }));
    store.insertIncident(makeIncident(workspace, store, { agentId: "agent-a", state: "MITIGATED", incidentId: "open-3" }));
    store.insertIncident(makeIncident(workspace, store, { agentId: "agent-a", state: "RESOLVED", incidentId: "closed-1" }));

    const openIncidents = store.getOpenIncidents("agent-a");
    expect(openIncidents.map((row) => row.incidentId).sort()).toEqual(["open-1", "open-2", "open-3"]);
    ledger.close();
  });

  test("insertIncidentTransition and getIncidentTransitions are time-ordered", () => {
    const workspace = newWorkspace();
    const ledger = openLedger(workspace);
    const store = createIncidentStore(ledger.db);
    store.initTables();
    store.insertIncident(makeIncident(workspace, store, { incidentId: "incident-tr", agentId: "agent-a" }));

    const tr1 = makeTransition(workspace, "incident-tr", "OPEN", "INVESTIGATING", 10);
    const tr2 = makeTransition(workspace, "incident-tr", "INVESTIGATING", "RESOLVED", 20);
    store.insertIncidentTransition(tr2);
    store.insertIncidentTransition(tr1);

    const transitions = store.getIncidentTransitions("incident-tr");
    expect(transitions.length).toBe(2);
    expect(transitions[0]!.toState).toBe("INVESTIGATING");
    expect(transitions[1]!.toState).toBe("RESOLVED");
    ledger.close();
  });

  test("insertCausalEdge and getCausalEdges are time-ordered", () => {
    const workspace = newWorkspace();
    const ledger = openLedger(workspace);
    const store = createIncidentStore(ledger.db);
    store.initTables();
    store.insertIncident(makeIncident(workspace, store, { incidentId: "incident-edge", agentId: "agent-a" }));

    const edge2 = makeEdge(workspace, "ev-2", "incident-edge", 20);
    const edge1 = makeEdge(workspace, "ev-1", "incident-edge", 10);
    store.insertCausalEdge("incident-edge", edge2);
    store.insertCausalEdge("incident-edge", edge1);

    const edges = store.getCausalEdges("incident-edge");
    expect(edges.length).toBe(2);
    expect(edges[0]!.fromEventId).toBe("ev-1");
    expect(edges[1]!.fromEventId).toBe("ev-2");
    ledger.close();
  });

  test("computeIncidentHash is deterministic and changes on payload mutation", () => {
    const base: Omit<Incident, "incident_hash" | "signature"> = {
      incidentId: "incident-hash",
      agentId: "agent-h",
      severity: "WARN",
      state: "OPEN",
      title: "title",
      description: "description",
      triggerType: "MANUAL",
      triggerId: "trigger",
      rootCauseClaimIds: [],
      affectedQuestionIds: [],
      causalEdges: [],
      timelineEventIds: [],
      createdTs: 1,
      updatedTs: 1,
      resolvedTs: null,
      postmortemRef: null,
      prev_incident_hash: "GENESIS_INCIDENT"
    };
    const hashA = computeIncidentHash(base);
    const hashB = computeIncidentHash(base);
    const hashC = computeIncidentHash({ ...base, title: "changed" });
    expect(hashA).toBe(hashB);
    expect(hashC).not.toBe(hashA);
  });

  test("verifyIncidentSignature succeeds for valid incident and fails on tamper", () => {
    const workspace = newWorkspace();
    const ledger = openLedger(workspace);
    const store = createIncidentStore(ledger.db);
    store.initTables();
    const incident = makeIncident(workspace, store, { incidentId: "incident-sig" });
    const pubKeys = getPublicKeyHistory(workspace, "monitor");
    expect(verifyIncidentSignature(workspace, incident, pubKeys)).toBe(true);
    expect(verifyIncidentSignature(workspace, { ...incident, title: "tampered" }, pubKeys)).toBe(false);
    ledger.close();
  });
});
