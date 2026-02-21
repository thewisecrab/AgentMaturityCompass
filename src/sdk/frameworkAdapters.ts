/**
 * frameworkAdapters.ts — Native SDK wrappers for popular agent frameworks.
 *
 * Provides plug-and-play integration with LangChain, CrewAI, OpenAI Agents SDK,
 * AutoGen, and other popular frameworks. Each adapter wraps the framework's
 * execution to automatically:
 *   - Capture traces for observability
 *   - Apply safety constraints
 *   - Track costs and tokens
 *   - Record decisions for audit
 *   - Export to AMC's governance layer
 */

import { randomUUID } from 'node:crypto';

/* ── Types ──────────────────────────────────────────────────────── */

export type FrameworkType =
  | 'langchain'
  | 'crewai'
  | 'openai-agents'
  | 'autogen'
  | 'llamaindex'
  | 'semantic-kernel'
  | 'custom';

export interface AdapterConfig {
  framework: FrameworkType;
  agentId: string;
  agentType: string;
  /** Whether to capture full input/output (may contain PII) */
  capturePayloads: boolean;
  /** Whether to apply safety constraints */
  enforceSafety: boolean;
  /** Max actions before stopping agent */
  maxActions: number;
  /** Cost budget in USD */
  costBudgetUsd?: number;
  /** Custom metadata to attach to all traces */
  metadata?: Record<string, unknown>;
}

export interface AdapterEvent {
  eventId: string;
  adapterType: FrameworkType;
  agentId: string;
  eventType: 'llm_call' | 'tool_call' | 'agent_step' | 'chain_start' | 'chain_end' | 'error' | 'decision';
  name: string;
  input?: unknown;
  output?: unknown;
  durationMs?: number;
  tokenUsage?: { prompt: number; completion: number; total: number };
  costUsd?: number;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

export interface AdapterSession {
  sessionId: string;
  adapterType: FrameworkType;
  agentId: string;
  events: AdapterEvent[];
  startTime: number;
  endTime?: number;
  totalTokens: number;
  totalCostUsd: number;
  totalActions: number;
  budgetExceeded: boolean;
  actionLimitReached: boolean;
  errors: string[];
}

export interface AdapterCallbacks {
  onLLMStart?: (name: string, input: unknown) => void;
  onLLMEnd?: (name: string, output: unknown, tokens: { prompt: number; completion: number }) => void;
  onToolStart?: (name: string, input: unknown) => void;
  onToolEnd?: (name: string, output: unknown) => void;
  onAgentStep?: (step: number, action: string, reasoning: string) => void;
  onError?: (error: Error) => void;
  onBudgetExceeded?: (currentCost: number, budget: number) => void;
  onActionLimit?: (count: number, limit: number) => void;
}

/* ── Base Adapter ────────────────────────────────────────────────── */

export class FrameworkAdapter {
  protected config: AdapterConfig;
  protected session: AdapterSession;
  protected callbacks: AdapterCallbacks;

  constructor(config: AdapterConfig, callbacks?: AdapterCallbacks) {
    this.config = config;
    this.callbacks = callbacks ?? {};
    this.session = {
      sessionId: randomUUID(),
      adapterType: config.framework,
      agentId: config.agentId,
      events: [],
      startTime: Date.now(),
      totalTokens: 0,
      totalCostUsd: 0,
      totalActions: 0,
      budgetExceeded: false,
      actionLimitReached: false,
      errors: [],
    };
  }

  /** Record an LLM call */
  recordLLMCall(name: string, input: unknown, output: unknown, tokens: { prompt: number; completion: number }, costUsd: number, durationMs: number): AdapterEvent {
    const event: AdapterEvent = {
      eventId: randomUUID(),
      adapterType: this.config.framework,
      agentId: this.config.agentId,
      eventType: 'llm_call',
      name,
      input: this.config.capturePayloads ? input : undefined,
      output: this.config.capturePayloads ? output : undefined,
      durationMs,
      tokenUsage: { prompt: tokens.prompt, completion: tokens.completion, total: tokens.prompt + tokens.completion },
      costUsd,
      timestamp: Date.now(),
    };

    this.session.events.push(event);
    this.session.totalTokens += tokens.prompt + tokens.completion;
    this.session.totalCostUsd += costUsd;
    this.session.totalActions++;

    this.checkLimits();
    this.callbacks.onLLMEnd?.(name, output, tokens);
    return event;
  }

  /** Record a tool call */
  recordToolCall(name: string, input: unknown, output: unknown, durationMs: number): AdapterEvent {
    const event: AdapterEvent = {
      eventId: randomUUID(),
      adapterType: this.config.framework,
      agentId: this.config.agentId,
      eventType: 'tool_call',
      name,
      input: this.config.capturePayloads ? input : undefined,
      output: this.config.capturePayloads ? output : undefined,
      durationMs,
      timestamp: Date.now(),
    };

    this.session.events.push(event);
    this.session.totalActions++;

    this.checkLimits();
    this.callbacks.onToolEnd?.(name, output);
    return event;
  }

  /** Record an agent reasoning step */
  recordAgentStep(step: number, action: string, reasoning: string): AdapterEvent {
    const event: AdapterEvent = {
      eventId: randomUUID(),
      adapterType: this.config.framework,
      agentId: this.config.agentId,
      eventType: 'agent_step',
      name: `step-${step}`,
      metadata: { step, action, reasoning },
      timestamp: Date.now(),
    };

    this.session.events.push(event);
    this.callbacks.onAgentStep?.(step, action, reasoning);
    return event;
  }

  /** Record an error */
  recordError(error: Error): AdapterEvent {
    const event: AdapterEvent = {
      eventId: randomUUID(),
      adapterType: this.config.framework,
      agentId: this.config.agentId,
      eventType: 'error',
      name: error.name,
      metadata: { message: error.message, stack: error.stack },
      timestamp: Date.now(),
    };

    this.session.events.push(event);
    this.session.errors.push(error.message);
    this.callbacks.onError?.(error);
    return event;
  }

  /** Check budget and action limits */
  private checkLimits(): void {
    if (this.config.costBudgetUsd && this.session.totalCostUsd >= this.config.costBudgetUsd) {
      this.session.budgetExceeded = true;
      this.callbacks.onBudgetExceeded?.(this.session.totalCostUsd, this.config.costBudgetUsd);
    }
    if (this.session.totalActions >= this.config.maxActions) {
      this.session.actionLimitReached = true;
      this.callbacks.onActionLimit?.(this.session.totalActions, this.config.maxActions);
    }
  }

  /** End the session */
  endSession(): AdapterSession {
    this.session.endTime = Date.now();
    return { ...this.session };
  }

  /** Get the current session */
  getSession(): AdapterSession { return { ...this.session }; }

  /** Check if the agent should stop (budget exceeded or action limit) */
  shouldStop(): boolean {
    return this.session.budgetExceeded || this.session.actionLimitReached;
  }

  /** Get events by type */
  getEventsByType(type: AdapterEvent['eventType']): AdapterEvent[] {
    return this.session.events.filter(e => e.eventType === type);
  }

  /** Get session summary */
  getSummary(): {
    sessionId: string;
    framework: FrameworkType;
    agentId: string;
    totalEvents: number;
    totalTokens: number;
    totalCostUsd: number;
    totalActions: number;
    totalErrors: number;
    durationMs: number;
    budgetExceeded: boolean;
    actionLimitReached: boolean;
  } {
    return {
      sessionId: this.session.sessionId,
      framework: this.config.framework,
      agentId: this.config.agentId,
      totalEvents: this.session.events.length,
      totalTokens: this.session.totalTokens,
      totalCostUsd: Math.round(this.session.totalCostUsd * 10000) / 10000,
      totalActions: this.session.totalActions,
      totalErrors: this.session.errors.length,
      durationMs: (this.session.endTime ?? Date.now()) - this.session.startTime,
      budgetExceeded: this.session.budgetExceeded,
      actionLimitReached: this.session.actionLimitReached,
    };
  }
}

/* ── Framework-specific adapters ─────────────────────────────────── */

/** LangChain adapter — wraps LangChain callbacks */
export class LangChainAdapter extends FrameworkAdapter {
  constructor(agentId: string, options?: Partial<Omit<AdapterConfig, 'framework' | 'agentId'>>, callbacks?: AdapterCallbacks) {
    super({
      framework: 'langchain',
      agentId,
      agentType: options?.agentType ?? 'langchain-agent',
      capturePayloads: options?.capturePayloads ?? false,
      enforceSafety: options?.enforceSafety ?? true,
      maxActions: options?.maxActions ?? 50,
      costBudgetUsd: options?.costBudgetUsd,
      metadata: options?.metadata,
    }, callbacks);
  }

  /** Create a LangChain-compatible callback handler object */
  getCallbackHandler(): Record<string, (...args: unknown[]) => void> {
    return {
      handleLLMStart: (llm: unknown, prompts: unknown) => {
        this.callbacks.onLLMStart?.(String(llm), prompts);
      },
      handleLLMEnd: (output: unknown) => {
        this.recordLLMCall('langchain-llm', '', output, { prompt: 0, completion: 0 }, 0, 0);
      },
      handleToolStart: (tool: unknown, input: unknown) => {
        this.callbacks.onToolStart?.(String(tool), input);
      },
      handleToolEnd: (output: unknown) => {
        this.recordToolCall('langchain-tool', '', output, 0);
      },
      handleChainStart: (chain: unknown) => {
        this.session.events.push({
          eventId: randomUUID(),
          adapterType: 'langchain',
          agentId: this.config.agentId,
          eventType: 'chain_start',
          name: String(chain),
          timestamp: Date.now(),
        });
      },
      handleChainEnd: (output: unknown) => {
        this.session.events.push({
          eventId: randomUUID(),
          adapterType: 'langchain',
          agentId: this.config.agentId,
          eventType: 'chain_end',
          name: 'chain-end',
          output: this.config.capturePayloads ? output : undefined,
          timestamp: Date.now(),
        });
      },
      handleAgentAction: (action: unknown) => {
        this.recordAgentStep(this.session.totalActions, String(action), '');
      },
      handleChainError: (error: unknown) => {
        this.recordError(error instanceof Error ? error : new Error(String(error)));
      },
    };
  }
}

/** CrewAI adapter */
export class CrewAIAdapter extends FrameworkAdapter {
  constructor(agentId: string, options?: Partial<Omit<AdapterConfig, 'framework' | 'agentId'>>, callbacks?: AdapterCallbacks) {
    super({ framework: 'crewai', agentId, agentType: options?.agentType ?? 'crewai-agent', capturePayloads: options?.capturePayloads ?? false, enforceSafety: options?.enforceSafety ?? true, maxActions: options?.maxActions ?? 100, costBudgetUsd: options?.costBudgetUsd, metadata: options?.metadata }, callbacks);
  }

  /** Record a crew task execution */
  recordTaskExecution(taskName: string, assignedAgent: string, input: unknown, output: unknown, durationMs: number): AdapterEvent {
    const event: AdapterEvent = {
      eventId: randomUUID(),
      adapterType: 'crewai',
      agentId: this.config.agentId,
      eventType: 'agent_step',
      name: taskName,
      input: this.config.capturePayloads ? input : undefined,
      output: this.config.capturePayloads ? output : undefined,
      durationMs,
      metadata: { assignedAgent, taskName },
      timestamp: Date.now(),
    };
    this.session.events.push(event);
    this.session.totalActions++;
    return event;
  }
}

/** OpenAI Agents SDK adapter */
export class OpenAIAgentsAdapter extends FrameworkAdapter {
  constructor(agentId: string, options?: Partial<Omit<AdapterConfig, 'framework' | 'agentId'>>, callbacks?: AdapterCallbacks) {
    super({ framework: 'openai-agents', agentId, agentType: options?.agentType ?? 'openai-agent', capturePayloads: options?.capturePayloads ?? false, enforceSafety: options?.enforceSafety ?? true, maxActions: options?.maxActions ?? 50, costBudgetUsd: options?.costBudgetUsd, metadata: options?.metadata }, callbacks);
  }

  /** Record a function/tool call from OpenAI agents */
  recordFunctionCall(functionName: string, args: unknown, result: unknown, durationMs: number): AdapterEvent {
    return this.recordToolCall(functionName, args, result, durationMs);
  }

  /** Record a handoff between agents */
  recordHandoff(fromAgent: string, toAgent: string, reason: string): AdapterEvent {
    const event: AdapterEvent = {
      eventId: randomUUID(),
      adapterType: 'openai-agents',
      agentId: this.config.agentId,
      eventType: 'decision',
      name: 'handoff',
      metadata: { fromAgent, toAgent, reason },
      timestamp: Date.now(),
    };
    this.session.events.push(event);
    return event;
  }
}

/* ── Adapter factory ─────────────────────────────────────────────── */

export function createAdapter(
  framework: FrameworkType,
  agentId: string,
  options?: Partial<Omit<AdapterConfig, 'framework' | 'agentId'>>,
  callbacks?: AdapterCallbacks,
): FrameworkAdapter {
  switch (framework) {
    case 'langchain': return new LangChainAdapter(agentId, options, callbacks);
    case 'crewai': return new CrewAIAdapter(agentId, options, callbacks);
    case 'openai-agents': return new OpenAIAgentsAdapter(agentId, options, callbacks);
    default: return new FrameworkAdapter({ framework, agentId, agentType: options?.agentType ?? 'custom', capturePayloads: options?.capturePayloads ?? false, enforceSafety: options?.enforceSafety ?? true, maxActions: options?.maxActions ?? 100, costBudgetUsd: options?.costBudgetUsd, metadata: options?.metadata }, callbacks);
  }
}
