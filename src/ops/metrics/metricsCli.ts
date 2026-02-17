import { request as httpRequest } from "node:http";

export async function metricsReachable(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = httpRequest(
      {
        host,
        port,
        path: "/metrics",
        method: "GET",
        timeout: 1000
      },
      (res) => {
        resolve((res.statusCode ?? 0) === 200);
      }
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

