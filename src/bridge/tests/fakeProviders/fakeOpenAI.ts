import { createServer, type Server } from "node:http";

export async function startFakeOpenAI(): Promise<{ server: Server; port: number }> {
  const server = createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString("utf8");
    });
    req.on("end", () => {
      let model = "gpt-test";
      try {
        const parsed = JSON.parse(body) as { model?: string };
        if (typeof parsed.model === "string") {
          model = parsed.model;
        }
      } catch {
        // noop
      }
      res.statusCode = 200;
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({
          id: "chatcmpl_fake_openai",
          object: "chat.completion",
          model,
          usage: {
            prompt_tokens: 10,
            completion_tokens: 5,
            total_tokens: 15
          },
          choices: [
            {
              index: 0,
              message: { role: "assistant", content: "openai-ok" },
              finish_reason: "stop"
            }
          ]
        })
      );
    });
  });
  await new Promise<void>((resolvePromise) => server.listen(0, "127.0.0.1", () => resolvePromise()));
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("fakeOpenAI failed to bind");
  }
  return { server, port: address.port };
}
