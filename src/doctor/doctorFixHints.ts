import type { DoctorCheck } from "./doctorRules.js";

export function doctorFixHint(check: DoctorCheck): string | null {
  return check.fixHint ?? null;
}

