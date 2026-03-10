/**
 * CLI commands for continuous monitoring (amc watch)
 */

import { Command } from "commander";
import { createContinuousMonitor, globalDashboardFeed, type ContinuousMonitorConfig } from "./watch/index.js";
import { resolveAgentId } from "./fleet/paths.js";
import { cliFormat } from "./cliFormat.js";

export function registerWatchCommands(program: Command): void {
  const watch = program
    .command("watch")
    .description("Continuous production monitoring for agents");

  watch
    .command("start")
    .description("Start continuous monitoring for an agent")
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

      // Register with dashboard feed
      globalDashboardFeed.registerMonitor(agentId, monitor.getMetrics());

      // Event handlers
      monitor.on("started", (data) => {
        console.log(cliFormat.success(`✓ Monitoring started for agent: ${data.agentId}`));
      });

      monitor.on("score", (event) => {
        const data = event.data as { score: number; delta: number | null };
        const deltaStr = data.delta !== null ? ` (${data.delta > 0 ? "+" : ""}${(data.delta * 100).toFixed(1)}%)` : "";
        console.log(cliFormat.info(`📊 Score: ${data.score.toFixed(2)}${deltaStr}`));
        globalDashboardFeed.updateMetrics(agentId, monitor.getMetrics());
        globalDashboardFeed.pushEvent(event);
      });

      monitor.on("drift", (event) => {
        const result = event.data as { triggered: boolean; reasons: string[] };
        if (result.triggered) {
          console.log(cliFormat.warning(`⚠️  Drift detected: ${result.reasons.join(", ")}`));
        }
        globalDashboardFeed.pushEvent(event);
      });

      monitor.on("anomaly", (event) => {
        const anomaly = event.data as { type: string; severity: string; message: string };
        console.log(cliFormat.warning(`🔍 Anomaly [${anomaly.severity}]: ${anomaly.message}`));
        globalDashboardFeed.pushEvent(event);
      });

      monitor.on("alert", (event) => {
        const alert = event.data as { summary: string };
        console.log(cliFormat.error(`🚨 Alert: ${alert.summary}`));
        globalDashboardFeed.pushEvent(event);
      });

      monitor.on("error", (event) => {
        const error = event.data as { code: string; message: string };
        console.error(cliFormat.error(`❌ Error [${error.code}]: ${error.message}`));
      });

      // Start monitoring
      await monitor.start();

      // Keep process alive
      console.log(cliFormat.info("Press Ctrl+C to stop monitoring..."));
      
      process.on("SIGINT", async () => {
        console.log(cliFormat.info("\nStopping monitor..."));
        await monitor.stop();
        globalDashboardFeed.unregisterMonitor(agentId);
        console.log(cliFormat.success("✓ Monitor stopped"));
        process.exit(0);
      });

      // Keep alive
      await new Promise(() => {});
    });

  watch
    .command("status")
    .description("Show monitoring status for all agents")
    .option("--json", "Output as JSON")
    .action((options) => {
      const snapshot = globalDashboardFeed.getSnapshot();

      if (options.json) {
        console.log(JSON.stringify(snapshot, null, 2));
        return;
      }

      console.log(cliFormat.header("Monitoring Status"));
      console.log(`Active monitors: ${snapshot.globalStats.activeMonitors}`);
      console.log(`Total incidents: ${snapshot.globalStats.totalIncidents}`);
      console.log(`Total anomalies: ${snapshot.globalStats.totalAnomalies}`);
      console.log();

      if (Object.keys(snapshot.agents).length === 0) {
        console.log(cliFormat.dim("No active monitors"));
        return;
      }

      for (const [agentId, metrics] of Object.entries(snapshot.agents)) {
        console.log(cliFormat.bold(`Agent: ${agentId}`));
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
    .description("Show recent monitoring events")
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
        console.log(cliFormat.dim("No recent events"));
        return;
      }

      console.log(cliFormat.header(`Recent Events (${events.length})`));
      for (const event of events.slice(-limit)) {
        const timestamp = new Date(event.ts).toISOString();
        const typeIcon = event.type === "score" ? "📊" : event.type === "drift" ? "⚠️" : event.type === "anomaly" ? "🔍" : event.type === "alert" ? "🚨" : "ℹ️";
        console.log(`${typeIcon} [${timestamp}] ${event.type.toUpperCase()} - ${event.agentId}`);
      }
    });

  watch
    .command("metrics")
    .description("Get metrics for a specific agent")
    .option("--agent <id>", "Agent ID")
    .option("--json", "Output as JSON")
    .action((options) => {
      const workspace = process.cwd();
      const agentId = resolveAgentId(workspace, options.agent);
      const metrics = globalDashboardFeed.getAgentMetrics(agentId);

      if (!metrics) {
        console.error(cliFormat.error(`No active monitor for agent: ${agentId}`));
        process.exit(1);
      }

      if (options.json) {
        console.log(JSON.stringify(metrics, null, 2));
        return;
      }

      console.log(cliFormat.header(`Metrics: ${agentId}`));
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
