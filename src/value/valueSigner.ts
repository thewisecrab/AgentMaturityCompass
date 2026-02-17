import { signFileWithAuditor } from "../org/orgSigner.js";

export function signValueFile(workspace: string, path: string): string {
  return signFileWithAuditor(workspace, path);
}
