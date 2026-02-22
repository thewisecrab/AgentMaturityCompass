import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import YAML from "yaml";
import { afterEach, describe, expect, test } from "vitest";
import { initWorkspace } from "../src/workspace.js";
import { dispatchIntegrationEvent } from "../src/integrations/integrationDispatcher.js";
import { initIntegrationsConfig, integrationsConfigPath, integrationsConfigSigPath } from "../src/integrations/integrationStore.js";
import { getPrivateKeyPem, signHexDigest } from "../src/crypto/keys.js";
import { sha256Hex } from "../src/utils/hash.js";
import { setVaultSecret } from "../src/vault/vault.js";

const roots: string[] = [];

function newWorkspace(): string {
  const dir = mkdtempSync(join(tmpdir(), "amc-integrations-dispatch-"));
  roots.push(dir);
  process.env.AMC_VAULT_PASSPHRASE = "dispatch-test-passphrase";
  initWorkspace({ workspacePath: dir, trustBoundaryMode: "isolated" });
  initIntegrationsConfig(dir);
  return dir;
}

function resignIntegrationsConfig(workspace: string): void {
  const path = integrationsConfigPath(workspace);
  const sigPath = integrationsConfigSigPath(workspace);
  const digest = sha256Hex(readFileSync(path));
  const signature = signHexDigest(digest, getPrivateKeyPem(workspace, "auditor"));
  writeFileSync(
    sigPath,
    JSON.stringify(
      {
        digestSha256: digest,
        signature,
        signedTs: Date.now(),
        signer: "auditor"
      },
      null,
      2
    )
  );
}

async function listenServer(handler: (req: IncomingMessage, res: ServerResponse) => void): Promise<Server> {
  const server = createServer(handler);
  await new Promise<void>((resolvePromise) => server.listen(0, "127.0.0.1", () => resolvePromise()));
  return server;
}

afterEach(async () => {
  while (roots.length > 0) {
    const dir = roots.pop();
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("integration dispatcher failure handling", () => {
  test("skips a failing channel and still dispatches to healthy channels", async () => {
    const workspace = newWorkspace();
    const received: string[] = [];
    const okServer = await listenServer((req, res) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString("utf8");
      });
      req.on("end", () => {
        received.push(body);
        res.statusCode = 202;
        res.end("ok");
      });
    });

    try {
      const addr = okServer.address();
      if (!addr || typeof addr === "string") {
        throw new Error("missing test server address");
      }
      setVaultSecret(workspace, "integrations/ops-webhook", "ok-secret");
      setVaultSecret(workspace, "integrations/fail-webhook", "fail-secret");

      const cfgPath = integrationsConfigPath(workspace);
      const cfg = YAML.parse(readFileSync(cfgPath, "utf8")) as any;
      cfg.integrations.channels = [
        {
          id: "ok-webhook",
          type: "webhook",
          url: `http://127.0.0.1:${addr.port}/ok`,
          secretRef: "vault:integrations/ops-webhook",
          enabled: true
        },
        {
          id: "fail-webhook",
          type: "webhook",
          url: "http://127.0.0.1:1/unreachable",
          secretRef: "vault:integrations/fail-webhook",
          enabled: true,
          delivery: { retry: { maxAttempts: 1, timeoutMs: 500 }, maxRounds: 1 }
        }
      ];
      cfg.integrations.routing.INTEGRATION_TEST = ["ok-webhook", "fail-webhook"];
      writeFileSync(cfgPath, YAML.stringify(cfg), "utf8");
      resignIntegrationsConfig(workspace);

      const result = await dispatchIntegrationEvent({
        workspace,
        eventName: "INTEGRATION_TEST",
        agentId: "default",
        summary: "failure handling test"
      });

      expect(result.dispatched).toHaveLength(1);
      expect(result.dispatched[0]?.channelId).toBe("ok-webhook");
      expect(result.dispatched[0]?.httpStatus).toBe(202);
      expect(result.skipped.some((row) => row.startsWith("fail-webhook:dispatch-failed:"))).toBe(true);
      expect(received).toHaveLength(1);
      const payload = JSON.parse(received[0]!);
      expect(payload.eventName).toBe("INTEGRATION_TEST");
      expect(payload.agentId).toBe("default");
    } finally {
      await new Promise<void>((resolvePromise) => okServer.close(() => resolvePromise()));
    }
  });

  test("returns skipped reason for missing secret without throwing", async () => {
    const workspace = newWorkspace();
    const cfgPath = integrationsConfigPath(workspace);
    const cfg = YAML.parse(readFileSync(cfgPath, "utf8")) as any;
    cfg.integrations.channels = [
      {
        id: "missing-secret",
        type: "webhook",
        url: "http://127.0.0.1:65535/amc",
        secretRef: "vault:integrations/not-present",
        enabled: true
      }
    ];
    cfg.integrations.routing.INTEGRATION_TEST = ["missing-secret"];
    writeFileSync(cfgPath, YAML.stringify(cfg), "utf8");
    resignIntegrationsConfig(workspace);

    const result = await dispatchIntegrationEvent({
      workspace,
      eventName: "INTEGRATION_TEST",
      agentId: "system",
      summary: "missing secret test"
    });

    expect(result.dispatched).toHaveLength(0);
    expect(result.skipped).toContain("missing-secret:missing-secret");
  });
});
