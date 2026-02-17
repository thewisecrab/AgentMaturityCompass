import type { AdapterDefinition } from "../adapterTypes.js";

export const geminiCliAdapter: AdapterDefinition = {
  id: "gemini-cli",
  displayName: "Gemini CLI",
  kind: "CLI",
  detection: {
    commandCandidates: ["gemini", "gemini-cli"],
    versionArgs: ["--version"],
    parseVersionRegex: "([0-9]+(?:\\.[0-9]+){0,2})"
  },
  providerFamily: "GEMINI",
  defaultRunMode: "SUPERVISE",
  envStrategy: {
    leaseCarrier: "ENV_API_KEY",
    baseUrlEnv: {
      keys: ["GEMINI_BASE_URL", "GOOGLE_API_BASE", "AMC_LLM_BASE_URL"],
      valueTemplate: "{{gatewayBase}}{{providerRoute}}"
    },
    apiKeyEnv: {
      keys: ["GEMINI_API_KEY", "GOOGLE_API_KEY", "X_GOOG_API_KEY"],
      valueTemplate: "{{lease}}"
    },
    proxyEnv: {
      setHttpProxy: true,
      setHttpsProxy: true,
      noProxy: "localhost,127.0.0.1,::1"
    }
  },
  commandTemplate: {
    executable: "gemini",
    args: [],
    supportsStdin: true
  }
};

