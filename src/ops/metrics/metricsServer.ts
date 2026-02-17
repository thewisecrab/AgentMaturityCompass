import { createServer, type Server } from "node:http";
import { renderPrometheusMetrics } from "./metricsRegistry.js";
import { appendOpsAuditEvent } from "../audit.js";

export interface MetricsServerOptions {
  workspace: string;
  host: string;
  port: number;
  allowRemote?: boolean;
  allowedCidrs?: string[];
}

export interface MetricsServerHandle {
  host: string;
  port: number;
  close: () => Promise<void>;
}

function normalizeIp(remote: string | undefined): string {
  if (!remote || remote.length === 0) {
    return "127.0.0.1";
  }
  if (remote.startsWith("::ffff:")) {
    return remote.slice("::ffff:".length);
  }
  return remote;
}

function isLocal(ip: string): boolean {
  return ip === "127.0.0.1" || ip === "::1";
}

function ipToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) {
    return null;
  }
  const nums = parts.map((part) => Number(part));
  if (nums.some((row) => !Number.isInteger(row) || row < 0 || row > 255)) {
    return null;
  }
  return ((nums[0] ?? 0) << 24) + ((nums[1] ?? 0) << 16) + ((nums[2] ?? 0) << 8) + (nums[3] ?? 0);
}

function parseCidr(cidr: string): { base: number; mask: number } | null {
  const [ip, bitsRaw] = cidr.split("/");
  if (!ip || !bitsRaw) {
    return null;
  }
  const base = ipToInt(ip.trim());
  const bits = Number(bitsRaw);
  if (base === null || !Number.isInteger(bits) || bits < 0 || bits > 32) {
    return null;
  }
  const mask = bits === 0 ? 0 : Number((0xffffffff << (32 - bits)) >>> 0);
  return {
    base: Number(base >>> 0),
    mask
  };
}

function ipAllowedByCidrs(ip: string, cidrs: string[]): boolean {
  if (ip === "::1") {
    return true;
  }
  const value = ipToInt(ip);
  if (value === null) {
    return false;
  }
  for (const cidr of cidrs) {
    const parsed = parseCidr(cidr);
    if (!parsed) {
      continue;
    }
    if (((value >>> 0) & parsed.mask) === (parsed.base & parsed.mask)) {
      return true;
    }
  }
  return false;
}

export async function startMetricsServer(options: MetricsServerOptions): Promise<MetricsServerHandle> {
  const allowRemote = options.allowRemote === true;
  const allowedCidrs = options.allowedCidrs && options.allowedCidrs.length > 0 ? options.allowedCidrs : ["127.0.0.1/32"];
  const server: Server = createServer((req, res) => {
    const ip = normalizeIp(req.socket.remoteAddress);
    const allowed = allowRemote ? ipAllowedByCidrs(ip, allowedCidrs) : isLocal(ip);
    if (!allowed) {
      res.statusCode = 403;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ error: "metrics endpoint is localhost-only by default" }));
      return;
    }
    if ((req.url ?? "/") === "/health") {
      res.statusCode = 200;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ ok: true }));
      return;
    }
    if ((req.url ?? "/") !== "/metrics") {
      res.statusCode = 404;
      res.end("not found");
      return;
    }
    res.statusCode = 200;
    res.setHeader("content-type", "text/plain; version=0.0.4; charset=utf-8");
    res.end(renderPrometheusMetrics());
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port, options.host, () => resolve());
  });
  const bound = server.address();
  const boundPort =
    bound && typeof bound === "object" && typeof bound.port === "number" && Number.isFinite(bound.port)
      ? bound.port
      : options.port;
  appendOpsAuditEvent({
    workspace: options.workspace,
    auditType: "METRICS_SERVER_STARTED",
    payload: {
      host: options.host,
      port: boundPort
    }
  });
  return {
    host: options.host,
    port: boundPort,
    close: async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    }
  };
}
