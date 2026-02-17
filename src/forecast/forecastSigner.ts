import { signFileWithAuditor } from "../org/orgSigner.js";

export function signForecastArtifactFile(workspace: string, path: string): string {
  return signFileWithAuditor(workspace, path);
}

