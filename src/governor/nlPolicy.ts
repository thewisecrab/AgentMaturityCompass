/**
 * nlPolicy.ts — Natural Language Policy Authoring for AMC Governor
 *
 * Translates plain-English policy descriptions into AMC Governor YAML
 * using deterministic pattern matching — no LLM calls, fully auditable.
 *
 * "don't share PII with external vendors"
 *   → blocks DATA_EXPORT actions where external=true + enables PII shield
 *
 * "require approval for all financial transactions over $10,000"
 *   → step-up auth gate on FINANCIAL actions with amount > 10000
 *
 * Integrates with: governor/actionPolicyEngine.ts, governor/actionPolicySchema.ts,
 *                  shield/validators, enforce/policyFirewall.ts
 */

/* ── Types ────────────────────────────────────────────────────────── */

export interface NLPolicyInput {
  description: string;
  agentId?: string;
  examples?: string[];        // optional "for example: ..." clauses
  context?: string;           // domain context: 'healthcare' | 'finance' | 'general'
}

export interface PolicyRule {
  id: string;
  condition: string;
  action: 'ALLOW' | 'DENY' | 'STEP_UP' | 'LOG' | 'REDACT';
  actionClasses?: string[];   // AMC action classes this applies to
  parameters?: Record<string, unknown>;
  reason: string;
}

export interface ParsedPolicy {
  policyId: string;
  name: string;
  description: string;
  yaml: string;
  rules: PolicyRule[];
  shields: string[];          // AMC Shield modules to activate
  confidence: number;         // 0–1, how confident the parser is
  warnings: string[];
  matchedPatterns: string[];
}

export interface PolicyValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  ruleCount: number;
}

/* ── Policy Templates ─────────────────────────────────────────────── */

export const POLICY_TEMPLATES: Record<string, string> = {
  no_pii_external: `
# No PII to external vendors
- when: action.class == "DATA_EXPORT" AND action.external == true
  then: DENY
  reason: "PII must not leave the system to external parties"
  shields: [pii, dlp]
`.trim(),

  require_approval_financial: `
# Require approval for high-value financial actions
- when: action.class == "FINANCIAL" AND action.amount > 10000
  then: STEP_UP
  approvers: [human]
  reason: "Financial transactions over $10,000 require human approval"
`.trim(),

  no_code_execution: `
# Block arbitrary code execution
- when: action.class == "DEPLOY" OR action.class == "NETWORK_EXTERNAL"
  then: DENY
  reason: "Arbitrary code execution is not permitted"
  shields: [execGuard]
`.trim(),

  read_only_mode: `
# Read-only mode — no writes or deploys
- when: action.class IN ["WRITE_LOW","WRITE_HIGH","DEPLOY","DATA_EXPORT"]
  then: DENY
  reason: "Agent is in read-only mode"
`.trim(),

  log_all_external: `
# Log all external network calls
- when: action.class == "NETWORK_EXTERNAL"
  then: LOG
  reason: "All external calls are audited"
`.trim(),
};

/* ── Intent patterns ──────────────────────────────────────────────── */

interface IntentPattern {
  id: string;
  patterns: RegExp[];
  buildRule: (input: NLPolicyInput, match: RegExpMatchArray) => PolicyRule;
  shields?: string[];
  confidence: number;
  warnings?: string[];
}

const INTENT_PATTERNS: IntentPattern[] = [
  // PII / data protection
  {
    id: 'no_pii_external',
    patterns: [
      /don'?t?\s+(share|send|export|leak)\s+(pii|personal|private|sensitive)\s+(data|info|information)?\s*(to|with)?\s*(external|outside|third.party|vendor)/i,
      /prevent\s+(pii|personal data)\s+(leakage|leak|exposure|sharing)/i,
      /block\s+(pii|sensitive data)\s+(export|transfer|sharing)/i,
    ],
    buildRule: (_input, _match) => ({
      id: 'no_pii_export',
      condition: 'action.class == "DATA_EXPORT" AND action.external == true',
      action: 'DENY',
      actionClasses: ['DATA_EXPORT'],
      parameters: { external: true },
      reason: 'PII must not be shared with external parties',
    }),
    shields: ['pii', 'dlp'],
    confidence: 0.9,
  },

  // Financial approval threshold
  {
    id: 'financial_approval',
    patterns: [
      /require\s+(approval|authorization|auth).{0,40}(over|above|exceeding|greater\s+than)\s*[$]?(\d{1,3}(?:,\d{3})*|\d+)/i,
      /human\s+(approval|review).{0,40}(over|above|exceeding)\s*[$]?(\d{1,3}(?:,\d{3})*|\d+)/i,
      /(financial|transaction|payment).{0,30}(approval|authorize).{0,30}[$](\d{1,3}(?:,\d{3})*|\d+)/i,
      /approval.{0,50}[$](\d{1,3}(?:,\d{3})*|\d+)/i,
    ],
    buildRule: (_input, match) => {
      // Find the first group that looks like a full number (with optional commas)
      const amountStr = [...(match as RegExpMatchArray)].reverse().find(g => g && /^\d{1,3}(?:,\d{3})*$|^\d+$/.test(g)) ?? '1000';
      const cleanAmount = amountStr.replace(/,/g, '');
      const amount = parseInt(cleanAmount, 10) || 1000;
      return {
        id: 'financial_step_up',
        condition: `action.class == "FINANCIAL" AND action.amount > ${amount}`,
        action: 'STEP_UP',
        actionClasses: ['FINANCIAL'],
        parameters: { threshold: amount, approvers: ['human'] },
        reason: `Financial transactions over $${amount.toLocaleString()} require human approval`,
      };
    },
    shields: [],
    confidence: 0.85,
    warnings: ['Ensure action.amount is populated in your action metadata'],
  },

  // Read-only / no writes
  {
    id: 'read_only',
    patterns: [
      /read.only\s+mode/i,
      /no\s+(write|writes|writing|modification|deploy|deployment)/i,
      /block\s+(all\s+)?(write|writes|deploy|deployment|modification)/i,
      /prevent\s+(any\s+)?(modification|change|write|deploy)/i,
    ],
    buildRule: (_input, _match) => ({
      id: 'read_only_mode',
      condition: 'action.class IN ["WRITE_LOW","WRITE_HIGH","DEPLOY","DATA_EXPORT","IDENTITY"]',
      action: 'DENY',
      actionClasses: ['WRITE_LOW', 'WRITE_HIGH', 'DEPLOY', 'DATA_EXPORT', 'IDENTITY'],
      reason: 'Agent restricted to read-only operations',
    }),
    shields: ['execGuard'],
    confidence: 0.92,
  },

  // No external network
  {
    id: 'no_external_network',
    patterns: [
      /no\s+(external|outbound|outside)\s+(network|internet|api|call|request)/i,
      /block\s+(all\s+)?(external|outbound)\s+(network|internet|traffic|calls?)/i,
      /prevent\s+(external|internet)\s+(access|communication|calls?)/i,
      /block\s+all\s+external/i,
    ],
    buildRule: (_input, _match) => ({
      id: 'no_external_network',
      condition: 'action.class == "NETWORK_EXTERNAL"',
      action: 'DENY',
      actionClasses: ['NETWORK_EXTERNAL'],
      reason: 'External network access is not permitted',
    }),
    shields: ['egressProxy'],
    confidence: 0.90,
  },

  // Require approval for deploys
  {
    id: 'deploy_approval',
    patterns: [
      /require\s+(approval|human|review)\s+(for|before)\s+(deploy|deployment|release)/i,
      /no\s+(autonomous|auto|automatic)\s+(deploy|deployment|release)/i,
      /human\s+(in the loop|approval|review)\s+(for|before|on)\s+(deploy|release)/i,
    ],
    buildRule: (_input, _match) => ({
      id: 'deploy_step_up',
      condition: 'action.class == "DEPLOY"',
      action: 'STEP_UP',
      actionClasses: ['DEPLOY'],
      parameters: { approvers: ['human'], quorum: 1 },
      reason: 'All deployments require human approval',
    }),
    shields: [],
    confidence: 0.88,
  },

  // Log everything
  {
    id: 'log_all',
    patterns: [
      /log\s+(all|every|each)\s+(action|request|call|event|operation)/i,
      /audit\s+(all|every|each)\s+(action|request|operation)/i,
      /full\s+(audit|logging|log)\s+(trail|mode)/i,
    ],
    buildRule: (_input, _match) => ({
      id: 'log_all_actions',
      condition: 'true',
      action: 'LOG',
      reason: 'All actions are logged for audit trail',
    }),
    shields: [],
    confidence: 0.85,
  },

  // Redact secrets
  {
    id: 'redact_secrets',
    patterns: [
      /redact\s+(secrets?|passwords?|api.keys?|credentials?|tokens?)/i,
      /hide\s+(secrets?|passwords?|credentials?)\s+(from|before)\s+(llm|model|output)/i,
      /don'?t?\s+(expose|reveal|leak)\s+(secrets?|api.keys?|credentials?)/i,
    ],
    buildRule: (_input, _match) => ({
      id: 'redact_secrets',
      condition: 'action.hasSecretContent == true',
      action: 'REDACT',
      reason: 'Secrets and credentials must be redacted before LLM processing',
    }),
    shields: ['secretBlind', 'dlp'],
    confidence: 0.87,
  },

  // No code execution
  {
    id: 'no_code_exec',
    patterns: [
      /no\s+(arbitrary\s+)?(code\s+execution|exec|shell|command)/i,
      /block\s+(shell|code|exec|command)\s+(execution|commands?|access)/i,
      /prevent\s+(arbitrary\s+)?code\s+(execution|running|eval)/i,
    ],
    buildRule: (_input, _match) => ({
      id: 'no_code_exec',
      condition: 'action.class == "DEPLOY" AND action.type == "exec"',
      action: 'DENY',
      actionClasses: ['DEPLOY'],
      reason: 'Arbitrary code execution is blocked',
    }),
    shields: ['execGuard', 'behavioralSandbox'],
    confidence: 0.91,
  },
];

/* ── YAML builder ─────────────────────────────────────────────────── */

function buildYAML(rules: PolicyRule[], shields: string[], input: NLPolicyInput): string {
  const lines: string[] = [
    `# AMC Governor Policy`,
    `# Generated from: "${input.description}"`,
    `# Agent: ${input.agentId ?? '*'}`,
    ``,
    `agent: ${input.agentId ?? '*'}`,
    `version: 1`,
    `rules:`,
  ];

  for (const rule of rules) {
    lines.push(`  - id: ${rule.id}`);
    lines.push(`    condition: "${rule.condition}"`);
    lines.push(`    action: ${rule.action}`);
    if (rule.actionClasses?.length) {
      lines.push(`    actionClasses: [${rule.actionClasses.map(c => `"${c}"`).join(', ')}]`);
    }
    if (rule.parameters && Object.keys(rule.parameters).length > 0) {
      lines.push(`    parameters:`);
      for (const [k, v] of Object.entries(rule.parameters)) {
        lines.push(`      ${k}: ${JSON.stringify(v)}`);
      }
    }
    lines.push(`    reason: "${rule.reason}"`);
  }

  if (shields.length > 0) {
    lines.push(``);
    lines.push(`shields:`);
    for (const shield of shields) {
      lines.push(`  - ${shield}`);
    }
  }

  return lines.join('\n');
}

/* ── Parser ───────────────────────────────────────────────────────── */

import { randomUUID } from 'node:crypto';

export function parseNLPolicy(input: NLPolicyInput): ParsedPolicy {
  const rules: PolicyRule[] = [];
  const shields: Set<string> = new Set();
  const warnings: string[] = [];
  const matchedPatterns: string[] = [];
  let totalConfidence = 0;
  let matchCount = 0;

  const text = [input.description, ...(input.examples ?? [])].join(' ');

  for (const intent of INTENT_PATTERNS) {
    for (const pattern of intent.patterns) {
      const match = text.match(pattern);
      if (match) {
        const rule = intent.buildRule(input, match);
        // Avoid duplicate rules
        if (!rules.some(r => r.id === rule.id)) {
          rules.push(rule);
          matchedPatterns.push(intent.id);
          totalConfidence += intent.confidence;
          matchCount++;
          if (intent.shields) {
            for (const s of intent.shields) shields.add(s);
          }
          if (intent.warnings) {
            warnings.push(...intent.warnings);
          }
        }
        break; // only match once per intent
      }
    }
  }

  // Warn if no patterns matched
  if (rules.length === 0) {
    warnings.push('No recognized policy patterns found. Review the generated YAML manually.');
    warnings.push('Try rephrasing using keywords: block, deny, require, prevent, log, redact');
    // Add a default LOG rule as a safe fallback
    rules.push({
      id: 'default_log',
      condition: 'true',
      action: 'LOG',
      reason: `Policy intent: "${input.description}" — logging all actions as safe default`,
    });
    totalConfidence = 0.3;
    matchCount = 1;
  }

  const confidence = matchCount > 0 ? totalConfidence / matchCount : 0;
  const shieldList = [...shields];
  const yaml = buildYAML(rules, shieldList, input);
  const name = input.description.length > 50
    ? input.description.substring(0, 47) + '...'
    : input.description;

  return {
    policyId: `nlpolicy_${randomUUID().substring(0, 8)}`,
    name,
    description: input.description,
    yaml,
    rules,
    shields: shieldList,
    confidence,
    warnings,
    matchedPatterns,
  };
}

export function validateParsedPolicy(policy: ParsedPolicy): PolicyValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [...policy.warnings];

  if (policy.rules.length === 0) {
    errors.push('Policy has no rules');
  }

  if (policy.confidence < 0.5) {
    warnings.push(`Low confidence (${(policy.confidence * 100).toFixed(0)}%) — manual review recommended`);
  }

  for (const rule of policy.rules) {
    if (!rule.condition) errors.push(`Rule ${rule.id} has no condition`);
    if (!rule.action) errors.push(`Rule ${rule.id} has no action`);
    if (!rule.reason) warnings.push(`Rule ${rule.id} has no reason specified`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    ruleCount: policy.rules.length,
  };
}
