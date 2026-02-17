import { z } from "zod";
import { isWorkspaceId } from "./workspaceId.js";

export const workspaceRecordSchema = z.object({
  workspaceId: z.string().refine((value) => isWorkspaceId(value), "invalid workspace id"),
  name: z.string().min(1),
  createdTs: z.number().int(),
  updatedTs: z.number().int(),
  status: z.enum(["ACTIVE", "SUSPENDED", "DELETED"])
});

export type WorkspaceRecord = z.infer<typeof workspaceRecordSchema>;

