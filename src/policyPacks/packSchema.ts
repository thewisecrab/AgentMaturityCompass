import { z } from "zod";
import { questionIds } from "../diagnostic/questionBank.js";

const riskTierSchema = z.enum(["low", "medium", "high", "critical"]);

const targetMappingSchema = z.object(
  Object.fromEntries(questionIds.map((id) => [id, z.number().int().min(0).max(5)])) as Record<string, z.ZodNumber>
);

export const policyPackSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  archetypeId: z.string().min(1),
  riskTier: riskTierSchema,
  actionPolicy: z.record(z.string(), z.unknown()),
  tools: z.record(z.string(), z.unknown()),
  budgets: z.record(z.string(), z.unknown()),
  alerts: z.record(z.string(), z.unknown()),
  approvalPolicy: z.record(z.string(), z.unknown()),
  gatePolicy: z.record(z.string(), z.unknown()),
  targetAdjustments: targetMappingSchema
});

export type PolicyPack = z.infer<typeof policyPackSchema>;
