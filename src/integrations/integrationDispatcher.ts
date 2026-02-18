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

async function postWebhook(urlRaw: string, body: string, secret: string): Promise<number> {
  const url = new URL(urlRaw);
  return new Promise<number>((resolvePromise, rejectPromise) => {
    const req = requestImpl(url)(
      url,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": Buffer.byteLength(body),
          "x-amc-integration-secret": secret
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
  const skipped: string[] = [];
  const dispatched: IntegrationDispatchResult[] = [];
  for (const channel of channels) {
    if (!channel.enabled) {
      skipped.push(`${channel.id}:disabled`);
      continue;
    }
    const secret = resolveSecretRef(params.workspace, channel.secretRef);
    if (!secret) {
      skipped.push(`${channel.id}:missing-secret`);
      continue;
    }
    const payload: IntegrationDispatchPayload = {
      type: "AMC_OPS_EVENT",
      eventName: params.eventName,
      ts: Date.now(),
      agentId: params.agentId,
      summary: params.summary,
      details: params.details ?? {}
    };
    const payloadBody = canonicalize(payload);
    const payloadSha256 = sha256Hex(Buffer.from(payloadBody, "utf8"));
    try {
      const httpStatus = await postWebhook(channel.url, payloadBody, secret);
      const evidence = writeIntegrationEvidence({
        workspace: params.workspace,
        channelId: channel.id,
        eventName: params.eventName,
        agentId: params.agentId,
        payloadBody,
        payloadSha256,
        httpStatus
      });
      dispatched.push({
        channelId: channel.id,
        eventName: params.eventName,
        payloadSha256,
        httpStatus,
        eventId: evidence.eventId,
        receiptId: evidence.receiptId,
        receipt: evidence.receipt
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      skipped.push(`${channel.id}:dispatch-failed:${reason}`);
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
