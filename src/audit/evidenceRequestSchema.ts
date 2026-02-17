import { z } from "zod";

export const evidenceRequestItemSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("ARTIFACT_HASH"),
    id: z.string().min(1),
    sha256: z.string().length(64)
  }),
  z.object({
    kind: z.literal("PROOF"),
    id: z.string().min(1)
  }),
  z.object({
    kind: z.literal("CONTROL"),
    controlId: z.string().min(1)
  })
]);

export const evidenceRequestSchema = z.object({
  v: z.literal(1),
  requestId: z.string().min(1),
  createdTs: z.number().int(),
  scope: z.object({
    type: z.enum(["WORKSPACE", "NODE", "AGENT"]),
    id: z.string().min(1)
  }),
  requestedItems: z.array(evidenceRequestItemSchema).min(1),
  status: z.enum(["OPEN", "APPROVED", "REJECTED", "FULFILLED"]),
  requesterUserIdHash: z.string().min(8),
  approvals: z
    .array(
      z.object({
        approvalEventHash: z.string().length(64),
        userIdHash: z.string().min(8),
        role: z.enum(["OWNER", "AUDITOR", "APPROVER", "OPERATOR", "VIEWER"])
      })
    )
    .optional(),
  fulfillment: z
    .object({
      binderSha256: z.string().length(64),
      exportedAtTs: z.number().int()
    })
    .optional()
});

export type EvidenceRequest = z.infer<typeof evidenceRequestSchema>;
