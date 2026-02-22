import { AMCSDKError, trimForError } from "./errors.js";

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
  const headers: Record<string, string> = {
    "content-type": "application/json"
  };
  if (params.token.trim().length > 0) {
    headers.authorization = `Bearer ${params.token}`;
  }
  let response: Response;
  try {
    response = await fetchImpl(`${params.bridgeUrl.replace(/\/+$/, "")}/bridge/telemetry`, {
      method: "POST",
      headers,
      body: JSON.stringify(params.event)
    });
  } catch (error) {
    throw new AMCSDKError({
      code: "NETWORK_ERROR",
      message: `Failed to send telemetry to ${params.bridgeUrl.replace(/\/+$/, "")}/bridge/telemetry.`,
      details: "Check bridge availability (`amc up`) and network connectivity.",
      cause: error
    });
  }
  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new AMCSDKError({
      code: "HTTP_ERROR",
      message: `Telemetry endpoint returned HTTP ${response.status}.`,
      status: response.status,
      path: "/bridge/telemetry",
      details: trimForError(bodyText)
    });
  }
}
