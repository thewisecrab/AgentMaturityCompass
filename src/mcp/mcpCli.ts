/**
 * CLI handler for `amc mcp` commands
 */

import { Command } from "commander";
import chalk from "chalk";
import { INDUSTRY_PACKS } from "../domains/industryPacks.js";
import { startMcpServer } from "./amcMcpServer.js";

const CLAUDE_CODE_CONFIG = {
  mcpServers: {
    amc: {
      command: "amc",
      args: ["mcp", "serve"],
      env: {},
    },
  },
};

const CURSOR_CONFIG = {
  mcpServers: {
    amc: {
      command: "amc",
      args: ["mcp", "serve"],
    },
  },
};

const GENERIC_CONFIG = {
  name: "amc",
  description: "Agent Maturity Compass — AI agent trust scoring and governance",
  command: "amc",
  args: ["mcp", "serve"],
  transport: "stdio",
};

const IDE_CONFIGS: Record<string, { file: string; config: unknown }> = {
  "Claude Code": { file: ".claude/mcp.json", config: CLAUDE_CODE_CONFIG },
  "Cursor": { file: ".cursor/mcp.json", config: CURSOR_CONFIG },
  "Windsurf": { file: ".windsurf/mcp.json", config: CURSOR_CONFIG },
  "VS Code Copilot": { file: ".vscode/mcp.json", config: CURSOR_CONFIG },
  "Kiro": { file: ".kiro/mcp.json", config: CURSOR_CONFIG },
  "Generic (OpenAI Agents SDK, etc.)": { file: "mcp.json", config: GENERIC_CONFIG },
};

const MCP_TOOLS = [
  {
    name: "amc_list_agents",
    description: "List all AMC-registered agents with trust status",
    input: "{ workspace?: string }",
  },
  {
    name: "amc_quickscore",
    description: "Get trust score and maturity level for an agent (L1-L5, 0-100)",
    input: "{ agentId: string, workspace?: string }",
  },
  {
    name: "amc_get_guide",
    description: "Get prioritized improvement guide with CLI commands",
    input: "{ agentId: string, workspace?: string }",
  },
  {
    name: "amc_check_compliance",
    description: "Check compliance gaps (EU_AI_ACT, ISO_42001, NIST_AI_RMF, SOC2, ISO_27001)",
    input: "{ agentId: string, frameworks?: string[], workspace?: string }",
  },
  {
    name: "amc_transparency_report",
    description: "Full Agent Transparency Report — capabilities, data access, trust evidence",
    input: "{ agentId: string, format?: 'markdown'|'json', workspace?: string }",
  },
  {
    name: "amc_score_sector_pack",
    description: "Score agent against an industry Sector Pack (40 packs, 7 stations)",
    input: "{ packId: string, responses: Record<string, number> }",
  },
];

export function registerMcpCommands(program: Command): void {
  const mcp = program
    .command("mcp")
    .description("AMC Model Context Protocol (MCP) server for AI coding assistants");

  // amc mcp serve
  mcp
    .command("serve")
    .description("Start the AMC MCP server (stdio transport for IDE integration)")
    .option("--workspace <path>", "Default workspace path", process.cwd())
    .action(async (opts: { workspace: string }) => {
      process.chdir(opts.workspace);
      await startMcpServer();
    });

  // amc mcp config
  mcp
    .command("config")
    .description("Print MCP configuration snippets for supported AI coding assistants")
    .option("--ide <name>", "Specific IDE (claude-code, cursor, windsurf, vscode, kiro)")
    .action((opts: { ide?: string }) => {
      console.log(chalk.bold.cyan("\n🔌 AMC MCP Server Configuration\n"));
      console.log(
        chalk.gray(
          "Paste the appropriate config into your AI coding assistant's MCP config file.\n"
        )
      );

      const entries = Object.entries(IDE_CONFIGS);
      const filtered = opts.ide
        ? entries.filter(([name]) =>
            name.toLowerCase().includes(opts.ide!.toLowerCase())
          )
        : entries;

      for (const [name, { file, config }] of filtered) {
        console.log(chalk.bold.green(`── ${name}`));
        console.log(chalk.gray(`   File: ${file}`));
        console.log(chalk.white(JSON.stringify(config, null, 2)));
        console.log();
      }

      console.log(chalk.bold("\nQuick start:"));
      console.log(chalk.white("  1. Install AMC:  ") + chalk.cyan("npm install -g agent-maturity-compass"));
      console.log(chalk.white("  2. Paste config above into your IDE's MCP config file"));
      console.log(chalk.white("  3. Restart your IDE — AMC tools will appear in the assistant"));
      console.log();
      console.log(
        chalk.gray(
          `Available tools: ${MCP_TOOLS.map((t) => t.name).join(", ")}`
        )
      );
      console.log();
    });

  // amc mcp list-tools
  mcp
    .command("list-tools")
    .description("List all tools exposed by the AMC MCP server")
    .option("--json", "Output as JSON")
    .action((opts: { json?: boolean }) => {
      if (opts.json) {
        console.log(JSON.stringify(MCP_TOOLS, null, 2));
        return;
      }

      console.log(chalk.bold.cyan("\n🛠️  AMC MCP Tools\n"));
      for (const tool of MCP_TOOLS) {
        console.log(chalk.bold.green(`  ${tool.name}`));
        console.log(`    ${chalk.gray(tool.description)}`);
        console.log(`    ${chalk.dim("Input:")} ${chalk.white(tool.input)}`);
        console.log();
      }

      console.log(chalk.bold.cyan("📦 Resources\n"));
      console.log(chalk.bold.green("  amc://agent/{agentId}"));
      console.log(
        `    ${chalk.gray("Full Agent Transparency Report as a markdown resource")}`
      );
      console.log();

      console.log(
        chalk.gray(
          `Sector Packs available via amc_score_sector_pack: ${Object.keys(INDUSTRY_PACKS).length} packs`
        )
      );
    });
}
