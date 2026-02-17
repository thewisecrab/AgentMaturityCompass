import type { AMCClient } from "../amcClient.js";

type AnyRecord = Record<string, unknown>;

function asRecord(value: unknown): AnyRecord {
  return typeof value === "object" && value !== null ? (value as AnyRecord) : {};
}

export function instrumentGeminiClient<T extends object>(client: T, amc: AMCClient): T {
  const root = client as unknown as Record<string, unknown>;
  return new Proxy(root, {
    get(target, prop, receiver) {
      if (prop === "models") {
        const models = Reflect.get(target, prop, receiver) as Record<string, unknown>;
        return new Proxy(models, {
          get(modelsTarget, modelsProp, modelsReceiver) {
            if (modelsProp === "generateContent") {
              return async (...args: unknown[]) => {
                const first = args[0];
                const second = args[1];
                if (typeof first === "string") {
                  return (await amc.geminiGenerateContent(first, asRecord(second))).body;
                }
                const payload = asRecord(first);
                const model = typeof payload.model === "string" ? payload.model : "gemini-1.5-flash";
                return (await amc.geminiGenerateContent(model, payload)).body;
              };
            }
            return Reflect.get(modelsTarget, modelsProp, modelsReceiver);
          }
        });
      }
      return Reflect.get(target, prop, receiver);
    }
  }) as unknown as T;
}
