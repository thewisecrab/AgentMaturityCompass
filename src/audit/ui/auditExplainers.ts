export const AUDIT_EXPLAINERS = {
  singleSource: "Audit Binder is an engineering evidence crosswalk. It is not legal advice.",
  privacy: "Binder exports are allowlist-only and include hashes, signatures, and categorical summaries instead of raw prompts, logs, or secrets.",
  recurrence: "Binder cache refresh follows continuous recurrence so readiness and control status stay current over time.",
  honesty: "When evidence gates are not met, controls and sections are marked INSUFFICIENT_EVIDENCE instead of overstating compliance."
} as const;
