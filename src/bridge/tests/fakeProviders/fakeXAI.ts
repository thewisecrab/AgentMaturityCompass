import { createServer, type Server } from "node:http";

export async function startFakeXAI(): Promise<{ server: Server; port: number }> {
  const server = createServer((_req, res) => {
    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({
        id: "chatcmpl_fake_xai",
        object: "chat.completion",
        model: "grok-test",
        usage: {
          prompt_tokens: 7,
          completion_tokens: 6,
          total_tokens: 13
        },
        choices: [{ index: 0, message: { role: "assistant", content: "xai-ok" }, finish_reason: "stop" }]
      })
    );
  });
  await new Promise<void>((resolvePromise) => server.listen(0, "127.0.0.1", () => resolvePromise()));
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("fakeXAI failed to bind");
  }
  return { server, port: address.port };
}
