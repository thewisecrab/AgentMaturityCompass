import { canonApplyForApi, canonGetForApi, canonInitForApi, canonVerifyForApi } from "./canonApi.js";
import type { CompassCanon } from "./canonSchema.js";

export function canonInitCli(workspace: string) {
  return canonInitForApi(workspace);
}

export function canonVerifyCli(workspace: string) {
  return canonVerifyForApi(workspace);
}

export function canonPrintCli(workspace: string): CompassCanon {
  return canonGetForApi(workspace).canon;
}

export function canonApplyCli(params: {
  workspace: string;
  canon: CompassCanon;
}) {
  return canonApplyForApi(params);
}
