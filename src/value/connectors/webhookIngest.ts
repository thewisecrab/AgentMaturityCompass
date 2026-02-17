import { ingestValueWebhookForApi } from "../valueApi.js";

export async function ingestValueWebhook(params: {
  workspace: string;
  payload: unknown;
  attested: boolean;
}) {
  return ingestValueWebhookForApi({
    workspace: params.workspace,
    payload: params.payload,
    sourceTrust: params.attested ? "ATTESTED" : "SELF_REPORTED"
  });
}
