import { randomUUID } from 'node:crypto';

export interface SandboxConfig { language: string; timeout: number; }
export interface Sandbox { id: string; config: SandboxConfig; active: boolean; createdAt: number; output: string[]; }
export interface SandboxSession { sessionId: string; active: boolean; }

export class DevSandboxManager {
  private sandboxes = new Map<string, Sandbox>();

  createDevSandbox(config: SandboxConfig): Sandbox {
    const sb: Sandbox = { id: randomUUID(), config, active: true, createdAt: Date.now(), output: [] };
    this.sandboxes.set(sb.id, sb);
    return sb;
  }

  runCode(sandboxId: string, code: string): { output: string; lineCount: number; hasErrors: boolean } {
    const sb = this.sandboxes.get(sandboxId);
    if (!sb || !sb.active) throw new Error('Sandbox not found or inactive');
    const lines = code.split('\n').length;
    const hasErrors = /\b(throw|error|undefined)\b/i.test(code);
    const output = `[${sb.config.language}] Analyzed ${lines} lines. ${hasErrors ? 'Potential errors detected.' : 'No obvious issues.'}`;
    sb.output.push(output);
    return { output, lineCount: lines, hasErrors };
  }

  inspectSandbox(sandboxId: string): Sandbox | undefined { return this.sandboxes.get(sandboxId); }

  destroySandbox(sandboxId: string): boolean {
    const sb = this.sandboxes.get(sandboxId);
    if (!sb) return false;
    sb.active = false;
    return true;
  }
}

export function createDevSandbox(): SandboxSession {
  return { sessionId: randomUUID(), active: true };
}
