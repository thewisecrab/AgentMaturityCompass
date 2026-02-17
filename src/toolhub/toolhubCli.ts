import { initToolsConfig, listAllowedTools, verifyToolsConfigSignature } from "./toolhubValidators.js";

export function initToolhubConfig(workspace: string): { configPath: string; sigPath: string } {
  return initToolsConfig(workspace);
}

export function verifyToolhubConfig(workspace: string): {
  valid: boolean;
  signatureExists: boolean;
  reason: string | null;
  path: string;
  sigPath: string;
} {
  return verifyToolsConfigSignature(workspace);
}

export function listToolhubTools(workspace: string): Array<{ name: string; actionClass: string; requireExecTicket: boolean }> {
  return listAllowedTools(workspace).map((tool) => ({
    name: tool.name,
    actionClass: tool.actionClass,
    requireExecTicket: tool.requireExecTicket === true
  }));
}
