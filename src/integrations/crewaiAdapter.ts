export interface CrewAIAdapterConfig {
  projectPath: string;
  ledgerPath?: string;
  autoCapture?: boolean;
}

export interface CrewAIWrapper {
  config: CrewAIAdapterConfig;
  wrapCrew: (crew: unknown) => unknown;
  captureEvidence: (event: Record<string, unknown>) => void;
}

export function createCrewAIAdapter(config: CrewAIAdapterConfig): CrewAIWrapper {
  const events: Array<Record<string, unknown>> = [];
  return {
    config,
    wrapCrew(crew: unknown): unknown {
      return new Proxy(crew as object, {
        get(target: Record<string, unknown>, prop: string) {
          const orig = target[prop];
          if (typeof orig === "function" && (prop === "kickoff" || prop === "run")) {
            return async (...args: unknown[]) => {
              const start = Date.now();
              const result = await (orig as Function).apply(target, args);
              events.push({
                type: "crewai_execution",
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
