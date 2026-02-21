/**
 * Behavioral Contract Maturity
 * Scores whether an agent has explicit behavioral contracts (permitted/forbidden actions,
 * escalation triggers, value declarations) and runtime integrity monitoring.
 * Source: HN community (AAP/AIP protocols, 2026), mnemom.ai pattern
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";

export interface BehavioralContractResult {
  score: number; // 0-100
  level: number; // 0-5
  hasAlignmentCard: boolean;
  hasPermittedActions: boolean;
  hasForbiddenActions: boolean;
  hasEscalationTriggers: boolean;
  hasValueDeclarations: boolean;
  hasRuntimeIntegrityCheck: boolean;
  hasDriftProfile: boolean;
  gaps: string[];
  recommendations: string[];
}

export function scoreBehavioralContractMaturity(cwd?: string): BehavioralContractResult {
  const root = cwd ?? process.cwd();
  const gaps: string[] = [];
  const recommendations: string[] = [];

  let hasAlignmentCard = false;
  let hasPermittedActions = false;
  let hasForbiddenActions = false;
  let hasEscalationTriggers = false;
  let hasValueDeclarations = false;
  let hasRuntimeIntegrityCheck = false;
  let hasDriftProfile = false;

  // Check filesystem for contract artifacts
  const contractPaths = [
    ".amc/alignment_card.json",
    ".amc/behavioral_contract.json",
    "CAPABILITY_MANIFEST.md",
    "ACTION_POLICY.md",
  ];
  for (const f of contractPaths) {
    if (existsSync(join(root, f))) {
      hasAlignmentCard = true;
    }
  }

  // Parse alignment card if present
  const cardPath = join(root, ".amc/alignment_card.json");
  if (existsSync(cardPath)) {
    try {
      const card = JSON.parse(readFileSync(cardPath, "utf8"));
      if (Array.isArray(card.permitted) && card.permitted.length > 0) hasPermittedActions = true;
      if (Array.isArray(card.forbidden) && card.forbidden.length > 0) hasForbiddenActions = true;
      if (Array.isArray(card.escalationTriggers) && card.escalationTriggers.length > 0) hasEscalationTriggers = true;
      if (Array.isArray(card.values) && card.values.length > 0) hasValueDeclarations = true;
    } catch { /* malformed */ }
  }

  // ACTION_POLICY.md implies permitted/forbidden are documented
  if (existsSync(join(root, "ACTION_POLICY.md"))) {
    hasPermittedActions = true;
    hasForbiddenActions = true;
  }

  // CAPABILITY_MANIFEST.md implies value declarations
  if (existsSync(join(root, "CAPABILITY_MANIFEST.md"))) {
    hasValueDeclarations = true;
  }

  // Runtime integrity check — look for audit log or integrity checkpoint evidence
  const auditPaths = [".amc/ACTION_AUDIT.md", ".amc/audit_log.jsonl", "AUDIT_PROTOCOL.md"];
  for (const f of auditPaths) {
    if (existsSync(join(root, f))) hasRuntimeIntegrityCheck = true;
  }

  // Drift profile — look for prediction log or drift tracking
  const driftPaths = [".amc/PREDICTION_LOG.md", ".amc/drift_profile.json"];
  for (const f of driftPaths) {
    if (existsSync(join(root, f))) hasDriftProfile = true;
  }

  if (!hasAlignmentCard) gaps.push("No behavioral contract / alignment card defined");
  if (!hasPermittedActions) gaps.push("No explicit permitted actions declared");
  if (!hasForbiddenActions) gaps.push("No explicit forbidden actions declared");
  if (!hasEscalationTriggers) gaps.push("No escalation triggers defined");
  if (!hasValueDeclarations) gaps.push("No value declarations (accuracy, privacy, etc.)");
  if (!hasRuntimeIntegrityCheck) gaps.push("No runtime integrity checkpoints or audit log");
  if (!hasDriftProfile) gaps.push("No behavioral drift profile tracked over time");

  if (!hasAlignmentCard) recommendations.push("Create .amc/alignment_card.json with permitted/forbidden/escalationTriggers/values");
  if (!hasRuntimeIntegrityCheck) recommendations.push("Add integrity checkpoints comparing agent reasoning to declared contract before each action");
  if (!hasDriftProfile) recommendations.push("Track behavioral drift: compare current behavior to baseline contract over time");

  const checks = [hasAlignmentCard, hasPermittedActions, hasForbiddenActions,
    hasEscalationTriggers, hasValueDeclarations, hasRuntimeIntegrityCheck, hasDriftProfile];
  const passed = checks.filter(Boolean).length;
  const score = Math.round((passed / checks.length) * 100);
  const level = score >= 90 ? 5 : score >= 70 ? 4 : score >= 50 ? 3 : score >= 30 ? 2 : score >= 10 ? 1 : 0;

  return {
    score, level,
    hasAlignmentCard, hasPermittedActions, hasForbiddenActions,
    hasEscalationTriggers, hasValueDeclarations, hasRuntimeIntegrityCheck, hasDriftProfile,
    gaps, recommendations,
  };
}
