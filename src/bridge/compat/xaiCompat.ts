import type { BridgeRouteMatch } from "../bridgeModelRouter.js";
import type { ModelIntent } from "../bridgeRoutes.js";
import { parseOpenAIIntent } from "./openaiCompat.js";

export function parseXaiIntent(match: BridgeRouteMatch, body: unknown): ModelIntent {
  const base = parseOpenAIIntent(match, body);
  return {
    ...base,
    provider: "xai"
  };
}
