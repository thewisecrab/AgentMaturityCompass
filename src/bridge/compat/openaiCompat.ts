import type { BridgeRouteMatch } from "../bridgeModelRouter.js";
import type { ModelIntent } from "../bridgeRoutes.js";

function toRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function parseOpenAIIntent(match: BridgeRouteMatch, body: unknown): ModelIntent {
  const record = toRecord(body);
  const messages = toArray(record.messages);
  const input = toArray(record.input);
  const tools = toArray(record.tools);
  const toolCalls = toArray(record.tool_calls);
  const model = typeof record.model === "string" ? record.model : null;
  const maxTokens = numberOrNull(record.max_tokens ?? record.max_output_tokens ?? record.max_completion_tokens);
  return {
    provider: "openai",
    requestKind: match.requestKind,
    model,
    messageCount: messages.length > 0 ? messages.length : input.length,
    toolCount: tools.length > 0 ? tools.length : toolCalls.length,
    temperature: numberOrNull(record.temperature),
    maxTokens
  };
}
