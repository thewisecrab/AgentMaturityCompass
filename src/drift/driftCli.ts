import { resolveAgentId } from "../fleet/paths.js";
import { activeFreezeStatus, liftFreeze } from "./freezeEngine.js";
import { runDriftCheck, writeDriftCheckReport } from "./driftDetector.js";
import { renderDriftMarkdown } from "./driftReport.js";

export async function driftCheckCli(params: {
  workspace: string;
  agentId?: string;
  against?: "previous";
}): Promise<{
  agentId: string;
  triggered: boolean;
  incidentId: string | null;
  reasons: string[];
}> {
  const agentId = resolveAgentId(params.workspace, params.agentId);
  const result = await runDriftCheck({
    workspace: params.workspace,
    agentId
  });
  return {
    agentId,
    triggered: result.triggered,
    incidentId: result.incidentId,
    reasons: result.reasons
  };
}

export async function driftReportCli(params: {
  workspace: string;
  agentId?: string;
  outFile?: string;
}): Promise<{ markdown: string; outFile: string | null }> {
  const agentId = resolveAgentId(params.workspace, params.agentId);
  const markdown = renderDriftMarkdown({
    workspace: params.workspace,
    agentId
  });
  if (!params.outFile) {
    return { markdown, outFile: null };
  }
  const result = await runDriftCheck({
    workspace: params.workspace,
    agentId
  });
  const outFile = writeDriftCheckReport({
    workspace: params.workspace,
    agentId,
    outFile: params.outFile,
    result
  });
  return {
    markdown,
    outFile
  };
}

export function freezeStatusCli(params: {
  workspace: string;
  agentId?: string;
}): ReturnType<typeof activeFreezeStatus> {
  return activeFreezeStatus(params.workspace, params.agentId);
}

export function freezeLiftCli(params: {
  workspace: string;
  agentId?: string;
  incidentId: string;
  reason: string;
}): { liftPath: string } {
  return liftFreeze({
    workspace: params.workspace,
    agentId: params.agentId,
    incidentId: params.incidentId,
    reason: params.reason
  });
}
