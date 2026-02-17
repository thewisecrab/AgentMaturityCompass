import { signFileWithAuditor } from "../org/orgSigner.js";
import { cgxLatestGraphPath, cgxLatestPackPath, cgxPolicyPath } from "./cgxStore.js";
import type { CgxScope } from "./cgxSchema.js";

export function signCgxPolicy(workspace: string): string {
  return signFileWithAuditor(workspace, cgxPolicyPath(workspace));
}

export function signCgxLatestGraph(workspace: string, scope: CgxScope): string {
  return signFileWithAuditor(workspace, cgxLatestGraphPath(workspace, scope));
}

export function signCgxLatestPack(workspace: string, agentId: string): string {
  return signFileWithAuditor(workspace, cgxLatestPackPath(workspace, agentId));
}
