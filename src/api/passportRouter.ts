import type { IncomingMessage, ServerResponse } from "node:http";
import { apiError, apiSuccess, bodyJson, pathParam } from "./apiHelpers.js";
import {
  passportPublicForApi,
  passportRegistryForApi,
  passportRevokeForApi,
  passportVerifyPublicForApi
} from "../passport/passportApi.js";

function firstHeader(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return typeof value === "string" ? value : null;
}

function inferBaseUrl(req: IncomingMessage): string {
  const host = firstHeader(req.headers["x-forwarded-host"])
    ?? firstHeader(req.headers.host)
    ?? "localhost:8787";
  const proto = firstHeader(req.headers["x-forwarded-proto"])
    ?? (typeof (req.socket as { encrypted?: unknown }).encrypted === "boolean"
      && (req.socket as { encrypted?: boolean }).encrypted
      ? "https"
      : "http");
  return `${proto}://${host}`;
}

export async function handlePassportRoute(
  pathname: string,
  method: string,
  req: IncomingMessage,
  res: ServerResponse,
  workspace = process.cwd(),
  apiToken?: string
): Promise<boolean> {
  if (pathname === "/api/v1/passports" && method === "GET") {
    const url = new URL(req.url ?? pathname, "http://localhost");
    const pageRaw = Number(url.searchParams.get("page") ?? "1");
    const pageSizeRaw = Number(url.searchParams.get("pageSize") ?? "20");
    apiSuccess(res, passportRegistryForApi({
      workspace,
      page: Number.isFinite(pageRaw) ? pageRaw : 1,
      pageSize: Number.isFinite(pageSizeRaw) ? pageSizeRaw : 20,
      baseUrl: inferBaseUrl(req)
    }));
    return true;
  }

  const verifyParams = pathParam(pathname, "/api/v1/passport/:id/verify");
  if (verifyParams && method === "GET") {
    const result = passportVerifyPublicForApi({
      workspace,
      passportId: decodeURIComponent(verifyParams.id ?? ""),
      baseUrl: inferBaseUrl(req)
    });
    if (!result) {
      apiError(res, 404, "Passport not found");
      return true;
    }
    apiSuccess(res, result, result.ok ? 200 : 422);
    return true;
  }

  const revokeParams = pathParam(pathname, "/api/v1/passport/:id/revoke");
  if (revokeParams && method === "POST") {
    if ((apiToken ?? "").trim().length > 0) {
      const provided = firstHeader(req.headers["x-amc-admin-token"]);
      if (provided !== apiToken) {
        apiError(res, 401, "Missing or invalid admin token");
        return true;
      }
    }
    let body: { reason?: string; revokedBy?: string } = {};
    try {
      body = await bodyJson<{ reason?: string; revokedBy?: string }>(req);
    } catch {
      body = {};
    }
    const result = passportRevokeForApi({
      workspace,
      passportId: decodeURIComponent(revokeParams.id ?? ""),
      reason: typeof body.reason === "string" ? body.reason : null,
      revokedBy: typeof body.revokedBy === "string" ? body.revokedBy : null
    });
    if (!result) {
      apiError(res, 404, "Passport not found");
      return true;
    }
    apiSuccess(res, result);
    return true;
  }

  const publicParams = pathParam(pathname, "/api/v1/passport/:id");
  if (publicParams && method === "GET") {
    const result = passportPublicForApi({
      workspace,
      passportId: decodeURIComponent(publicParams.id ?? ""),
      baseUrl: inferBaseUrl(req)
    });
    if (!result) {
      apiError(res, 404, "Passport not found");
      return true;
    }
    apiSuccess(res, result);
    return true;
  }

  return false;
}
