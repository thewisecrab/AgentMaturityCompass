import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { URL } from "node:url";

export async function executeHttpFetch(params: {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  simulate: boolean;
}): Promise<{ status: number; headers: Record<string, string>; body: string }> {
  if (params.simulate) {
    return {
      status: 200,
      headers: {},
      body: `SIMULATE http.fetch ${params.method ?? "GET"} ${params.url}`
    };
  }

  const url = new URL(params.url);
  const reqImpl = url.protocol === "https:" ? httpsRequest : httpRequest;
  const response = await new Promise<{ status: number; headers: Record<string, string>; body: string }>((resolvePromise, rejectPromise) => {
    const req = reqImpl(
      url,
      {
        method: params.method ?? "GET",
        headers: params.headers
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        res.on("end", () => {
          const headers: Record<string, string> = {};
          for (const [key, value] of Object.entries(res.headers)) {
            if (typeof value === "undefined") {
              continue;
            }
            headers[key] = Array.isArray(value) ? value.join(",") : value;
          }
          resolvePromise({
            status: res.statusCode ?? 0,
            headers,
            body: Buffer.concat(chunks).toString("utf8")
          });
        });
      }
    );
    req.on("error", rejectPromise);
    if (params.body) {
      req.write(params.body);
    }
    req.end();
  });

  return response;
}
