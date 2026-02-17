import { loadDiagnosticBank, verifyDiagnosticBankSignature } from "./bankLoader.js";

export function verifyDiagnosticBank(workspace: string): {
  signature: ReturnType<typeof verifyDiagnosticBankSignature>;
  bank: ReturnType<typeof loadDiagnosticBank>;
} {
  return {
    signature: verifyDiagnosticBankSignature(workspace),
    bank: loadDiagnosticBank(workspace)
  };
}
