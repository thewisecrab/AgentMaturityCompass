import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { DiagnosticReport } from "../types.js";
import { getAgentPaths, resolveAgentId } from "../fleet/paths.js";
import { ensureDir, pathExists, readUtf8, writeFileAtomic } from "../utils/fs.js";
import { sha256Hex } from "../utils/hash.js";
import { loadContextGraph } from "../context/contextGraph.js";
import { loadTargetProfile, verifyTargetProfileSignature } from "../targets/targetProfile.js";
import { loadAgentConfig, verifyAgentConfigSignature } from "../fleet/registry.js";
import { verifyGatewayConfigSignature } from "../gateway/config.js";
import { loadRunReport } from "../diagnostic/runner.js";

function packageVersion(workspace: string): string {
  const packageFile = join(workspace, "package.json");
  if (!pathExists(packageFile)) {
    return "unknown";
  }
  return String((JSON.parse(readUtf8(packageFile)) as { version?: string }).version ?? "unknown");
}

function overallScore(report: DiagnosticReport): number {
  if (report.layerScores.length === 0) {
    return 0;
  }
  return report.layerScores.reduce((sum, layer) => sum + layer.avgFinalLevel, 0) / report.layerScores.length;
}

function commonMetaBlock(params: {
  version: string;
  generatedTs: string;
  targetSigValid: boolean;
  agentSigValid: boolean;
  gatewaySigValid: boolean;
}): string[] {
  return [
    `Version: ${params.version}`,
    `Generated: ${params.generatedTs}`,
    `Signature status: target=${params.targetSigValid ? "VALID" : "INVALID"}, agent=${params.agentSigValid ? "VALID" : "INVALID"}, gateway=${params.gatewaySigValid ? "VALID" : "INVALID"}`,
    "Hash reference: ./manifest.json"
  ];
}

function defaultRoutingSample(params: {
  agentId: string;
  providerRoute: string;
  providerTemplateId: string;
}): string {
  return [
    `# AMC routing sample for agent ${params.agentId}`,
    `# Provider template: ${params.providerTemplateId}`,
    `# Replace placeholders with your environment-specific values.`,
    `OPENAI_BASE_URL=${params.providerRoute}`,
    `OPENAI_API_BASE=${params.providerRoute}`,
    `OPENAI_API_HOST=${params.providerRoute}`,
    `AMC_LLM_BASE_URL=${params.providerRoute}`,
    `AMC_AGENT_ID=${params.agentId}`,
    `# Example only: keep secrets in your secret manager, not in this file`,
    "# OPENAI_API_KEY=<set in environment>"
  ].join("\n");
}

function fetchWrapperSource(): string {
  return [
    "export function createAmcFetch(options) {",
    "  const baseUrl = String(options.baseUrl || '').trim();",
    "  const agentId = String(options.agentId || '').trim();",
    "  if (!baseUrl) throw new Error('baseUrl is required');",
    "  if (!agentId) throw new Error('agentId is required');",
    "",
    "  return async function amcFetch(path, init = {}) {",
    "    const url = new URL(path, baseUrl);",
    "    const headers = new Headers(init.headers || {});",
    "    headers.set('x-amc-agent-id', agentId);",
    "    if (!headers.has('content-type') && init.body) {",
    "      headers.set('content-type', 'application/json');",
    "    }",
    "    const response = await fetch(url, { ...init, headers });",
    "    return response;",
    "  };",
    "}",
    "",
    "export function withGatewayBaseUrl(env = process.env) {",
    "  return env.AMC_LLM_BASE_URL || env.OPENAI_BASE_URL || '';",
    "}"
  ].join("\n");
}

function loggerHelperSource(): string {
  return [
    "export function amcLog(event, payload = {}) {",
    "  const row = {",
    "    ts: new Date().toISOString(),",
    "    event,",
    "    payload",
    "  };",
    "  process.stdout.write(`${JSON.stringify(row)}\\n`);",
    "}",
    "",
    "export function amcError(event, payload = {}) {",
    "  const row = {",
    "    ts: new Date().toISOString(),",
    "    event,",
    "    payload",
    "  };",
    "  process.stderr.write(`${JSON.stringify(row)}\\n`);",
    "}"
  ].join("\n");
}

function writeManifest(outputDir: string): { path: string; entries: Array<{ path: string; sha256: string; size: number }> } {
  const files = [
    "northstar-card.md",
    "truth-protocol.md",
    "guardrails.yaml",
    "policy.json",
    "routing.env.sample",
    "integration-notes.md",
    "js/fetch-wrapper.mjs",
    "js/logger-helper.mjs"
  ];

  const entries = files.map((file) => {
    const full = join(outputDir, file);
    const bytes = readFileSync(full);
    return {
      path: file,
      sha256: sha256Hex(bytes),
      size: bytes.length
    };
  });

  const manifestPath = join(outputDir, "manifest.json");
  writeFileAtomic(
    manifestPath,
    JSON.stringify(
      {
        generatedTs: Date.now(),
        files: entries
      },
      null,
      2
    ),
    0o644
  );

  return {
    path: manifestPath,
    entries
  };
}

export function exportPolicyPack(params: {
  workspace: string;
  agentId?: string;
  targetName: string;
  outDir: string;
}): {
  outputDir: string;
  files: string[];
  manifestPath: string;
} {
  const workspace = params.workspace;
  const agentId = resolveAgentId(workspace, params.agentId);
  const agentPaths = getAgentPaths(workspace, agentId);
  const outputDir = resolve(workspace, params.outDir);
  const version = packageVersion(workspace);
  const generatedTs = new Date().toISOString();

  ensureDir(outputDir);
  ensureDir(join(outputDir, "js"));

  const context = loadContextGraph(workspace, agentId);
  const target = loadTargetProfile(workspace, params.targetName, agentId);
  const targetSigValid = verifyTargetProfileSignature(workspace, target);
  const agentSig = verifyAgentConfigSignature(workspace, agentId);
  const gatewaySig = verifyGatewayConfigSignature(workspace);

  const agentConfig = loadAgentConfig(workspace, agentId);
  const providerRoute = `http://127.0.0.1:3210${agentConfig.provider.routePrefix}`;

  const metaLines = commonMetaBlock({
    version,
    generatedTs,
    targetSigValid,
    agentSigValid: agentSig.valid,
    gatewaySigValid: gatewaySig.valid
  });

  const northstarCard = [
    "# North Star Card",
    ...metaLines,
    "",
    `Agent: ${agentConfig.agentName} (${agentConfig.id})`,
    `Role: ${agentConfig.role}`,
    `Domain: ${agentConfig.domain}`,
    `Risk Tier: ${context.riskTier}`,
    "",
    "## Mission",
    context.mission,
    "",
    "## Success Metrics",
    ...context.successMetrics.map((line) => `- ${line}`),
    "",
    "## Constraints",
    ...context.constraints.map((line) => `- ${line}`),
    "",
    "## Forbidden Actions",
    ...context.forbiddenActions.map((line) => `- ${line}`),
    "",
    "## Escalation Rules",
    ...context.escalationRules.map((line) => `- ${line}`)
  ].join("\n");

  const truthProtocol = [
    "# Truth Protocol",
    ...metaLines,
    "",
    "Mandatory structure for high-risk responses:",
    "1. What I observed (evidence-linked)",
    "2. What I inferred (assumptions explicit)",
    "3. What I cannot know from current evidence",
    "4. Next verification steps",
    "",
    "Failure to follow this structure is treated as TRUTH_PROTOCOL_MISSING and can cap maturity."
  ].join("\n");

  const existingGuardrails = pathExists(agentPaths.guardrails) ? readUtf8(agentPaths.guardrails).trim() : "";
  const guardrailsYaml = [
    `# Version: ${version}`,
    `# Generated: ${generatedTs}`,
    `# Signature status: target=${targetSigValid ? "VALID" : "INVALID"}, agent=${agentSig.valid ? "VALID" : "INVALID"}, gateway=${gatewaySig.valid ? "VALID" : "INVALID"}`,
    "# Hash reference: ./manifest.json",
    "",
    existingGuardrails || "guardrails:\n  note: no existing guardrails found"
  ].join("\n");

  const policyJson = {
    _meta: {
      version,
      generatedTs,
      signatureStatus: {
        target: targetSigValid ? "VALID" : "INVALID",
        agent: agentSig.valid ? "VALID" : "INVALID",
        gateway: gatewaySig.valid ? "VALID" : "INVALID"
      },
      hashReference: "./manifest.json"
    },
    northStar: {
      mission: context.mission,
      riskTier: context.riskTier,
      successMetrics: context.successMetrics,
      constraints: context.constraints,
      forbiddenActions: context.forbiddenActions,
      escalationRules: context.escalationRules
    },
    truthProtocol: {
      requiredSections: [
        "What I observed",
        "What I inferred",
        "What I cannot know",
        "Next verification steps"
      ]
    },
    approvals: {
      requiredForHighRisk: true,
      requiredForIrreversibleActions: true
    },
    target: {
      id: target.id,
      name: target.name,
      signatureValid: targetSigValid,
      mapping: target.mapping
    },
    routing: {
      providerTemplate: agentConfig.provider.templateId,
      routePrefix: agentConfig.provider.routePrefix,
      providerRoute,
      requiredHeader: "x-amc-agent-id"
    }
  };

  const integrationNotes = [
    "# Integration Notes",
    ...metaLines,
    "",
    "Use these artifacts with any framework by wiring model calls through the AMC gateway route and enforcing the Truth Protocol.",
    "",
    "## Generic steps",
    "1. Set base URL environment variables from routing.env.sample.",
    "2. Inject x-amc-agent-id on outbound model requests.",
    "3. Apply northstar-card.md + truth-protocol.md to system prompts.",
    "4. Keep guardrails.yaml and policy.json under source control with owner review.",
    "",
    "## JS drop-in helpers",
    "- js/fetch-wrapper.mjs: forces baseUrl and agent attribution header",
    "- js/logger-helper.mjs: structured stdout/stderr logs for AMC capture"
  ].join("\n");

  writeFileAtomic(join(outputDir, "northstar-card.md"), northstarCard, 0o644);
  writeFileAtomic(join(outputDir, "truth-protocol.md"), truthProtocol, 0o644);
  writeFileAtomic(join(outputDir, "guardrails.yaml"), guardrailsYaml, 0o644);
  writeFileAtomic(join(outputDir, "policy.json"), JSON.stringify(policyJson, null, 2), 0o644);
  writeFileAtomic(join(outputDir, "routing.env.sample"), defaultRoutingSample({
    agentId,
    providerRoute,
    providerTemplateId: agentConfig.provider.templateId
  }), 0o644);
  writeFileAtomic(join(outputDir, "integration-notes.md"), integrationNotes, 0o644);

  writeFileAtomic(join(outputDir, "js", "fetch-wrapper.mjs"), fetchWrapperSource(), 0o644);
  writeFileAtomic(join(outputDir, "js", "logger-helper.mjs"), loggerHelperSource(), 0o644);

  const manifest = writeManifest(outputDir);
  return {
    outputDir,
    files: manifest.entries.map((entry) => entry.path),
    manifestPath: manifest.path
  };
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateBadgeSvg(report: DiagnosticReport): string {
  const overall = overallScore(report);
  const integrity = report.integrityIndex;
  const ts = new Date(report.ts).toISOString();

  const lines = [
    `AMC ${report.agentId}`,
    `Overall ${overall.toFixed(2)} | Integrity ${integrity.toFixed(3)}`,
    `${report.trustLabel}`,
    ts
  ];

  const width = 540;
  const height = 120;
  const y0 = 28;
  const dy = 22;

  return [
    `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${width}\" height=\"${height}\" role=\"img\" aria-label=\"AMC badge\">`,
    `  <rect width=\"${width}\" height=\"${height}\" fill=\"#0b1320\" rx=\"8\" ry=\"8\"/>`,
    `  <rect x=\"4\" y=\"4\" width=\"${width - 8}\" height=\"${height - 8}\" fill=\"#121f33\" rx=\"6\" ry=\"6\"/>`,
    `  <text x=\"16\" y=\"${y0}\" font-family=\"Menlo, Consolas, monospace\" font-size=\"14\" fill=\"#e2ecff\">${escapeXml(lines[0] ?? "")}</text>`,
    `  <text x=\"16\" y=\"${y0 + dy}\" font-family=\"Menlo, Consolas, monospace\" font-size=\"13\" fill=\"#b5c9ef\">${escapeXml(lines[1] ?? "")}</text>`,
    `  <text x=\"16\" y=\"${y0 + dy * 2}\" font-family=\"Menlo, Consolas, monospace\" font-size=\"13\" fill=\"#9ad18b\">${escapeXml(lines[2] ?? "")}</text>`,
    `  <text x=\"16\" y=\"${y0 + dy * 3}\" font-family=\"Menlo, Consolas, monospace\" font-size=\"11\" fill=\"#7f95ba\">${escapeXml(lines[3] ?? "")}</text>`,
    "</svg>",
    ""
  ].join("\n");
}

export function exportBadge(params: {
  workspace: string;
  agentId?: string;
  runId: string;
  outFile: string;
}): { outFile: string; runId: string; agentId: string } {
  const agentId = resolveAgentId(params.workspace, params.agentId);
  const report = loadRunReport(params.workspace, params.runId, agentId);
  const svg = generateBadgeSvg(report);
  const outFile = resolve(params.workspace, params.outFile);
  ensureDir(dirname(outFile));
  writeFileAtomic(outFile, svg, 0o644);
  return {
    outFile,
    runId: report.runId,
    agentId
  };
}
