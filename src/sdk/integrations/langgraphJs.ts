import type { AMCClient } from "../amcClient.js";

export function createLangGraphJsBridge(amc: AMCClient, model = "gpt-4o-mini"): {
  run: (state: Record<string, unknown>) => Promise<unknown>;
} {
  return {
    run: async (state: Record<string, unknown>) => {
      const messages = Array.isArray(state.messages)
        ? state.messages
        : [{ role: "user", content: JSON.stringify(state) }];
      const out = await amc.openaiChat({
        model,
        messages
      });
      return out.body;
    }
  };
}
