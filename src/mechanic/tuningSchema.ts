import { z } from "zod";
import { mechanicScopeSchema } from "./targetSchema.js";

const approvalRequirementSchema = z.enum(["HIGH_RISK_TOOLS", "DATA_EXPORT", "PLUGIN_INSTALL", "POLICY_CHANGE"]);

export const mechanicTuningSchema = z.object({
  mechanicTuning: z.object({
    version: z.literal(1),
    scope: mechanicScopeSchema,
    knobs: z.object({
      maxTokensPerRun: z.number().int().positive(),
      maxCostPerDayUsd: z.number().positive(),
      maxToolCallsPerRun: z.number().int().nonnegative(),
      maxNetworkCallsPerRun: z.number().int().nonnegative(),
      requireApprovalFor: z.array(approvalRequirementSchema).default(["HIGH_RISK_TOOLS", "DATA_EXPORT", "PLUGIN_INSTALL", "POLICY_CHANGE"]),
      approvalQuorum: z.object({
        owners: z.number().int().min(0),
        auditors: z.number().int().min(0)
      }),
      allowedProviders: z.array(z.enum(["openai", "anthropic", "google", "xai", "openrouter", "local"])).min(1),
      allowedModelPatterns: z.array(z.string().min(1)).min(1),
      allowedTools: z.array(z.string().min(1)).default([]),
      deniedTools: z.array(z.string().min(1)).default([]),
      requireTruthguardForFinalOutputs: z.boolean().default(true),
      minObservedEvidenceShareForScoreIncrease: z.number().min(0).max(1).default(0.6),
      forbidSelfReportScoreIncrease: z.boolean().default(true),
      diagnosticCadenceHours: z.number().int().min(1).max(24 * 30).default(24),
      forecastCadenceHours: z.number().int().min(1).max(24 * 30).default(24),
      benchCadenceDays: z.number().int().min(1).max(3650).default(30)
    }),
    updatedTs: z.number().int().nonnegative()
  })
});

export type MechanicTuning = z.infer<typeof mechanicTuningSchema>;
