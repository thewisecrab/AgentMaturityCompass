import { createServer, type Server } from "node:http";

export async function startFakeGemini(): Promise<{ server: Server; port: number }> {
  const server = createServer((req, res) => {
    const match = /\/models\/([^/:]+):generateContent$/.exec(req.url ?? "");
    const model = decodeURIComponent(match?.[1] ?? "gemini-test");
    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({
        modelVersion: model,
        candidates: [
          {
            content: {
              parts: [{ text: "gemini-ok" }]
            }
          }
        ],
        usageMetadata: {
          promptTokenCount: 9,
          candidatesTokenCount: 4,
          totalTokenCount: 13
        }
      })
    );
  });
  await new Promise<void>((resolvePromise) => server.listen(0, "127.0.0.1", () => resolvePromise()));
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("fakeGemini failed to bind");
  }
  return { server, port: address.port };
}
