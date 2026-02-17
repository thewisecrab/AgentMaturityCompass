import type { AdapterDefinition } from "../adapterTypes.js";

export const claudeCliAdapter: AdapterDefinition = {
  id: "claude-cli",
  displayName: "Claude CLI",
  kind: "CLI",
  detection: {
    commandCandidates: ["claude", "claude-cli"],
    versionArgs: ["--version"],
    parseVersionRegex: "([0-9]+(?:\\.[0-9]+){0,2})"
  },
  providerFamily: "ANTHROPIC",
  defaultRunMode: "SUPERVISE",
  envStrategy: {
    leaseCarrier: "ENV_API_KEY",
    baseUrlEnv: {
      keys: ["ANTHROPIC_BASE_URL", "ANTHROPIC_API_URL", "AMC_LLM_BASE_URL"],
      valueTemplate: "{{gatewayBase}}{{providerRoute}}"
    },
    apiKeyEnv: {
      keys: ["ANTHROPIC_API_KEY", "X_API_KEY", "API_KEY"],
      valueTemplate: "{{lease}}"
    },
    proxyEnv: {
      setHttpProxy: true,
      setHttpsProxy: true,
      noProxy: "localhost,127.0.0.1,::1"
    }
  },
  commandTemplate: {
    executable: "claude",
    args: [],
    supportsStdin: true
  }
};

