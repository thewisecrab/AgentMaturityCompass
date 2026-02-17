import { wildcardMatch } from "../leases/leaseVerifier.js";

export const SECRET_PATTERNS: Array<{ type: string; re: RegExp }> = [
  { type: "PRIVATE_KEY", re: /BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY/g },
  { type: "OPENAI_KEY", re: /\bsk-[A-Za-z0-9]{10,}\b/g },
  { type: "GOOGLE_KEY", re: /\bAIza[0-9A-Za-z\-_]{20,}\b/g },
  { type: "XAI_KEY", re: /\bxai-[A-Za-z0-9\-_]{10,}\b/g },
  { type: "JWT", re: /\beyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\b/g },
  { type: "BEARER", re: /Bearer\s+[A-Za-z0-9._-]{10,}/gi }
];

export const CLAIM_ACTION_RE = /\b(i|we)\s+(did|ran|executed|deployed|completed|verified|changed|updated)\b/i;

export function redactSnippet(value: string): string {
  if (value.length <= 8) {
    return "<REDACTED>";
  }
  return `${value.slice(0, 3)}***${value.slice(-3)}`;
}

export function extractTaggedValues(text: string, tag: "tool" | "model"): string[] {
  const re = new RegExp(`\\b${tag}:([A-Za-z0-9._:/-]+)`, "gi");
  const out: string[] = [];
  for (const match of text.matchAll(re)) {
    const value = (match[1] ?? "").trim();
    if (value.length > 0) {
      out.push(value);
    }
  }
  return [...new Set(out)].sort((a, b) => a.localeCompare(b));
}

export function allowedByPatterns(patterns: string[], value: string): boolean {
  if (patterns.length === 0) {
    return false;
  }
  return patterns.some((pattern) => wildcardMatch(pattern, value));
}
