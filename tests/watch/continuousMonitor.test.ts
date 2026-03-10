import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createContinuousMonitor, type ContinuousMonitorConfig } from "../../src/watch/continuousMonitor.js";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("ContinuousMonitor", () => {
  let workspace: string;

  beforeEach(() => {
    workspace = mkdtempSync(join(tmpdir(), "amc-test-"));
  });

  afterEach(() => {
    rmSync(workspace, { recursive: true, force: true });
  });

  it("should create a monitor with default config", () => {
    const config: ContinuousMonitorConfig = {
      workspace,
      agentId: "test-agent"
    };

    const monitor = createContinuousMonitor(config);
    expect(monitor).toBeDefined();

    const metrics = monitor.getMetrics();
    expect(metrics.agentId).toBe("test-agent");
    expect(metrics.currentScore).toBeNull();
    expect(metrics.uptime).toBe(0);
  });

  it("should emit started event when started", async () => {
    const config: ContinuousMonitorConfig = {
      workspace,
      agentId: "test-agent",
      scoringIntervalMs: 100000,
      driftCheckIntervalMs: 100000
    };

    const monitor = createContinuousMonitor(config);
    
    const startedPromise = new Promise<void>((resolve) => {
      monitor.once("started", (data) => {
        expect(data.agentId).toBe("test-agent");
        resolve();
      });
    });

    await monitor.start();
    await startedPromise;
    await monitor.stop();
  });

  it("should track uptime correctly", async () => {
    const config: ContinuousMonitorConfig = {
      workspace,
      agentId: "test-agent",
      scoringIntervalMs: 100000,
      driftCheckIntervalMs: 100000
    };

    const monitor = createContinuousMonitor(config);
    await monitor.start();

    await new Promise((resolve) => setTimeout(resolve, 100));

    const metrics = monitor.getMetrics();
    expect(metrics.uptime).toBeGreaterThan(0);

    await monitor.stop();
  });
});
