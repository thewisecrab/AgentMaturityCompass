/**
 * CLI commands for continuous monitoring (amc watch)
 * 
 * `amc watch` is a backward-compatible alias for `amc monitor`.
 * The canonical commands now live under `amc monitor start|check|status|events|metrics`.
 */

import chalk from "chalk";
import { Command } from "commander";
import { createContinuousMonitor, globalDashboardFeed, type ContinuousMonitorConfig } from "./watch/index.js";
import { resolveAgentId } from "./fleet/paths.js";
import * as fmt from "./cliFormat.js";

export function registerWatchCommands(_program: Command): void {
  // Disabled: watch/monitor commands are already registered in cli.ts directly.
  return;
  const watch = _program
    .command("monitor-legacy")
    .description("Continuous production monitoring for agents (alias for 'amc monitor')");

  watch
    .command("start")
    .description("Start continuous monitoring for an agent (alias: use 'amc monitor start')")
    .option("--agent <id>", "Agent ID to monitor")
    .option("--scoring-interval <ms>", "Scoring interval in milliseconds", "300000")
    .option("--drift-interval <ms>", "Drift check interval in milliseconds", "900000")
    .option("--score-drop-threshold <n>", "Score drop alert threshold (0-1)", "0.1")
    .option("--no-webhooks", "Disable webhook notifications")
    .action(async (options) => {
      const workspace = process.cwd();
      const agentId = resolveAgentId(workspace, options.agent);

      const config: ContinuousMonitorConfig = {
        workspace,
        agentId,
        scoringIntervalMs: parseInt(options.scoringInterval, 10),
        driftCheckIntervalMs: parseInt(options.driftInterval, 10),
        scoreDropThreshold: parseFloat(options.scoreDropThreshold),
        enableWebhooks: options.webhooks
      };

      const monitor = createContinuousMonitor(config);
      globalDashboardFeed.registerMonitor(agentId, monitor.getMetrics());

      monitor.on("started", (data: { agentId: string }) => {
        console.log(chalk.green(`  ✓ Monitoring started for agent: ${data.agentId}`));
      });

      monitor.on("score", (event: { data: { score: number; delta: number | null } }) => {
        const d = event.data;
        const deltaStr = d.delta !== null ? ` (${d.delta > 0 ? "+" : ""}${(d.delta * 100).toFixed(1)}%)` : "";
        console.log(fmt.info(`📊 Score: ${d.score.toFixed(2)}${deltaStr}`));
        globalDashboardFeed.updateMetrics(agentId, monitor.getMetrics());
        globalDashboardFeed.pushEvent(event as never);
      });

      monitor.on("drift", (event: { data: { triggered: boolean; reasons: string[] } }) => {
        if (event.data.triggered) {
          console.log(fmt.warn(`⚠️  Drift detected: ${event.data.reasons.join(", ")}`));
        }
        globalDashboardFeed.pushEvent(event as never);
      });

      monitor.on("anomaly", (event: { data: { type: string; severity: string; message: string } }) => {
        console.log(fmt.warn(`🔍 Anomaly [${event.data.severity}]: ${event.data.message}`));
        globalDashboardFeed.pushEvent(event as never);
      });

      monitor.on("alert", (event: { data: { summary: string } }) => {
        console.log(chalk.red(`  🚨 Alert: ${event.data.summary}`));
        globalDashboardFeed.pushEvent(event as never);
      });

      monitor.on("error", (event: { data: { code: string; message: string } }) => {
        console.error(chalk.red(`  ❌ Error [${event.data.code}]: ${event.data.message}`));
      });

      await monitor.start();

      console.log(fmt.info("Press Ctrl+C to stop monitoring..."));
      
      process.on("SIGINT", async () => {
        console.log(fmt.info("Stopping monitor..."));
        await monitor.stop();
        globalDashboardFeed.unregisterMonitor(agentId);
        console.log(chalk.green("  ✓ Monitor stopped"));
        process.exit(0);
      });

      await new Promise(() => {});
    });

  watch
    .command("status")
    .description("Show monitoring status (alias: use 'amc monitor status')")
    .option("--json", "Output as JSON")
    .action((options) => {
      const snapshot = globalDashboardFeed.getSnapshot();

      if (options.json) {
        console.log(JSON.stringify(snapshot, null, 2));
        return;
      }

      console.log(fmt.header("Monitoring Status"));
      console.log(`Active monitors: ${snapshot.globalStats.activeMonitors}`);
      console.log(`Total incidents: ${snapshot.globalStats.totalIncidents}`);
      console.log(`Total anomalies: ${snapshot.globalStats.totalAnomalies}`);
      console.log();

      if (Object.keys(snapshot.agents).length === 0) {
        console.log(chalk.gray("No active monitors"));
        return;
      }

      for (const [agentId, metrics] of Object.entries(snapshot.agents)) {
        console.log(chalk.bold(`Agent: ${agentId}`));
        console.log(`  Current score: ${metrics.currentScore?.toFixed(2) ?? "N/A"}`);
        console.log(`  Score delta: ${metrics.scoreDelta !== null ? `${metrics.scoreDelta > 0 ? "+" : ""}${(metrics.scoreDelta * 100).toFixed(1)}%` : "N/A"}`);
        console.log(`  Last scored: ${metrics.lastScoredAt ? new Date(metrics.lastScoredAt).toISOString() : "N/A"}`);
        console.log(`  Active incidents: ${metrics.activeIncidents}`);
        console.log(`  Anomalies detected: ${metrics.anomaliesDetected}`);
        console.log(`  Uptime: ${(metrics.uptime / 1000 / 60).toFixed(1)} minutes`);
        console.log();
      }
    });

  watch
    .command("events")
    .description("Show recent events (alias: use 'amc monitor events')")
    .option("--limit <n>", "Number of events to show", "20")
    .option("--json", "Output as JSON")
    .action((options) => {
      const limit = parseInt(options.limit, 10);
      const events = globalDashboardFeed.getRecentEvents(limit);

      if (options.json) {
        console.log(JSON.stringify(events, null, 2));
        return;
      }

      if (events.length === 0) {
        console.log(chalk.gray("No recent events"));
        return;
      }

      console.log(fmt.header(`Recent Events (${events.length})`));
      for (const event of events.slice(-limit)) {
        const timestamp = new Date(event.ts).toISOString();
        const typeIcon = event.type === "score" ? "📊" : event.type === "drift" ? "⚠️" : event.type === "anomaly" ? "🔍" : event.type === "alert" ? "🚨" : "ℹ️";
        console.log(`${typeIcon} [${timestamp}] ${event.type.toUpperCase()} - ${event.agentId}`);
      }
    });

  watch
    .command("metrics")
    .description("Get agent metrics (alias: use 'amc monitor metrics')")
    .option("--agent <id>", "Agent ID")
    .option("--json", "Output as JSON")
    .action((options) => {
      const workspace = process.cwd();
      const agentId = resolveAgentId(workspace, options.agent);
      const metrics = globalDashboardFeed.getAgentMetrics(agentId);

      if (!metrics) {
        console.error(chalk.red(`  No active monitor for agent: ${agentId}`));
        process.exit(1);
      }

      if (options.json) {
        console.log(JSON.stringify(metrics, null, 2));
        return;
      }

      console.log(fmt.header(`Metrics: ${agentId}`));
      console.log(`Current score: ${metrics.currentScore?.toFixed(2) ?? "N/A"}`);
      console.log(`Previous score: ${metrics.previousScore?.toFixed(2) ?? "N/A"}`);
      console.log(`Score delta: ${metrics.scoreDelta !== null ? `${metrics.scoreDelta > 0 ? "+" : ""}${(metrics.scoreDelta * 100).toFixed(1)}%` : "N/A"}`);
      console.log(`Last scored: ${metrics.lastScoredAt ? new Date(metrics.lastScoredAt).toISOString() : "N/A"}`);
      console.log(`Last drift check: ${metrics.lastDriftCheckAt ? new Date(metrics.lastDriftCheckAt).toISOString() : "N/A"}`);
      console.log(`Active incidents: ${metrics.activeIncidents}`);
      console.log(`Anomalies detected: ${metrics.anomaliesDetected}`);
      console.log(`Total scores: ${metrics.totalScores}`);
      console.log(`Uptime: ${(metrics.uptime / 1000 / 60).toFixed(1)} minutes`);
    });
}
