import type { AMCConfig } from "../types.js";
import { discoverCapabilities, resolveCommand, type RuntimeIntegration } from "./common.js";

export const geminiCliRuntime: RuntimeIntegration = {
  name: "gemini",
  installHint: "Install Gemini CLI and ensure `gemini` is available in PATH.",
  detect(config: AMCConfig) {
    const command = config.runtimes.gemini.command;
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
