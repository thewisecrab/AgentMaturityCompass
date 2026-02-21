import type { AMCConfig } from "../types.js";
import { discoverCapabilities, resolveCommand, type RuntimeIntegration } from "./common.js";

export const claudeCliRuntime: RuntimeIntegration = {
  name: "claude",
  installHint: "Install Claude Code CLI: npm install -g @anthropic-ai/claude-code",
  detect(config: AMCConfig) {
    const command = config.runtimes.claude?.command ?? "claude";
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
