import type { ExecutionMode } from "../types.js";
import type { ApprovalStatus } from "./approvalSchema.js";

export function parseApprovalStatus(value?: string): ApprovalStatus | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = value.trim().toUpperCase();
  if (normalized === "PENDING" || normalized === "APPROVED" || normalized === "DENIED" || normalized === "CONSUMED" || normalized === "EXPIRED") {
    return normalized;
  }
  throw new Error(`Invalid approval status: ${value}`);
}

export function parseApprovalMode(value: string): ExecutionMode {
  const normalized = value.trim().toUpperCase();
  if (normalized === "SIMULATE" || normalized === "EXECUTE") {
    return normalized;
  }
  throw new Error(`Invalid approval mode: ${value}`);
}

