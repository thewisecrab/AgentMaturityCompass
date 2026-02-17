import { createServer, type Server } from "node:http";

export async function startFakeAnthropic(): Promise<{ server: Server; port: number }> {
  const server = createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString("utf8");
    });
    req.on("end", () => {
      let model = "claude-test";
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
          id: "msg_fake_anthropic",
          model,
          type: "message",
          role: "assistant",
          usage: {
            input_tokens: 12,
            output_tokens: 8
          },
          content: [{ type: "text", text: "anthropic-ok" }]
        })
      );
    });
  });
  await new Promise<void>((resolvePromise) => server.listen(0, "127.0.0.1", () => resolvePromise()));
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("fakeAnthropic failed to bind");
  }
  return { server, port: address.port };
}
