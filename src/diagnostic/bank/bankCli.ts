import {
  diagnosticBankApplyForApi,
  diagnosticBankGetForApi,
  diagnosticBankInitForApi,
  diagnosticBankVerifyForApi
} from "./bankApi.js";
import type { DiagnosticBank } from "./bankSchema.js";

export function diagnosticBankInitCli(workspace: string) {
  return diagnosticBankInitForApi(workspace);
}

export function diagnosticBankVerifyCli(workspace: string) {
  return diagnosticBankVerifyForApi(workspace);
}

export function diagnosticBankPrintCli(workspace: string): DiagnosticBank {
  return diagnosticBankGetForApi(workspace).bank;
}

export function diagnosticBankApplyCli(params: {
  workspace: string;
  bank: DiagnosticBank;
}) {
  return diagnosticBankApplyForApi(params);
}
