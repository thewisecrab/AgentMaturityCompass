import { resolveAgentId } from "../fleet/paths.js";
import { loadOrgConfig } from "../org/orgStore.js";
import type { ForecastScope } from "./forecastSchema.js";
import {
  acknowledgeAdvisory,
  createForecast,
  listForecastScopesForWorkspace,
  parseForecastScope,
  refreshForecastsForWorkspace,
  schedulerRunNow,
  schedulerSetEnabled,
  schedulerStatus
} from "./forecastEngine.js";
import {
  listAdvisories,
  loadForecastPolicy,
  saveForecastPolicy,
  verifyForecastPolicySignature
} from "./forecastStore.js";

function normalizeScope(params: {
  workspace: string;
  scope: "workspace" | "agent" | "node";
  targetId?: string | null;
}): ForecastScope {
  if (params.scope === "agent") {
    return parseForecastScope({
      scope: "agent",
      targetId: resolveAgentId(params.workspace, params.targetId ?? "default")
    });
  }
  if (params.scope === "node") {
    const nodeId = params.targetId?.trim() ?? "";
    if (!nodeId) {
      throw new Error("targetId is required for node scope");
    }
    const org = loadOrgConfig(params.workspace);
    if (!org.nodes.some((node) => node.id === nodeId)) {
      throw new Error(`unknown org node: ${nodeId}`);
    }
    return parseForecastScope({
      scope: "node",
      targetId: nodeId
    });
  }
  return parseForecastScope({
    scope: "workspace"
  });
}

export function getForecastLatestForApi(params: {
  workspace: string;
  scope: "workspace" | "agent" | "node";
  targetId?: string | null;
}) {
  const scope = normalizeScope(params);
  return createForecast({
    workspace: params.workspace,
    scope,
    persist: false
  }).forecast;
}

export function refreshForecastForApi(params: {
  workspace: string;
  scope: "workspace" | "agent" | "node";
  targetId?: string | null;
}) {
  const scope = normalizeScope(params);
  return createForecast({
    workspace: params.workspace,
    scope,
    persist: true
  });
}

export function listAdvisoriesForApi(params: {
  workspace: string;
  scope?: "workspace" | "agent" | "node";
  targetId?: string | null;
}) {
  const rows = listAdvisories(params.workspace);
  if (!params.scope) {
    return rows;
  }
  const normalized = normalizeScope({
    workspace: params.workspace,
    scope: params.scope,
    targetId: params.targetId
  });
  return rows.filter((row) => row.scope.type === normalized.type && row.scope.id === normalized.id);
}

export function ackAdvisoryForApi(params: {
  workspace: string;
  advisoryId: string;
  by: string;
  note: string;
}) {
  return acknowledgeAdvisory(params);
}

export function getForecastPolicyForApi(workspace: string) {
  return {
    policy: loadForecastPolicy(workspace),
    signature: verifyForecastPolicySignature(workspace)
  };
}

export function applyForecastPolicyForApi(params: {
  workspace: string;
  policy: ReturnType<typeof loadForecastPolicy>;
}) {
  return saveForecastPolicy(params.workspace, params.policy);
}

export function forecastSchedulerStatusForApi(workspace: string) {
  return schedulerStatus(workspace);
}

export function forecastSchedulerRunNowForApi(params: {
  workspace: string;
  scope?: "workspace" | "agent" | "node";
  targetId?: string | null;
}) {
  if (!params.scope) {
    return schedulerRunNow({
      workspace: params.workspace
    });
  }
  const scope = normalizeScope({
    workspace: params.workspace,
    scope: params.scope,
    targetId: params.targetId
  });
  return schedulerRunNow({
    workspace: params.workspace,
    scopes: [scope]
  });
}

export function forecastSchedulerSetEnabledForApi(params: {
  workspace: string;
  enabled: boolean;
}) {
  return schedulerSetEnabled(params.workspace, params.enabled);
}

export function listForecastScopesForApi(workspace: string) {
  return listForecastScopesForWorkspace(workspace);
}

export function refreshAllForecastsForApi(workspace: string) {
  return refreshForecastsForWorkspace({
    workspace
  });
}

