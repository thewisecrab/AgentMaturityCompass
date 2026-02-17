import { z } from "zod";
import { isWorkspaceId } from "./workspaceId.js";

export const hostUserRoleSchema = z.enum(["OWNER", "OPERATOR", "AUDITOR", "VIEWER"]);
export type HostUserRole = z.infer<typeof hostUserRoleSchema>;

export const hostUserSchema = z.object({
  userId: z.string().uuid(),
  username: z.string().min(1),
  createdTs: z.number().int(),
  disabled: z.boolean(),
  isHostAdmin: z.boolean()
});
export type HostUser = z.infer<typeof hostUserSchema>;

export const hostWorkspaceSchema = z.object({
  workspaceId: z.string().refine((value) => isWorkspaceId(value), "invalid workspace id"),
  name: z.string().min(1),
  createdTs: z.number().int(),
  updatedTs: z.number().int(),
  status: z.enum(["ACTIVE", "SUSPENDED", "DELETED"])
});
export type HostWorkspace = z.infer<typeof hostWorkspaceSchema>;

export const hostMembershipSchema = z.object({
  userId: z.string().uuid(),
  workspaceId: z.string().refine((value) => isWorkspaceId(value), "invalid workspace id"),
  roles: z.array(hostUserRoleSchema).min(1),
  createdTs: z.number().int()
});
export type HostMembership = z.infer<typeof hostMembershipSchema>;

