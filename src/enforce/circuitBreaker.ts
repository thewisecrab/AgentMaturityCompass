import { emitGuardEvent } from './evidenceEmitter.js';
/**
 * Per-session circuit breaker.
 */


export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerConfig {
  maxCalls?: number;
  maxTokens?: number;
  windowMs?: number;
}

export interface CircuitCheckResult {
  allowed: boolean;
  state: CircuitState;
  hardKilled: boolean;
}

interface SessionState {
  calls: number;
  tokens: number;
  openedAt?: number;
  startedAt: number;
}

const DEFAULT_CONFIG: Required<CircuitBreakerConfig> = {
  maxCalls: 100,
  maxTokens: 100000,
  windowMs: 60000,
};

export class CircuitBreaker {
  private sessions = new Map<string, SessionState>();
  private config: Required<CircuitBreakerConfig>;

  constructor(config?: CircuitBreakerConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  check(sessionId: string, cost?: { calls?: number; tokens?: number }): CircuitCheckResult {
    let state = this.sessions.get(sessionId);
    if (!state) {
      state = { calls: 0, tokens: 0, startedAt: Date.now() };
      this.sessions.set(sessionId, state);
    }

    // Reset window if expired
    if (Date.now() - state.startedAt > this.config.windowMs) {
      state.calls = 0;
      state.tokens = 0;
      state.startedAt = Date.now();
      state.openedAt = undefined;
    }

    // If already open, check half-open
    if (state.openedAt) {
      if (Date.now() - state.openedAt > this.config.windowMs) {
        return { allowed: true, state: 'half-open', hardKilled: false };
      }
      return { allowed: false, state: 'open', hardKilled: true };
    }

    state.calls += cost?.calls ?? 1;
    state.tokens += cost?.tokens ?? 0;

    if (state.calls > this.config.maxCalls || state.tokens > this.config.maxTokens) {
      state.openedAt = Date.now();
      emitGuardEvent({ agentId: sessionId, moduleCode: 'E7', decision: 'deny', reason: 'Circuit breaker opened', severity: 'high', meta: { calls: state.calls, tokens: state.tokens } });
      return { allowed: false, state: 'open', hardKilled: true };
    }

    return { allowed: true, state: 'closed', hardKilled: false };
  }

  reset(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  getState(sessionId: string): CircuitState {
    const state = this.sessions.get(sessionId);
    if (!state || !state.openedAt) return 'closed';
    if (Date.now() - state.openedAt > this.config.windowMs) return 'half-open';
    return 'open';
  }
}
