import { createHash } from "node:crypto";
import { benchPiiScanSchema, type BenchArtifact, type BenchPiiScanReport } from "./benchSchema.js";

interface Rule {
  severity: "LOW" | "MEDIUM" | "HIGH";
  type: string;
  pattern: RegExp;
}

const PIIRules: Rule[] = [
  { severity: "HIGH", type: "PRIVATE_KEY", pattern: /BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY/g },
  { severity: "HIGH", type: "EMAIL", pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g },
  { severity: "HIGH", type: "URL", pattern: /\bhttps?:\/\/[^\s"']+/gi },
  { severity: "HIGH", type: "FILE_PATH_UNIX", pattern: /(?:^|[\s"'])\/(?:Users|home|var|tmp|etc)\/[^\s"']+/g },
  { severity: "HIGH", type: "FILE_PATH_WINDOWS", pattern: /(?:^|[\s"'])[A-Za-z]:\\[^\s"']+/g },
  { severity: "HIGH", type: "OPENAI_TOKEN", pattern: /\bsk-[A-Za-z0-9]{10,}\b/g },
  { severity: "HIGH", type: "GOOGLE_TOKEN", pattern: /\bAIza[0-9A-Za-z\-_]{20,}\b/g },
  { severity: "HIGH", type: "JWT_TOKEN", pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g },
  { severity: "MEDIUM", type: "LONG_BASE64", pattern: /\b[A-Za-z0-9+/_-]{80,}={0,2}\b/g }
];

function redactSnippet(input: string): string {
  if (input.length <= 10) {
    return "<REDACTED>";
  }
  return `${input.slice(0, 4)}***${input.slice(-4)}`;
}

function isEnumLike(path: string, value: string): boolean {
  const enumPaths: Array<{ path: RegExp; values: Set<string> }> = [
    { path: /^scope\.type$/, values: new Set(["WORKSPACE", "NODE", "AGENT"]) },
    { path: /^publisher\.mode$/, values: new Set(["ANONYMIZED", "NAMED"]) },
    { path: /^publisher\.attestation\.trustMode$/, values: new Set(["LOCAL_VAULT", "NOTARY"]) },
    { path: /^publisher\.attestation\.attestationLevel$/, values: new Set(["SOFTWARE", "HARDWARE", "NONE"]) },
    { path: /^evidence\.trustLabel$/, values: new Set(["LOW", "MEDIUM", "HIGH"]) },
    { path: /^metrics\.operatingHealth\.plugins\.integrity$/, values: new Set(["PASS", "FAIL"]) },
    { path: /^metrics\.forecastSummary\.status$/, values: new Set(["OK", "INSUFFICIENT_EVIDENCE"]) },
    { path: /^metrics\.forecastSummary\.confidenceLabel$/, values: new Set(["HIGH", "MEDIUM", "LOW", "NONE"]) }
  ];
  for (const item of enumPaths) {
    if (item.path.test(path) && item.values.has(value)) {
      return true;
    }
  }
  return false;
}

function isSafeHashLike(value: string): boolean {
  return /^[a-f0-9]{8,128}$/i.test(value) || /^q_[a-f0-9]{8,128}$/i.test(value);
}

function scanValue(path: string, value: string, findings: BenchPiiScanReport["findings"]): void {
  if (isEnumLike(path, value) || isSafeHashLike(value)) {
    return;
  }
  for (const rule of PIIRules) {
    for (const match of value.matchAll(rule.pattern)) {
      findings.push({
        severity: rule.severity,
        type: rule.type,
        path,
        pattern: rule.pattern.source,
        snippetRedacted: redactSnippet(match[0] ?? value)
      });
    }
  }

  // Free-text guard: disallow broad prose in non-allowlisted strings.
  if (/\s{1,}/.test(value) && value.length > 32) {
    findings.push({
      severity: "HIGH",
      type: "FREE_TEXT",
      path,
      pattern: "free-text-guard",
      snippetRedacted: redactSnippet(value)
    });
  }
}

function walk(path: string, value: unknown, findings: BenchPiiScanReport["findings"]): void {
  if (typeof value === "string") {
    scanValue(path, value, findings);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(`${path}[${index}]`, item, findings));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      walk(path.length > 0 ? `${path}.${key}` : key, item, findings);
    }
  }
}

export function scanBenchForPii(bench: BenchArtifact): BenchPiiScanReport {
  const findings: BenchPiiScanReport["findings"] = [];
  walk("", bench, findings);
  const hasHigh = findings.some((row) => row.severity === "HIGH");
  return benchPiiScanSchema.parse({
    v: 1,
    status: hasHigh ? "FAIL" : "PASS",
    findings
  });
}

export function hashId(input: string, truncBytes = 8): string {
  const digest = createHash("sha256").update(input).digest("hex");
  const n = Math.max(4, Math.min(32, truncBytes)) * 2;
  return digest.slice(0, n);
}

