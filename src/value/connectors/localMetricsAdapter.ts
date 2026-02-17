import { ingestValueWebhookForApi } from "../valueApi.js";

export function ingestLocalMetricPoints(params: {
  workspace: string;
  scopeType: "WORKSPACE" | "NODE" | "AGENT";
  scopeId: string;
  sourceId: string;
  points: Array<{ ts?: number; kpiId: string; value: number; unit?: string; labels?: Record<string, string> }>;
  attested?: boolean;
}) {
  return ingestValueWebhookForApi({
    workspace: params.workspace,
    sourceTrust: params.attested ? "ATTESTED" : "SELF_REPORTED",
    payload: {
      v: 1,
      sourceId: params.sourceId,
      scope: {
        type: params.scopeType,
        id: params.scopeId
      },
      events: params.points
    }
  });
}
