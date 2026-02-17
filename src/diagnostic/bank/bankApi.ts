import {
  initDiagnosticBank,
  loadDiagnosticBank,
  saveDiagnosticBank,
  verifyDiagnosticBankSignature
} from "./bankLoader.js";
import type { DiagnosticBank } from "./bankSchema.js";

export function diagnosticBankInitForApi(workspace: string) {
  return initDiagnosticBank(workspace);
}

export function diagnosticBankGetForApi(workspace: string): {
  bank: DiagnosticBank;
  signature: ReturnType<typeof verifyDiagnosticBankSignature>;
} {
  return {
    bank: loadDiagnosticBank(workspace),
    signature: verifyDiagnosticBankSignature(workspace)
  };
}

export function diagnosticBankApplyForApi(params: {
  workspace: string;
  bank: DiagnosticBank;
}) {
  return saveDiagnosticBank(params.workspace, params.bank);
}

export function diagnosticBankVerifyForApi(workspace: string) {
  return verifyDiagnosticBankSignature(workspace);
}
