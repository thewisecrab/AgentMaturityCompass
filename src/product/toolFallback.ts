/**
 * toolFallback.ts — Fallback chains with health scores (EMA of success rate),
 * automatic reordering, and chain export/import.
 */

import { randomUUID } from 'node:crypto';

export interface FallbackChain {
  id: string;
  primary: string;
  fallbacks: string[];
  failureCounts: Map<string, number>;
  successCounts: Map<string, number>;
  healthScores: Map<string, number>;
}

export interface FallbackResult {
  tool: string;
  fallbackUsed: boolean;
  reason?: string;
  attemptsBeforeSuccess: number;
}

export interface ChainExport {
  id: string;
  primary: string;
  fallbacks: string[];
  health: Record<string, number>;
}

/* ── EMA alpha ───────────────────────────────────────────────────── */
const EMA_ALPHA = 0.3;

/* ── Chain store ─────────────────────────────────────────────────── */

const chains = new Map<string, FallbackChain>();

export function withFallback(primary: string, fallbacks: string[]): FallbackChain {
  const chain: FallbackChain = {
    id: randomUUID(),
    primary,
    fallbacks: [...fallbacks],
    failureCounts: new Map(),
    successCounts: new Map(),
    healthScores: new Map(),
  };
  // Initialize health to 1.0 (healthy)
  chain.healthScores.set(primary, 1.0);
  for (const f of fallbacks) chain.healthScores.set(f, 1.0);
  chains.set(primary, chain);
  return chain;
}

export function getFallbackChain(toolId: string): FallbackChain | undefined {
  return chains.get(toolId);
}

/* ── Health score update (EMA) ───────────────────────────────────── */

function updateHealth(chain: FallbackChain, toolId: string, success: boolean): void {
  const current = chain.healthScores.get(toolId) ?? 1.0;
  const sample = success ? 1.0 : 0.0;
  chain.healthScores.set(toolId, EMA_ALPHA * sample + (1 - EMA_ALPHA) * current);
}

/* ── Record outcomes ─────────────────────────────────────────────── */

export function recordSuccess(toolId: string): void {
  for (const chain of chains.values()) {
    if (chain.primary === toolId || chain.fallbacks.includes(toolId)) {
      chain.successCounts.set(toolId, (chain.successCounts.get(toolId) ?? 0) + 1);
      updateHealth(chain, toolId, true);
    }
  }
}

export function recordFailure(toolId: string, _reason: string): void {
  for (const chain of chains.values()) {
    if (chain.primary === toolId || chain.fallbacks.includes(toolId)) {
      chain.failureCounts.set(toolId, (chain.failureCounts.get(toolId) ?? 0) + 1);
      updateHealth(chain, toolId, false);
      // Reorder fallbacks by health score (healthiest first)
      chain.fallbacks.sort((a, b) =>
        (chain.healthScores.get(b) ?? 0) - (chain.healthScores.get(a) ?? 0)
      );
    }
  }
}

/* ── Execute with fallback ───────────────────────────────────────── */

export async function executeWithFallback<T>(
  primary: string,
  executeFn: (toolId: string) => Promise<T>,
): Promise<{ result: T; fallbackResult: FallbackResult }> {
  const chain = chains.get(primary);
  const allTools = chain ? [chain.primary, ...chain.fallbacks] : [primary];
  let attempts = 0;

  for (const toolId of allTools) {
    attempts++;
    // Skip tools with very low health
    if (chain && (chain.healthScores.get(toolId) ?? 1) < 0.1 && toolId !== allTools[allTools.length - 1]) {
      continue;
    }
    try {
      const result = await executeFn(toolId);
      recordSuccess(toolId);
      return {
        result,
        fallbackResult: {
          tool: toolId,
          fallbackUsed: toolId !== primary,
          reason: toolId !== primary ? `Primary "${primary}" skipped/failed` : undefined,
          attemptsBeforeSuccess: attempts,
        },
      };
    } catch {
      recordFailure(toolId, 'execution failed');
    }
  }

  throw new Error(`All tools in fallback chain failed for "${primary}"`);
}

/* ── Legacy compat ───────────────────────────────────────────────── */

export function tryWithFallback(primary: string, fallback: string, succeeded: boolean): FallbackResult {
  if (succeeded) recordSuccess(primary); else recordFailure(primary, 'failed');
  return {
    tool: succeeded ? primary : fallback,
    fallbackUsed: !succeeded,
    reason: succeeded ? undefined : 'Primary tool failed',
    attemptsBeforeSuccess: succeeded ? 1 : 2,
  };
}

/* ── Export / Import ─────────────────────────────────────────────── */

export function exportChains(): ChainExport[] {
  return [...chains.values()].map(c => ({
    id: c.id,
    primary: c.primary,
    fallbacks: [...c.fallbacks],
    health: Object.fromEntries(c.healthScores),
  }));
}

export function importChains(data: ChainExport[]): number {
  let count = 0;
  for (const d of data) {
    const chain = withFallback(d.primary, d.fallbacks);
    for (const [tool, score] of Object.entries(d.health)) {
      chain.healthScores.set(tool, score);
    }
    count++;
  }
  return count;
}
