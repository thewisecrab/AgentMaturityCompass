/**
 * taskSpecBuilder.ts — Fluent builder for task specifications with
 * priority, deadline, agent type, and acceptance criteria.
 */

import { randomUUID } from 'node:crypto';

/* ── Interfaces ──────────────────────────────────────────────────── */

/** Backward-compatible with stubs.ts TaskSpec, extended with new fields. */
export interface TaskSpec {
  specId: string;
  description: string;
  constraints: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline?: number;
  agentType?: string;
  inputs: string[];
  outputs: string[];
  acceptanceCriteria: string[];
  createdAt: number;
}

/* ── Builder ─────────────────────────────────────────────────────── */

export class TaskSpecBuilder {
  private _description = '';
  private _constraints: string[] = [];
  private _priority: TaskSpec['priority'] = 'medium';
  private _deadline?: number;
  private _agentType?: string;
  private _inputs: string[] = [];
  private _outputs: string[] = [];
  private _acceptanceCriteria: string[] = [];

  withDescription(desc: string): this {
    this._description = desc;
    return this;
  }

  withConstraints(constraints: string[]): this {
    this._constraints = [...constraints];
    return this;
  }

  withPriority(priority: TaskSpec['priority']): this {
    this._priority = priority;
    return this;
  }

  withDeadline(deadline: number): this {
    this._deadline = deadline;
    return this;
  }

  withAgentType(agentType: string): this {
    this._agentType = agentType;
    return this;
  }

  withInputs(inputs: string[]): this {
    this._inputs = [...inputs];
    return this;
  }

  withOutputs(outputs: string[]): this {
    this._outputs = [...outputs];
    return this;
  }

  withAcceptanceCriteria(criteria: string[]): this {
    this._acceptanceCriteria = [...criteria];
    return this;
  }

  build(): TaskSpec {
    if (!this._description) throw new Error('TaskSpec requires a description');
    return {
      specId: randomUUID(),
      description: this._description,
      constraints: this._constraints,
      priority: this._priority,
      deadline: this._deadline,
      agentType: this._agentType,
      inputs: this._inputs,
      outputs: this._outputs,
      acceptanceCriteria: this._acceptanceCriteria,
      createdAt: Date.now(),
    };
  }
}

/* ── Backward-compatible free function (stubs.ts) ────────────────── */

export function createTaskSpec(description: string, constraints?: string[]): TaskSpec {
  return new TaskSpecBuilder()
    .withDescription(description)
    .withConstraints(constraints ?? [])
    .build();
}
