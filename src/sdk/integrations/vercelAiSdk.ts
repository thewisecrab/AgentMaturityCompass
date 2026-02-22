import type { AMCClient } from "../amcClient.js";
import { AMCSDKError } from "../errors.js";

type BridgeProvider = "openai" | "anthropic" | "gemini" | "openrouter" | "xai" | "local";

function bodyToObject(body: RequestInit["body"]): Record<string, unknown> {
  if (!body) {
    return {};
  }
  if (typeof body === "string") {
    try {
      return JSON.parse(body) as Record<string, unknown>;
    } catch (error) {
      throw new AMCSDKError({
        code: "INVALID_JSON",
        message: "createVercelAIFetchBridge expected JSON request body string.",
        details: "Pass a JSON-serialized object body from your fetch transport.",
        cause: error
      });
    }
  }
  return {};
}

export function createVercelAIFetchBridge(amc: AMCClient, provider: BridgeProvider = "openai"): typeof fetch {
  return async (_input: URL | RequestInfo, init?: RequestInit): Promise<Response> => {
    const payload = bodyToObject(init?.body);
    const out = await (async () => {
      switch (provider) {
        case "openai":
          return amc.openaiChat(payload);
        case "anthropic":
          return amc.anthropicMessages(payload);
        case "gemini": {
          const model = typeof payload.model === "string" ? payload.model : "gemini-1.5-flash";
          return amc.geminiGenerateContent(model, payload);
        }
        case "openrouter":
          return amc.openrouterChat(payload);
        case "xai":
          return amc.xaiChat(payload);
        case "local":
          return amc.localChat(payload);
      }
    })();
    return new Response(JSON.stringify(out.body), {
      status: out.status,
      headers: {
        "content-type": "application/json",
        "x-amc-bridge-request-id": out.requestId ?? "",
        "x-amc-correlation-id": out.correlationId ?? "",
        "x-amc-receipt": out.receipt ?? ""
      }
    });
  };
}
