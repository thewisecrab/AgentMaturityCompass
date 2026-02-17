import type { AMCConfig } from "../types.js";
import { discoverCapabilities, resolveCommand, type RuntimeIntegration } from "./common.js";

export const claudeCliRuntime: RuntimeIntegration = {
  name: "claude",
  installHint: "Install Claude CLI and ensure `claude` is available in PATH. If using Anthropic tooling, follow your org-specific setup docs.",
  detect(config: AMCConfig) {
    const command = config.runtimes.claude.command;
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
