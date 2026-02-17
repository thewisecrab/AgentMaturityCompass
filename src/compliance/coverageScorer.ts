import type { ComplianceCategoryResult, ComplianceReportJson } from "./mappingSchema.js";

export function coverageScore(categories: ComplianceCategoryResult[]): ComplianceReportJson["coverage"] {
  const counts = {
    satisfied: 0,
    partial: 0,
    missing: 0,
    unknown: 0
  };
  for (const row of categories) {
    if (row.status === "SATISFIED") counts.satisfied += 1;
    else if (row.status === "PARTIAL") counts.partial += 1;
    else if (row.status === "MISSING") counts.missing += 1;
    else counts.unknown += 1;
  }
  const total = Math.max(1, categories.length);
  const weighted =
    counts.satisfied * 1 +
    counts.partial * 0.5 +
    counts.missing * 0 +
    counts.unknown * 0.25;
  return {
    ...counts,
    score: Number((weighted / total).toFixed(4))
  };
}
