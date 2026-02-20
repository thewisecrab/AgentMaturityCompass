/**
 * toolChainBuilder.ts — Tool chain construction with dependency
 * validation, cycle detection, and timeout / retry configuration.
 */

import { randomUUID } from 'node:crypto';

/* ── Interfaces ──────────────────────────────────────────────────── */

export interface ToolChainStep {
  name: string;
  toolId: string;
  config?: Record<string, unknown>;
  dependsOn: string[];
  timeout?: number;
  retryCount?: number;
}

/** Backward-compatible with stubs.ts ToolChain, extended. */
export interface ToolChain {
  chainId: string;
  tools: string[];
  steps: ToolChainStep[];
  validation: ChainValidation;
}

export interface ChainValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/* ── Builder ─────────────────────────────────────────────────────── */

export class ToolChainBuilder {
  private steps = new Map<string, ToolChainStep>();

  addStep(name: string, toolId: string, config?: Record<string, unknown>): this {
    if (this.steps.has(name)) throw new Error(`Step "${name}" already exists`);
    this.steps.set(name, { name, toolId, config, dependsOn: [] });
    return this;
  }

  withDependency(stepName: string, dependsOn: string): this {
    const step = this.steps.get(stepName);
    if (!step) throw new Error(`Step "${stepName}" not found`);
    if (!step.dependsOn.includes(dependsOn)) step.dependsOn.push(dependsOn);
    return this;
  }

  withTimeout(stepName: string, ms: number): this {
    const step = this.steps.get(stepName);
    if (!step) throw new Error(`Step "${stepName}" not found`);
    step.timeout = ms;
    return this;
  }

  withRetry(stepName: string, count: number): this {
    const step = this.steps.get(stepName);
    if (!step) throw new Error(`Step "${stepName}" not found`);
    step.retryCount = count;
    return this;
  }

  /** Validate the chain for missing deps, cycles, and unreachable steps. */
  validate(): ChainValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const names = new Set(this.steps.keys());

    // Check for missing dependencies
    for (const step of this.steps.values()) {
      for (const dep of step.dependsOn) {
        if (!names.has(dep)) errors.push(`Step "${step.name}" depends on unknown step "${dep}"`);
      }
    }

    // Check for circular dependencies (DFS)
    const visited = new Set<string>();
    const inStack = new Set<string>();
    const hasCycle = (name: string): boolean => {
      if (inStack.has(name)) return true;
      if (visited.has(name)) return false;
      visited.add(name);
      inStack.add(name);
      const step = this.steps.get(name);
      if (step) {
        for (const dep of step.dependsOn) {
          if (names.has(dep) && hasCycle(dep)) return true;
        }
      }
      inStack.delete(name);
      return false;
    };
    for (const name of names) {
      visited.clear();
      inStack.clear();
      if (hasCycle(name)) {
        errors.push(`Circular dependency detected involving step "${name}"`);
        break; // one cycle message is sufficient
      }
    }

    // Check for unreachable steps (steps that depend on others but are never depended upon, with no root)
    const roots = [...this.steps.values()].filter(s => s.dependsOn.length === 0);
    if (roots.length === 0 && this.steps.size > 0) {
      warnings.push('No root steps found (all steps have dependencies)');
    }

    // Reachability from roots
    const reachable = new Set<string>();
    const queue = roots.map(r => r.name);
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (reachable.has(current)) continue;
      reachable.add(current);
      for (const step of this.steps.values()) {
        if (step.dependsOn.includes(current)) queue.push(step.name);
      }
    }
    for (const name of names) {
      if (!reachable.has(name)) warnings.push(`Step "${name}" is unreachable from root steps`);
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  build(): ToolChain {
    const validation = this.validate();
    const stepsList = [...this.steps.values()];
    return {
      chainId: randomUUID(),
      tools: stepsList.map(s => s.toolId),
      steps: stepsList,
      validation,
    };
  }
}

/* ── Backward-compatible free function (stubs.ts) ────────────────── */

export function buildToolChain(tools: string[]): ToolChain {
  const builder = new ToolChainBuilder();
  for (const tool of tools) builder.addStep(tool, tool);
  return builder.build();
}
