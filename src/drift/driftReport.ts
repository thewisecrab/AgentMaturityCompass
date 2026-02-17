import { listIncidents } from "./freezeEngine.js";

export function renderDriftMarkdown(params: {
  workspace: string;
  agentId: string;
}): string {
  const incidents = listIncidents(params.workspace, params.agentId);
  const lines = [
    `# Drift/Regression Report (${params.agentId})`,
    ""
  ];
  if (incidents.length === 0) {
    lines.push("No incidents.");
    return lines.join("\n");
  }
  for (const incident of incidents) {
    lines.push(`## ${incident.incidentId}`);
    lines.push(`- rule: ${incident.ruleId}`);
    lines.push(`- created: ${new Date(incident.createdTs).toISOString()}`);
    lines.push(`- runs: ${incident.previousRunId} -> ${incident.currentRunId}`);
    lines.push(`- freeze active: ${incident.freeze.active ? "yes" : "no"}`);
    lines.push(`- freeze classes: ${incident.freeze.actionClasses.join(", ") || "none"}`);
    lines.push(`- reason: ${incident.freeze.reason}`);
    lines.push("");
  }
  return lines.join("\n");
}
