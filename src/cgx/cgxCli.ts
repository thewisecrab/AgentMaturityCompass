import {
  cgxBuildForApi,
  cgxInitForApi,
  cgxLatestGraphForApi,
  cgxLatestPackForApi,
  cgxPolicyApplyForApi,
  cgxPolicyForApi,
  cgxVerifyForApi
} from "./cgxApi.js";
import type { CgxPolicy } from "./cgxSchema.js";

export function cgxInitCli(workspace: string) {
  return cgxInitForApi(workspace);
}

export function cgxBuildCli(params: {
  workspace: string;
  scope: "workspace" | "agent";
  id?: string;
}) {
  return cgxBuildForApi({
    workspace: params.workspace,
    scope: params.scope,
    targetId: params.id
  });
}

export function cgxVerifyCli(workspace: string) {
  return cgxVerifyForApi(workspace);
}

export function cgxShowCli(params: {
  workspace: string;
  scope: "workspace" | "agent";
  id?: string;
  format: "graph" | "pack";
}) {
  if (params.format === "pack") {
    return cgxLatestPackForApi({
      workspace: params.workspace,
      agentId: params.id
    });
  }
  return cgxLatestGraphForApi({
    workspace: params.workspace,
    scope: params.scope,
    targetId: params.id
  });
}

export function cgxPolicyPrintCli(workspace: string): CgxPolicy {
  return cgxPolicyForApi(workspace).policy;
}

export function cgxPolicyApplyCli(params: {
  workspace: string;
  policy: CgxPolicy;
}) {
  return cgxPolicyApplyForApi(params);
}
