import { AMCSDKError } from "./errors.js";

const FORBIDDEN_TOKENS = ["score", "scores", "maturity", "questionScores", "42answers", "diagnosticScore"];

function forbiddenKeyPath(input: unknown, prefix = "", visited = new WeakSet<object>()): string | null {
  if (!input || typeof input !== "object") {
    return null;
  }
  if (visited.has(input)) {
    return null;
  }
  visited.add(input);
  if (Array.isArray(input)) {
    for (let i = 0; i < input.length; i++) {
      const found = forbiddenKeyPath(input[i], `${prefix}[${i}]`, visited);
      if (found) {
        return found;
      }
    }
    return null;
  }
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    const lowered = key.toLowerCase();
    if (FORBIDDEN_TOKENS.some((token) => lowered.includes(token.toLowerCase()))) {
      return fullPath;
    }
    const nested = forbiddenKeyPath(value, fullPath, visited);
    if (nested) {
      return nested;
    }
  }
  return null;
}

export function assertNoSelfScoring(payload: Record<string, unknown>): void {
  const blockedPath = forbiddenKeyPath(payload);
  if (!blockedPath) {
    return;
  }
  throw new AMCSDKError({
    code: "SELF_SCORING_BLOCKED",
    message: `AMC SDK blocked payload key '${blockedPath}' because self-reported scoring fields are not allowed.`,
    details: "Remove score/maturity fields from the request body and send only model input/output content."
  });
}

export function requireBridgeUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.length === 0) {
    throw new AMCSDKError({
      code: "INVALID_BRIDGE_URL",
      message: "bridgeUrl is required. Set AMC_BRIDGE_URL or pass { bridgeUrl } to createAMCClient()."
    });
  }
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    throw new AMCSDKError({
      code: "INVALID_BRIDGE_URL",
      message: `bridgeUrl must be an absolute http(s) URL, got '${trimmed}'.`,
      details: "Example: http://127.0.0.1:3212"
    });
  }
  return trimmed.replace(/\/+$/, "");
}
