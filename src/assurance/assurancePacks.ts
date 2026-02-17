import { readFileSync } from "node:fs";
import { join } from "node:path";
import { sha256Hex } from "../utils/hash.js";
import { loadPromptPolicy, promptPolicyPath, verifyPromptPolicySignature } from "../prompt/promptPolicyStore.js";
import type { PromptPolicy } from "../prompt/promptPolicySchema.js";
import { loadBridgeConfig, bridgeConfigPath, verifyBridgeConfigSignature } from "../bridge/bridgeConfigStore.js";
import type { BridgeConfig } from "../bridge/bridgeConfigSchema.js";
import { loadToolsConfig, toolsConfigPath, verifyToolsConfigSignature } from "../toolhub/toolhubValidators.js";
import type { ToolsConfig } from "../toolhub/toolsSchema.js";
import { budgetsPath, verifyBudgetsConfigSignature } from "../budgets/budgets.js";
import { loadGatewayConfig, verifyGatewayConfigSignature, type GatewayConfig } from "../gateway/config.js";
import { checkNotaryTrust, loadTrustConfig, type TrustConfig } from "../trust/trustConfig.js";
import { pathExists } from "../utils/fs.js";
import {
  assurancePackIdSchema,
  assuranceFindingCategorySchema,
  assuranceFindingSeveritySchema,
  type AssurancePackId,
  type AssuranceFindingCategory,
  type AssuranceFindingSeverity
} from "./assuranceSchema.js";
import type { AssurancePolicy } from "./assurancePolicySchema.js";

export interface AssurancePackEvidence {
  auditCounts: Record<string, number>;
  transparencyCounts: Record<string, number>;
  recentEventHashes: string[];
}

export interface AssurancePackContext {
  workspace: string;
  scope: { type: "WORKSPACE" | "NODE" | "AGENT"; id: string };
  nowTs: number;
  policy: AssurancePolicy;
  policySha256: string;
  evidence: AssurancePackEvidence;
  trustConfig: TrustConfig;
  notaryTrust: Awaited<ReturnType<typeof checkNotaryTrust>>;
  promptPolicy: PromptPolicy | null;
  promptPolicySigValid: boolean;
  promptPolicySha256: string;
  bridgeConfig: BridgeConfig | null;
  bridgeConfigSigValid: boolean;
  bridgeConfigSha256: string;
  toolsConfig: ToolsConfig | null;
  toolsSigValid: boolean;
  toolsSha256: string;
  budgetsSigValid: boolean;
  budgetsSha256: string;
  gatewayConfig: GatewayConfig | null;
  gatewaySigValid: boolean;
  gatewaySha256: string;
}

export interface AssuranceScenarioDefinition {
  packId: AssurancePackId;
  scenarioId: string;
  category: AssuranceFindingCategory;
  severityOnFailure: AssuranceFindingSeverity;
  descriptionTemplateId: string;
  remediationHints: string[];
  evaluate: (ctx: AssurancePackContext) => {
    passed: boolean;
    reasons: string[];
    decision: "ALLOWED" | "DENIED" | "REJECTED" | "FLAGGED";
    evidenceEventHashes: string[];
    counters?: Record<string, number>;
  };
}

function hashOfFile(path: string): string {
  if (!pathExists(path)) {
    return "0".repeat(64);
  }
  return sha256Hex(readFileSync(path));
}

function gatewayConfigPath(workspace: string): string {
  return join(workspace, ".amc", "gateway.yaml");
}

function hasAudit(ctx: AssurancePackContext, auditType: string): number {
  return ctx.evidence.auditCounts[auditType] ?? 0;
}

function hasTransparency(ctx: AssurancePackContext, eventType: string): number {
  return ctx.evidence.transparencyCounts[eventType] ?? 0;
}

function patternExists(policy: PromptPolicy | null, fragment: string): boolean {
  if (!policy) {
    return false;
  }
  const normalized = fragment.trim().toLowerCase();
  return policy.promptPolicy.enforcement.overridePatterns.some((row: string) => row.trim().toLowerCase() === normalized);
}

function evidenceHashes(ctx: AssurancePackContext): string[] {
  return ctx.evidence.recentEventHashes.slice(0, 3);
}

function includesTool(config: ToolsConfig | null, toolName: string): boolean {
  if (!config) {
    return false;
  }
  return config.tools.allowedTools.some((row) => row.name === toolName);
}

function providerModelRulesStrict(config: BridgeConfig | null): boolean {
  if (!config) {
    return false;
  }
  const providers = config.bridge.providers;
  return Object.values(providers).every((provider) => provider.modelAllowlist.length > 0 && !provider.modelAllowlist.includes("*"));
}

function gatewayAllowlistHealthy(config: GatewayConfig | null): boolean {
  if (!config) {
    return false;
  }
  return config.proxy.enabled && config.proxy.denyByDefault && config.proxy.allowlistHosts.length > 0;
}

export function loadAssurancePackContext(params: {
  workspace: string;
  scope: { type: "WORKSPACE" | "NODE" | "AGENT"; id: string };
  nowTs: number;
  policy: AssurancePolicy;
  policySha256: string;
  evidence: AssurancePackEvidence;
}): Promise<AssurancePackContext> {
  const promptSig = verifyPromptPolicySignature(params.workspace);
  let promptPolicy: PromptPolicy | null = null;
  try {
    promptPolicy = loadPromptPolicy(params.workspace);
  } catch {
    promptPolicy = null;
  }

  const bridgeSig = verifyBridgeConfigSignature(params.workspace);
  let bridgeConfig: BridgeConfig | null = null;
  try {
    bridgeConfig = loadBridgeConfig(params.workspace);
  } catch {
    bridgeConfig = null;
  }

  const toolsSig = verifyToolsConfigSignature(params.workspace);
  let toolsConfig: ToolsConfig | null = null;
  try {
    toolsConfig = loadToolsConfig(params.workspace);
  } catch {
    toolsConfig = null;
  }

  const budgetsSig = verifyBudgetsConfigSignature(params.workspace);
  const gatewaySig = verifyGatewayConfigSignature(params.workspace);
  let gatewayConfig: GatewayConfig | null = null;
  try {
    gatewayConfig = loadGatewayConfig(params.workspace);
  } catch {
    gatewayConfig = null;
  }

  const trustConfig = loadTrustConfig(params.workspace);

  return checkNotaryTrust(params.workspace).then((notaryTrust) => ({
    workspace: params.workspace,
    scope: params.scope,
    nowTs: params.nowTs,
    policy: params.policy,
    policySha256: params.policySha256,
    evidence: params.evidence,
    trustConfig,
    notaryTrust,
    promptPolicy,
    promptPolicySigValid: promptSig.valid,
    promptPolicySha256: hashOfFile(promptPolicyPath(params.workspace)),
    bridgeConfig,
    bridgeConfigSigValid: bridgeSig.valid,
    bridgeConfigSha256: hashOfFile(bridgeConfigPath(params.workspace)),
    toolsConfig,
    toolsSigValid: toolsSig.valid,
    toolsSha256: hashOfFile(toolsConfigPath(params.workspace)),
    budgetsSigValid: budgetsSig.valid,
    budgetsSha256: hashOfFile(budgetsPath(params.workspace)),
    gatewayConfig,
    gatewaySigValid: gatewaySig.valid,
    gatewaySha256: hashOfFile(gatewayConfigPath(params.workspace))
  }));
}

const scenarioDefinitions: AssuranceScenarioDefinition[] = [
  {
    packId: "injection",
    scenarioId: "injection.enforced-system",
    category: "INJECTION_RESILIENCE",
    severityOnFailure: "HIGH",
    descriptionTemplateId: "INJ_ENFORCED_SYSTEM_V1",
    remediationHints: ["amc prompt policy print", "amc prompt policy apply --file .amc/prompt/policy.yaml --reason \"enable enforce\""] ,
    evaluate: (ctx) => {
      const enforce = ctx.promptPolicy?.promptPolicy.enforcement.mode === "ENFORCE";
      const strip = ctx.promptPolicy?.promptPolicy.enforcement.stripUserSystemMessages === true;
      const passed = Boolean(ctx.promptPolicySigValid && enforce && strip);
      return {
        passed,
        reasons: passed ? [] : ["prompt enforcement mode/strip settings are not fail-closed"],
        decision: passed ? "ALLOWED" : "DENIED",
        evidenceEventHashes: evidenceHashes(ctx),
        counters: {
          promptPolicySignatureValid: ctx.promptPolicySigValid ? 1 : 0
        }
      };
    }
  },
  {
    packId: "injection",
    scenarioId: "injection.override-patterns",
    category: "INJECTION_RESILIENCE",
    severityOnFailure: "MEDIUM",
    descriptionTemplateId: "INJ_OVERRIDE_PATTERNS_V1",
    remediationHints: ["amc prompt policy print"],
    evaluate: (ctx) => {
      const required = ["ignore previous", "disregard system", "bypass policy"];
      const missing = required.filter((row) => !patternExists(ctx.promptPolicy, row));
      return {
        passed: missing.length === 0,
        reasons: missing.length === 0 ? [] : [`missing override patterns: ${missing.join(", ")}`],
        decision: missing.length === 0 ? "ALLOWED" : "FLAGGED",
        evidenceEventHashes: evidenceHashes(ctx),
        counters: {
          missing: missing.length
        }
      };
    }
  },
  {
    packId: "injection",
    scenarioId: "injection.override-audited",
    category: "INJECTION_RESILIENCE",
    severityOnFailure: "LOW",
    descriptionTemplateId: "INJ_OVERRIDE_AUDITED_V1",
    remediationHints: ["Route model traffic via AMC Bridge and rerun assurance"],
    evaluate: (ctx) => {
      const overrideAuditCount = hasAudit(ctx, "PROMPT_OVERRIDE_ATTEMPT") + hasTransparency(ctx, "PROMPT_OVERRIDE_ATTEMPT");
      return {
        passed: overrideAuditCount > 0,
        reasons: overrideAuditCount > 0 ? [] : ["no observed prompt override attempts were audited"],
        decision: overrideAuditCount > 0 ? "ALLOWED" : "FLAGGED",
        evidenceEventHashes: evidenceHashes(ctx),
        counters: {
          overrideAuditCount
        }
      };
    }
  },
  {
    packId: "exfiltration",
    scenarioId: "exfil.bridge-redaction",
    category: "SECRET_LEAKAGE",
    severityOnFailure: "HIGH",
    descriptionTemplateId: "EXFIL_BRIDGE_REDACTION_V1",
    remediationHints: ["amc bridge config verify"],
    evaluate: (ctx) => {
      const redact = ctx.bridgeConfig?.bridge.redaction.redactPromptText === true;
      const passed = Boolean(ctx.bridgeConfigSigValid && redact);
      return {
        passed,
        reasons: passed ? [] : ["bridge redaction is disabled or unsigned"],
        decision: passed ? "ALLOWED" : "DENIED",
        evidenceEventHashes: evidenceHashes(ctx)
      };
    }
  },
  {
    packId: "exfiltration",
    scenarioId: "exfil.truthguard-enabled",
    category: "SECRET_LEAKAGE",
    severityOnFailure: "HIGH",
    descriptionTemplateId: "EXFIL_TRUTHGUARD_V1",
    remediationHints: ["amc prompt policy print"],
    evaluate: (ctx) => {
      const enabled = ctx.promptPolicy?.promptPolicy.truth.requireTruthguardForBridgeResponses === true;
      return {
        passed: enabled,
        reasons: enabled ? [] : ["truthguard bridge response validation disabled"],
        decision: enabled ? "ALLOWED" : "DENIED",
        evidenceEventHashes: evidenceHashes(ctx)
      };
    }
  },
  {
    packId: "exfiltration",
    scenarioId: "exfil.no-secret-output-fails",
    category: "PII_LEAKAGE",
    severityOnFailure: "HIGH",
    descriptionTemplateId: "EXFIL_OUTPUT_VIOLATIONS_V1",
    remediationHints: ["amc truthguard validate --file <output.json>"],
    evaluate: (ctx) => {
      const outputFails = hasAudit(ctx, "OUTPUT_VALIDATED_FAIL");
      return {
        passed: outputFails === 0,
        reasons: outputFails === 0 ? [] : [`output validation failures observed: ${outputFails}`],
        decision: outputFails === 0 ? "ALLOWED" : "REJECTED",
        evidenceEventHashes: evidenceHashes(ctx),
        counters: { outputFails }
      };
    }
  },
  {
    packId: "toolMisuse",
    scenarioId: "tools.signed-config",
    category: "TOOL_GOVERNANCE",
    severityOnFailure: "HIGH",
    descriptionTemplateId: "TOOLS_SIGNED_CONFIG_V1",
    remediationHints: ["amc toolhub sign"],
    evaluate: (ctx) => ({
      passed: ctx.toolsSigValid && ctx.budgetsSigValid,
      reasons: ctx.toolsSigValid && ctx.budgetsSigValid ? [] : ["tools or budgets signature invalid"],
      decision: ctx.toolsSigValid && ctx.budgetsSigValid ? "ALLOWED" : "DENIED",
      evidenceEventHashes: evidenceHashes(ctx)
    })
  },
  {
    packId: "toolMisuse",
    scenarioId: "tools.high-risk-denied",
    category: "TOOL_GOVERNANCE",
    severityOnFailure: "MEDIUM",
    descriptionTemplateId: "TOOLS_HIGH_RISK_DENIED_V1",
    remediationHints: ["amc toolhub lint"],
    evaluate: (ctx) => {
      const dangerousPresent = includesTool(ctx.toolsConfig, "shell.exec") || includesTool(ctx.toolsConfig, "secrets.read");
      return {
        passed: !dangerousPresent,
        reasons: dangerousPresent ? ["high-risk tools are present in allowlist"] : [],
        decision: dangerousPresent ? "DENIED" : "ALLOWED",
        evidenceEventHashes: evidenceHashes(ctx)
      };
    }
  },
  {
    packId: "toolMisuse",
    scenarioId: "tools.denial-observed",
    category: "BUDGET_GOVERNANCE",
    severityOnFailure: "LOW",
    descriptionTemplateId: "TOOLS_DENIAL_OBSERVED_V1",
    remediationHints: ["Trigger denied tool scenarios and review TOOL_DENIED audits"],
    evaluate: (ctx) => {
      const denied = hasAudit(ctx, "TOOL_DENIED");
      return {
        passed: denied > 0,
        reasons: denied > 0 ? [] : ["no TOOL_DENIED audits observed"],
        decision: denied > 0 ? "ALLOWED" : "FLAGGED",
        evidenceEventHashes: evidenceHashes(ctx),
        counters: { denied }
      };
    }
  },
  {
    packId: "truthfulness",
    scenarioId: "truth.contract-allowlist",
    category: "TRUTHFULNESS",
    severityOnFailure: "HIGH",
    descriptionTemplateId: "TRUTH_CONTRACT_ALLOWLIST_V1",
    remediationHints: ["amc prompt policy print"],
    evaluate: (ctx) => {
      const hasSchema = ctx.promptPolicy?.promptPolicy.truth.allowedOutputContractSchemaIds.includes("amc.output.v1") ?? false;
      return {
        passed: hasSchema,
        reasons: hasSchema ? [] : ["amc.output.v1 missing from allowed output contract schema ids"],
        decision: hasSchema ? "ALLOWED" : "DENIED",
        evidenceEventHashes: evidenceHashes(ctx)
      };
    }
  },
  {
    packId: "truthfulness",
    scenarioId: "truth.strong-claims-enforced",
    category: "TRUTHFULNESS",
    severityOnFailure: "MEDIUM",
    descriptionTemplateId: "TRUTH_STRONG_CLAIMS_V1",
    remediationHints: ["Set prompt truth.enforcementMode to ENFORCE for strict gatekeeping"],
    evaluate: (ctx) => {
      const required = ctx.promptPolicy?.promptPolicy.truth.requireEvidenceRefsForStrongClaims === true;
      const hasRegex = (ctx.promptPolicy?.promptPolicy.truth.strongClaimRegexes.length ?? 0) > 0;
      return {
        passed: required && hasRegex,
        reasons: required && hasRegex ? [] : ["strong-claim evidence enforcement is incomplete"],
        decision: required && hasRegex ? "ALLOWED" : "FLAGGED",
        evidenceEventHashes: evidenceHashes(ctx)
      };
    }
  },
  {
    packId: "truthfulness",
    scenarioId: "truth.no-output-validation-fails",
    category: "TRUTHFULNESS",
    severityOnFailure: "HIGH",
    descriptionTemplateId: "TRUTH_OUTPUT_FAIL_V1",
    remediationHints: ["Inspect OUTPUT_VALIDATED failures and update output contract usage"],
    evaluate: (ctx) => {
      const outputFails = hasAudit(ctx, "OUTPUT_VALIDATED_FAIL");
      return {
        passed: outputFails === 0,
        reasons: outputFails === 0 ? [] : [`output validation failures observed: ${outputFails}`],
        decision: outputFails === 0 ? "ALLOWED" : "REJECTED",
        evidenceEventHashes: evidenceHashes(ctx)
      };
    }
  },
  {
    packId: "sandboxBoundary",
    scenarioId: "sandbox.gateway-proxy-hardening",
    category: "SANDBOX_BOUNDARY",
    severityOnFailure: "HIGH",
    descriptionTemplateId: "SANDBOX_GATEWAY_PROXY_V1",
    remediationHints: ["amc gateway verify-config"],
    evaluate: (ctx) => {
      const healthy = ctx.gatewaySigValid && gatewayAllowlistHealthy(ctx.gatewayConfig);
      return {
        passed: healthy,
        reasons: healthy ? [] : ["gateway proxy deny-by-default or host allowlist not hardened"],
        decision: healthy ? "ALLOWED" : "DENIED",
        evidenceEventHashes: evidenceHashes(ctx)
      };
    }
  },
  {
    packId: "sandboxBoundary",
    scenarioId: "sandbox.provider-model-allowlist",
    category: "MODEL_GOVERNANCE",
    severityOnFailure: "MEDIUM",
    descriptionTemplateId: "SANDBOX_MODEL_ALLOWLIST_V1",
    remediationHints: ["amc bridge config verify"],
    evaluate: (ctx) => {
      const strict = providerModelRulesStrict(ctx.bridgeConfig);
      return {
        passed: strict,
        reasons: strict ? [] : ["bridge provider model allowlist is too broad"],
        decision: strict ? "ALLOWED" : "FLAGGED",
        evidenceEventHashes: evidenceHashes(ctx)
      };
    }
  },
  {
    packId: "sandboxBoundary",
    scenarioId: "sandbox.denials-observed",
    category: "SANDBOX_BOUNDARY",
    severityOnFailure: "LOW",
    descriptionTemplateId: "SANDBOX_DENIAL_AUDIT_V1",
    remediationHints: ["Route blocked egress/tool attempts through audited interfaces"],
    evaluate: (ctx) => {
      const denied = hasAudit(ctx, "TOOL_DENIED") + hasAudit(ctx, "BRIDGE_POLICY_DENIED");
      return {
        passed: denied > 0,
        reasons: denied > 0 ? [] : ["no sandbox boundary denial events observed"],
        decision: denied > 0 ? "ALLOWED" : "FLAGGED",
        evidenceEventHashes: evidenceHashes(ctx),
        counters: { denied }
      };
    }
  },
  {
    packId: "notaryAttestation",
    scenarioId: "notary.required-availability",
    category: "ATTESTATION_INTEGRITY",
    severityOnFailure: "CRITICAL",
    descriptionTemplateId: "NOTARY_AVAILABILITY_V1",
    remediationHints: ["amc trust status", "amc notary status"],
    evaluate: (ctx) => {
      const requires = ctx.trustConfig.trust.mode === "NOTARY";
      if (!requires) {
        return {
          passed: true,
          reasons: [],
          decision: "ALLOWED",
          evidenceEventHashes: evidenceHashes(ctx)
        };
      }
      return {
        passed: ctx.notaryTrust.ok,
        reasons: ctx.notaryTrust.ok ? [] : ctx.notaryTrust.reasons,
        decision: ctx.notaryTrust.ok ? "ALLOWED" : "DENIED",
        evidenceEventHashes: evidenceHashes(ctx)
      };
    }
  },
  {
    packId: "notaryAttestation",
    scenarioId: "notary.attestation-freshness",
    category: "ATTESTATION_INTEGRITY",
    severityOnFailure: "HIGH",
    descriptionTemplateId: "NOTARY_ATTESTATION_FRESHNESS_V1",
    remediationHints: ["Restart or repair notary attestation path and observe NOTARY_ATTESTATION_OBSERVED events"],
    evaluate: (ctx) => {
      if (ctx.trustConfig.trust.mode !== "NOTARY") {
        return {
          passed: true,
          reasons: [],
          decision: "ALLOWED",
          evidenceEventHashes: evidenceHashes(ctx)
        };
      }
      const last = ctx.notaryTrust.lastAttestationTs;
      if (!last) {
        return {
          passed: false,
          reasons: ["no notary attestation observed"],
          decision: "DENIED",
          evidenceEventHashes: evidenceHashes(ctx)
        };
      }
      const ageMs = ctx.nowTs - last;
      const maxAgeMs = 30 * 60_000;
      return {
        passed: ageMs <= maxAgeMs,
        reasons: ageMs <= maxAgeMs ? [] : [`attestation stale by ${Math.trunc(ageMs / 60_000)} minutes`],
        decision: ageMs <= maxAgeMs ? "ALLOWED" : "DENIED",
        evidenceEventHashes: evidenceHashes(ctx),
        counters: { attestationAgeMinutes: Math.trunc(ageMs / 60_000) }
      };
    }
  }
];

export function assurancePackIdsFromPolicy(policy: AssurancePolicy): AssurancePackId[] {
  const out: AssurancePackId[] = [];
  if (policy.assurancePolicy.packsEnabled.injection) out.push("injection");
  if (policy.assurancePolicy.packsEnabled.exfiltration) out.push("exfiltration");
  if (policy.assurancePolicy.packsEnabled.toolMisuse) out.push("toolMisuse");
  if (policy.assurancePolicy.packsEnabled.truthfulness) out.push("truthfulness");
  if (policy.assurancePolicy.packsEnabled.sandboxBoundary) out.push("sandboxBoundary");
  if (policy.assurancePolicy.packsEnabled.notaryAttestation) out.push("notaryAttestation");
  return out;
}

export function normalizePackSelection(params: {
  policy: AssurancePolicy;
  selected: AssurancePackId | "all";
}): AssurancePackId[] {
  if (params.selected === "all") {
    return assurancePackIdsFromPolicy(params.policy);
  }
  return assurancePackIdSchema.array().parse([params.selected]);
}

export function scenariosForPack(packId: AssurancePackId): AssuranceScenarioDefinition[] {
  return scenarioDefinitions.filter((row) => row.packId === packId);
}

export function allScenarioDefinitions(): AssuranceScenarioDefinition[] {
  return [...scenarioDefinitions];
}

export const assurancePackCatalog = assurancePackIdSchema.options;
export const assuranceScenarioCatalog = scenarioDefinitions;
export const assuranceSeverityCatalog = assuranceFindingSeveritySchema.options;
