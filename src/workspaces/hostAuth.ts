import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ensureDir, pathExists, writeFileAtomic } from "../utils/fs.js";
import { canonicalize } from "../utils/json.js";

interface HostPasswordEnvelope {
  v: number;
  alg: "scrypt";
  N: number;
  r: number;
  p: number;
  keylen: number;
  nonceB64: string;
  digestB64: string;
}

function encodeEnvelope(input: HostPasswordEnvelope): string {
  return JSON.stringify(input);
}

function decodeEnvelope(raw: string): HostPasswordEnvelope | null {
  try {
    const parsed = JSON.parse(raw) as Partial<HostPasswordEnvelope>;
    if (
      parsed.v !== 1 ||
      parsed.alg !== "scrypt" ||
      typeof parsed.N !== "number" ||
      typeof parsed.r !== "number" ||
      typeof parsed.p !== "number" ||
      typeof parsed.keylen !== "number" ||
      typeof parsed.nonceB64 !== "string" ||
      typeof parsed.digestB64 !== "string"
    ) {
      return null;
    }
    return parsed as HostPasswordEnvelope;
  } catch {
    return null;
  }
}

function deriveDigest(password: string, envelope: Omit<HostPasswordEnvelope, "v" | "alg" | "digestB64">): Buffer {
  return scryptSync(Buffer.from(password, "utf8"), Buffer.from(envelope.nonceB64, "base64"), envelope.keylen, {
    N: envelope.N,
    r: envelope.r,
    p: envelope.p
  });
}

export function hashHostPassword(password: string): string {
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  const nonce = randomBytes(16);
  const envelopeBase = {
    N: 16384,
    r: 8,
    p: 1,
    keylen: 32,
    nonceB64: nonce.toString("base64")
  };
  const digest = deriveDigest(password, envelopeBase);
  return encodeEnvelope({
    v: 1,
    alg: "scrypt",
    ...envelopeBase,
    digestB64: digest.toString("base64")
  });
}

export function verifyHostPassword(password: string, hash: string): boolean {
  const envelope = decodeEnvelope(hash);
  if (!envelope) {
    return false;
  }
  const expected = Buffer.from(envelope.digestB64, "base64");
  const actual = deriveDigest(password, {
    N: envelope.N,
    r: envelope.r,
    p: envelope.p,
    keylen: envelope.keylen,
    nonceB64: envelope.nonceB64
  });
  if (expected.length !== actual.length) {
    return false;
  }
  return timingSafeEqual(expected, actual);
}

function toBase64Url(bytes: Buffer): string {
  return bytes.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Buffer {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${pad}`, "base64");
}

export interface HostSessionPayload {
  v: 1;
  userId: string;
  username: string;
  isHostAdmin: boolean;
  issuedTs: number;
  expiresTs: number;
  nonce: string;
}

function hostSessionSecretPath(hostDir: string): string {
  return join(hostDir, ".host-session.secret");
}

function ensureHostSessionSecret(hostDir: string): Buffer {
  ensureDir(hostDir);
  const path = hostSessionSecretPath(hostDir);
  if (pathExists(path)) {
    return readFileSync(path);
  }
  const secret = randomBytes(32);
  writeFileAtomic(path, secret, 0o600);
  return secret;
}

function hostSessionHmac(hostDir: string, payloadBytes: Buffer): Buffer {
  const secret = ensureHostSessionSecret(hostDir);
  return createHmac("sha256", secret).update(payloadBytes).digest();
}

export function issueHostSessionToken(input: {
  hostDir: string;
  userId: string;
  username: string;
  isHostAdmin: boolean;
  ttlMs?: number;
}): { token: string; payload: HostSessionPayload } {
  const now = Date.now();
  const payload: HostSessionPayload = {
    v: 1,
    userId: input.userId,
    username: input.username,
    isHostAdmin: input.isHostAdmin,
    issuedTs: now,
    expiresTs: now + Math.max(5 * 60_000, input.ttlMs ?? 8 * 60 * 60_000),
    nonce: randomBytes(16).toString("hex")
  };
  const payloadBytes = Buffer.from(canonicalize(payload), "utf8");
  const sig = hostSessionHmac(input.hostDir, payloadBytes);
  return {
    token: `${toBase64Url(payloadBytes)}.${toBase64Url(sig)}`,
    payload
  };
}

export function verifyHostSessionToken(input: {
  hostDir: string;
  token: string;
}): { ok: boolean; payload: HostSessionPayload | null; error?: string } {
  try {
    const [payloadPart, sigPart, ...extra] = input.token.split(".");
    if (!payloadPart || !sigPart || extra.length > 0) {
      return { ok: false, payload: null, error: "invalid host session token format" };
    }
    const payloadBytes = fromBase64Url(payloadPart);
    const expectedSig = fromBase64Url(sigPart);
    const actualSig = hostSessionHmac(input.hostDir, payloadBytes);
    if (expectedSig.length !== actualSig.length || !timingSafeEqual(expectedSig, actualSig)) {
      return { ok: false, payload: null, error: "host session signature verification failed" };
    }
    const parsed = JSON.parse(payloadBytes.toString("utf8")) as Partial<HostSessionPayload>;
    if (
      parsed.v !== 1 ||
      typeof parsed.userId !== "string" ||
      typeof parsed.username !== "string" ||
      typeof parsed.isHostAdmin !== "boolean" ||
      typeof parsed.issuedTs !== "number" ||
      typeof parsed.expiresTs !== "number" ||
      typeof parsed.nonce !== "string"
    ) {
      return { ok: false, payload: null, error: "invalid host session payload" };
    }
    if (Date.now() > parsed.expiresTs) {
      return { ok: false, payload: parsed as HostSessionPayload, error: "host session expired" };
    }
    return { ok: true, payload: parsed as HostSessionPayload };
  } catch (error) {
    return { ok: false, payload: null, error: String(error) };
  }
}
