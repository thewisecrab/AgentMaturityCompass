import { appendTransparencyEntry } from "../transparency/logChain.js";
import { sha256Hex } from "../utils/hash.js";
import { canonicalize } from "../utils/json.js";
import { buildCgxGraph } from "./cgxBuilder.js";
import { buildCgxContextPack } from "./cgxContextPack.js";
import {
  initCgxPolicy,
  loadCgxPolicy,
  loadLatestCgxContextPack,
  loadLatestCgxGraph,
  saveCgxContextPack,
  saveCgxPolicy,
  verifyCgxPolicySignature
} from "./cgxStore.js";
import { verifyCgxWorkspace } from "./cgxVerifier.js";
import type { CgxPolicy, CgxScope } from "./cgxSchema.js";

function normalizeScope(params: {
  scope: "workspace" | "agent";
  targetId?: string | null;
}): CgxScope {
  if (params.scope === "workspace") {
    return {
      type: "workspace",
      id: "workspace"
    };
  }
  const id = (params.targetId ?? "default").trim();
  if (!id) {
    throw new Error("agent scope requires targetId");
  }
  return {
    type: "agent",
    id
  };
}

export function cgxInitForApi(workspace: string) {
  return initCgxPolicy(workspace);
}

export function cgxPolicyForApi(workspace: string): {
  policy: CgxPolicy;
  signature: ReturnType<typeof verifyCgxPolicySignature>;
} {
  return {
    policy: loadCgxPolicy(workspace),
    signature: verifyCgxPolicySignature(workspace)
  };
}

export function cgxPolicyApplyForApi(params: {
  workspace: string;
  policy: CgxPolicy;
}) {
  return saveCgxPolicy(params.workspace, params.policy);
}

export function cgxBuildForApi(params: {
  workspace: string;
  scope: "workspace" | "agent";
  targetId?: string | null;
}) {
  const scope = normalizeScope({
    scope: params.scope,
    targetId: params.targetId
  });
  const built = buildCgxGraph({
    workspace: params.workspace,
    scope,
    persist: true
  });

  let packSaved: ReturnType<typeof saveCgxContextPack> | null = null;
  let packHash: string | null = null;
  if (scope.type === "agent") {
    const pack = buildCgxContextPack({
      workspace: params.workspace,
      agentId: scope.id
    });
    packSaved = saveCgxContextPack(params.workspace, scope.id, pack);
    packHash = sha256Hex(canonicalize(pack));
    appendTransparencyEntry({
      workspace: params.workspace,
      type: "CGX_PACK_CREATED",
      agentId: scope.id,
      artifact: {
        kind: "policy",
        id: `cgx-pack-${scope.id}-${pack.generatedTs}`,
        sha256: packHash
      }
    });
  }

  return {
    ...built,
    packSaved,
    packHash
  };
}

export function cgxLatestGraphForApi(params: {
  workspace: string;
  scope: "workspace" | "agent";
  targetId?: string | null;
}) {
  const scope = normalizeScope({
    scope: params.scope,
    targetId: params.targetId
  });
  return loadLatestCgxGraph(params.workspace, scope);
}

export function cgxLatestPackForApi(params: {
  workspace: string;
  agentId?: string | null;
}) {
  const agentId = (params.agentId ?? "default").trim() || "default";
  return loadLatestCgxContextPack(params.workspace, agentId);
}

export function cgxVerifyForApi(workspace: string) {
  return verifyCgxWorkspace(workspace);
}
