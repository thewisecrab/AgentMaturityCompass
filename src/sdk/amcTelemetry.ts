export interface AMCTelemetryEvent {
  sessionId: string;
  eventType: "agent_process_started" | "agent_stdout" | "agent_stderr" | "agent_process_exited";
  payload: string | Record<string, unknown>;
  correlationId?: string;
  runId?: string;
  provider?: string;
}

export async function sendBridgeTelemetry(params: {
  bridgeUrl: string;
  token: string;
  event: AMCTelemetryEvent;
  fetchImpl?: typeof fetch;
}): Promise<void> {
  const fetchImpl = params.fetchImpl ?? fetch;
  await fetchImpl(`${params.bridgeUrl.replace(/\/+$/, "")}/bridge/telemetry`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${params.token}`
    },
    body: JSON.stringify(params.event)
  });
}
