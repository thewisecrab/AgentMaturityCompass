import { sha256Hex } from "../utils/hash.js";
import { promptLintSchema, type PromptLintReport, type PromptPack, type PromptProviderFiles } from "./promptPackSchema.js";
import type { PromptPolicy } from "./promptPolicySchema.js";

interface Rule {
  type: "SECRET" | "EMAIL" | "URL" | "FILE_PATH" | "PRIVATE_KEY" | "POLICY_LEAK";
  severity: "HIGH" | "MEDIUM" | "LOW";
  re: RegExp;
}

const RULES: Rule[] = [
  { type: "PRIVATE_KEY", severity: "HIGH", re: /BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY/g },
  { type: "SECRET", severity: "HIGH", re: /\bsk-[A-Za-z0-9]{10,}\b/g },
  { type: "SECRET", severity: "HIGH", re: /\bAIza[0-9A-Za-z\-_]{20,}\b/g },
  { type: "SECRET", severity: "HIGH", re: /\bBearer\s+[A-Za-z0-9._-]{10,}\b/gi },
  { type: "SECRET", severity: "HIGH", re: /\bx-amc-notary-auth\b/gi },
  { type: "SECRET", severity: "HIGH", re: /\bvault:[^\s"'`]+/gi },
  { type: "EMAIL", severity: "HIGH", re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g },
  { type: "URL", severity: "HIGH", re: /\bhttps?:\/\/[^\s"'`]+/gi },
  { type: "FILE_PATH", severity: "HIGH", re: /(?:^|[\s"'`])\/(?:Users|home|var|tmp|etc)\/[^\s"'`]+/g },
  { type: "FILE_PATH", severity: "HIGH", re: /(?:^|[\s"'`])[A-Za-z]:\\[^\s"'`]+/g },
  { type: "POLICY_LEAK", severity: "MEDIUM", re: /AMC-[0-9](?:\.[0-9]){1,2}\s*[:=]\s*[0-5]\b/g }
];

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function addFinding(params: {
  findings: PromptLintReport["findings"];
  severity: "HIGH" | "MEDIUM" | "LOW";
  type: "SECRET" | "EMAIL" | "URL" | "FILE_PATH" | "PRIVATE_KEY" | "POLICY_LEAK";
  path: string;
  snippet: string;
}): void {
  params.findings.push({
    severity: params.severity,
    type: params.type,
    path: params.path,
    snippetHash: sha256Hex(Buffer.from(params.snippet, "utf8"))
  });
}

function scanString(path: string, value: string, findings: PromptLintReport["findings"]): void {
  for (const rule of RULES) {
    for (const match of value.matchAll(rule.re)) {
      addFinding({
        findings,
        severity: rule.severity,
        type: rule.type,
        path,
        snippet: match[0] ?? value
      });
    }
  }
  if (value.length > 16_000) {
    addFinding({
      findings,
      severity: "MEDIUM",
      type: "POLICY_LEAK",
      path,
      snippet: `len:${value.length}`
    });
  }
  if (estimateTokens(value) > 4_000) {
    addFinding({
      findings,
      severity: "LOW",
      type: "POLICY_LEAK",
      path,
      snippet: `tokens:${estimateTokens(value)}`
    });
  }
}

function walk(path: string, value: unknown, findings: PromptLintReport["findings"]): void {
  if (typeof value === "string") {
    scanString(path, value, findings);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((row, index) => walk(`${path}[${index}]`, row, findings));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, row] of Object.entries(value as Record<string, unknown>)) {
      walk(path.length > 0 ? `${path}.${key}` : key, row, findings);
    }
  }
}

export function runPromptLint(params: {
  pack: PromptPack;
  providerFiles: PromptProviderFiles;
  policy: PromptPolicy;
}): PromptLintReport {
  const findings: PromptLintReport["findings"] = [];
  walk("pack", params.pack, findings);
  walk("provider", params.providerFiles, findings);

  if (!params.policy.promptPolicy.privacy.includeNumericTargetsInPrompt) {
    const serialized = JSON.stringify(params.providerFiles);
    if (/AMC-[0-9](?:\.[0-9]){1,2}\s*[:=]\s*[0-5]\b/.test(serialized)) {
      addFinding({
        findings,
        severity: "HIGH",
        type: "POLICY_LEAK",
        path: "provider",
        snippet: "numeric-target-value"
      });
    }
  }

  findings.sort((a, b) => {
    const left = `${a.severity}:${a.type}:${a.path}:${a.snippetHash}`;
    const right = `${b.severity}:${b.type}:${b.path}:${b.snippetHash}`;
    return left.localeCompare(right);
  });
  const status = findings.some((row) => row.severity === "HIGH") ? "FAIL" : "PASS";
  return promptLintSchema.parse({
    v: 1,
    status,
    findings
  });
}
