import { signFileWithAuditor } from "../org/orgSigner.js";
import { canonPath } from "./canonLoader.js";

export function signCanon(workspace: string): string {
  return signFileWithAuditor(workspace, canonPath(workspace));
}
