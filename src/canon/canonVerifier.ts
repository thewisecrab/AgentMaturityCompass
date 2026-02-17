import { verifySignedFileWithAuditor } from "../org/orgSigner.js";
import { canonPath } from "./canonLoader.js";

export function verifyCanon(workspace: string) {
  return verifySignedFileWithAuditor(workspace, canonPath(workspace));
}
