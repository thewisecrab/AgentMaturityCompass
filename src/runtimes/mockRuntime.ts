import type { AMCConfig } from "../types.js";
import { discoverCapabilities, resolveCommand, type RuntimeIntegration } from "./common.js";

export const mockRuntime: RuntimeIntegration = {
  name: "mock",
  installHint: "Mock runtime is used for tests only.",
  detect(config: AMCConfig) {
    const command = config.runtimes.mock.command;
    const resolvedPath = resolveCommand(command);
    if (!resolvedPath) {
      return {
        available: false,
        command,
        resolvedPath: null,
        capabilities: {
          supportsHelp: false,
          supportsVersion: false,
          knownFlags: [],
          rawHelp: ""
        },
        error: "command not found"
      };
    }

    return {
      available: true,
      command,
      resolvedPath,
      capabilities: discoverCapabilities(command)
    };
  }
};
