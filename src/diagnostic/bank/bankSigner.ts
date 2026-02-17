import { signFileWithAuditor } from "../../org/orgSigner.js";
import { diagnosticBankPath } from "./bankLoader.js";

export function signDiagnosticBank(workspace: string): string {
  return signFileWithAuditor(workspace, diagnosticBankPath(workspace));
}
