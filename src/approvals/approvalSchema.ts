import { z } from "zod";
import type { ActionClass, ExecutionMode } from "../types.js";

export const approvalStatusSchema = z.enum(["PENDING", "APPROVED", "DENIED", "CONSUMED", "EXPIRED"]);
export type ApprovalStatus = z.infer<typeof approvalStatusSchema>;

export const approvalDecisionSchema = z.enum(["APPROVED", "DENIED"]);
export type ApprovalDecision = z.infer<typeof approvalDecisionSchema>;

const actionClassSchema: z.ZodType<ActionClass> = z.enum([
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

const modeSchema: z.ZodType<ExecutionMode> = z.enum(["SIMULATE", "EXECUTE"]);

export const approvalSchema = z.object({
  v: z.literal(1),
  approvalId: z.string().min(1),
  agentId: z.string().min(1),
  intentId: z.string().min(1),
  toolName: z.string().min(1),
  actionClass: actionClassSchema,
  workOrderId: z.string().min(1).nullable().optional(),
  requestedMode: modeSchema,
  effectiveMode: modeSchema,
  riskTier: z.enum(["low", "medium", "high", "critical"]),
  createdTs: z.number().int(),
  expiresTs: z.number().int(),
  status: approvalStatusSchema,
  decision: approvalDecisionSchema.nullable().optional(),
  decisionTs: z.number().int().nullable().optional(),
  decisionBy: z.literal("owner").nullable().optional(),
  decisionReceiptId: z.string().min(1).nullable().optional(),
  reason: z.string().min(1).nullable().optional(),
  boundHashes: z.object({
    intentHash: z.string().length(64),
    workOrderHash: z.string().length(64).nullable().optional(),
    policyHash: z.string().length(64),
    toolsHash: z.string().length(64)
  })
});

export type ApprovalArtifact = z.infer<typeof approvalSchema>;

export const approvalConsumedSchema = z.object({
  v: z.literal(1),
  approvalId: z.string().min(1),
  agentId: z.string().min(1),
  intentId: z.string().min(1),
  consumedTs: z.number().int(),
  executionId: z.string().min(1).nullable().optional(),
  reason: z.string().min(1)
});

export type ApprovalConsumedRecord = z.infer<typeof approvalConsumedSchema>;
