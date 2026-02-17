import { rotateMonitorKeyInVault } from "./vault.js";

export function rotateMonitorKey(workspace: string, passphrase?: string): {
  fingerprint: string;
  publicKeyPath: string;
} {
  return rotateMonitorKeyInVault(workspace, passphrase);
}
