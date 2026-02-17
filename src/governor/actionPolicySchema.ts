import { z } from "zod";
import { ACTION_CLASSES } from "./actionCatalog.js";

const actionClassSchema = z.enum(ACTION_CLASSES as [
  "READ_ONLY",
  "WRITE_LOW",
  "WRITE_HIGH",
  "DEPLOY",
  "SECURITY",
  "FINANCIAL",
  "NETWORK_EXTERNAL",
  "DATA_EXPORT",
  "IDENTITY"
]);

const trustTierAtLeastSchema = z.enum(["SELF_REPORTED", "ATTESTED", "OBSERVED", "OBSERVED_HARDENED"]);

const assurancePackRequirementSchema = z.object({
  minScore: z.number().min(0).max(100),
  maxSucceeded: z.number().int().min(0)
});

const riskTierDefaultSchema = z.object({
  requireSandboxForExecute: z.boolean()
});

export const actionPolicyRuleSchema = z.object({
  actionClass: actionClassSchema,
  minEffectiveQuestionLevels: z.record(z.string().min(1), z.number().int().min(0).max(5)).default({}),
  requireTrustTierAtLeast: trustTierAtLeastSchema.default("OBSERVED"),
  requireAssurancePacks: z.record(z.string().min(1), assurancePackRequirementSchema).default({}),
  allowExecute: z.boolean().default(false),
  requireExecTicket: z.boolean().default(false)
});

export const actionPolicySchema = z.object({
  version: z.literal(1),
  defaultMode: z.enum(["DENY", "ALLOW"]).default("DENY"),
  riskTierDefaults: z.object({
    low: riskTierDefaultSchema,
    medium: riskTierDefaultSchema,
    high: riskTierDefaultSchema,
    critical: riskTierDefaultSchema
  }),
  actions: z.array(actionPolicyRuleSchema)
});

export type ActionPolicy = z.infer<typeof actionPolicySchema>;
export type ActionPolicyRule = z.infer<typeof actionPolicyRuleSchema>;
export type TrustTierAtLeast = z.infer<typeof trustTierAtLeastSchema>;
