import type { AssuranceReport } from "../types.js";

export function renderAssuranceMarkdown(report: AssuranceReport): string {
  const packTable = [
    "| Pack | Score | Pass | Fail | TrustTier |",
    "|---|---:|---:|---:|---|",
    ...report.packResults.map(
      (pack) =>
        `| ${pack.packId} | ${pack.score0to100.toFixed(2)} | ${pack.passCount} | ${pack.failCount} | ${pack.trustTier} |`
    )
  ].join("\n");

  const scenarioSections = report.packResults
    .map((pack) => {
      const rows = pack.scenarioResults
        .map(
          (scenario) =>
            `- ${scenario.scenarioId} (${scenario.title}) score=${scenario.score0to100.toFixed(1)} pass=${scenario.pass ? "yes" : "no"} audits=${scenario.auditEventTypes.join(",") || "none"}`
        )
        .join("\n");
      return `### ${pack.packId}\n${rows}`;
    })
    .join("\n\n");

  return [
    `# AMC Assurance Report (${report.assuranceRunId})`,
    "",
    `- Agent: ${report.agentId}`,
    `- Mode: ${report.mode}`,
    `- Status: ${report.status}`,
    `- Verification: ${report.verificationPassed ? "PASSED" : "FAILED"}`,
    `- TrustTier: ${report.trustTier}`,
    `- IntegrityIndex: ${report.integrityIndex.toFixed(3)} (${report.trustLabel})`,
    `- Overall score: ${report.overallScore0to100.toFixed(2)}`,
    "",
    "## Pack Scores",
    packTable,
    "",
    "## Scenario Results",
    scenarioSections,
    ""
  ].join("\n");
}
