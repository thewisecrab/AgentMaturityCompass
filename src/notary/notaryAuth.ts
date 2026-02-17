import { createHmac, timingSafeEqual } from "node:crypto";
import type { IncomingMessage } from "node:http";
import { sha256Hex } from "../utils/hash.js";

function normalizeHex(input: string): string {
  return input.trim().toLowerCase();
}

export function buildNotaryAuthSignature(params: {
  secret: string;
  ts: number;
  method: string;
  path: string;
  bodyBytes: Buffer;
}): string {
  const bodySha = sha256Hex(params.bodyBytes);
  const canonical = `${params.ts}.${params.method.toUpperCase()}.${params.path}.${bodySha}`;
  return createHmac("sha256", params.secret).update(canonical).digest("hex");
}

function secureHexEqual(a: string, b: string): boolean {
  const left = Buffer.from(normalizeHex(a), "hex");
  const right = Buffer.from(normalizeHex(b), "hex");
  if (left.length === 0 || right.length === 0 || left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

export function verifyNotaryRequestAuth(params: {
  req: IncomingMessage;
  bodyBytes: Buffer;
  secret: string;
  headerName: string;
  tsHeaderName: string;
  maxClockSkewSeconds: number;
  path: string;
}): { ok: true } | { ok: false; reason: string } {
  const sigHeader = params.req.headers[params.headerName.toLowerCase()];
  const tsHeader = params.req.headers[params.tsHeaderName.toLowerCase()];
  if (typeof sigHeader !== "string" || sigHeader.trim().length === 0) {
    return { ok: false, reason: "missing signature header" };
  }
  if (typeof tsHeader !== "string" || tsHeader.trim().length === 0) {
    return { ok: false, reason: "missing timestamp header" };
  }
  const ts = Number(tsHeader);
  if (!Number.isFinite(ts)) {
    return { ok: false, reason: "invalid timestamp header" };
  }
  const now = Date.now();
  const skewMs = Math.abs(now - Math.trunc(ts));
  if (skewMs > params.maxClockSkewSeconds * 1000) {
    return { ok: false, reason: "timestamp skew exceeded" };
  }
  const expected = buildNotaryAuthSignature({
    secret: params.secret,
    ts: Math.trunc(ts),
    method: params.req.method ?? "GET",
    path: params.path,
    bodyBytes: params.bodyBytes
  });
  if (!secureHexEqual(expected, sigHeader)) {
    return { ok: false, reason: "signature mismatch" };
  }
  return { ok: true };
}

