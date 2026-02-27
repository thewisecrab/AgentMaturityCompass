/**
 * AMC MCP Server
 *
 * Exposes AMC trust scoring, guide, compliance, and transparency capabilities
 * to any MCP-compatible AI coding assistant via the Model Context Protocol.
 *
 * Supported clients: Claude Code, Cursor, GitHub Copilot, Windsurf, Kiro,
 * VS Code (MCP extension), Codex, IntelliJ with Junie.
 *
 * Transport: stdio (default) — runs as a subprocess of the IDE
 *
 * Usage:
 *   amc mcp serve
 *
 * Quick config for Claude Code (.claude/mcp.json):
 *   { "mcpServers": { "amc": { "command": "amc", "args": ["mcp", "serve"] } } }
 */

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { listAgents } from "../fleet/registry.js";
import {
  generateTransparencyReport,
  renderTransparencyReportMarkdown,
  renderTransparencyReportJson,
} from "../transparency/transparencyReport.js";
import { INDUSTRY_PACKS, scoreIndustryPack, type IndustryPackId } from "../domains/industryPacks.js";

const PKG_VERSION = "1.0.0";

// ---------------------------------------------------------------------------
// Server bootstrap
// ---------------------------------------------------------------------------

export async function startMcpServer(): Promise<void> {
  const server = new McpServer({
    name: "amc",
    version: PKG_VERSION,
  });

  // -------------------------------------------------------------------------
  // Tool: amc_list_agents
  // -------------------------------------------------------------------------
  server.tool(
    "amc_list_agents",
    "List all AMC-registered AI agents in the workspace with their current trust status.",
    {
      workspace: z
        .string()
        .optional()
        .describe("Path to the AMC workspace (defaults to current directory)"),
    },
    async ({ workspace }) => {
      const ws = resolve(workspace ?? process.cwd());
      try {
        const agents = listAgents(ws);
        if (agents.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No AMC agents registered in this workspace. Run `amc init` to get started.",
              },
            ],
          };
        }
        const rows = agents.map((a) => `- ${a.id}`).join("\n");
        return {
          content: [
            {
              type: "text",
              text: `Found ${agents.length} agent(s):\n${rows}\n\nRun amc_transparency_report for full trust details on any agent.`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            { type: "text", text: `Error listing agents: ${(err as Error).message}` },
          ],
          isError: true,
        };
      }
    }
  );

  // -------------------------------------------------------------------------
  // Tool: amc_quickscore
  // -------------------------------------------------------------------------
  server.tool(
    "amc_quickscore",
    "Get the current AMC trust score and maturity level for an AI agent. Returns L1-L5 score per dimension and an overall trust score (0-100).",
    {
      agentId: z.string().describe("Agent ID to score"),
      workspace: z
        .string()
        .optional()
        .describe("Path to the AMC workspace (defaults to current directory)"),
    },
    async ({ agentId, workspace }) => {
      const ws = resolve(workspace ?? process.cwd());
      try {
        const report = generateTransparencyReport(agentId, ws);
        const dims = report.dimensions
          .map((d) => `  • ${d.name}: ${d.label} (${d.level}/5)`)
          .join("\n");

        const text = [
          `## AMC Trust Score: ${agentId}`,
          ``,
          `**Overall:** ${report.identity.maturityLabel} · Trust Score: ${report.identity.trustScore}/100`,
          `**Certification:** ${report.identity.certificationStatus}`,
          `**Risk Tier:** ${report.identity.riskTier}`,
          `**Last Assessed:** ${report.identity.lastAssessed}`,
          ``,
          `**Dimensions:**`,
          dims || "  (No dimension scores yet — run `amc quickscore` first)",
          ``,
          report.topPriorities.length > 0 && report.topPriorities[0]
            ? `**Top Priority:** ${report.topPriorities[0].action}\n  → \`${report.topPriorities[0].command}\``
            : "",
        ]
          .filter(Boolean)
          .join("\n");

        return { content: [{ type: "text", text }] };
      } catch (err) {
        return {
          content: [
            {
              type: "text",
              text: `Could not score agent "${agentId}": ${(err as Error).message}\n\nMake sure the agent is registered with \`amc init\` and has at least one run.`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // -------------------------------------------------------------------------
  // Tool: amc_get_guide
  // -------------------------------------------------------------------------
  server.tool(
    "amc_get_guide",
    "Get a prioritized improvement guide for an AI agent. Returns the top actions to improve trust score with specific CLI commands to run.",
    {
      agentId: z.string().describe("Agent ID to guide"),
      workspace: z
        .string()
        .optional()
        .describe("Path to the AMC workspace (defaults to current directory)"),
    },
    async ({ agentId, workspace }) => {
      const ws = resolve(workspace ?? process.cwd());
      try {
        const report = generateTransparencyReport(agentId, ws);
        const priorities = report.topPriorities;

        if (priorities.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `Agent "${agentId}" has no immediate improvement priorities — either fully assessed or no run data yet.\n\nRun: amc guide --agent ${agentId}`,
              },
            ],
          };
        }

        const items = priorities
          .map(
            (p, i) =>
              `${i + 1}. **${p.action}**\n   Impact: ${p.impact}\n   Command: \`${p.command}\``
          )
          .join("\n\n");

        return {
          content: [
            {
              type: "text",
              text: `## AMC Improvement Guide: ${agentId}\n\nCurrent: ${report.identity.maturityLabel} (${report.identity.trustScore}/100)\n\n${items}\n\nFull guide: \`amc guide --agent ${agentId}\``,
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            { type: "text", text: `Error generating guide: ${(err as Error).message}` },
          ],
          isError: true,
        };
      }
    }
  );

  // -------------------------------------------------------------------------
  // Tool: amc_check_compliance
  // -------------------------------------------------------------------------
  server.tool(
    "amc_check_compliance",
    "Check an AI agent for compliance gaps against regulatory frameworks. Supported frameworks: EU_AI_ACT, ISO_42001, NIST_AI_RMF, SOC2, ISO_27001.",
    {
      agentId: z.string().describe("Agent ID to check"),
      frameworks: z
        .array(z.string())
        .optional()
        .describe(
          "Compliance frameworks to check (default: all). Options: EU_AI_ACT, ISO_42001, NIST_AI_RMF, SOC2, ISO_27001"
        ),
      workspace: z
        .string()
        .optional()
        .describe("Path to the AMC workspace"),
    },
    async ({ agentId, frameworks, workspace }) => {
      const ws = resolve(workspace ?? process.cwd());
      const fwList = frameworks?.length
        ? frameworks.join(", ")
        : "EU_AI_ACT, ISO_42001, NIST_AI_RMF, SOC2, ISO_27001";

      try {
        const report = generateTransparencyReport(agentId, ws);
        const cmd = frameworks?.length
          ? `amc guide --agent ${agentId} --compliance ${frameworks.join(",")}`
          : `amc guide --agent ${agentId} --compliance`;

        return {
          content: [
            {
              type: "text",
              text: [
                `## AMC Compliance Check: ${agentId}`,
                ``,
                `**Frameworks:** ${fwList}`,
                `**Critical Gaps:** ${report.compliance.criticalGaps}`,
                `**High Gaps:** ${report.compliance.highGaps}`,
                ``,
                `For detailed gap analysis with article references:`,
                `\`${cmd}\``,
                ``,
                `Current trust level: ${report.identity.maturityLabel} — compliance gaps are calculated from dimension scores below target level.`,
              ].join("\n"),
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            { type: "text", text: `Compliance check failed: ${(err as Error).message}` },
          ],
          isError: true,
        };
      }
    }
  );

  // -------------------------------------------------------------------------
  // Tool: amc_transparency_report
  // -------------------------------------------------------------------------
  server.tool(
    "amc_transparency_report",
    "Generate an Agent Transparency Report — a complete picture of what an AI agent does, what it can access, what decisions it can make autonomously, and its trust evidence. Essential for AI governance, audits, and compliance reviews.",
    {
      agentId: z.string().describe("Agent ID to report on"),
      format: z
        .enum(["markdown", "json"])
        .optional()
        .describe("Output format: markdown (default) or json"),
      workspace: z
        .string()
        .optional()
        .describe("Path to the AMC workspace"),
    },
    async ({ agentId, format, workspace }) => {
      const ws = resolve(workspace ?? process.cwd());
      try {
        const report = generateTransparencyReport(agentId, ws);
        const text =
          format === "json"
            ? renderTransparencyReportJson(report)
            : renderTransparencyReportMarkdown(report);

        return { content: [{ type: "text", text }] };
      } catch (err) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to generate transparency report: ${(err as Error).message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // -------------------------------------------------------------------------
  // Tool: amc_score_sector_pack
  // -------------------------------------------------------------------------
  server.tool(
    "amc_score_sector_pack",
    "Score an AI agent against an AMC Sector Pack for a specific industry vertical. Sector Packs provide regulatory-grounded assessment for 40 industry sub-verticals across 7 stations (Environment, Health, Wealth, Education, Mobility, Technology, Governance). Example pack IDs: digital-health-record, clinical-trials, farm-to-fork, dance-of-democracy.",
    {
      packId: z
        .string()
        .describe(
          "Sector Pack ID (e.g. digital-health-record, clinical-trials, farm-to-fork, dance-of-democracy)"
        ),
      responses: z
        .record(z.string(), z.number().min(1).max(5))
        .describe(
          "Map of question ID to maturity level (1-5). Get question IDs from the pack definition."
        ),
    },
    async ({ packId, responses }) => {
      if (!INDUSTRY_PACKS[packId as IndustryPackId]) {
        const available = Object.keys(INDUSTRY_PACKS).slice(0, 10).join(", ");
        return {
          content: [
            {
              type: "text",
              text: `Unknown sector pack: "${packId}"\n\nAvailable packs (first 10): ${available}...\n\nRun \`amc sector packs list\` for the full list.`,
            },
          ],
          isError: true,
        };
      }

      try {
        const result = scoreIndustryPack(packId as IndustryPackId, responses);
        const gapList =
          result.complianceGaps.length > 0
            ? result.complianceGaps.slice(0, 5).map((g) => `  ⚠️ ${g}`).join("\n")
            : "  ✅ No compliance gaps";

        return {
          content: [
            {
              type: "text",
              text: [
                `## AMC Sector Pack Score: ${result.packName}`,
                ``,
                `**Station:** ${result.stationId}`,
                `**Score:** ${result.percentage}%`,
                `**Maturity Level:** L${result.level}`,
                `**Certified:** ${result.certified ? "✅ Yes" : "❌ No (threshold: not met)"}`,
                `**Risk Tier:** ${result.riskTier}`,
                ``,
                `**Compliance Gaps (questions below L3):**`,
                gapList,
                ``,
                result.complianceGaps.length > 5
                  ? `  ...and ${result.complianceGaps.length - 5} more gaps`
                  : "",
              ]
                .filter((l) => l !== "")
                .join("\n"),
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            { type: "text", text: `Scoring failed: ${(err as Error).message}` },
          ],
          isError: true,
        };
      }
    }
  );

  // -------------------------------------------------------------------------
  // Resource: amc://agent/{agentId}
  // -------------------------------------------------------------------------
  server.resource(
    "agent-transparency",
    new ResourceTemplate("amc://agent/{agentId}", { list: undefined }),
    async (uri, { agentId }) => {
      const ws = process.cwd();
      const id = Array.isArray(agentId) ? agentId[0] : agentId;
      try {
        const report = generateTransparencyReport(String(id), ws);
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "text/markdown",
              text: renderTransparencyReportMarkdown(report),
            },
          ],
        };
      } catch (err) {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "text/plain",
              text: `Could not load agent "${String(id)}": ${(err as Error).message}`,
            },
          ],
        };
      }
    }
  );

  // -------------------------------------------------------------------------
  // Start
  // -------------------------------------------------------------------------
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
