export interface LangChainAdapterConfig {
  projectPath: string;
  ledgerPath?: string;
  autoCapture?: boolean;
}

export interface LangChainWrapper {
  config: LangChainAdapterConfig;
  wrapAgent: (agent: unknown) => unknown;
  captureEvidence: (event: Record<string, unknown>) => void;
}

export function createLangChainAdapter(config: LangChainAdapterConfig): LangChainWrapper {
  const events: Array<Record<string, unknown>> = [];
  return {
    config,
    wrapAgent(agent: unknown): unknown {
      // Wrap a LangChain agent to auto-capture evidence
      // In real implementation, this would use LangChain callbacks
      return new Proxy(agent as object, {
        get(target: Record<string, unknown>, prop: string) {
          const orig = target[prop];
          if (typeof orig === "function" && (prop === "invoke" || prop === "call" || prop === "run")) {
            return async (...args: unknown[]) => {
              const start = Date.now();
              const result = await (orig as Function).apply(target, args);
              events.push({
                type: "langchain_invocation",
                method: prop,
                durationMs: Date.now() - start,
                ts: new Date().toISOString(),
                inputSummary: typeof args[0] === "string" ? args[0].slice(0, 100) : "object",
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
