/**
 * Cross-Agent Contradiction Detection
 *
 * Detects when agents in a fleet make conflicting claims about the same entity.
 * Compares claims across agents by questionId and assertion evidence.
 */

import { randomUUID } from "node:crypto";
import type { DiagnosticReport, QuestionScore } from "../types.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ContradictionSeverity = "INFO" | "WARN" | "CRITICAL";

export interface AgentContradiction {
  contradictionId: string;
  agentA: string;
  agentB: string;
  questionId: string;
  agentALevel: number;
  agentBLevel: number;
  agentAConfidence: number;
  agentBConfidence: number;
  delta: number;
  severity: ContradictionSeverity;
  agentANarrative: string;
  agentBNarrative: string;
  agentAEvidenceIds: string[];
  agentBEvidenceIds: string[];
}

export interface ContradictionReport {
  reportId: string;
  ts: number;
  scope: "fleet" | "agent";
  totalContradictions: number;
  criticalCount: number;
  warnCount: number;
  infoCount: number;
  contradictions: AgentContradiction[];
  agentPairSummary: { agentA: string; agentB: string; count: number }[];
}

// ---------------------------------------------------------------------------
// Detection
// ---------------------------------------------------------------------------

function classifySeverity(delta: number, confidenceA: number, confidenceB: number): ContradictionSeverity {
  const avgConfidence = (confidenceA + confidenceB) / 2;
  if (delta >= 3 && avgConfidence >= 0.7) return "CRITICAL";
  if (delta >= 2 && avgConfidence >= 0.5) return "WARN";
  return "INFO";
}

export function detectContradictions(
  reports: DiagnosticReport[],
  options?: { minDelta?: number; scope?: "fleet" | "agent" },
): ContradictionReport {
  const minDelta = options?.minDelta ?? 1;
  const contradictions: AgentContradiction[] = [];

  for (let i = 0; i < reports.length; i++) {
    for (let j = i + 1; j < reports.length; j++) {
      const a = reports[i]!;
      const b = reports[j]!;

      for (const scoreA of a.questionScores) {
        const scoreB = b.questionScores.find((s) => s.questionId === scoreA.questionId);
        if (!scoreB) continue;

        const delta = Math.abs(scoreA.finalLevel - scoreB.finalLevel);
        if (delta < minDelta) continue;

        const severity = classifySeverity(delta, scoreA.confidence, scoreB.confidence);

        contradictions.push({
          contradictionId: `contradiction_${randomUUID().slice(0, 12)}`,
          agentA: a.agentId,
          agentB: b.agentId,
          questionId: scoreA.questionId,
          agentALevel: scoreA.finalLevel,
          agentBLevel: scoreB.finalLevel,
          agentAConfidence: scoreA.confidence,
          agentBConfidence: scoreB.confidence,
          delta,
          severity,
          agentANarrative: scoreA.narrative,
          agentBNarrative: scoreB.narrative,
          agentAEvidenceIds: scoreA.evidenceEventIds,
          agentBEvidenceIds: scoreB.evidenceEventIds,
        });
      }
    }
  }

  contradictions.sort((a, b) => {
    const severityOrder = { CRITICAL: 0, WARN: 1, INFO: 2 };
    const diff = severityOrder[a.severity] - severityOrder[b.severity];
    return diff !== 0 ? diff : b.delta - a.delta;
  });

  // Build pair summary
  const pairMap = new Map<string, { agentA: string; agentB: string; count: number }>();
  for (const c of contradictions) {
    const key = `${c.agentA}::${c.agentB}`;
    const existing = pairMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      pairMap.set(key, { agentA: c.agentA, agentB: c.agentB, count: 1 });
    }
  }

  return {
    reportId: `cdr_${randomUUID().slice(0, 12)}`,
    ts: Date.now(),
    scope: options?.scope ?? "fleet",
    totalContradictions: contradictions.length,
    criticalCount: contradictions.filter((c) => c.severity === "CRITICAL").length,
    warnCount: contradictions.filter((c) => c.severity === "WARN").length,
    infoCount: contradictions.filter((c) => c.severity === "INFO").length,
    contradictions,
    agentPairSummary: [...pairMap.values()].sort((a, b) => b.count - a.count),
  };
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

export function renderContradictionReportMarkdown(report: ContradictionReport): string {
  const lines = [
    "# Cross-Agent Contradiction Report",
    "",
    `- Report ID: ${report.reportId}`,
    `- Timestamp: ${new Date(report.ts).toISOString()}`,
    `- Scope: ${report.scope}`,
    `- Total: ${report.totalContradictions} (CRITICAL: ${report.criticalCount}, WARN: ${report.warnCount}, INFO: ${report.infoCount})`,
    "",
  ];

  if (report.agentPairSummary.length > 0) {
    lines.push("## Agent Pair Summary");
    lines.push("| Agent A | Agent B | Contradictions |");
    lines.push("|---|---|---:|");
    for (const p of report.agentPairSummary) {
      lines.push(`| ${p.agentA} | ${p.agentB} | ${p.count} |`);
    }
    lines.push("");
  }

  if (report.contradictions.length > 0) {
    lines.push("## Contradictions");
    lines.push("| Severity | Question | Agent A | Level A | Agent B | Level B | Delta |");
    lines.push("|---|---|---|---:|---|---:|---:|");
    for (const c of report.contradictions) {
      lines.push(
        `| ${c.severity} | ${c.questionId} | ${c.agentA} | ${c.agentALevel} | ${c.agentB} | ${c.agentBLevel} | ${c.delta} |`,
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}
