import type { AMCClient } from "../amcClient.js";

type AnyRecord = Record<string, unknown>;

function asRecord(value: unknown): AnyRecord {
  return typeof value === "object" && value !== null ? (value as AnyRecord) : {};
}

export function instrumentOpenAIClient<T extends object>(client: T, amc: AMCClient): T {
  const root = client as unknown as Record<string, unknown>;
  return new Proxy(root, {
    get(target, prop, receiver) {
      if (prop === "chat") {
        const chat = Reflect.get(target, prop, receiver) as Record<string, unknown>;
        return new Proxy(chat, {
          get(chatTarget, chatProp, chatReceiver) {
            if (chatProp === "completions") {
              const completions = Reflect.get(chatTarget, chatProp, chatReceiver) as Record<string, unknown>;
              return new Proxy(completions, {
                get(compTarget, compProp, compReceiver) {
                  if (compProp === "create") {
                    return async (payload: unknown) => (await amc.openaiChat(asRecord(payload))).body;
                  }
                  return Reflect.get(compTarget, compProp, compReceiver);
                }
              });
            }
            return Reflect.get(chatTarget, chatProp, chatReceiver);
          }
        });
      }
      if (prop === "responses") {
        const responses = Reflect.get(target, prop, receiver) as Record<string, unknown>;
        return new Proxy(responses, {
          get(resTarget, resProp, resReceiver) {
            if (resProp === "create") {
              return async (payload: unknown) => (await amc.openaiResponses(asRecord(payload))).body;
            }
            return Reflect.get(resTarget, resProp, resReceiver);
          }
        });
      }
      return Reflect.get(target, prop, receiver);
    }
  }) as unknown as T;
}

export function createOpenAIFetchTransport(amc: AMCClient): typeof fetch {
  return async (input: URL | RequestInfo, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const path = (() => {
      try {
        return new URL(url).pathname;
      } catch {
        return url;
      }
    })();
    const bodyText = typeof init?.body === "string" ? init.body : init?.body ? String(init.body) : "{}";
    const payload = asRecord(JSON.parse(bodyText));
    const out = path.endsWith("/responses") ? await amc.openaiResponses(payload) : await amc.openaiChat(payload);
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
