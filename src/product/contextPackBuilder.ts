/**
 * contextPackBuilder.ts — Context pack assembly with priority-based
 * entry management, token budgeting, expiry pruning, and summaries.
 */

import { randomUUID } from 'node:crypto';

/* ── Interfaces ──────────────────────────────────────────────────── */

export interface ContextEntry {
  key: string;
  value: unknown;
  source: string;
  priority: number;
  expiresAt?: number;
}

/** Backward-compatible with stubs.ts ContextPack, extended. */
export interface ContextPack {
  packId: string;
  entries: Record<string, unknown>;
  items: ContextEntry[];
  totalTokens: number;
  createdAt: number;
}

export interface PackSummary {
  totalEntries: number;
  totalTokens: number;
  sources: string[];
  topPriority: number;
}

/* ── Token estimation ────────────────────────────────────────────── */

/** Rough token estimate: ~4 chars per token. */
function estimateTokens(value: unknown): number {
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  return Math.ceil(str.length / 4);
}

/* ── Builder ─────────────────────────────────────────────────────── */

export class ContextPackBuilder {
  private entries = new Map<string, ContextEntry>();

  addEntry(key: string, value: unknown, source = 'unknown', priority = 0): this {
    this.entries.set(key, { key, value, source, priority });
    return this;
  }

  removeEntry(key: string): this {
    this.entries.delete(key);
    return this;
  }

  setExpiry(key: string, expiresAt: number): this {
    const entry = this.entries.get(key);
    if (!entry) throw new Error(`Entry "${key}" not found`);
    entry.expiresAt = expiresAt;
    return this;
  }

  /** Remove entries whose expiresAt is in the past. */
  prune(): this {
    const now = Date.now();
    for (const [key, entry] of this.entries) {
      if (entry.expiresAt !== undefined && entry.expiresAt <= now) {
        this.entries.delete(key);
      }
    }
    return this;
  }

  /**
   * Build a ContextPack, optionally trimmed to a token budget.
   * Entries are kept in descending priority order; lower-priority
   * entries are dropped first when the budget is exceeded.
   */
  build(maxTokens?: number): ContextPack {
    // Sort by priority descending
    const sorted = [...this.entries.values()].sort((a, b) => b.priority - a.priority);

    let items: ContextEntry[];
    let totalTokens: number;

    if (maxTokens !== undefined) {
      items = [];
      totalTokens = 0;
      for (const entry of sorted) {
        const tokens = estimateTokens(entry.value);
        if (totalTokens + tokens > maxTokens) continue;
        items.push(entry);
        totalTokens += tokens;
      }
    } else {
      items = sorted;
      totalTokens = sorted.reduce((sum, e) => sum + estimateTokens(e.value), 0);
    }

    // Build backward-compatible entries record
    const entriesRecord: Record<string, unknown> = {};
    for (const item of items) entriesRecord[item.key] = item.value;

    return {
      packId: randomUUID(),
      entries: entriesRecord,
      items,
      totalTokens,
      createdAt: Date.now(),
    };
  }

  summarize(): PackSummary {
    const all = [...this.entries.values()];
    const sources = [...new Set(all.map(e => e.source))];
    const totalTokens = all.reduce((sum, e) => sum + estimateTokens(e.value), 0);
    const topPriority = all.length > 0 ? Math.max(...all.map(e => e.priority)) : 0;
    return { totalEntries: all.length, totalTokens, sources, topPriority };
  }
}

/* ── Backward-compatible free function (stubs.ts) ────────────────── */

export function createContextPack(entries: Record<string, unknown>): ContextPack {
  const builder = new ContextPackBuilder();
  for (const [key, value] of Object.entries(entries)) {
    builder.addEntry(key, value);
  }
  return builder.build();
}
