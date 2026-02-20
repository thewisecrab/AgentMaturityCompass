/**
 * devSandbox.ts — Development sandbox for testing agent configurations.
 *
 * Provides isolated sandbox sessions where agent configurations can be
 * tested without affecting production. Supports snapshotting, rollback,
 * and event logging within each session.
 */

import { randomUUID } from 'node:crypto';

/* ── Interfaces ────────────────────────────────────────────────────── */

export interface SandboxConfig {
  language: string;
  timeout: number;
  maxExecutions: number;
  allowNetwork: boolean;
  allowFileSystem: boolean;
  environment: Record<string, string>;
}

export interface SandboxEvent {
  eventId: string;
  type: 'execution' | 'snapshot' | 'rollback' | 'config_change' | 'error';
  description: string;
  data: Record<string, unknown>;
  timestamp: number;
}

export interface SandboxSnapshot {
  snapshotId: string;
  sandboxId: string;
  label: string;
  config: SandboxConfig;
  state: Record<string, unknown>;
  output: string[];
  createdAt: number;
}

export interface Sandbox {
  id: string;
  config: SandboxConfig;
  active: boolean;
  createdAt: number;
  output: string[];
  state: Record<string, unknown>;
  events: SandboxEvent[];
  snapshots: SandboxSnapshot[];
  executionCount: number;
  lastActivityAt: number;
}

export interface SandboxSession {
  sessionId: string;
  active: boolean;
}

export interface ExecutionResult {
  executionId: string;
  sandboxId: string;
  output: string;
  lineCount: number;
  hasErrors: boolean;
  durationMs: number;
}

/* ── Default config ────────────────────────────────────────────────── */

function defaultConfig(overrides?: Partial<SandboxConfig>): SandboxConfig {
  return {
    language: 'typescript',
    timeout: 30000,
    maxExecutions: 100,
    allowNetwork: false,
    allowFileSystem: false,
    environment: {},
    ...overrides,
  };
}

/* ── DevSandboxManager ─────────────────────────────────────────────── */

export class DevSandboxManager {
  private sandboxes = new Map<string, Sandbox>();

  createDevSandbox(config?: Partial<SandboxConfig>): Sandbox {
    const now = Date.now();
    const sb: Sandbox = {
      id: randomUUID(),
      config: defaultConfig(config),
      active: true,
      createdAt: now,
      output: [],
      state: {},
      events: [],
      snapshots: [],
      executionCount: 0,
      lastActivityAt: now,
    };
    this.sandboxes.set(sb.id, sb);
    this.addEvent(sb.id, 'config_change', 'Sandbox created', { config: sb.config });
    return sb;
  }

  runCode(sandboxId: string, code: string): ExecutionResult {
    const sb = this.sandboxes.get(sandboxId);
    const executionId = randomUUID();

    if (!sb || !sb.active) {
      throw new Error('Sandbox not found or inactive');
    }

    if (sb.executionCount >= sb.config.maxExecutions) {
      throw new Error(`Max executions (${sb.config.maxExecutions}) reached`);
    }

    const t0 = performance.now();
    const lines = code.split('\n').length;
    const hasErrors = /\b(throw|error|undefined)\b/i.test(code);
    const output = `[${sb.config.language}] Analyzed ${lines} lines. ${hasErrors ? 'Potential errors detected.' : 'No obvious issues.'}`;

    sb.output.push(output);
    sb.executionCount++;
    sb.lastActivityAt = Date.now();
    const durationMs = Math.round(performance.now() - t0);

    this.addEvent(sandboxId, 'execution', `Execution #${sb.executionCount}`, {
      executionId, lineCount: lines, hasErrors, durationMs,
    });

    return { executionId, sandboxId, output, lineCount: lines, hasErrors, durationMs };
  }

  inspectSandbox(sandboxId: string): Sandbox | undefined {
    return this.sandboxes.get(sandboxId);
  }

  listSandboxes(activeOnly = false): Sandbox[] {
    const all = [...this.sandboxes.values()];
    if (activeOnly) return all.filter(s => s.active);
    return all;
  }

  destroySandbox(sandboxId: string): boolean {
    const sb = this.sandboxes.get(sandboxId);
    if (!sb) return false;
    sb.active = false;
    sb.lastActivityAt = Date.now();
    this.addEvent(sandboxId, 'config_change', 'Sandbox destroyed', {});
    return true;
  }

  /** Update sandbox state */
  setState(sandboxId: string, key: string, value: unknown): boolean {
    const sb = this.sandboxes.get(sandboxId);
    if (!sb || !sb.active) return false;
    sb.state[key] = value;
    sb.lastActivityAt = Date.now();
    return true;
  }

  /** Get sandbox state */
  getState(sandboxId: string): Record<string, unknown> | undefined {
    return this.sandboxes.get(sandboxId)?.state;
  }

  /** Update sandbox config */
  updateConfig(sandboxId: string, updates: Partial<SandboxConfig>): SandboxConfig | undefined {
    const sb = this.sandboxes.get(sandboxId);
    if (!sb || !sb.active) return undefined;
    const oldConfig = { ...sb.config };
    Object.assign(sb.config, updates);
    sb.lastActivityAt = Date.now();
    this.addEvent(sandboxId, 'config_change', 'Config updated', { oldConfig, newConfig: sb.config });
    return sb.config;
  }

  /** Create a snapshot of the current sandbox state */
  createSnapshot(sandboxId: string, label?: string): SandboxSnapshot | undefined {
    const sb = this.sandboxes.get(sandboxId);
    if (!sb) return undefined;
    const snapshot: SandboxSnapshot = {
      snapshotId: randomUUID(),
      sandboxId,
      label: label ?? `snapshot-${sb.snapshots.length + 1}`,
      config: { ...sb.config, environment: { ...sb.config.environment } },
      state: structuredClone(sb.state),
      output: [...sb.output],
      createdAt: Date.now(),
    };
    sb.snapshots.push(snapshot);
    sb.lastActivityAt = Date.now();
    this.addEvent(sandboxId, 'snapshot', `Snapshot created: ${snapshot.label}`, { snapshotId: snapshot.snapshotId });
    return snapshot;
  }

  /** Rollback to a previous snapshot */
  rollbackToSnapshot(sandboxId: string, snapshotId: string): boolean {
    const sb = this.sandboxes.get(sandboxId);
    if (!sb) return false;
    const snapshot = sb.snapshots.find(s => s.snapshotId === snapshotId);
    if (!snapshot) return false;
    sb.config = { ...snapshot.config, environment: { ...snapshot.config.environment } };
    sb.state = structuredClone(snapshot.state);
    sb.output = [...snapshot.output];
    sb.lastActivityAt = Date.now();
    this.addEvent(sandboxId, 'rollback', `Rolled back to: ${snapshot.label}`, { snapshotId });
    return true;
  }

  /** Get events for a sandbox */
  getEvents(sandboxId: string, limit?: number): SandboxEvent[] {
    const sb = this.sandboxes.get(sandboxId);
    if (!sb) return [];
    if (limit) return sb.events.slice(-limit);
    return sb.events;
  }

  /** Get snapshots for a sandbox */
  getSnapshots(sandboxId: string): SandboxSnapshot[] {
    return this.sandboxes.get(sandboxId)?.snapshots ?? [];
  }

  private addEvent(sandboxId: string, type: SandboxEvent['type'], description: string, data: Record<string, unknown>): void {
    const sb = this.sandboxes.get(sandboxId);
    if (!sb) return;
    sb.events.push({
      eventId: randomUUID(),
      type, description, data,
      timestamp: Date.now(),
    });
  }
}

/* ── Backward-compat stub function ─────────────────────────────────── */

export function createDevSandbox(): SandboxSession {
  return { sessionId: randomUUID(), active: true };
}

/* ── Singleton ─────────────────────────────────────────────────────── */

let _manager: DevSandboxManager | undefined;

export function getDevSandboxManager(): DevSandboxManager {
  if (!_manager) _manager = new DevSandboxManager();
  return _manager;
}
