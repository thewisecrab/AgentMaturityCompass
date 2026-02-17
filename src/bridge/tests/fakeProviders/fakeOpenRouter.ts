import { createServer, type Server } from "node:http";

export async function startFakeOpenRouter(): Promise<{ server: Server; port: number }> {
  const server = createServer((_req, res) => {
    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({
        id: "chatcmpl_fake_openrouter",
        object: "chat.completion",
        model: "openrouter/test-model",
        usage: {
          prompt_tokens: 5,
          completion_tokens: 3,
          total_tokens: 8
        },
        choices: [{ index: 0, message: { role: "assistant", content: "openrouter-ok" }, finish_reason: "stop" }]
      })
    );
  });
  await new Promise<void>((resolvePromise) => server.listen(0, "127.0.0.1", () => resolvePromise()));
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("fakeOpenRouter failed to bind");
  }
  return { server, port: address.port };
}
