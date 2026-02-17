import { z } from "zod";
import { ACTION_CLASSES } from "../governor/actionCatalog.js";

export const execTicketPayloadSchema = z.object({
  v: z.literal(1),
  agentId: z.string().min(1),
  workOrderId: z.string().min(1),
  workOrderSha256: z.string().length(64),
  actionClass: z.enum(ACTION_CLASSES as [
    "READ_ONLY",
    "WRITE_LOW",
    "WRITE_HIGH",
    "DEPLOY",
    "SECURITY",
    "FINANCIAL",
    "NETWORK_EXTERNAL",
    "DATA_EXPORT",
    "IDENTITY"
  ]),
  toolName: z.string().min(1).optional(),
  issuedTs: z.number().int(),
  expiresTs: z.number().int(),
  nonce: z.string().min(1)
});

export type ExecTicketPayload = z.infer<typeof execTicketPayloadSchema>;
