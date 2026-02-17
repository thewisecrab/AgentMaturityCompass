import { request as httpRequest } from "node:http";
import { URL } from "node:url";

function callStudioApi<T>(params: {
  baseUrl: string;
  path: string;
  method: "GET" | "POST";
  adminToken?: string;
  leaseToken?: string;
  body?: unknown;
}): Promise<T> {
  const url = new URL(params.path, params.baseUrl);
  const rawBody = params.body === undefined ? "" : JSON.stringify(params.body);
  return new Promise((resolve, reject) => {
    const req = httpRequest(
      {
        method: params.method,
        host: url.hostname,
        port: Number(url.port || "80"),
        path: `${url.pathname}${url.search}`,
        headers: {
          "content-type": "application/json",
          "content-length": Buffer.byteLength(rawBody),
          ...(params.adminToken ? { "x-amc-admin-token": params.adminToken } : {}),
          ...(params.leaseToken ? { "x-amc-lease": params.leaseToken } : {})
        }
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          const parsed = text.length > 0 ? (JSON.parse(text) as T & { error?: string }) : ({} as T & { error?: string });
          if ((res.statusCode ?? 500) >= 400) {
            reject(new Error(parsed.error ?? `HTTP ${res.statusCode ?? 500}`));
            return;
          }
          resolve(parsed as T);
        });
      }
    );
    req.on("error", reject);
    if (rawBody.length > 0) {
      req.write(rawBody);
    }
    req.end();
  });
}

export function fetchApprovals(params: {
  baseUrl: string;
  adminToken: string;
  agentId: string;
  status?: string;
}): Promise<{
  approvals: Array<Record<string, unknown>>;
}> {
  const query = new URLSearchParams({
    agentId: params.agentId
  });
  if (params.status) {
    query.set("status", params.status);
  }
  return callStudioApi({
    baseUrl: params.baseUrl,
    path: `/approvals?${query.toString()}`,
    method: "GET",
    adminToken: params.adminToken
  });
}

export function approveIntent(params: {
  baseUrl: string;
  adminToken: string;
  approvalId: string;
  mode: "SIMULATE" | "EXECUTE";
  reason: string;
}): Promise<Record<string, unknown>> {
  return callStudioApi({
    baseUrl: params.baseUrl,
    path: `/approvals/${encodeURIComponent(params.approvalId)}/approve`,
    method: "POST",
    adminToken: params.adminToken,
    body: {
      mode: params.mode,
      reason: params.reason
    }
  });
}

export function denyIntent(params: {
  baseUrl: string;
  adminToken: string;
  approvalId: string;
  reason: string;
}): Promise<Record<string, unknown>> {
  return callStudioApi({
    baseUrl: params.baseUrl,
    path: `/approvals/${encodeURIComponent(params.approvalId)}/deny`,
    method: "POST",
    adminToken: params.adminToken,
    body: {
      reason: params.reason
    }
  });
}

export function pollApprovalStatus(params: {
  baseUrl: string;
  leaseToken: string;
  approvalId: string;
}): Promise<Record<string, unknown>> {
  return callStudioApi({
    baseUrl: params.baseUrl,
    path: `/agent/approvals/${encodeURIComponent(params.approvalId)}/status`,
    method: "GET",
    leaseToken: params.leaseToken
  });
}

