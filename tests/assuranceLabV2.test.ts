import { createServer as createHttpServer, request as httpRequest } from "node:http";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, test } from "vitest";
import { initWorkspace } from "../src/workspace.js";
import { runAssuranceLab } from "../src/assurance/assuranceEngine.js";
import { canonicalize } from "../src/utils/json.js";
import { loadTrustConfig, saveTrustConfig } from "../src/trust/trustConfig.js";
import { assuranceReadinessGate } from "../src/assurance/assuranceApi.js";
import { assurancePolicyPath, saveAssuranceWaiver } from "../src/assurance/assurancePolicyStore.js";
import { readUtf8 } from "../src/utils/fs.js";
import { sha256Hex } from "../src/utils/hash.js";
import { runStudioForeground } from "../src/studio/studioSupervisor.js";
import { initGatewayConfig } from "../src/gateway/config.js";

const roots: string[] = [];
const previousVaultPassphrase = process.env.AMC_VAULT_PASSPHRASE;

function newWorkspace(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), `${prefix}-`));
  roots.push(dir);
  process.env.AMC_VAULT_PASSPHRASE = "assurance-v2-passphrase";
  initWorkspace({ workspacePath: dir, trustBoundaryMode: "isolated" });
  return dir;
}

async function pickPort(): Promise<number> {
  return new Promise((resolvePort, reject) => {
    const probe = createHttpServer((_req, res) => {
      res.statusCode = 200;
      res.end("ok");
    });
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      if (!address || typeof address === "string") {
        probe.close(() => reject(new Error("failed to allocate port")));
        return;
      }
      const port = address.port;
      probe.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolvePort(port);
      });
    });
  });
}

async function httpText(params: {
  method?: "GET" | "POST";
  url: string;
  payload?: string;
  headers?: Record<string, string>;
}): Promise<{ status: number; body: string }> {
  return new Promise((resolveResult, reject) => {
    const body = params.payload ?? "";
    const req = httpRequest(
      params.url,
      {
        method: params.method ?? "GET",
        headers: {
          ...(body
            ? {
                "content-type": "application/json",
                "content-length": String(Buffer.byteLength(body))
              }
            : {}),
          ...(params.headers ?? {})
        }
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        res.on("end", () => {
          resolveResult({
            status: res.statusCode ?? 0,
            body: Buffer.concat(chunks).toString("utf8")
          });
        });
      }
    );
    req.once("error", reject);
    if (body.length > 0) {
      req.write(body);
    }
    req.end();
  });
}

afterEach(() => {
  while (roots.length > 0) {
    const root = roots.pop();
    if (root) {
      rmSync(root, { recursive: true, force: true });
    }
  }
  if (typeof previousVaultPassphrase === "string") {
    process.env.AMC_VAULT_PASSPHRASE = previousVaultPassphrase;
  } else {
    delete process.env.AMC_VAULT_PASSPHRASE;
  }
});

describe("assurance lab v2", () => {
  test("run/findings/trace are deterministic for fixed inputs", async () => {
    const workspace = newWorkspace("amc-assurance-v2-deterministic");
    const one = await runAssuranceLab({
      workspace,
      scopeType: "WORKSPACE",
      runId: "run_fixed_inputs",
      nowTs: 1,
      windowDays: 1,
      selectedPack: "all"
    });
    const two = await runAssuranceLab({
      workspace,
      scopeType: "WORKSPACE",
      runId: "run_fixed_inputs",
      nowTs: 1,
      windowDays: 1,
      selectedPack: "all"
    });

    expect(canonicalize(one.run)).toBe(canonicalize(two.run));
    expect(canonicalize(one.findings)).toBe(canonicalize(two.findings));
    expect(canonicalize(one.traceRefs)).toBe(canonicalize(two.traceRefs));

    const traceRaw = canonicalize(one.traceRefs);
    expect(traceRaw).not.toMatch(/BEGIN PRIVATE KEY|Bearer\s+[A-Za-z0-9._-]{8,}|(?:^|[^a-zA-Z0-9])sk-[A-Za-z0-9]{10,}|AIza[0-9A-Za-z_-]{12,}|ignore previous|\/Users\/|\/home\//i);
  });

  test("notary attestation pack fails when NOTARY trust is required but unreachable", async () => {
    const workspace = newWorkspace("amc-assurance-v2-notary");
    const trust = loadTrustConfig(workspace);
    trust.trust.mode = "NOTARY";
    trust.trust.notary.baseUrl = "http://127.0.0.1:9";
    trust.trust.notary.pinnedPubkeyFingerprint = "a".repeat(64);
    trust.trust.notary.requiredAttestationLevel = "SOFTWARE";
    saveTrustConfig(workspace, trust);

    await expect(runAssuranceLab({
      workspace,
      scopeType: "WORKSPACE",
      selectedPack: "notaryAttestation"
    })).rejects.toThrow(/notary/i);
  });

  test("readiness fails closed on threshold breach and allows active waiver", async () => {
    const workspace = newWorkspace("amc-assurance-v2-waiver");
    await runAssuranceLab({
      workspace,
      scopeType: "WORKSPACE",
      runId: "run_threshold_breach",
      nowTs: 1,
      windowDays: 1,
      selectedPack: "all"
    });

    const gateBefore = assuranceReadinessGate(workspace);
    expect(gateBefore.ok).toBe(false);
    expect(gateBefore.reasons).toContain("ASSURANCE_THRESHOLD_BREACH");

    const policySha256 = sha256Hex(Buffer.from(readUtf8(assurancePolicyPath(workspace)), "utf8"));
    saveAssuranceWaiver(workspace, {
      v: 1,
      waiverId: "wvr_test_active",
      createdTs: Date.now(),
      expiresTs: Date.now() + 24 * 60 * 60 * 1000,
      reason: "temporary continuity while remediating assurance findings",
      scope: {
        type: "WORKSPACE",
        id: "workspace"
      },
      allowReadyDespiteAssuranceFail: true,
      approvedBy: [
        {
          userIdHash: "a1b2c3d4e5f6a7b8",
          role: "OWNER",
          approvalEventHash: "1".repeat(64)
        },
        {
          userIdHash: "b1c2d3e4f5a6b7c8",
          role: "AUDITOR",
          approvalEventHash: "2".repeat(64)
        }
      ],
      bindings: {
        lastCertSha256: "0".repeat(64),
        policySha256
      }
    });

    const gateAfter = assuranceReadinessGate(workspace);
    expect(gateAfter.ok).toBe(true);
    expect(gateAfter.warnings.some((row) => row.startsWith("ASSURANCE_WAIVER_ACTIVE:"))).toBe(true);
  });

  test("assurance console pages serve and include no external CDN refs", async () => {
    const workspace = newWorkspace("amc-assurance-v2-console");
    initGatewayConfig(workspace);
    const runtime = await runStudioForeground({
      workspace,
      apiPort: await pickPort(),
      dashboardPort: await pickPort(),
      gatewayPort: await pickPort(),
      proxyPort: await pickPort(),
      metricsPort: await pickPort()
    });

    try {
      for (const page of ["assurance", "assuranceRun", "assuranceCert"]) {
        const res = await httpText({
          url: `http://${runtime.state.host}:${runtime.state.apiPort}/console/${page}.html`
        });
        expect(res.status).toBe(200);
        expect(res.body).not.toMatch(/https?:\/\/cdn|unpkg|jsdelivr/i);
      }
    } finally {
      await runtime.stop();
    }
  });
});
