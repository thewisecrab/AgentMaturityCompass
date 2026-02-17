import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

interface ParsedPasswordHash {
  algo: "scrypt";
  n: number;
  r: number;
  p: number;
  keylen: number;
  saltB64: string;
  hashB64: string;
}

const DEFAULT_PARAMS = {
  n: 16384,
  r: 8,
  p: 1,
  keylen: 64
};

function parsePasswordHash(encoded: string): ParsedPasswordHash {
  const parts = encoded.split("$");
  if (parts.length !== 7 || parts[0] !== "scrypt") {
    throw new Error("invalid password hash format");
  }
  const algo = parts[0]!;
  const n = parts[1]!;
  const r = parts[2]!;
  const p = parts[3]!;
  const keylen = parts[4]!;
  const saltB64 = parts[5]!;
  const hashB64 = parts[6]!;
  return {
    algo: algo as "scrypt",
    n: Number(n),
    r: Number(r),
    p: Number(p),
    keylen: Number(keylen),
    saltB64,
    hashB64
  };
}

export function hashPassword(password: string): string {
  if (password.length < 8) {
    throw new Error("password must be at least 8 characters");
  }
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, DEFAULT_PARAMS.keylen, {
    N: DEFAULT_PARAMS.n,
    r: DEFAULT_PARAMS.r,
    p: DEFAULT_PARAMS.p
  });
  return [
    "scrypt",
    String(DEFAULT_PARAMS.n),
    String(DEFAULT_PARAMS.r),
    String(DEFAULT_PARAMS.p),
    String(DEFAULT_PARAMS.keylen),
    salt.toString("base64"),
    derived.toString("base64")
  ].join("$");
}

export function verifyPassword(password: string, encodedHash: string): boolean {
  try {
    const parsed = parsePasswordHash(encodedHash);
    const salt = Buffer.from(parsed.saltB64, "base64");
    const expected = Buffer.from(parsed.hashB64, "base64");
    const actual = scryptSync(password, salt, parsed.keylen, {
      N: parsed.n,
      r: parsed.r,
      p: parsed.p
    });
    if (actual.length !== expected.length) {
      return false;
    }
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
