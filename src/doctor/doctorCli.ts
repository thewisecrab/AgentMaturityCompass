import { runDoctorRules } from "./doctorRules.js";
import { renderDoctorText } from "./doctorReport.js";

export async function runDoctorCli(workspace: string): Promise<{
  ok: boolean;
  checks: Awaited<ReturnType<typeof runDoctorRules>>["checks"];
  text: string;
}> {
  const report = await runDoctorRules(workspace);
  return {
    ok: report.ok,
    checks: report.checks,
    text: renderDoctorText(report)
  };
}

