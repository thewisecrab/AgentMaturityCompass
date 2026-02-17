import { signFileWithAuditor } from "../org/orgSigner.js";

export function signAuditMapFile(workspace: string, filePath: string): string {
  return signFileWithAuditor(workspace, filePath);
}
