export const CONTROL_REASON_TEMPLATES: Record<string, string> = {
  CHECK_PASS: "All required deterministic checks passed for this control.",
  CHECK_FAIL: "One or more deterministic checks failed for this control.",
  CHECK_INSUFFICIENT: "Evidence is currently insufficient to support a strong claim for this control.",
  GATE_FAIL_INTEGRITY: "Integrity gate not met for strong claim.",
  GATE_FAIL_CORRELATION: "Correlation gate not met for strong claim."
};

export function reasonTemplate(id: keyof typeof CONTROL_REASON_TEMPLATES): string {
  return CONTROL_REASON_TEMPLATES[id] ?? id;
}
