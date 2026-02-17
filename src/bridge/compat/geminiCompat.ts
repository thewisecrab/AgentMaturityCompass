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

export function parseGeminiIntent(match: BridgeRouteMatch, body: unknown): ModelIntent {
  const record = toRecord(body);
  const contents = toArray(record.contents);
  const tools = toArray(record.tools);
  const config = toRecord(record.generationConfig);
  const modelFromBody = typeof record.model === "string" ? record.model : null;
  return {
    provider: "gemini",
    requestKind: match.requestKind,
    model: match.modelFromPath ?? modelFromBody,
    messageCount: contents.length,
    toolCount: tools.length,
    temperature: numberOrNull(config.temperature ?? record.temperature),
    maxTokens: numberOrNull(config.maxOutputTokens ?? config.max_output_tokens)
  };
}
