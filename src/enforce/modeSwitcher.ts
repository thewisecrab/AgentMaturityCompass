import { emitGuardEvent } from './evidenceEmitter.js';
/**
 * Agent mode controller.
 */

export type AgentMode = 'STANDARD' | 'RESTRICTED' | 'ELEVATED' | 'MAINTENANCE';

const RESTRICTED_ACTIONS = new Set(['execute', 'deploy', 'delete', 'modify_config']);
const MAINTENANCE_ACTIONS = new Set(['health_check', 'status', 'diagnostics']);

export class ModeSwitcher {
  private mode: AgentMode = 'STANDARD';
  private reason = '';

  getMode(): AgentMode {
    return this.mode;
  }

  setMode(mode: AgentMode, reason: string): void {
    this.mode = mode;
    this.reason = reason;
  }

  canExecute(action: string): boolean {
    switch (this.mode) {
      case 'RESTRICTED':
        return !RESTRICTED_ACTIONS.has(action);
      case 'MAINTENANCE':
        return MAINTENANCE_ACTIONS.has(action);
      case 'ELEVATED':
        return true;
      case 'STANDARD':
      default:
        return true;
    }
  }

  getReason(): string {
    return this.reason;
  }
}