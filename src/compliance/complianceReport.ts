import { dirname, resolve } from "node:path";
import { ensureDir, writeFileAtomic } from "../utils/fs.js";
import type { ComplianceReportJson } from "./mappingSchema.js";

export function complianceReportToMarkdown(report: ComplianceReportJson): string {
  const lines: string[] = [];
  lines.push(`# AMC Compliance Report (${report.framework})`);
  lines.push("");
  lines.push(`- Agent: ${report.agentId}`);
  lines.push(`- Window: ${new Date(report.windowStartTs).toISOString()} -> ${new Date(report.windowEndTs).toISOString()}`);
  lines.push(`- Config trusted: ${report.configTrusted ? "YES" : "NO"}${report.configReason ? ` (${report.configReason})` : ""}`);
  lines.push(
    `- Trust coverage: OBSERVED ${(report.trustTierCoverage.observed * 100).toFixed(1)}% | ATTESTED ${(report.trustTierCoverage.attested * 100).toFixed(1)}% | SELF_REPORTED ${(report.trustTierCoverage.selfReported * 100).toFixed(1)}%`
  );
  lines.push(
    `- Coverage score: ${(report.coverage.score * 100).toFixed(1)}% (S:${report.coverage.satisfied} P:${report.coverage.partial} M:${report.coverage.missing} U:${report.coverage.unknown})`
  );
  lines.push("");
  lines.push("## Categories");
  lines.push("");
  for (const category of report.categories) {
    lines.push(`### ${category.category} (${category.status})`);
    lines.push("");
    lines.push(category.description);
    lines.push("");
    lines.push("Deterministic reasons:");
    for (const reason of category.reasons) {
      lines.push(`- ${reason}`);
    }
    lines.push("Evidence references:");
    if (category.evidenceRefs.length === 0) {
      lines.push("- none");
    } else {
      for (const ref of category.evidenceRefs) {
        lines.push(`- ${ref.eventId} (${ref.eventType}) hash=${ref.eventHash}`);
      }
    }
    lines.push("What would make this SATISFIED?");
    for (const item of category.neededToSatisfy) {
      lines.push(`- ${item}`);
    }
    lines.push("");
  }
  lines.push("## Non-Claims");
  for (const line of report.nonClaims) {
    lines.push(`- ${line}`);
  }
  lines.push("");
  return lines.join("\n");
}

export function writeComplianceReport(params: {
  workspace: string;
  outFile: string;
  report: ComplianceReportJson;
  format: "md" | "json";
}): string {
  const file = resolve(params.workspace, params.outFile);
  ensureDir(dirname(file));
  if (params.format === "json") {
    writeFileAtomic(file, JSON.stringify(params.report, null, 2), 0o644);
  } else {
    writeFileAtomic(file, complianceReportToMarkdown(params.report), 0o644);
  }
  return file;
}

export function diffComplianceReports(a: ComplianceReportJson, b: ComplianceReportJson): {
  framework: string;
  coverageScoreDelta: number;
  categoryDeltas: Array<{
    id: string;
    before: string;
    after: string;
  }>;
} {
  const beforeById = new Map(a.categories.map((row) => [row.id, row]));
  const afterById = new Map(b.categories.map((row) => [row.id, row]));
  const ids = [...new Set([...beforeById.keys(), ...afterById.keys()])].sort((x, y) => x.localeCompare(y));
  return {
    framework: b.framework,
    coverageScoreDelta: Number((b.coverage.score - a.coverage.score).toFixed(4)),
    categoryDeltas: ids
      .map((id) => ({
        id,
        before: beforeById.get(id)?.status ?? "UNKNOWN",
        after: afterById.get(id)?.status ?? "UNKNOWN"
      }))
      .filter((row) => row.before !== row.after)
  };
}
