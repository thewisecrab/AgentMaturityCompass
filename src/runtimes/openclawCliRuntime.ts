import type { AMCConfig } from "../types.js";
import { discoverCapabilities, resolveCommand, type RuntimeIntegration } from "./common.js";

export const openclawCliRuntime: RuntimeIntegration = {
  name: "openclaw",
  installHint: "Install OpenClaw CLI and ensure `openclaw` is available in PATH.",
  detect(config: AMCConfig) {
    const command = config.runtimes.openclaw.command;
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
