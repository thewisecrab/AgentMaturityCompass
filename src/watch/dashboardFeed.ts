/**
 * Dashboard Metrics Feed for Real-time Monitoring
 * 
 * Provides a streaming metrics API for dashboard consumption.
 * Supports WebSocket and Server-Sent Events (SSE).
 */

import { EventEmitter } from "node:events";
import type { MonitoringMetrics, MonitoringEvent } from "./continuousMonitor.js";

export interface DashboardMetricsSnapshot {
  ts: number;
  agents: Record<string, MonitoringMetrics>;
  globalStats: {
    totalAgents: number;
    activeMonitors: number;
    totalIncidents: number;
    totalAnomalies: number;
  };
}

export class DashboardFeed extends EventEmitter {
  private monitors: Map<string, MonitoringMetrics> = new Map();
  private eventBuffer: MonitoringEvent[] = [];
  private maxBufferSize = 1000;

  registerMonitor(agentId: string, metrics: MonitoringMetrics): void {
    this.monitors.set(agentId, metrics);
    this.emit("monitor_registered", { agentId, ts: Date.now() });
  }

  unregisterMonitor(agentId: string): void {
    this.monitors.delete(agentId);
    this.emit("monitor_unregistered", { agentId, ts: Date.now() });
  }

  updateMetrics(agentId: string, metrics: MonitoringMetrics): void {
    this.monitors.set(agentId, metrics);
    this.emit("metrics_updated", { agentId, metrics, ts: Date.now() });
  }

  pushEvent(event: MonitoringEvent): void {
    this.eventBuffer.push(event);
    
    // Keep buffer size under control
    if (this.eventBuffer.length > this.maxBufferSize) {
      this.eventBuffer = this.eventBuffer.slice(-this.maxBufferSize);
    }

    this.emit("event", event);
  }

  getSnapshot(): DashboardMetricsSnapshot {
    const agents: Record<string, MonitoringMetrics> = {};
    let totalIncidents = 0;
    let totalAnomalies = 0;

    for (const [agentId, metrics] of this.monitors.entries()) {
      agents[agentId] = metrics;
      totalIncidents += metrics.activeIncidents;
      totalAnomalies += metrics.anomaliesDetected;
    }

    return {
      ts: Date.now(),
      agents,
      globalStats: {
        totalAgents: this.monitors.size,
        activeMonitors: this.monitors.size,
        totalIncidents,
        totalAnomalies
      }
    };
  }

  getRecentEvents(limit = 100): MonitoringEvent[] {
    return this.eventBuffer.slice(-limit);
  }

  getAgentMetrics(agentId: string): MonitoringMetrics | null {
    return this.monitors.get(agentId) ?? null;
  }

  toJSON(): DashboardMetricsSnapshot {
    return this.getSnapshot();
  }
}

export const globalDashboardFeed = new DashboardFeed();
