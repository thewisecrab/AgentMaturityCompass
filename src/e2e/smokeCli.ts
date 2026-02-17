import type { SmokeMode } from "./smokeSchema.js";
import { runSmoke } from "./smoke.js";

export async function smokeCli(params: {
  mode: SmokeMode;
  json?: boolean;
  workspace?: string;
  repoRoot?: string;
}): Promise<{
  report: Awaited<ReturnType<typeof runSmoke>>;
  text: string;
}> {
  const report = await runSmoke({
    mode: params.mode,
    workspace: params.workspace,
    repoRoot: params.repoRoot
  });
  const lines: string[] = [];
  lines.push(`status: ${report.status}`);
  lines.push(`mode: ${report.mode}`);
  lines.push(`generatedTs: ${new Date(report.generatedTs).toISOString()}`);
  lines.push("steps:");
  for (const step of report.steps) {
    lines.push(`- ${step.id}: ${step.status} (${step.ms}ms)`);
    for (const detail of step.details) {
      lines.push(`  ${detail}`);
    }
  }
  if (Object.keys(report.artifacts).length > 0) {
    lines.push("artifacts:");
    for (const [key, value] of Object.entries(report.artifacts)) {
      lines.push(`- ${key}: ${value}`);
    }
  }
  if (report.warnings.length > 0) {
    lines.push("warnings:");
    for (const warning of report.warnings) {
      lines.push(`- ${warning}`);
    }
  }
  return {
    report,
    text: lines.join("\n")
  };
}
