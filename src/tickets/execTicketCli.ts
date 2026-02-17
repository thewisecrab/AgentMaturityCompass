import type { ActionClass } from "../types.js";

export function parseTtlToMs(input: string): number {
  const raw = input.trim().toLowerCase();
  const match = raw.match(/^(\d+)(ms|s|m|h|d)?$/);
  if (!match) {
    throw new Error(`Invalid TTL value: ${input}`);
  }
  const value = Number(match[1]);
  const unit = match[2] ?? "m";
  if (unit === "ms") {
    return value;
  }
  if (unit === "s") {
    return value * 1000;
  }
  if (unit === "m") {
    return value * 60_000;
  }
  if (unit === "h") {
    return value * 3_600_000;
  }
  return value * 86_400_000;
}

export function normalizeActionClass(input: string): ActionClass {
  const value = input.trim().toUpperCase();
  const valid: ActionClass[] = [
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
  if (!valid.includes(value as ActionClass)) {
    throw new Error(`Invalid action class: ${input}`);
  }
  return value as ActionClass;
}
