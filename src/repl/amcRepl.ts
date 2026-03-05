/**
 * AMC Interactive REPL — main loop.
 * Drops users into an interactive session where they can use
 * natural language or exact AMC commands.
 *
 * Supports:
 * - Natural language → command resolution (60+ patterns)
 * - Multi-step workflows (onboard, audit, production check, CI gate, security audit)
 * - Tab completion
 * - Command history (↑/↓)
 * - Context tracking (score, trust label, gaps update automatically)
 * - Contextual suggestions
 * - Rich terminal output with colors and badges
 */

import { createInterface, type Interface as ReadlineInterface } from "node:readline";
import { spawn } from "node:child_process";
import chalk from "chalk";
import { createReplContext, updateContextFromOutput, type ReplContext } from "./replContext.js";
import { parseInput, getCompletions, type ParsedCommand } from "./replParser.js";
import {
  renderBanner, renderHelp, renderCommandEcho, renderSuggestions,
  renderStatusBar, renderError, renderWorkflowHeader, renderWorkflowStep,
  renderWorkflowComplete, renderContextualTip
} from "./replRenderer.js";

const PROMPT = chalk.hex("#6366f1").bold("> ");
const QUIT_COMMANDS = new Set(["exit", "quit", "q", ".exit", ".quit", "bye", "goodbye"]);
const CLEAR_COMMANDS = new Set(["clear", "cls"]);

/**
 * Execute an AMC command and stream output to the terminal.
 * Returns the combined stdout+stderr output.
 */
async function execAmcCommand(command: string, ctx: ReplContext): Promise<string> {
  const bin = process.argv[1] ?? "amc";
  const args = command.split(/\s+/);
  // Pass agent flag if not already specified and agent is non-default
  if (ctx.agentId !== "default" && !args.includes("--agent")) {
    args.push("--agent", ctx.agentId);
  }

  return new Promise<string>((resolveP) => {
    let output = "";
    const proc = spawn(process.execPath, [bin, ...args], {
      stdio: ["inherit", "pipe", "pipe"],
      env: { ...process.env, FORCE_COLOR: "1", AMC_REPL: "1" },
      cwd: process.cwd(),
    });

    proc.stdout.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      output += text;
      process.stdout.write(text);
    });

    proc.stderr.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      output += text;
      process.stderr.write(text);
    });

    proc.on("close", () => {
      resolveP(output);
    });

    proc.on("error", (err) => {
      const msg = `Failed to run: amc ${command} (${err.message})`;
      output += msg;
      console.error(renderError(msg));
      resolveP(output);
    });
  });
}

/**
 * Execute a multi-step workflow.
 */
async function execWorkflow(parsed: ParsedCommand, ctx: ReplContext): Promise<void> {
  const steps = parsed.steps ?? [];
  if (!steps.length) return;

  console.log(renderWorkflowHeader(parsed.description, steps.length));

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    console.log(renderWorkflowStep(i + 1, steps.length, step));

    const output = await execAmcCommand(step, ctx);
    updateContextFromOutput(ctx, step, output);
    ctx.commandCount++;

    // Brief pause between steps for readability
    if (i < steps.length - 1) {
      console.log("");
    }
  }

  console.log(renderWorkflowComplete(parsed.description, ctx));
}

/**
 * Preload context by running a quick status check.
 */
async function preloadContext(ctx: ReplContext): Promise<void> {
  try {
    const bin = process.argv[1] ?? "amc";
    const output = await new Promise<string>((resolveP) => {
      let out = "";
      const proc = spawn(process.execPath, [bin, "status", "--json"], {
        stdio: ["pipe", "pipe", "pipe"],
        env: { ...process.env, AMC_REPL: "1" },
        cwd: process.cwd(),
      });
      proc.stdout.on("data", (chunk: Buffer) => { out += chunk.toString(); });
      proc.stderr.on("data", (chunk: Buffer) => { out += chunk.toString(); });
      proc.on("close", () => resolveP(out));
      proc.on("error", () => resolveP(""));
    });

    // Try to parse JSON from status output
    try {
      const jsonStart = output.indexOf("{");
      if (jsonStart >= 0) {
        const data = JSON.parse(output.slice(jsonStart)) as Record<string, unknown>;
        if (typeof data["overallScore"] === "number") ctx.score = data["overallScore"] as number;
        if (typeof data["trustLabel"] === "string") ctx.trustLabel = data["trustLabel"] as string;
        if (typeof data["level"] === "number") ctx.level = data["level"] as number;
        if (typeof data["evidenceGapCount"] === "number") ctx.gaps = data["evidenceGapCount"] as number;
        if (typeof data["studioRunning"] === "boolean") ctx.studioRunning = data["studioRunning"] as boolean;
      }
    } catch {
      updateContextFromOutput(ctx, "status", output);
    }
  } catch {
    // Preload failed — not critical
  }
}

/**
 * Start the interactive REPL.
 */
export async function startRepl(options?: { agent?: string }): Promise<void> {
  const ctx = createReplContext(options?.agent);

  // Preload context silently
  await preloadContext(ctx);

  // Print banner
  console.log(renderBanner(ctx));

  // Initial suggestions
  console.log(renderSuggestions(ctx));
  console.log("");

  const completions = getCompletions();

  const rl: ReadlineInterface = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: PROMPT,
    terminal: true,
    completer: (line: string): [string[], string] => {
      const lower = line.toLowerCase();
      const hits = completions.filter(c => c.toLowerCase().startsWith(lower));
      return [hits.length ? hits : completions.slice(0, 10), line];
    },
    history: [],
  });

  rl.prompt();

  rl.on("line", async (line: string) => {
    const input = line.trim();

    // Empty line
    if (!input) {
      rl.prompt();
      return;
    }

    // Quit
    if (QUIT_COMMANDS.has(input.toLowerCase())) {
      const elapsed = Math.round((Date.now() - ctx.sessionStart) / 1000 / 60);
      const timeStr = elapsed > 0 ? `${elapsed}m, ` : "";
      console.log(chalk.gray(`\n  Session: ${timeStr}${ctx.commandCount} commands. Goodbye.\n`));
      rl.close();
      return;
    }

    // Clear
    if (CLEAR_COMMANDS.has(input.toLowerCase())) {
      console.clear();
      console.log(renderBanner(ctx));
      rl.prompt();
      return;
    }

    // Help
    if (input.toLowerCase() === "help" || input === "?") {
      console.log(renderHelp(ctx));
      rl.prompt();
      return;
    }

    // Parse input (natural language or raw command)
    const parsed = parseInput(input);
    if (!parsed.command) {
      rl.prompt();
      return;
    }

    // Show what we're doing (for natural language mappings)
    const echo = renderCommandEcho(parsed.description, parsed.natural);
    if (echo) console.log(echo);
    console.log("");

    // Workflow or single command
    if (parsed.workflow && parsed.steps?.length) {
      await execWorkflow(parsed, ctx);
    } else {
      const output = await execAmcCommand(parsed.command, ctx);
      updateContextFromOutput(ctx, parsed.command, output);
      ctx.commandCount++;
    }

    // Show contextual tip after certain commands
    const tip = renderContextualTip(ctx, parsed.command);
    if (tip) {
      console.log("");
      console.log(tip);
    }

    // Show status bar periodically
    if (ctx.commandCount > 0 && (ctx.score !== null || ctx.gaps !== null)) {
      console.log(renderStatusBar(ctx));
    }

    console.log("");
    rl.prompt();
  });

  rl.on("close", () => {
    process.exit(0);
  });

  // Handle Ctrl+C gracefully
  let ctrlCCount = 0;
  rl.on("SIGINT", () => {
    ctrlCCount++;
    if (ctrlCCount >= 2) {
      console.log(chalk.gray("\n  Goodbye.\n"));
      process.exit(0);
    }
    console.log(chalk.gray("\n  Press Ctrl+C again to exit, or type 'exit'.\n"));
    rl.prompt();
    setTimeout(() => { ctrlCCount = 0; }, 2000);
  });
}
