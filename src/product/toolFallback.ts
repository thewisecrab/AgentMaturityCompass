import { randomUUID } from 'node:crypto';

export interface FallbackChain { id: string; primary: string; fallbacks: string[]; failureCounts: Map<string, number>; }
export interface FallbackResult { tool: string; fallbackUsed: boolean; reason?: string; }

const chains = new Map<string, FallbackChain>();

export function withFallback(primary: string, fallbacks: string[]): FallbackChain {
  const chain: FallbackChain = { id: randomUUID(), primary, fallbacks, failureCounts: new Map() };
  chains.set(primary, chain);
  return chain;
}

export function getFallbackChain(toolId: string): FallbackChain | undefined { return chains.get(toolId); }

export function recordFailure(toolId: string, _reason: string): void {
  for (const chain of chains.values()) {
    if (chain.primary === toolId || chain.fallbacks.includes(toolId)) {
      chain.failureCounts.set(toolId, (chain.failureCounts.get(toolId) ?? 0) + 1);
      // Auto-adjust: move high-failure fallbacks to the end
      chain.fallbacks.sort((a, b) => (chain.failureCounts.get(a) ?? 0) - (chain.failureCounts.get(b) ?? 0));
    }
  }
}

export function tryWithFallback(primary: string, fallback: string, succeeded: boolean): FallbackResult {
  return { tool: succeeded ? primary : fallback, fallbackUsed: !succeeded, reason: succeeded ? undefined : 'Primary tool failed' };
}
