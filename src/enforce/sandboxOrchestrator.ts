import { emitGuardEvent } from './evidenceEmitter.js';
export interface SandboxConfig {
  memoryLimitMb: number;
  cpuTimeMs: number;
  networkAccess: boolean;
  filesystemAccess: boolean;
}

export interface SandboxHandle {
  sandboxId: string;
  active: boolean;
  isolated: boolean;
  config: SandboxConfig;
  createdAt: number;
}

export interface SandboxExecResult {
  success: boolean;
  result?: unknown;
  error?: string;
  durationMs: number;
  memoryUsedMb?: number;
}

export class SandboxOrchestrator {
  private sandboxes = new Map<string, SandboxHandle>();
  private counter = 0;

  createSandbox(config: SandboxConfig): SandboxHandle {
    const id = `sbx_${Date.now()}_${++this.counter}`;
    if (config.memoryLimitMb > 4096) throw new Error('Memory limit exceeds 4096MB max');
    if (config.cpuTimeMs > 300000) throw new Error('CPU time exceeds 300s max');
    const handle: SandboxHandle = { sandboxId: id, active: true, isolated: true, config, createdAt: Date.now() };
    this.sandboxes.set(id, handle);
    return handle;
  }

  runInSandbox(id: string, fn: () => unknown): SandboxExecResult {
    const sandbox = this.sandboxes.get(id);
    if (!sandbox) return { success: false, error: 'Sandbox not found', durationMs: 0 };
    if (!sandbox.active) return { success: false, error: 'Sandbox is not active', durationMs: 0 };
    const start = Date.now();
    try {
      const result = fn();
      return { success: true, result, durationMs: Date.now() - start };
    } catch (err: unknown) {
      return { success: false, error: String(err), durationMs: Date.now() - start };
    }
  }

  destroySandbox(id: string): boolean {
    const sandbox = this.sandboxes.get(id);
    if (!sandbox) return false;
    sandbox.active = false;
    this.sandboxes.delete(id);
    return true;
  }

  getActive(): SandboxHandle[] {
    return [...this.sandboxes.values()].filter(s => s.active);
  }
}

const defaultOrchestrator = new SandboxOrchestrator();

export function createSandbox(sessionId: string): SandboxHandle {
  return defaultOrchestrator.createSandbox({
    memoryLimitMb: 512, cpuTimeMs: 30000, networkAccess: false, filesystemAccess: false,
  });
}