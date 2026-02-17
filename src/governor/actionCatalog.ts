import type { ActionClass } from "../types.js";

export const ACTION_CLASSES: ActionClass[] = [
  "READ_ONLY",
  "WRITE_LOW",
  "WRITE_HIGH",
  "DEPLOY",
  "SECURITY",
  "FINANCIAL",
  "NETWORK_EXTERNAL",
  "DATA_EXPORT",
  "IDENTITY"
];

export const ACTION_CLASS_TITLES: Record<ActionClass, string> = {
  READ_ONLY: "Read-only operations",
  WRITE_LOW: "Low-impact reversible writes",
  WRITE_HIGH: "High-impact or hard-to-reverse writes",
  DEPLOY: "Build/deploy/release actions",
  SECURITY: "Security and credential actions",
  FINANCIAL: "Financial/billing actions",
  NETWORK_EXTERNAL: "External network actions",
  DATA_EXPORT: "Data export actions",
  IDENTITY: "Identity/account actions"
};

export function isActionClass(value: string): value is ActionClass {
  return ACTION_CLASSES.includes(value as ActionClass);
}
