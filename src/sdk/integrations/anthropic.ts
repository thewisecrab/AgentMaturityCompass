import type { AMCClient } from "../amcClient.js";

type AnyRecord = Record<string, unknown>;

function asRecord(value: unknown): AnyRecord {
  return typeof value === "object" && value !== null ? (value as AnyRecord) : {};
}

export function instrumentAnthropicClient<T extends object>(client: T, amc: AMCClient): T {
  const root = client as unknown as Record<string, unknown>;
  return new Proxy(root, {
    get(target, prop, receiver) {
      if (prop === "messages") {
        const messages = Reflect.get(target, prop, receiver) as Record<string, unknown>;
        return new Proxy(messages, {
          get(messagesTarget, messagesProp, messagesReceiver) {
            if (messagesProp === "create") {
              return async (payload: unknown) => (await amc.anthropicMessages(asRecord(payload))).body;
            }
            return Reflect.get(messagesTarget, messagesProp, messagesReceiver);
          }
        });
      }
      return Reflect.get(target, prop, receiver);
    }
  }) as unknown as T;
}
