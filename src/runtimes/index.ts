import type { AMCConfig, RuntimeName } from "../types.js";
import { claudeCliRuntime } from "./claudeCliRuntime.js";
import { geminiCliRuntime } from "./geminiCliRuntime.js";
import { mockRuntime } from "./mockRuntime.js";
import { openclawCliRuntime } from "./openclawCliRuntime.js";
import type { RuntimeIntegration } from "./common.js";

export const runtimeIntegrations: RuntimeIntegration[] = [
  claudeCliRuntime,
  geminiCliRuntime,
  openclawCliRuntime,
  mockRuntime
];

export function getRuntimeIntegration(name: RuntimeName): RuntimeIntegration {
  const found = runtimeIntegrations.find((runtime) => runtime.name === name);
  if (!found) {
    throw new Error(`Unsupported runtime: ${name}`);
  }
  return found;
}

export function detectAllRuntimes(config: AMCConfig): Array<{
  name: RuntimeName;
  available: boolean;
  command: string;
  resolvedPath: string | null;
  error?: string;
  installHint: string;
}> {
  return runtimeIntegrations
    .filter((runtime) => runtime.name !== "mock")
    .map((runtime) => {
      const detection = runtime.detect(config);
      return {
        name: runtime.name,
        available: detection.available,
        command: detection.command,
        resolvedPath: detection.resolvedPath,
        error: detection.error,
        installHint: runtime.installHint
      };
    });
}
