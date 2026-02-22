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
  const dir = mkdtempSync(join(tmpdir(), "amc-integrations-slack-"));
  roots.push(dir);
  process.env.AMC_VAULT_PASSPHRASE = "slack-test-passphrase";
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

describe("slack webhook integration channel", () => {
  test("dispatches incident events to slack webhook URL from vault", async () => {
    const workspace = newWorkspace();
    const received: string[] = [];
    const slackServer = await listenServer((req, res) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString("utf8");
      });
      req.on("end", () => {
        received.push(body);
        res.statusCode = 200;
        res.end("ok");
      });
    });

    try {
      const addr = slackServer.address();
      if (!addr || typeof addr === "string") {
        throw new Error("missing slack test server address");
      }
      setVaultSecret(workspace, "integrations/slack-webhook-url", `http://127.0.0.1:${addr.port}/slack`);

      const cfgPath = integrationsConfigPath(workspace);
      const cfg = YAML.parse(readFileSync(cfgPath, "utf8")) as any;
      cfg.integrations.channels = [
        {
          id: "ops-slack",
          type: "slack_webhook",
          webhookUrlRef: "vault:integrations/slack-webhook-url",
          channel: "#alerts",
          enabled: true
        }
      ];
      cfg.integrations.routing.INCIDENT_CREATED = ["ops-slack"];
      writeFileSync(cfgPath, YAML.stringify(cfg), "utf8");
      resignIntegrationsConfig(workspace);

      const out = await dispatchIntegrationEvent({
        workspace,
        eventName: "INCIDENT_CREATED",
        agentId: "agent-alpha",
        summary: "Prod incident opened",
        details: {
          severity: "high",
          incidentId: "inc_123"
        }
      });

      expect(out.dispatched).toHaveLength(1);
      expect(out.dispatched[0]?.channelId).toBe("ops-slack");
      expect(out.skipped).toHaveLength(0);
      expect(received).toHaveLength(1);
      const payload = JSON.parse(received[0] ?? "{}") as {
        text?: string;
        blocks?: Array<{ type?: string }>;
      };
      expect(payload.text).toContain("INCIDENT_CREATED");
      expect(Array.isArray(payload.blocks)).toBe(true);
      expect(payload.blocks?.length).toBeGreaterThan(0);
    } finally {
      await new Promise<void>((resolvePromise) => slackServer.close(() => resolvePromise()));
    }
  });
});
