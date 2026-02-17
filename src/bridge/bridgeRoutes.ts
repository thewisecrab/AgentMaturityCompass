import type { BridgeProvider } from "./bridgeConfigSchema.js";
import { matchBridgeRoute, type BridgeRouteMatch } from "./bridgeModelRouter.js";
import { parseAnthropicIntent } from "./compat/anthropicCompat.js";
import { parseGeminiIntent } from "./compat/geminiCompat.js";
import { parseLocalIntent } from "./compat/localMockCompat.js";
import { parseOpenAIIntent } from "./compat/openaiCompat.js";
import { parseOpenRouterIntent } from "./compat/openrouterCompat.js";
import { parseXaiIntent } from "./compat/xaiCompat.js";

export interface ModelIntent {
  provider: BridgeProvider;
  requestKind: string;
  model: string | null;
  messageCount: number;
  toolCount: number;
  temperature: number | null;
  maxTokens: number | null;
}

export function resolveBridgeRoute(pathname: string): BridgeRouteMatch | null {
  return matchBridgeRoute(pathname);
}

export function buildModelIntent(match: BridgeRouteMatch, body: unknown): ModelIntent {
  switch (match.provider) {
    case "openai":
      return parseOpenAIIntent(match, body);
    case "anthropic":
      return parseAnthropicIntent(match, body);
    case "gemini":
      return parseGeminiIntent(match, body);
    case "openrouter":
      return parseOpenRouterIntent(match, body);
    case "xai":
      return parseXaiIntent(match, body);
    case "local":
      return parseLocalIntent(match, body);
  }
}
