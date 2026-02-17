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

export function parseAnthropicIntent(match: BridgeRouteMatch, body: unknown): ModelIntent {
  const record = toRecord(body);
  const messages = toArray(record.messages);
  const tools = toArray(record.tools);
  return {
    provider: "anthropic",
    requestKind: match.requestKind,
    model: typeof record.model === "string" ? record.model : null,
    messageCount: messages.length,
    toolCount: tools.length,
    temperature: numberOrNull(record.temperature),
    maxTokens: numberOrNull(record.max_tokens)
  };
}
