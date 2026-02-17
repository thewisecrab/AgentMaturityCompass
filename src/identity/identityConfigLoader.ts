import type { IdentityConfig } from "./identityConfig.js";
import {
  defaultIdentityConfig,
  identityConfigPaths,
  initIdentityConfig,
  loadIdentityConfig,
  verifyIdentityConfigSignature
} from "./identityConfig.js";
import { pathExists } from "../utils/fs.js";

export function ensureIdentityConfig(hostDir: string): IdentityConfig {
  const paths = identityConfigPaths(hostDir);
  if (!pathExists(paths.path)) {
    initIdentityConfig(hostDir);
    return defaultIdentityConfig();
  }
  return loadIdentityConfig(hostDir);
}

export function loadIdentityConfigTrusted(hostDir: string): {
  config: IdentityConfig;
  signatureValid: boolean;
  reason: string | null;
} {
  const config = loadIdentityConfig(hostDir);
  const sig = verifyIdentityConfigSignature(hostDir);
  return {
    config,
    signatureValid: sig.valid,
    reason: sig.reason
  };
}
