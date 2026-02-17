import { verifySignedFileWithAuditor } from "../org/orgSigner.js";

export function verifyAuditMapFile(workspace: string, filePath: string) {
  return verifySignedFileWithAuditor(workspace, filePath);
}
