import chalk from "chalk";
import { Command } from "commander";
import { toErrorMessage } from "../utils/errors.js";
import { applyDomainToAgent } from "./domainApply.js";

function collectComplianceFrameworks(value: string, previous: string[] = []): string[] {
  const next = value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  return [...previous, ...next];
}

export function registerDomainApplyCommand(domainCmd: Command): void {
  domainCmd
    .command("apply")
    .description("Apply domain-specific guardrails and industry pack rules to an agent")
    .requiredOption("--agent <id>", "Agent ID")
    .option("--domain <domain>", "Domain ID (health|education|environment|mobility|governance|technology|wealth)")
    .option("--pack <packId>", "Specific industry pack ID (for example: clinical-trials)")
    .option("--dry-run", "Preview changes without writing files", false)
    .option(
      "--compliance <frameworks>",
      "Compliance frameworks (comma-separated or repeated, e.g. EU_AI_ACT,ISO_42001)",
      collectComplianceFrameworks,
      []
    )
    .option("--file <path>", "Explicit agent config file to update")
    .option("--json", "Output as JSON")
    .action(async (opts: {
      agent: string;
      domain?: string;
      pack?: string;
      dryRun?: boolean;
      compliance: string[];
      file?: string;
      json?: boolean;
    }) => {
      try {
        const result = await applyDomainToAgent({
          agentId: opts.agent,
          domain: opts.domain,
          packId: opts.pack,
          dryRun: opts.dryRun,
          compliance: opts.compliance.length > 0 ? opts.compliance : undefined,
          targetFile: opts.file,
          workspacePath: process.cwd()
        });

        if (opts.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        const header = result.dryRun ? "🧭  Domain Apply (dry-run)" : "🧭  Domain Apply";
        console.log(chalk.bold.cyan(`\n${header}`));
        console.log(chalk.gray("Agent:"), result.agentId);
        console.log(chalk.gray("Domain:"), result.domain);
        console.log(chalk.gray("Packs Applied:"), result.packsApplied.join(", "));
        console.log(chalk.gray("Guardrails Generated:"), result.guardrailsGenerated);
        console.log(chalk.gray("Guardrails Enabled:"), result.guardrailsEnabled.length);
        console.log(
          chalk.gray("Assessment:"),
          `composite=${result.assessmentScore.composite} level=${result.assessmentScore.level} gaps=${result.assessmentScore.gaps}`
        );
        if (result.complianceFrameworks.length > 0) {
          console.log(chalk.gray("Compliance Frameworks:"), result.complianceFrameworks.join(", "));
        }
        if (result.configFileUpdated) {
          console.log(
            chalk.gray(result.dryRun ? "Config File (would update):" : "Config File Updated:"),
            result.configFileUpdated
          );
        }
      } catch (error: unknown) {
        console.error(chalk.red(toErrorMessage(error)));
        process.exit(1);
      }
    });
}
