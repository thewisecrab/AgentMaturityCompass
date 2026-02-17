import { createHash, randomBytes } from "node:crypto";

function toBase64Url(value: Buffer): string {
  return value.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function generatePkceVerifier(): string {
  return toBase64Url(randomBytes(32));
}

export function pkceChallengeS256(verifier: string): string {
  return toBase64Url(createHash("sha256").update(verifier, "utf8").digest());
}
