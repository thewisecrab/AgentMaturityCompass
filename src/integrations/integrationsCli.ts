import { dispatchIntegrationEvent, dispatchIntegrationTest } from "./integrationDispatcher.js";
import {
  initIntegrationsConfig,
  loadIntegrationsConfig,
  verifyIntegrationsConfigSignature
} from "./integrationStore.js";

export function integrationsInitCli(workspace: string): {
  path: string;
  sigPath: string;
} {
  return initIntegrationsConfig(workspace);
}

export function integrationsVerifyCli(workspace: string): {
  valid: boolean;
  signatureExists: boolean;
  reason: string | null;
  path: string;
  sigPath: string;
} {
  return verifyIntegrationsConfigSignature(workspace);
}

export function integrationsStatusCli(workspace: string): {
  signature: ReturnType<typeof verifyIntegrationsConfigSignature>;
  channels: Array<{
    id: string;
    type: string;
    enabled: boolean;
    routedEvents: string[];
  }>;
} {
  const signature = verifyIntegrationsConfigSignature(workspace);
  const config = loadIntegrationsConfig(workspace);
  const channels = config.integrations.channels.map((channel) => ({
    id: channel.id,
    type: channel.type,
    enabled: channel.enabled,
    routedEvents: Object.entries(config.integrations.routing)
      .filter(([, channelIds]) => channelIds.includes(channel.id))
      .map(([eventName]) => eventName)
      .sort((a, b) => a.localeCompare(b))
  }));
  return {
    signature,
    channels
  };
}

export async function integrationsTestCli(params: {
  workspace: string;
  channelId?: string;
}): Promise<ReturnType<typeof dispatchIntegrationTest>> {
  return dispatchIntegrationTest(params);
}

export async function integrationsDispatchCli(params: {
  workspace: string;
  eventName: string;
  agentId: string;
  summary?: string;
  details?: Record<string, unknown>;
}): Promise<ReturnType<typeof dispatchIntegrationEvent>> {
  return dispatchIntegrationEvent({
    workspace: params.workspace,
    eventName: params.eventName,
    agentId: params.agentId,
    summary: params.summary ?? `AMC integration dispatch for ${params.eventName}`,
    details: params.details
  });
}
