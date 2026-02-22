import type { IncomingMessage, ServerResponse } from "node:http";
import { buildAgentTimelineData } from "../observability/timeline.js";
import { apiError, apiSuccess, pathParam, queryParam } from "./apiHelpers.js";

function parsePositiveInt(value: string | undefined, fallback: number, maxValue: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.max(1, Math.min(maxValue, parsed));
}

export async function handleAgentTimelineRoute(
  pathname: string,
  method: string,
  req: IncomingMessage,
  res: ServerResponse,
  workspace = process.cwd()
): Promise<boolean> {
  const params = pathParam(pathname, "/api/v1/agents/:id/timeline");
  if (!params) {
    return false;
  }

  if (method !== "GET") {
    apiError(res, 405, `Method ${method} not allowed, expected GET`);
    return true;
  }

  const agentId = params.id?.trim();
  if (!agentId) {
    apiError(res, 400, "Missing required path param: id");
    return true;
  }

  try {
    const maxRuns = parsePositiveInt(queryParam(req.url ?? "", "maxRuns"), 200, 5000);
    const maxEvidenceEvents = parsePositiveInt(queryParam(req.url ?? "", "maxEvidenceEvents"), 1000, 20_000);
    const payload = buildAgentTimelineData({
      workspace,
      agentId,
      maxRuns,
      maxEvidenceEvents
    });
    apiSuccess(res, payload);
  } catch (error) {
    apiError(res, 500, error instanceof Error ? error.message : "Internal error");
  }
  return true;
}
