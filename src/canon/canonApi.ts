import { initCanon, loadCanon, saveCanon, verifyCanonSignature } from "./canonLoader.js";
import type { CompassCanon } from "./canonSchema.js";

export function canonInitForApi(workspace: string) {
  return initCanon(workspace);
}

export function canonGetForApi(workspace: string): {
  canon: CompassCanon;
  signature: ReturnType<typeof verifyCanonSignature>;
} {
  const signature = verifyCanonSignature(workspace);
  const canon = loadCanon(workspace);
  return {
    canon,
    signature
  };
}

export function canonApplyForApi(params: {
  workspace: string;
  canon: CompassCanon;
}) {
  return saveCanon(params.workspace, params.canon);
}

export function canonVerifyForApi(workspace: string) {
  return verifyCanonSignature(workspace);
}
