import { createHash } from "node:crypto";
import { canonicalize } from "../utils/json.js";

const SECRET_PATTERNS: RegExp[] = [
  /Bearer\s+[A-Za-z0-9._-]{8,}/gi,
  /\bsk-[A-Za-z0-9]{12,}\b/g,
  /\bAIza[0-9A-Za-z\-_]{20,}\b/g,
  /\bxai-[A-Za-z0-9\-_]{12,}\b/g,
  /BEGIN (?:RSA|EC|OPENSSH|PRIVATE) KEY/gi,
  /\blease_[a-z0-9]{10,}\b/gi,
  /\bamc_[a-z0-9]{12,}\b/gi
];

function clip(value: string, maxChars: number): string {
  if (value.length <= maxChars) {
    return value;
  }
  return `${value.slice(0, maxChars)}…`;
}

export function redactBridgeText(input: string): string {
  let out = input;
  for (const pattern of SECRET_PATTERNS) {
    out = out.replace(pattern, "<AMC_REDACTED>");
  }
  return out;
}

export function bridgeSha256(bytes: Buffer | string): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export function summarizeBridgeBody(params: {
  payload: unknown;
  maxChars: number;
  redactPromptText: boolean;
}): string {
  const serialized = canonicalize(params.payload ?? {});
  if (!params.redactPromptText) {
    return clip(redactBridgeText(serialized), params.maxChars);
  }
  return clip(redactBridgeText(serialized).replace(/"content":"[^"]*"/g, "\"content\":\"<REDACTED>\""), params.maxChars);
}
