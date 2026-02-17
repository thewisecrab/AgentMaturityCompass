import { createHash } from "node:crypto";

const SECRET_PATTERNS = [
  /Bearer\s+[A-Za-z0-9._-]{8,}/gi,
  /\bsk-[A-Za-z0-9]{12,}\b/g,
  /\bAIza[0-9A-Za-z\-_]{20,}\b/g,
  /\bxai-[A-Za-z0-9\-_]{12,}\b/g,
  /BEGIN (?:RSA|EC|OPENSSH|PRIVATE) KEY/gi
];

export function redactSdkText(value: string): string {
  let out = value;
  for (const pattern of SECRET_PATTERNS) {
    out = out.replace(pattern, "<AMC_REDACTED>");
  }
  return out;
}

export function hashSdkValue(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}
