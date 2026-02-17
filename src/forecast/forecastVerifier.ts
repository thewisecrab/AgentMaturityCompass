import { join } from "node:path";
import {
  forecastPolicyPath,
  forecastScopeLatestPath,
  loadLatestForecastArtifact,
  verifyForecastPolicySignature
} from "./forecastStore.js";
import type { ForecastScope } from "./forecastSchema.js";
import { verifySignedFileWithAuditor } from "../org/orgSigner.js";

export function verifyForecastPolicy(workspace: string): ReturnType<typeof verifyForecastPolicySignature> {
  return verifyForecastPolicySignature(workspace);
}

export function verifyLatestForecast(workspace: string, scope: ForecastScope): {
  file: ReturnType<typeof verifySignedFileWithAuditor>;
  parseOk: boolean;
  parseError: string | null;
} {
  const file = verifySignedFileWithAuditor(workspace, forecastScopeLatestPath(workspace, scope));
  if (!file.valid) {
    return {
      file,
      parseOk: false,
      parseError: file.reason
    };
  }
  try {
    loadLatestForecastArtifact(workspace, scope);
    return {
      file,
      parseOk: true,
      parseError: null
    };
  } catch (error) {
    return {
      file,
      parseOk: false,
      parseError: String(error)
    };
  }
}

export function verifyForecastWorkspaceArtifacts(workspace: string): {
  policy: ReturnType<typeof verifyForecastPolicySignature>;
  scheduler: ReturnType<typeof verifySignedFileWithAuditor>;
} {
  return {
    policy: verifyForecastPolicySignature(workspace),
    scheduler: verifySignedFileWithAuditor(workspace, join(workspace, ".amc", "forecast", "scheduler.json"))
  };
}

export function forecastPolicyFilePath(workspace: string): string {
  return forecastPolicyPath(workspace);
}

