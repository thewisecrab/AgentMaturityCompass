import { join } from "node:path";
import YAML from "yaml";
import { ensureDir, pathExists, readUtf8, writeFileAtomic } from "../utils/fs.js";
import { signFileWithAuditor, verifySignedFileWithAuditor, type SignedFileVerification } from "../org/orgSigner.js";
import { bridgeConfigSchema, defaultBridgeConfig, type BridgeConfig } from "./bridgeConfigSchema.js";

export function bridgeConfigPath(workspace: string): string {
  return join(workspace, ".amc", "bridge.yaml");
}

export function bridgeConfigSigPath(workspace: string): string {
  return `${bridgeConfigPath(workspace)}.sig`;
}

export function loadBridgeConfig(workspace: string): BridgeConfig {
  const path = bridgeConfigPath(workspace);
  if (!pathExists(path)) {
    return defaultBridgeConfig();
  }
  const parsed = YAML.parse(readUtf8(path));
  return bridgeConfigSchema.parse(parsed);
}

export function saveBridgeConfig(workspace: string, config: BridgeConfig): string {
  const path = bridgeConfigPath(workspace);
  ensureDir(join(workspace, ".amc"));
  writeFileAtomic(path, YAML.stringify(bridgeConfigSchema.parse(config)), 0o644);
  return path;
}

export function signBridgeConfig(workspace: string): string {
  return signFileWithAuditor(workspace, bridgeConfigPath(workspace));
}

export function verifyBridgeConfigSignature(workspace: string): SignedFileVerification {
  return verifySignedFileWithAuditor(workspace, bridgeConfigPath(workspace));
}

export function initBridgeConfig(workspace: string): { configPath: string; sigPath: string } {
  const configPath = saveBridgeConfig(workspace, defaultBridgeConfig());
  const sigPath = signBridgeConfig(workspace);
  return { configPath, sigPath };
}
