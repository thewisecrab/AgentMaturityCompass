import type { OrgNodeScorecard, OrgScorecard } from "./orgSchema.js";

function heading(title: string): string {
  return `# ${title}`;
}

function nodeById(scorecard: OrgScorecard, nodeId: string): OrgNodeScorecard {
  const row = scorecard.nodes.find((node) => node.nodeId === nodeId);
  if (!row) {
    throw new Error(`Node not found in scorecard: ${nodeId}`);
  }
  return row;
}

export function renderOrgNodeReportMarkdown(scorecard: OrgScorecard, nodeId: string): string {
  const node = nodeById(scorecard, nodeId);
  const layerLines = node.layerScores.map((layer) => `- ${layer.layerName}: median=${layer.median.toFixed(3)} trimmed=${layer.trimmedMean.toFixed(3)}`);
  const gapLines = node.topGapQuestions.map((gap) => `- ${gap.questionId}: current ${gap.currentMedian.toFixed(2)} vs target ${gap.targetMedian.toFixed(2)} (gap ${gap.gap.toFixed(2)})`);
  const riskLines = node.topSystemicRisks.map((risk) => `- ${risk.id}: ${risk.score0to100.toFixed(2)}`);

  return [
    heading(`ORG Scorecard — ${node.name} (${node.nodeId})`),
    "",
    `- Window: ${new Date(scorecard.window.windowStartTs).toISOString()} .. ${new Date(scorecard.window.windowEndTs).toISOString()}`,
    `- Headline (weighted median): ${node.headline.median.toFixed(3)}`,
    `- Headline (weighted trimmed mean): ${node.headline.trimmedMean.toFixed(3)}`,
    `- IntegrityIndex: ${node.integrityIndex.toFixed(3)}`,
    `- Trust Label: ${node.trustLabel}`,
    `- Agent count: ${node.countAgentsIncluded}`,
    `- OBSERVED coverage: ${(node.evidenceCoverage.observedRatio * 100).toFixed(1)}%`,
    `- Median correlation ratio: ${node.evidenceCoverage.medianCorrelationRatio.toFixed(3)}`,
    "",
    "## Layer Scores",
    ...(layerLines.length > 0 ? layerLines : ["- none"]),
    "",
    "## Top 10 Gaps",
    ...(gapLines.length > 0 ? gapLines : ["- none"]),
    "",
    "## Top 5 Systemic Risks",
    ...(riskLines.length > 0 ? riskLines : ["- none"]),
    "",
    "## Why Capped",
    ...(node.whyCapped.length > 0 ? node.whyCapped.map((item) => `- ${item}`) : ["- none"]),
    "",
    "## Run References",
    ...(node.runRefs.length > 0 ? node.runRefs.map((runId) => `- ${runId}`) : ["- none"]),
    ""
  ].join("\n");
}

export function renderOrgCompareMarkdown(scorecard: OrgScorecard, nodeAId: string, nodeBId: string): string {
  const nodeA = nodeById(scorecard, nodeAId);
  const nodeB = nodeById(scorecard, nodeBId);

  const layerDeltas = nodeA.layerScores.map((layer) => {
    const other = nodeB.layerScores.find((row) => row.layerName === layer.layerName);
    return {
      layerName: layer.layerName,
      delta: (other?.median ?? 0) - layer.median
    };
  });

  const questionDeltas = nodeA.questionScores.map((question) => {
    const other = nodeB.questionScores.find((row) => row.questionId === question.questionId);
    return {
      questionId: question.questionId,
      delta: (other?.median ?? 0) - question.median
    };
  });

  const topGaps = [...questionDeltas].sort((a, b) => b.delta - a.delta).slice(0, 10);
  const topWins = [...questionDeltas].sort((a, b) => a.delta - b.delta).slice(0, 10);

  return [
    heading(`ORG Compare — ${nodeA.name} vs ${nodeB.name}`),
    "",
    `- Overall delta (${nodeB.nodeId} - ${nodeA.nodeId}): ${(nodeB.headline.median - nodeA.headline.median).toFixed(3)}`,
    `- Integrity delta: ${(nodeB.integrityIndex - nodeA.integrityIndex).toFixed(3)}`,
    `- Value delta: ${
      nodeA.valueScore === null || nodeB.valueScore === null
        ? "n/a"
        : (nodeB.valueScore - nodeA.valueScore).toFixed(3)
    }`,
    "",
    "## Layer Deltas",
    ...layerDeltas.map((row) => `- ${row.layerName}: ${row.delta.toFixed(3)}`),
    "",
    "## Top 10 Question Gaps",
    ...topGaps.map((row) => `- ${row.questionId}: ${row.delta.toFixed(3)}`),
    "",
    "## Top 10 Wins",
    ...topWins.map((row) => `- ${row.questionId}: ${(-row.delta).toFixed(3)}`),
    ""
  ].join("\n");
}

export function renderOrgSystemicMarkdown(scorecard: OrgScorecard): string {
  const enterprise = scorecard.summary.enterpriseRollup;
  if (!enterprise) {
    return [heading("ORG Systemic Risks"), "", "No enterprise rollup available.", ""].join("\n");
  }

  const risks = [...enterprise.riskIndices].sort((a, b) => b.score0to100 - a.score0to100);
  return [
    heading("ORG Systemic Risks"),
    "",
    `- Enterprise node: ${enterprise.name} (${enterprise.nodeId})`,
    `- Trust: ${enterprise.trustLabel}`,
    `- Headline: ${enterprise.headline.median.toFixed(3)}`,
    "",
    "## Why Strategies Fail Risk Map",
    ...risks.map((risk) => `- ${risk.id}: ${risk.score0to100.toFixed(2)}`),
    "",
    "## Root Contributors",
    ...enterprise.topGapQuestions.slice(0, 10).map((gap) => `- ${gap.questionId}: gap ${gap.gap.toFixed(2)}`),
    "",
    "## 4C Remediation Summary",
    "- Concept: tighten mission clarity and explicit success metrics for weakest nodes.",
    "- Culture: enforce truth protocol and dissent behavior where risk is highest.",
    "- Capabilities: add deterministic assurance and outcome tests for weak processes.",
    "- Configuration: raise policy/CI/sandbox controls to prevent regressions.",
    ""
  ].join("\n");
}
