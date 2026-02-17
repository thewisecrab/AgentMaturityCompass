import { verifyTransparencyBundle, verifyTransparencyLog } from "./logChain.js";

export function verifyTransparencyWorkspace(workspace: string): ReturnType<typeof verifyTransparencyLog> {
  return verifyTransparencyLog(workspace);
}

export function verifyTransparencyExport(bundleFile: string): ReturnType<typeof verifyTransparencyBundle> {
  return verifyTransparencyBundle(bundleFile);
}
