import { resolveAgentId } from "../fleet/paths.js";
import { loadWorkOrder } from "../workorders/workorderEngine.js";
import {
  addCaseToCasebook,
  initCasebook,
  listCasebooks,
  verifyCasebook
} from "./casebookStore.js";

export function casebookInitCli(params: { workspace: string; agentId?: string; casebookId?: string }) {
  return initCasebook(params.workspace, params.agentId, params.casebookId ?? "default");
}

export function casebookListCli(params: { workspace: string; agentId?: string }) {
  return listCasebooks(params.workspace, params.agentId);
}

export function casebookVerifyCli(params: { workspace: string; agentId?: string; casebookId: string }) {
  return verifyCasebook(params.workspace, params.casebookId, params.agentId);
}

export function casebookAddFromWorkOrderCli(params: {
  workspace: string;
  agentId?: string;
  casebookId: string;
  workOrderId: string;
}) {
  const agentId = resolveAgentId(params.workspace, params.agentId);
  const workOrder = loadWorkOrder({
    workspace: params.workspace,
    agentId,
    workOrderId: params.workOrderId,
    requireValidSignature: true
  });

  return addCaseToCasebook({
    workspace: params.workspace,
    agentId,
    casebookId: params.casebookId,
    title: `From workorder ${workOrder.workOrderId}`,
    description: workOrder.description,
    riskTier: workOrder.riskTier,
    requestedMode: workOrder.requestedMode,
    allowedActionClasses: workOrder.allowedActionClasses,
    prompt: `${workOrder.title}\n\n${workOrder.description}`,
    forbiddenAudits: ["EXECUTE_WITHOUT_TICKET_ATTEMPTED", "TOOLHUB_BYPASS_ATTEMPTED"]
  });
}
