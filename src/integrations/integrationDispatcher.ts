import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { randomUUID } from "node:crypto";
import { canonicalize } from "../utils/json.js";
import { sha256Hex } from "../utils/hash.js";
import { openLedger } from "../ledger/ledger.js";
import {
  loadIntegrationsConfig,
  resolveSecretRef,
  verifyIntegrationsConfigSignature
} from "./integrationStore.js";

export interface IntegrationDispatchPayload {
  type: "AMC_OPS_EVENT";
  eventName: string;
  ts: number;
  agentId: string;
  summary: string;
  details: Record<string, unknown>;
}

export interface IntegrationDispatchResult {
  channelId: string;
  eventName: string;
  payloadSha256: string;
  httpStatus: number;
  eventId: string;
  receiptId: string;
  receipt: string;
}

function requestImpl(url: URL) {
  return url.protocol === "https:" ? httpsRequest : httpRequest;
}

const WEBHOOK_TIMEOUT_MS = 10_000;

async function postJson(urlRaw: string, body: string, headers: Record<string, string> = {}): Promise<number> {
  const url = new URL(urlRaw);
  return new Promise<number>((resolvePromise, rejectPromise) => {
    const req = requestImpl(url)(
      url,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": Buffer.byteLength(body),
          ...headers
        }
      },
      (res) => {
        const status = res.statusCode ?? 0;
        res.resume();
        res.on("end", () => resolvePromise(status));
      }
    );
    req.setTimeout(WEBHOOK_TIMEOUT_MS, () => {
      req.destroy(new Error(`integration webhook timeout after ${WEBHOOK_TIMEOUT_MS}ms`));
    });
    req.on("error", rejectPromise);
    req.write(body);
    req.end();
  });
}

function slackWebhookPayload(body: IntegrationDispatchPayload, channel?: string): string {
  const summary = body.summary.trim().length > 0 ? body.summary.trim() : body.eventName;
  const detailsJson = JSON.stringify(body.details, null, 2);
  const detailsSection = detailsJson === "{}" ? "None" : detailsJson.slice(0, 3000);
  return canonicalize({
    text: `[AMC] ${body.eventName}: ${summary}`,
    channel,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `AMC Incident: ${body.eventName}`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Agent:* \`${body.agentId}\`\n*Summary:* ${summary}`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Details:*\n\`\`\`${detailsSection}\`\`\``
        }
      }
    ]
  });
}

function writeIntegrationEvidence(params: {
  workspace: string;
  channelId: string;
  eventName: string;
  agentId: string;
  payloadBody: string;
  payloadSha256: string;
  httpStatus: number;
}): {
  eventId: string;
  receiptId: string;
  receipt: string;
} {
  const ledger = openLedger(params.workspace);
  const sessionId = `integration-dispatch-${Date.now()}-${randomUUID().replace(/-/g, "")}`;
  try {
    ledger.startSession({
      sessionId,
      runtime: "unknown",
      binaryPath: "amc-integrations",
      binarySha256: sha256Hex("amc-integrations")
    });
    const written = ledger.appendEvidenceWithReceipt({
      sessionId,
      runtime: "unknown",
      eventType: "audit",
      payload: params.payloadBody,
      payloadExt: "json",
      inline: true,
      meta: {
        trustTier: "OBSERVED",
        auditType: "INTEGRATION_DISPATCHED",
        channelId: params.channelId,
        eventName: params.eventName,
        payloadSha256: params.payloadSha256,
        httpStatus: params.httpStatus,
        agentId: params.agentId
      },
      receipt: {
        kind: "guard_check",
        agentId: params.agentId,
        providerId: "integration",
        model: null,
        bodySha256: params.payloadSha256
      }
    });
    ledger.sealSession(sessionId);
    return {
      eventId: written.id,
      receiptId: written.receiptId,
      receipt: written.receipt
    };
  } finally {
    ledger.close();
  }
}

export async function dispatchIntegrationEvent(params: {
  workspace: string;
  eventName: string;
  agentId: string;
  summary: string;
  details?: Record<string, unknown>;
  forceChannelId?: string;
}): Promise<{
  dispatched: IntegrationDispatchResult[];
  skipped: string[];
}> {
  const verify = verifyIntegrationsConfigSignature(params.workspace);
  if (!verify.valid) {
    throw new Error(`integrations config signature invalid: ${verify.reason ?? "unknown"}`);
  }
  const config = loadIntegrationsConfig(params.workspace);
  const routed = params.forceChannelId
    ? [params.forceChannelId]
    : config.integrations.routing[params.eventName] ?? [];
  const routedSet = new Set(routed);
  const channels = config.integrations.channels.filter((channel) => routedSet.has(channel.id));
  const payload: IntegrationDispatchPayload = {
    type: "AMC_OPS_EVENT",
    eventName: params.eventName,
    ts: Date.now(),
    agentId: params.agentId,
    summary: params.summary,
    details: params.details ?? {}
  };
  const standardPayloadBody = canonicalize(payload);
  const skipped: string[] = [];
  const dispatched: IntegrationDispatchResult[] = [];
  for (const channel of channels) {
    const channelId = channel.id;
    if (!channel.enabled) {
      skipped.push(`${channelId}:disabled`);
      continue;
    }
    try {
      let payloadBody = standardPayloadBody;
      let httpStatus = 0;

      if (channel.type === "webhook") {
        const secret = resolveSecretRef(params.workspace, channel.secretRef);
        if (!secret) {
          skipped.push(`${channelId}:missing-secret`);
          continue;
        }
        httpStatus = await postJson(channel.url, payloadBody, {
          "x-amc-integration-secret": secret
        });
      } else if (channel.type === "slack_webhook") {
        const webhookUrl = resolveSecretRef(params.workspace, channel.webhookUrlRef);
        if (!webhookUrl) {
          skipped.push(`${channelId}:missing-slack-webhook-url`);
          continue;
        }
        payloadBody = slackWebhookPayload(payload, channel.channel);
        httpStatus = await postJson(webhookUrl, payloadBody);
      } else {
        skipped.push(`${channelId}:unsupported-channel-type`);
        continue;
      }

      const payloadSha256 = sha256Hex(Buffer.from(payloadBody, "utf8"));
      const evidence = writeIntegrationEvidence({
        workspace: params.workspace,
        channelId,
        eventName: params.eventName,
        agentId: params.agentId,
        payloadBody,
        payloadSha256,
        httpStatus
      });
      dispatched.push({
        channelId,
        eventName: params.eventName,
        payloadSha256,
        httpStatus,
        eventId: evidence.eventId,
        receiptId: evidence.receiptId,
        receipt: evidence.receipt
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      skipped.push(`${channelId}:dispatch-failed:${reason}`);
    }
  }
  return {
    dispatched,
    skipped
  };
}

export async function dispatchIntegrationTest(params: {
  workspace: string;
  channelId?: string;
}): Promise<{
  dispatched: IntegrationDispatchResult[];
  skipped: string[];
}> {
  return dispatchIntegrationEvent({
    workspace: params.workspace,
    eventName: "INTEGRATION_TEST",
    agentId: "system",
    summary: "AMC integration test dispatch",
    details: {
      source: "amc integrations test"
    },
    forceChannelId: params.channelId
  });
}
