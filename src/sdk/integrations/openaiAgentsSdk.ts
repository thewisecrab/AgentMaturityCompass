import type { AMCClient } from "../amcClient.js";

type AnyRecord = Record<string, unknown>;

function asRecord(value: unknown): AnyRecord {
  return typeof value === "object" && value !== null ? (value as AnyRecord) : {};
}

export function instrumentOpenAIAgentsSdk<T extends object>(client: T, amc: AMCClient): T {
  const root = client as unknown as Record<string, unknown>;
  return new Proxy(root, {
    get(target, prop, receiver) {
      if (prop === "run") {
        return async (payload: unknown) => {
          const out = await amc.openaiResponses(asRecord(payload));
          return out.body;
        };
      }
      if (prop === "responses") {
        const responses = Reflect.get(target, prop, receiver) as Record<string, unknown>;
        return new Proxy(responses, {
          get(responseTarget, responseProp, responseReceiver) {
            if (responseProp === "create") {
              return async (payload: unknown) => (await amc.openaiResponses(asRecord(payload))).body;
            }
            return Reflect.get(responseTarget, responseProp, responseReceiver);
          }
        });
      }
      return Reflect.get(target, prop, receiver);
    }
  }) as unknown as T;
}
