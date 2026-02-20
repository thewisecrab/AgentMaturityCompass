/**
 * agentBase.ts — Abstract base class for AMC-governed autonomous agents.
 */

export interface AgentConfig {
  id: string;
  name: string;
  type: string;
  governanceEnabled: boolean;
  maxActionsPerRun: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface AgentDecision {
  action: string;
  confidence: number;
  reasoning: string;
  blocked: boolean;
  blockReason?: string;
}

export interface AgentStats {
  actionsExecuted: number;
  actionsBlocked: number;
  errorsEncountered: number;
  startedAt: number;
  lastActionAt?: number;
}

export abstract class AMCAgentBase {
  protected config: AgentConfig;
  protected stats: AgentStats;

  constructor(config: Partial<AgentConfig> & { name: string; type: string }) {
    this.config = {
      id: config.id ?? `agent-${Date.now()}`,
      name: config.name,
      type: config.type,
      governanceEnabled: config.governanceEnabled ?? true,
      maxActionsPerRun: config.maxActionsPerRun ?? 100,
      logLevel: config.logLevel ?? 'info',
    };
    this.stats = {
      actionsExecuted: 0,
      actionsBlocked: 0,
      errorsEncountered: 0,
      startedAt: Date.now(),
    };
  }

  /** Execute a governed action */
  protected async executeAction(action: string, execute: () => Promise<unknown>): Promise<AgentDecision> {
    if (this.stats.actionsExecuted >= this.config.maxActionsPerRun) {
      this.stats.actionsBlocked++;
      return { action, confidence: 0, reasoning: 'Max actions exceeded', blocked: true, blockReason: 'Action limit reached' };
    }

    try {
      await execute();
      this.stats.actionsExecuted++;
      this.stats.lastActionAt = Date.now();
      return { action, confidence: 1, reasoning: 'Action completed successfully', blocked: false };
    } catch (err) {
      this.stats.errorsEncountered++;
      return {
        action, confidence: 0,
        reasoning: `Error: ${err instanceof Error ? err.message : String(err)}`,
        blocked: true, blockReason: 'Execution error',
      };
    }
  }

  /** Abstract method — implement the agent's core logic */
  abstract run(input: unknown): Promise<unknown>;

  getStats(): AgentStats { return { ...this.stats }; }
  getConfig(): AgentConfig { return { ...this.config }; }
}
