import type { ActionClass, RiskTier } from "../types.js";
import { ACTION_CLASSES } from "../governor/actionCatalog.js";

export function parseActionClasses(input: string[]): ActionClass[] {
  if (input.length === 0) {
    return ["READ_ONLY"];
  }
  const normalized = input.map((item) => item.trim().toUpperCase());
  const unknown = normalized.filter((item) => !ACTION_CLASSES.includes(item as ActionClass));
  if (unknown.length > 0) {
    throw new Error(`Unknown action class(es): ${unknown.join(", ")}`);
  }
  return normalized as ActionClass[];
}

export function parseRiskTier(value: string): RiskTier {
  const normalized = value.trim().toLowerCase();
  if (normalized === "low" || normalized === "med" || normalized === "high" || normalized === "critical") {
    return normalized;
  }
  throw new Error(`Unsupported risk tier: ${value}`);
}
