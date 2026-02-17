import { dirname, resolve } from "node:path";
import { ensureDir, writeFileAtomic } from "../../utils/fs.js";
import { renderContextualizedDiagnostic } from "./contextualizer.js";

function toMarkdown(rendered: ReturnType<typeof renderContextualizedDiagnostic>): string {
  const lines: string[] = [];
  lines.push(`# AMC Contextualized Diagnostic (${rendered.agentId})`);
  lines.push("");
  lines.push(`Generated: ${new Date(rendered.generatedTs).toISOString()}`);
  lines.push(`Agent type: ${rendered.profile.agentType}`);
  lines.push(`Operating mode: ${rendered.profile.operatingMode}`);
  lines.push("");
  for (const question of rendered.questions) {
    lines.push(`## ${question.qId} — ${question.title}`);
    lines.push(question.howThisApplies);
    lines.push(`Target: ${question.ownerTarget === null ? "(not set)" : question.ownerTarget}`);
    lines.push("Evidence examples:");
    for (const example of question.tailoredEvidenceExamples) {
      lines.push(`- ${example}`);
    }
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

export function contextualizedDiagnosticRenderCli(params: {
  workspace: string;
  agentId?: string;
  format: "json" | "md";
  outFile?: string;
}): {
  render: ReturnType<typeof renderContextualizedDiagnostic>;
  outFile: string | null;
} {
  const render = renderContextualizedDiagnostic({
    workspace: params.workspace,
    agentId: params.agentId
  });
  let outFile: string | null = null;
  if (params.outFile) {
    const outputPath = resolve(params.workspace, params.outFile);
    ensureDir(dirname(outputPath));
    const body = params.format === "md" ? toMarkdown(render) : JSON.stringify(render, null, 2);
    writeFileAtomic(outputPath, body, 0o644);
    outFile = outputPath;
  }
  return {
    render,
    outFile
  };
}
