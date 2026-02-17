import { dirname, resolve } from "node:path";
import { ensureDir, writeFileAtomic } from "../utils/fs.js";
import type { ForecastPolicy } from "./forecastSchema.js";
import {
  ackAdvisoryForApi,
  applyForecastPolicyForApi,
  forecastSchedulerRunNowForApi,
  forecastSchedulerSetEnabledForApi,
  forecastSchedulerStatusForApi,
  getForecastLatestForApi,
  getForecastPolicyForApi,
  listAdvisoriesForApi,
  refreshForecastForApi
} from "./forecastApi.js";
import { defaultForecastPolicy, initForecastPolicy } from "./forecastEngine.js";
import { renderForecastMarkdown } from "./forecastReports.js";
import { verifyForecastPolicy } from "./forecastVerifier.js";

function writeOutFile(path: string, content: string): string {
  const out = resolve(path);
  ensureDir(dirname(out));
  writeFileAtomic(out, content, 0o644);
  return out;
}

export function forecastInitCli(workspace: string): {
  path: string;
  sigPath: string;
} {
  return initForecastPolicy(workspace);
}

export function forecastVerifyCli(workspace: string) {
  return verifyForecastPolicy(workspace);
}

export function forecastPrintPolicyCli(workspace: string): ForecastPolicy {
  return getForecastPolicyForApi(workspace).policy;
}

export function forecastRefreshCli(params: {
  workspace: string;
  scope: "workspace" | "agent" | "node";
  targetId?: string;
  outFile?: string;
}): {
  status: "OK" | "INSUFFICIENT_EVIDENCE";
  latestPath: string | null;
  snapshotPath: string | null;
  advisories: number;
  outFile: string | null;
} {
  const refreshed = refreshForecastForApi({
    workspace: params.workspace,
    scope: params.scope,
    targetId: params.targetId
  });
  let outFile: string | null = null;
  if (params.outFile) {
    const isJson = params.outFile.endsWith(".json");
    const body = isJson ? JSON.stringify(refreshed.forecast, null, 2) : renderForecastMarkdown(refreshed.forecast);
    outFile = writeOutFile(params.outFile, body);
  }
  return {
    status: refreshed.forecast.status,
    latestPath: refreshed.latestPath,
    snapshotPath: refreshed.snapshotPath,
    advisories: refreshed.advisories.length,
    outFile
  };
}

export function forecastLatestCli(params: {
  workspace: string;
  scope: "workspace" | "agent" | "node";
  targetId?: string;
  outFile?: string;
}): {
  status: "OK" | "INSUFFICIENT_EVIDENCE";
  outFile: string | null;
} {
  const latest = getForecastLatestForApi({
    workspace: params.workspace,
    scope: params.scope,
    targetId: params.targetId
  });
  let outFile: string | null = null;
  if (params.outFile) {
    const isJson = params.outFile.endsWith(".json");
    outFile = writeOutFile(params.outFile, isJson ? JSON.stringify(latest, null, 2) : renderForecastMarkdown(latest));
  }
  return {
    status: latest.status,
    outFile
  };
}

export function advisoryListCli(params: {
  workspace: string;
  scope?: "workspace" | "agent" | "node";
  targetId?: string;
}) {
  return listAdvisoriesForApi({
    workspace: params.workspace,
    scope: params.scope,
    targetId: params.targetId
  });
}

export function advisoryShowCli(params: {
  workspace: string;
  advisoryId: string;
}) {
  const all = advisoryListCli({ workspace: params.workspace });
  const advisory = all.find((row) => row.advisoryId === params.advisoryId);
  if (!advisory) {
    throw new Error(`advisory not found: ${params.advisoryId}`);
  }
  return advisory;
}

export function advisoryAckCli(params: {
  workspace: string;
  advisoryId: string;
  by: string;
  note: string;
}) {
  return ackAdvisoryForApi({
    workspace: params.workspace,
    advisoryId: params.advisoryId,
    by: params.by,
    note: params.note
  });
}

export function forecastSchedulerStatusCli(workspace: string) {
  return forecastSchedulerStatusForApi(workspace);
}

export function forecastSchedulerRunNowCli(params: {
  workspace: string;
  scope?: "workspace" | "agent" | "node";
  targetId?: string;
}) {
  return forecastSchedulerRunNowForApi(params);
}

export function forecastSchedulerEnableCli(workspace: string) {
  return forecastSchedulerSetEnabledForApi({
    workspace,
    enabled: true
  });
}

export function forecastSchedulerDisableCli(workspace: string) {
  return forecastSchedulerSetEnabledForApi({
    workspace,
    enabled: false
  });
}

export function forecastPolicyApplyCli(params: {
  workspace: string;
  policy: ForecastPolicy;
}) {
  return applyForecastPolicyForApi({
    workspace: params.workspace,
    policy: params.policy
  });
}

export function forecastPolicyDefaultCli(): ForecastPolicy {
  return defaultForecastPolicy();
}

