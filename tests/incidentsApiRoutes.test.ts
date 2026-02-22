import { mkdtempSync, rmSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { afterEach, describe, expect, test } from "vitest";
import { handleApiRoute } from "../src/api/index.js";
import { handleIncidentRoute } from "../src/api/incidentRouter.js";
import { initWorkspace } from "../src/workspace.js";

interface MockResponseState {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

const roots: string[] = [];
const originalCwd = process.cwd();

function newWorkspace(): string {
  const dir = mkdtempSync(join(tmpdir(), "amc-incidents-api-test-"));
  roots.push(dir);
  initWorkspace({ workspacePath: dir, trustBoundaryMode: "isolated" });
  return dir;
}

function mockReq(method: string, url: string, body?: unknown): IncomingMessage {
  const payload = body === undefined ? "" : JSON.stringify(body);
  const req = Readable.from(payload.length > 0 ? [Buffer.from(payload, "utf8")] : []) as unknown as IncomingMessage;
  (req as any).method = method;
  (req as any).url = url;
  return req;
}

function mockRes(): { res: ServerResponse; state: MockResponseState } {
  const state: MockResponseState = {
    statusCode: 0,
    headers: {},
    body: ""
  };
  const res = {
    writeHead: (statusCode: number, headers?: Record<string, string>) => {
      state.statusCode = statusCode;
      state.headers = headers ?? {};
      return res;
    },
    end: (chunk?: string | Buffer) => {
      if (chunk !== undefined) {
        state.body += chunk.toString();
      }
    }
  } as unknown as ServerResponse;
  return { res, state };
}

async function callIncidentRoute(
  method: string,
  pathname: string,
  url: string,
  body?: unknown
): Promise<{ handled: boolean; state: MockResponseState; json: any }> {
  const req = mockReq(method, url, body);
  const { res, state } = mockRes();
  const handled = await handleIncidentRoute(pathname, method, req, res);
  return {
    handled,
    state,
    json: state.body.length > 0 ? JSON.parse(state.body) : null
  };
}

afterEach(() => {
  process.chdir(originalCwd);
  while (roots.length > 0) {
    const dir = roots.pop();
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("incident API routes", () => {
  test("GET /api/v1/incidents returns empty list for new workspace", async () => {
    const workspace = newWorkspace();
    process.chdir(workspace);

    const out = await callIncidentRoute("GET", "/api/v1/incidents", "/api/v1/incidents?agent=agent-api");
    expect(out.handled).toBe(true);
    expect(out.state.statusCode).toBe(200);
    expect(out.json.ok).toBe(true);
    expect(out.json.data.count).toBe(0);
    expect(out.json.data.incidents).toEqual([]);
  });

  test("POST /api/v1/incidents creates a new incident", async () => {
    const workspace = newWorkspace();
    process.chdir(workspace);

    const out = await callIncidentRoute("POST", "/api/v1/incidents", "/api/v1/incidents", {
      agentId: "agent-api",
      title: "gateway timeout spike",
      severity: "high"
    });

    expect(out.handled).toBe(true);
    expect(out.state.statusCode).toBe(201);
    expect(out.json.ok).toBe(true);
    expect(out.json.data.incidentId).toMatch(/^incident_/);
    expect(out.json.data.agentId).toBe("agent-api");
    expect(out.json.data.state).toBe("OPEN");
  });

  test("GET /api/v1/incidents/:id returns incident details", async () => {
    const workspace = newWorkspace();
    process.chdir(workspace);

    const created = await callIncidentRoute("POST", "/api/v1/incidents", "/api/v1/incidents", {
      agentId: "agent-api",
      title: "drift anomaly",
      severity: "medium"
    });
    const id = created.json.data.incidentId as string;

    const out = await callIncidentRoute("GET", `/api/v1/incidents/${id}`, `/api/v1/incidents/${id}`);
    expect(out.handled).toBe(true);
    expect(out.state.statusCode).toBe(200);
    expect(out.json.ok).toBe(true);
    expect(out.json.data.incidentId).toBe(id);
    expect(out.json.data.title).toBe("drift anomaly");
    expect(out.json.data.transitions).toEqual([]);
  });

  test("PATCH /api/v1/incidents/:id with resolution closes incident", async () => {
    const workspace = newWorkspace();
    process.chdir(workspace);

    const created = await callIncidentRoute("POST", "/api/v1/incidents", "/api/v1/incidents", {
      agentId: "agent-api",
      title: "policy violation",
      severity: "critical"
    });
    const id = created.json.data.incidentId as string;

    const patched = await callIncidentRoute("PATCH", `/api/v1/incidents/${id}`, `/api/v1/incidents/${id}`, {
      resolution: "patched policy and redeployed"
    });
    expect(patched.state.statusCode).toBe(200);
    expect(patched.json.ok).toBe(true);
    expect(patched.json.data.state).toBe("RESOLVED");
    expect(patched.json.data.transitions.length).toBe(1);
  });

  test("PATCH /api/v1/incidents/:id with evidenceId creates causal edge", async () => {
    const workspace = newWorkspace();
    process.chdir(workspace);

    const created = await callIncidentRoute("POST", "/api/v1/incidents", "/api/v1/incidents", {
      agentId: "agent-api",
      title: "slo breach",
      severity: "low"
    });
    const id = created.json.data.incidentId as string;

    const patched = await callIncidentRoute("PATCH", `/api/v1/incidents/${id}`, `/api/v1/incidents/${id}`, {
      evidenceId: "ev-123"
    });
    expect(patched.state.statusCode).toBe(200);
    expect(patched.json.ok).toBe(true);
    expect(patched.json.data.causalEdges.length).toBe(1);
    expect(patched.json.data.causalEdges[0].fromEventId).toBe("ev-123");
  });

  test("GET /api/v1/incidents supports closed filter", async () => {
    const workspace = newWorkspace();
    process.chdir(workspace);

    const created = await callIncidentRoute("POST", "/api/v1/incidents", "/api/v1/incidents", {
      agentId: "agent-api",
      title: "budget exceed",
      severity: "high"
    });
    const id = created.json.data.incidentId as string;
    await callIncidentRoute("PATCH", `/api/v1/incidents/${id}`, `/api/v1/incidents/${id}`, {
      resolution: "throttled non-critical jobs"
    });

    const out = await callIncidentRoute(
      "GET",
      "/api/v1/incidents",
      "/api/v1/incidents?agent=agent-api&status=closed&limit=10"
    );
    expect(out.state.statusCode).toBe(200);
    expect(out.json.ok).toBe(true);
    expect(out.json.data.count).toBe(1);
    expect(out.json.data.incidents[0].state).toBe("RESOLVED");
  });

  test("handleApiRoute dispatches to incident router when registered", async () => {
    const workspace = newWorkspace();
    process.chdir(workspace);

    const req = mockReq("GET", "/api/v1/incidents?agent=agent-dispatch");
    const { res, state } = mockRes();
    const handled = await handleApiRoute("/api/v1/incidents", "GET", req, res);
    expect(handled).toBe(true);
    // Incident router is now wired — should return 200 with incidents list
    expect(state.statusCode).toBe(200);
  });
});
