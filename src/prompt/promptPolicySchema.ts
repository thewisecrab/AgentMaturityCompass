import { z } from "zod";

export const promptEnforcementModeSchema = z.enum(["OFF", "ENFORCE"]);
export const promptTruthEnforcementModeSchema = z.enum(["WARN", "ENFORCE"]);
export const promptTemplateAgentTypeSchema = z.enum([
  "code-agent",
  "support-agent",
  "ops-agent",
  "research-agent",
  "sales-agent",
  "other"
]);

export const promptPolicySchema = z.object({
  promptPolicy: z.object({
    version: z.literal(1),
    enforcement: z.object({
      mode: promptEnforcementModeSchema.default("ENFORCE"),
      stripUserSystemMessages: z.boolean().default(true),
      rejectIfUserTriesToOverride: z.boolean().default(true),
      overridePatterns: z.array(z.string().min(1)).min(1),
      maxClockSkewSeconds: z.number().int().min(10).max(3600).default(120),
      requirePackSignatureValid: z.boolean().default(true),
      failClosedOnLintFail: z.boolean().default(true),
      requireNotarySigner: z.boolean().default(false)
    }),
    templates: z.object({
      defaultTemplate: z.string().min(1),
      byAgentType: z.object({
        "code-agent": z.string().min(1),
        "support-agent": z.string().min(1),
        "ops-agent": z.string().min(1),
        "research-agent": z.string().min(1),
        "sales-agent": z.string().min(1),
        other: z.string().min(1)
      }),
      providerOverrides: z.object({
        openai: z.string().min(1),
        anthropic: z.string().min(1),
        gemini: z.string().min(1),
        xai: z.string().min(1),
        openrouter: z.string().min(1)
      })
    }),
    truth: z.object({
      requireTruthguardForBridgeResponses: z.boolean().default(true),
      enforcementMode: promptTruthEnforcementModeSchema.default("WARN"),
      requireEvidenceRefsForStrongClaims: z.boolean().default(true),
      strongClaimRegexes: z.array(z.string().min(1)).min(1),
      allowedOutputContractSchemaIds: z.array(z.string().min(1)).min(1),
      structuredOutput: z.object({
        prefer: z.boolean().default(true),
        openaiResponseFormatJson: z.boolean().default(true)
      })
    }),
    recurrence: z.object({
      refreshCadenceHours: z.number().int().min(1).max(168).default(24),
      refreshOnEvents: z.array(
        z.enum([
          "CGX_PACK_UPDATED",
          "MECHANIC_TARGETS_UPDATED",
          "POLICY_APPLIED",
          "PLUGIN_INSTALLED",
          "TRANSFORM_PLAN_CREATED",
          "ADVISORY_CREATED"
        ])
      )
    }),
    privacy: z.object({
      includeNumericTargetsInPrompt: z.boolean().default(false),
      includeMaturityScoreInPrompt: z.boolean().default(false),
      includeOnlyTopTasksCount: z.number().int().min(1).max(10).default(3),
      allowIncludeToolNames: z.boolean().default(true),
      allowIncludeModelNames: z.boolean().default(true),
      redactAllFilePaths: z.boolean().default(true),
      redactAllEmails: z.boolean().default(true)
    })
  })
});

export const promptSchedulerStateSchema = z.object({
  v: z.literal(1),
  enabled: z.boolean(),
  lastRefreshTs: z.number().int().nullable(),
  nextRefreshTs: z.number().int().nullable(),
  lastOutcome: z.object({
    status: z.enum(["OK", "ERROR"]),
    reason: z.string()
  })
});

export type PromptPolicy = z.infer<typeof promptPolicySchema>;
export type PromptTemplateAgentType = z.infer<typeof promptTemplateAgentTypeSchema>;
export type PromptSchedulerState = z.infer<typeof promptSchedulerStateSchema>;

export function defaultPromptPolicy(): PromptPolicy {
  return promptPolicySchema.parse({
    promptPolicy: {
      version: 1,
      enforcement: {
        mode: "ENFORCE",
        stripUserSystemMessages: true,
        rejectIfUserTriesToOverride: true,
        overridePatterns: [
          "ignore previous",
          "disregard system",
          "developer message says",
          "reveal hidden prompt",
          "bypass policy",
          "jailbreak"
        ],
        maxClockSkewSeconds: 120,
        requirePackSignatureValid: true,
        failClosedOnLintFail: true,
        requireNotarySigner: false
      },
      templates: {
        defaultTemplate: "generic_northstar_v1",
        byAgentType: {
          "code-agent": "code_northstar_v1",
          "support-agent": "support_northstar_v1",
          "ops-agent": "ops_northstar_v1",
          "research-agent": "research_northstar_v1",
          "sales-agent": "sales_northstar_v1",
          other: "generic_northstar_v1"
        },
        providerOverrides: {
          openai: "openai_northstar_v1",
          anthropic: "anthropic_northstar_v1",
          gemini: "gemini_northstar_v1",
          xai: "xai_northstar_v1",
          openrouter: "openrouter_northstar_v1"
        }
      },
      truth: {
        requireTruthguardForBridgeResponses: true,
        enforcementMode: "WARN",
        requireEvidenceRefsForStrongClaims: true,
        strongClaimRegexes: [
          "\\bI (did|completed|executed|deployed|ran)\\b",
          "\\bVerified\\b",
          "\\bGuaranteed\\b"
        ],
        allowedOutputContractSchemaIds: ["amc.output.v1"],
        structuredOutput: {
          prefer: true,
          openaiResponseFormatJson: true
        }
      },
      recurrence: {
        refreshCadenceHours: 24,
        refreshOnEvents: [
          "CGX_PACK_UPDATED",
          "MECHANIC_TARGETS_UPDATED",
          "POLICY_APPLIED",
          "PLUGIN_INSTALLED",
          "TRANSFORM_PLAN_CREATED",
          "ADVISORY_CREATED"
        ]
      },
      privacy: {
        includeNumericTargetsInPrompt: false,
        includeMaturityScoreInPrompt: false,
        includeOnlyTopTasksCount: 3,
        allowIncludeToolNames: true,
        allowIncludeModelNames: true,
        redactAllFilePaths: true,
        redactAllEmails: true
      }
    }
  });
}

export function defaultPromptSchedulerState(): PromptSchedulerState {
  return promptSchedulerStateSchema.parse({
    v: 1,
    enabled: true,
    lastRefreshTs: null,
    nextRefreshTs: null,
    lastOutcome: {
      status: "OK",
      reason: ""
    }
  });
}
