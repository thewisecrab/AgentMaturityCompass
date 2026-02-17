import { z } from "zod";

export const outcomeCategorySchema = z.enum(["Emotional", "Functional", "Economic", "Brand", "Lifetime"]);
export const outcomeMetricTypeSchema = z.enum(["ratio", "derived", "avg"]);
export const trustTierForOutcomeSchema = z.enum(["OBSERVED", "ATTESTED", "SELF_REPORTED"]);

const targetLevelSchema = z.union([z.number(), z.string(), z.boolean()]);

export const outcomeMetricSchema = z.object({
  metricId: z.string().min(1),
  category: outcomeCategorySchema,
  description: z.string().min(1),
  type: outcomeMetricTypeSchema,
  signal: z.string().min(1).optional(),
  numeratorSignal: z.string().min(1).optional(),
  denominatorSignal: z.string().min(1).optional(),
  inputs: z.array(z.string().min(1)).optional(),
  target: z.object({
    level3: targetLevelSchema,
    level4: targetLevelSchema,
    level5: targetLevelSchema
  }),
  evidenceRules: z.object({
    trustTierAtLeast: trustTierForOutcomeSchema,
    minSampleSize: z.number().int().positive().optional(),
    requiresNoAudit: z.array(z.string().min(1)).optional()
  })
});

export const outcomeContractSchema = z.object({
  outcomeContract: z.object({
    version: z.literal(1),
    agentId: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    windowDefaults: z.object({
      reportingWindowDays: z.number().int().positive(),
      minObservedRatioForClaims: z.number().min(0).max(1)
    }),
    metrics: z.array(outcomeMetricSchema).min(1)
  })
});

export type OutcomeContract = z.infer<typeof outcomeContractSchema>;
export type OutcomeMetric = z.infer<typeof outcomeMetricSchema>;
export type OutcomeCategory = z.infer<typeof outcomeCategorySchema>;
