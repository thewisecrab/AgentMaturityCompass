import { join } from "node:path";
import YAML from "yaml";
import { ensureDir, pathExists, readUtf8, writeFileAtomic } from "../utils/fs.js";
import { signFileWithAuditor, verifySignedFileWithAuditor, type SignedFileVerification } from "../org/orgSigner.js";
import { adapterConfigSchema, defaultAdapterConfig, type AdapterAgentProfile, type AdapterConfig } from "./adapterConfigSchema.js";

export function adaptersConfigPath(workspace: string): string {
  return join(workspace, ".amc", "adapters.yaml");
}

export function adaptersConfigSigPath(workspace: string): string {
  return `${adaptersConfigPath(workspace)}.sig`;
}

export function loadAdaptersConfig(workspace: string): AdapterConfig {
  const path = adaptersConfigPath(workspace);
  if (!pathExists(path)) {
    return defaultAdapterConfig();
  }
  const parsed = YAML.parse(readUtf8(path));
  return adapterConfigSchema.parse(parsed);
}

export function saveAdaptersConfig(workspace: string, config: AdapterConfig): string {
  const path = adaptersConfigPath(workspace);
  ensureDir(join(workspace, ".amc"));
  writeFileAtomic(path, YAML.stringify(adapterConfigSchema.parse(config)), 0o644);
  return path;
}

export function signAdaptersConfig(workspace: string): string {
  return signFileWithAuditor(workspace, adaptersConfigPath(workspace));
}

export function verifyAdaptersConfigSignature(workspace: string): SignedFileVerification {
  return verifySignedFileWithAuditor(workspace, adaptersConfigPath(workspace));
}

export function initAdaptersConfig(workspace: string): { configPath: string; sigPath: string } {
  const configPath = saveAdaptersConfig(workspace, defaultAdapterConfig());
  const sigPath = signAdaptersConfig(workspace);
  return { configPath, sigPath };
}

export function setAgentAdapterProfile(workspace: string, agentId: string, profile: AdapterAgentProfile): {
  configPath: string;
  sigPath: string;
} {
  const current = loadAdaptersConfig(workspace);
  current.adapters.perAgent[agentId] = profile;
  const configPath = saveAdaptersConfig(workspace, current);
  const sigPath = signAdaptersConfig(workspace);
  return { configPath, sigPath };
}

