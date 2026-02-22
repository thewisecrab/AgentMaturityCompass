import { randomUUID } from "node:crypto";
import { assertNoSelfScoring, requireBridgeUrl } from "./amcGuards.js";
import { hashSdkValue, redactSdkText } from "./amcEvidence.js";
import { sendBridgeTelemetry } from "./amcTelemetry.js";
import { AMCSDKError, trimForError } from "./errors.js";
import type { AMCTelemetryEvent } from "./amcTelemetry.js";

const DEFAULT_BRIDGE_URL = "http://127.0.0.1:3212";

export type AMCPayload = Record<string, unknown>;

export interface OpenAIChatPayload extends AMCPayload {
  model?: string;
  messages?: Array<{ role: string; content: unknown }>;
}

export interface OpenAIResponsesPayload extends AMCPayload {
  model?: string;
  input?: unknown;
}

export interface OpenAIEmbeddingsPayload extends AMCPayload {
  model?: string;
  input?: string | string[];
}

export interface OpenAIImagesPayload extends AMCPayload {
  model?: string;
  prompt?: string;
}

export interface OpenAIAudioSpeechPayload extends AMCPayload {
  model?: string;
  voice?: string;
  input?: string;
}

export interface AnthropicMessagesPayload extends AMCPayload {
  model?: string;
  messages?: Array<{ role: string; content: unknown }>;
}

export interface GeminiGenerateContentPayload extends AMCPayload {
  model?: string;
  contents?: unknown;
}

export interface OpenRouterChatPayload extends AMCPayload {
  model?: string;
  messages?: Array<{ role: string; content: unknown }>;
}

export interface XAIChatPayload extends AMCPayload {
  model?: string;
  messages?: Array<{ role: string; content: unknown }>;
}

export interface LocalChatPayload extends AMCPayload {
  model?: string;
  messages?: Array<{ role: string; content: unknown }>;
}

/**
 * Configuration for the AMC Bridge SDK client.
 */
export interface AMCClientConfig {
  /**
   * Full AMC Bridge base URL, for example http://127.0.0.1:3212.
   * Falls back to AMC_BRIDGE_URL, then default localhost bridge.
   */
  bridgeUrl?: string;
  /**
   * Bridge bearer token. Falls back to AMC_TOKEN.
   */
  token?: string;
  workspaceId?: string;
  fetchImpl?: typeof fetch;
}

/**
 * Raw bridge response envelope for all routed SDK calls.
 */
export interface AMCBridgeResponse<T = unknown> {
  status: number;
  body: T;
  requestId: string | null;
  receipt: string | null;
  correlationId: string | null;
}

function resolveClientConfig(config: AMCClientConfig): Required<Pick<AMCClientConfig, "bridgeUrl" | "token">> & AMCClientConfig {
  const bridgeUrl = config.bridgeUrl ?? process.env.AMC_BRIDGE_URL ?? DEFAULT_BRIDGE_URL;
  const token = config.token ?? process.env.AMC_TOKEN ?? "";
  return { ...config, bridgeUrl, token };
}

export class AMCClient {
  readonly bridgeUrl: string;
  readonly token: string;
  readonly workspaceId: string | null;
  private readonly fetchImpl: typeof fetch;

  constructor(config: AMCClientConfig) {
    const resolved = resolveClientConfig(config);
    this.bridgeUrl = requireBridgeUrl(resolved.bridgeUrl);
    this.token = resolved.token;
    this.workspaceId = resolved.workspaceId ?? null;
    this.fetchImpl = resolved.fetchImpl ?? fetch;
  }

  private async callBridge<T>(path: string, payload: AMCPayload): Promise<AMCBridgeResponse<T>> {
    assertNoSelfScoring(payload);
    const correlationId = randomUUID();
    const headers: Record<string, string> = {
      "content-type": "application/json",
      "x-amc-correlation-id": correlationId
    };
    if (this.token.trim().length > 0) {
      headers.authorization = `Bearer ${this.token}`;
    }
    let response: Response;
    try {
      response = await this.fetchImpl(`${this.bridgeUrl}${path}`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
    } catch (error) {
      throw new AMCSDKError({
        code: "NETWORK_ERROR",
        message: `Failed to reach AMC Bridge at ${this.bridgeUrl}${path}.`,
        path,
        details: "Check AMC_BRIDGE_URL, network reachability, and bridge availability (`amc up`).",
        cause: error
      });
    }

    const bodyText = await response.text();
    const parsed = (() => {
      try {
        if (bodyText.trim().length === 0) {
          return ({ raw: "" } as unknown) as T;
        }
        return JSON.parse(bodyText) as T;
      } catch {
        if (response.headers.get("content-type")?.toLowerCase().includes("application/json")) {
          throw new AMCSDKError({
            code: "INVALID_JSON",
            message: `AMC Bridge returned invalid JSON for ${path}.`,
            status: response.status,
            path,
            details: trimForError(bodyText)
          });
        }
        return ({ raw: bodyText } as unknown) as T;
      }
    })();
    return {
      status: response.status,
      body: parsed,
      requestId: response.headers.get("x-amc-bridge-request-id"),
      receipt: response.headers.get("x-amc-receipt"),
      correlationId: response.headers.get("x-amc-correlation-id")
    };
  }

  async openaiChat<T = unknown>(payload: OpenAIChatPayload): Promise<AMCBridgeResponse<T>> {
    return this.callBridge("/bridge/openai/v1/chat/completions", payload);
  }

  async openaiResponses<T = unknown>(payload: OpenAIResponsesPayload): Promise<AMCBridgeResponse<T>> {
    return this.callBridge("/bridge/openai/v1/responses", payload);
  }

  async openaiEmbeddings<T = unknown>(payload: OpenAIEmbeddingsPayload): Promise<AMCBridgeResponse<T>> {
    return this.callBridge("/bridge/openai/v1/embeddings", payload);
  }

  async openaiImages<T = unknown>(payload: OpenAIImagesPayload): Promise<AMCBridgeResponse<T>> {
    return this.callBridge("/bridge/openai/v1/images/generations", payload);
  }

  async openaiAudioSpeech<T = unknown>(payload: OpenAIAudioSpeechPayload): Promise<AMCBridgeResponse<T>> {
    return this.callBridge("/bridge/openai/v1/audio/speech", payload);
  }

  async anthropicMessages<T = unknown>(payload: AnthropicMessagesPayload): Promise<AMCBridgeResponse<T>> {
    return this.callBridge("/bridge/anthropic/v1/messages", payload);
  }

  async geminiGenerateContent<T = unknown>(model: string, payload: GeminiGenerateContentPayload): Promise<AMCBridgeResponse<T>> {
    return this.callBridge(`/bridge/gemini/v1beta/models/${encodeURIComponent(model)}:generateContent`, payload);
  }

  /**
   * Alias for geminiGenerateContent with verb-first naming.
   */
  async generateGeminiContent<T = unknown>(model: string, payload: GeminiGenerateContentPayload): Promise<AMCBridgeResponse<T>> {
    return this.geminiGenerateContent(model, payload);
  }

  async openrouterChat<T = unknown>(payload: OpenRouterChatPayload): Promise<AMCBridgeResponse<T>> {
    return this.callBridge("/bridge/openrouter/v1/chat/completions", payload);
  }

  /**
   * Alias for openrouterChat with router-cased naming.
   */
  async openRouterChat<T = unknown>(payload: OpenRouterChatPayload): Promise<AMCBridgeResponse<T>> {
    return this.openrouterChat(payload);
  }

  async xaiChat<T = unknown>(payload: XAIChatPayload): Promise<AMCBridgeResponse<T>> {
    return this.callBridge("/bridge/xai/v1/chat/completions", payload);
  }

  async localChat<T = unknown>(payload: LocalChatPayload): Promise<AMCBridgeResponse<T>> {
    return this.callBridge("/bridge/local/v1/chat/completions", payload);
  }

  async reportOutput(params: {
    sessionId: string;
    value: string | Record<string, unknown>;
    provider?: string;
    runId?: string;
  }): Promise<void> {
    const serialized = typeof params.value === "string" ? params.value : JSON.stringify(params.value);
    await this.sendTelemetry({
      sessionId: params.sessionId,
      eventType: "agent_stdout",
      provider: params.provider,
      runId: params.runId,
      payload: redactSdkText(serialized)
    });
  }

  outputHash(value: string | Record<string, unknown>): string {
    const serialized = typeof value === "string" ? value : JSON.stringify(value);
    return hashSdkValue(serialized);
  }

  async sendTelemetry(event: AMCTelemetryEvent): Promise<void> {
    await sendBridgeTelemetry({
      bridgeUrl: this.bridgeUrl,
      token: this.token,
      fetchImpl: this.fetchImpl,
      event
    });
  }
}

export function createAMCClient(config: AMCClientConfig): AMCClient {
  return new AMCClient(config);
}

/**
 * Build a client using AMC_* environment variables, with optional overrides.
 */
export function createAMCClientFromEnv(overrides: Partial<AMCClientConfig> = {}): AMCClient {
  return new AMCClient({ ...overrides });
}
