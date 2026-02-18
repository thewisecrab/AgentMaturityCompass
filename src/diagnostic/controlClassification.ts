/**
 * Control Classification — Synthetic vs Architectural enforcement tagging.
 *
 * Every control is tagged with an enforcement level indicating how structurally
 * the control prevents violations:
 *
 * - ARCHITECTURAL: violation is structurally prevented (e.g., hash chain, signature verification)
 * - POLICY_ENFORCED: violation is blocked by signed policy (e.g., governor, budget limits)
 * - CONVENTION: violation is detectable but not prevented (e.g., naming conventions, review checklists)
 */

import { questionBank } from "./questionBank.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ControlEnforcementLevel = "ARCHITECTURAL" | "POLICY_ENFORCED" | "CONVENTION";

export interface SubControl {
  id: string;
  label: string;
  enforcementLevel: ControlEnforcementLevel;
  description: string;
}

export interface QuestionControlClassification {
  questionId: string;
  questionTitle: string;
  subControls: SubControl[];
  dominantLevel: ControlEnforcementLevel;
  architecturalRatio: number;
}

export interface ControlClassificationReport {
  generatedTs: number;
  questions: QuestionControlClassification[];
  summary: {
    totalSubControls: number;
    architectural: number;
    policyEnforced: number;
    convention: number;
    architecturalRatio: number;
    progressionScore: number;
  };
}

// ---------------------------------------------------------------------------
// Default sub-control mappings
// ---------------------------------------------------------------------------

const DEFAULT_SUB_CONTROLS: Record<string, SubControl[]> = {
  // Layer 1: Foundations
  "q-01": [
    { id: "q01-ledger-hash", label: "Ledger hash chain integrity", enforcementLevel: "ARCHITECTURAL", description: "SHA-256 hash chain prevents retroactive tampering" },
    { id: "q01-event-logging", label: "Evidence event logging", enforcementLevel: "CONVENTION", description: "Events are logged but completeness depends on adapter" },
  ],
  "q-02": [
    { id: "q02-gateway-sig", label: "Gateway config signature", enforcementLevel: "ARCHITECTURAL", description: "Signed config prevents unauthorized routing changes" },
    { id: "q02-provider-routing", label: "Provider routing policy", enforcementLevel: "POLICY_ENFORCED", description: "Model allowlist enforced by signed bridge config" },
  ],
  "q-03": [
    { id: "q03-action-policy", label: "Action policy enforcement", enforcementLevel: "POLICY_ENFORCED", description: "Governor blocks disallowed actions via signed policy" },
    { id: "q03-tool-allowlist", label: "Tool allowlist", enforcementLevel: "POLICY_ENFORCED", description: "ToolHub restricts available tools per signed config" },
  ],
  "q-04": [
    { id: "q04-budget-limits", label: "Budget cost limits", enforcementLevel: "POLICY_ENFORCED", description: "Daily/monthly cost caps enforced by budget engine" },
    { id: "q04-budget-sig", label: "Budget config signature", enforcementLevel: "ARCHITECTURAL", description: "Budget config is signed to prevent tampering" },
  ],
  "q-05": [
    { id: "q05-approval-flow", label: "Approval workflow", enforcementLevel: "POLICY_ENFORCED", description: "High-risk actions require human approval per policy" },
    { id: "q05-approval-sig", label: "Approval policy signature", enforcementLevel: "ARCHITECTURAL", description: "Approval policy is signed" },
  ],
  "q-06": [
    { id: "q06-trust-config", label: "Trust mode config", enforcementLevel: "POLICY_ENFORCED", description: "Trust boundaries enforced by signed trust config" },
    { id: "q06-boundary-detection", label: "Trust boundary violation detection", enforcementLevel: "ARCHITECTURAL", description: "Ledger structurally detects cross-boundary events" },
  ],
  "q-07": [
    { id: "q07-transparency-log", label: "Transparency log chain", enforcementLevel: "ARCHITECTURAL", description: "Append-only log with hash chain" },
    { id: "q07-merkle-proof", label: "Merkle inclusion proof", enforcementLevel: "ARCHITECTURAL", description: "Merkle tree enables third-party verification" },
  ],
  "q-08": [
    { id: "q08-target-profile", label: "Target profile", enforcementLevel: "CONVENTION", description: "Target levels are aspirational and not enforced" },
    { id: "q08-target-sig", label: "Target profile signature", enforcementLevel: "ARCHITECTURAL", description: "Signed target profile prevents unauthorized changes" },
  ],
  "q-09": [
    { id: "q09-fleet-config", label: "Fleet config management", enforcementLevel: "POLICY_ENFORCED", description: "Fleet config is signed and versioned" },
    { id: "q09-agent-isolation", label: "Agent isolation", enforcementLevel: "CONVENTION", description: "Agents are logically separated but share workspace" },
  ],
  "q-10": [
    { id: "q10-exec-tickets", label: "Execution ticket verification", enforcementLevel: "ARCHITECTURAL", description: "Cryptographic ticket required for privileged actions" },
    { id: "q10-lease-system", label: "Lease-based access", enforcementLevel: "ARCHITECTURAL", description: "Time-bounded leases with cryptographic verification" },
  ],
};

function getSubControls(questionId: string): SubControl[] {
  const mapped = DEFAULT_SUB_CONTROLS[questionId];
  if (mapped) return mapped;
  return [
    {
      id: `${questionId}-default`,
      label: "General control",
      enforcementLevel: "CONVENTION" as ControlEnforcementLevel,
      description: "No specific architectural enforcement mapped",
    },
  ];
}

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

function dominantLevel(subControls: SubControl[]): ControlEnforcementLevel {
  const counts: Record<ControlEnforcementLevel, number> = {
    ARCHITECTURAL: 0,
    POLICY_ENFORCED: 0,
    CONVENTION: 0,
  };
  for (const sc of subControls) {
    counts[sc.enforcementLevel]++;
  }
  if (counts.ARCHITECTURAL >= counts.POLICY_ENFORCED && counts.ARCHITECTURAL >= counts.CONVENTION) {
    return "ARCHITECTURAL";
  }
  if (counts.POLICY_ENFORCED >= counts.CONVENTION) {
    return "POLICY_ENFORCED";
  }
  return "CONVENTION";
}

export function classifyControls(): ControlClassificationReport {
  const questions: QuestionControlClassification[] = [];
  const bank = questionBank;

  for (const q of bank) {
    const subControls = getSubControls(q.id);
    const archCount = subControls.filter((sc) => sc.enforcementLevel === "ARCHITECTURAL").length;
    questions.push({
      questionId: q.id,
      questionTitle: q.title,
      subControls,
      dominantLevel: dominantLevel(subControls),
      architecturalRatio: subControls.length > 0 ? archCount / subControls.length : 0,
    });
  }

  const allSubs = questions.flatMap((q) => q.subControls);
  const archTotal = allSubs.filter((s) => s.enforcementLevel === "ARCHITECTURAL").length;
  const policyTotal = allSubs.filter((s) => s.enforcementLevel === "POLICY_ENFORCED").length;
  const conventionTotal = allSubs.filter((s) => s.enforcementLevel === "CONVENTION").length;

  // Progression score: ARCHITECTURAL=3, POLICY_ENFORCED=2, CONVENTION=1, normalized to 0-1
  const maxScore = allSubs.length * 3;
  const rawScore = archTotal * 3 + policyTotal * 2 + conventionTotal * 1;
  const progressionScore = maxScore > 0 ? rawScore / maxScore : 0;

  return {
    generatedTs: Date.now(),
    questions,
    summary: {
      totalSubControls: allSubs.length,
      architectural: archTotal,
      policyEnforced: policyTotal,
      convention: conventionTotal,
      architecturalRatio: allSubs.length > 0 ? archTotal / allSubs.length : 0,
      progressionScore: Number(progressionScore.toFixed(4)),
    },
  };
}

export function renderControlClassificationMarkdown(report: ControlClassificationReport): string {
  const lines: string[] = [
    "# Control Classification Report",
    "",
    `Generated: ${new Date(report.generatedTs).toISOString()}`,
    "",
    "## Summary",
    "",
    `- Total sub-controls: ${report.summary.totalSubControls}`,
    `- ARCHITECTURAL: ${report.summary.architectural} (${(report.summary.architecturalRatio * 100).toFixed(1)}%)`,
    `- POLICY_ENFORCED: ${report.summary.policyEnforced}`,
    `- CONVENTION: ${report.summary.convention}`,
    `- Progression score: ${(report.summary.progressionScore * 100).toFixed(1)}%`,
    "",
    "## Per-Question Breakdown",
    "",
    "| Question | Dominant Level | Architectural Ratio | Sub-Controls |",
    "|---|---|---:|---:|",
  ];

  for (const q of report.questions) {
    lines.push(
      `| ${q.questionId}: ${q.questionTitle.slice(0, 40)} | ${q.dominantLevel} | ${(q.architecturalRatio * 100).toFixed(0)}% | ${q.subControls.length} |`,
    );
  }

  lines.push("");
  return lines.join("\n");
}
