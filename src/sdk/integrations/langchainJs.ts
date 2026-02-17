import type { AMCClient } from "../amcClient.js";

export function createLangChainJsBridge(amc: AMCClient, model = "gpt-4o-mini"): {
  invoke: (input: string | Array<{ role: string; content: string }>) => Promise<unknown>;
  bind: (params: Record<string, unknown>) => { invoke: (input: string | Array<{ role: string; content: string }>) => Promise<unknown> };
} {
  const invoke = async (input: string | Array<{ role: string; content: string }>): Promise<unknown> => {
    const messages = typeof input === "string"
      ? [{ role: "user", content: input }]
      : input.map((row) => ({ role: row.role, content: row.content }));
    const out = await amc.openaiChat({
      model,
      messages
    });
    return out.body;
  };
  return {
    invoke,
    bind: (_params: Record<string, unknown>) => ({ invoke })
  };
}
