export interface AutoGenAdapterConfig {
  projectPath: string;
  ledgerPath?: string;
  autoCapture?: boolean;
}

export interface AutoGenWrapper {
  config: AutoGenAdapterConfig;
  wrapAgent: (agent: unknown) => unknown;
  captureEvidence: (event: Record<string, unknown>) => void;
}

export function createAutoGenAdapter(config: AutoGenAdapterConfig): AutoGenWrapper {
  const events: Array<Record<string, unknown>> = [];
  return {
    config,
    wrapAgent(agent: unknown): unknown {
      return new Proxy(agent as object, {
        get(target: Record<string, unknown>, prop: string) {
          const orig = target[prop];
          if (typeof orig === "function" && (prop === "initiate_chat" || prop === "generate_reply" || prop === "run")) {
            return async (...args: unknown[]) => {
              const start = Date.now();
              const result = await (orig as Function).apply(target, args);
              events.push({
                type: "autogen_interaction",
                method: prop,
                durationMs: Date.now() - start,
                ts: new Date().toISOString(),
              });
              return result;
            };
          }
          return orig;
        },
      });
    },
    captureEvidence(event: Record<string, unknown>) { events.push(event); },
  };
}
