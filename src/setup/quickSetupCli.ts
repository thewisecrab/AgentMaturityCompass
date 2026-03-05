import type { Command } from "commander";
import { runQuickSetup } from "./quickSetup.js";

export function registerQuickSetupCommand(program: Command): void {
  program
    .command("setup")
    .description("Quick setup wizard for provider + gateway")
    .option("--provider <name>", "openai|anthropic|gemini|groq|mistral|together|openrouter")
    .option("--auto", "non-interactive mode: auto-pick provider if not provided", false)
    .action(async (opts: { provider?: string; auto: boolean }) => {
      await runQuickSetup({
        cwd: process.cwd(),
        provider: opts.provider,
        auto: opts.auto
      });
    });
}
