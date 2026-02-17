import { z } from "zod";
import { ACTION_CLASSES } from "../governor/actionCatalog.js";

export const workOrderSchema = z.object({
  v: z.literal(1),
  workOrderId: z.string().min(1),
  agentId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  createdTs: z.number().int(),
  riskTier: z.enum(["low", "medium", "high", "critical"]),
  requestedMode: z.enum(["SIMULATE", "EXECUTE"]),
  allowedActionClasses: z.array(z.enum(ACTION_CLASSES as [
    "READ_ONLY",
    "WRITE_LOW",
    "WRITE_HIGH",
    "DEPLOY",
    "SECURITY",
    "FINANCIAL",
    "NETWORK_EXTERNAL",
    "DATA_EXPORT",
    "IDENTITY"
  ])).min(1),
  requiredAssurancePacks: z.record(z.string(), z.object({ minScore: z.number().min(0).max(100) })).default({}),
  expiresTs: z.number().int().nullable().optional(),
  artifacts: z.object({
    repoUrl: z.string().optional(),
    branch: z.string().optional(),
    ticketUrl: z.string().optional()
  }).default({})
});

export type WorkOrder = z.infer<typeof workOrderSchema>;
