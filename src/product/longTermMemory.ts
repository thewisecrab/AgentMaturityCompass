/**
 * longTermMemory.ts — Long-term memory store for agent state persistence.
 *
 * Provides a key-value store with metadata, TTL support, tagging,
 * search, and memory statistics. Supports namespaces for multi-agent
 * isolation.
 */

import { randomUUID } from 'node:crypto';

/* ── Interfaces ────────────────────────────────────────────────────── */

export interface MemoryEntry {
  key: string;
  value: unknown;
  timestamp: Date;
  importance?: number;
  tags?: string[];
  namespace: string;
  accessCount: number;
  expiresAt: number | null;  // null = no expiry
  lastAccessedAt: number;
  metadata: Record<string, unknown>;
}

export interface MemoryStats {
  totalEntries: number;
  namespaces: string[];
  oldestEntry: number | null;
  newestEntry: number | null;
  totalAccessCount: number;
  averageImportance: number;
}

export interface SearchResult {
  entries: MemoryEntry[];
  totalMatches: number;
}

/* ── LongTermMemory ────────────────────────────────────────────────── */

export class LongTermMemory {
  private store = new Map<string, MemoryEntry>(); // compositeKey -> entry

  private compositeKey(namespace: string, key: string): string {
    return `${namespace}::${key}`;
  }

  /** Set or update a memory entry (backward-compat simple signature) */
  set(key: string, value: unknown, options?: {
    namespace?: string;
    importance?: number;
    tags?: string[];
    ttlMs?: number;
    metadata?: Record<string, unknown>;
  }): void {
    const ns = options?.namespace ?? 'default';
    const ck = this.compositeKey(ns, key);
    const now = Date.now();
    const existing = this.store.get(ck);

    const entry: MemoryEntry = {
      key,
      value,
      timestamp: new Date(),
      importance: options?.importance ?? existing?.importance ?? 0.5,
      tags: options?.tags ?? existing?.tags ?? [],
      namespace: ns,
      accessCount: existing?.accessCount ?? 0,
      expiresAt: options?.ttlMs ? now + options.ttlMs : (existing?.expiresAt ?? null),
      lastAccessedAt: now,
      metadata: options?.metadata ?? existing?.metadata ?? {},
    };

    this.store.set(ck, entry);
  }

  /** Get a memory entry by key (backward-compat) */
  get(key: string, namespace = 'default'): MemoryEntry | undefined {
    const ck = this.compositeKey(namespace, key);
    const entry = this.store.get(ck);
    if (!entry) return undefined;

    // Check expiry
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(ck);
      return undefined;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccessedAt = Date.now();
    return entry;
  }

  /** List all entries (backward-compat simple return) */
  list(namespace?: string, limit?: number): MemoryEntry[] {
    this.evictExpired();
    const entries: MemoryEntry[] = [];
    for (const entry of this.store.values()) {
      if (namespace && entry.namespace !== namespace) continue;
      entries.push(entry);
    }
    entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return limit ? entries.slice(0, limit) : entries;
  }

  /** Store entry with metadata (enhanced API) */
  store_entry(key: string, value: unknown, metadata: {
    importance?: number;
    tags?: string[];
    namespace?: string;
    ttlMs?: number;
  }): void {
    this.set(key, value, {
      namespace: metadata.namespace,
      importance: metadata.importance ?? 0.5,
      tags: metadata.tags ?? [],
      ttlMs: metadata.ttlMs,
    });
  }

  /** Retrieve entry (alias for get) */
  retrieve(key: string, namespace = 'default'): MemoryEntry | undefined {
    return this.get(key, namespace);
  }

  /** Check if a key exists (without updating access stats) */
  has(key: string, namespace = 'default'): boolean {
    const ck = this.compositeKey(namespace, key);
    const entry = this.store.get(ck);
    if (!entry) return false;
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(ck);
      return false;
    }
    return true;
  }

  /** Delete a memory entry */
  forget(key: string, namespace = 'default'): boolean {
    return this.store.delete(this.compositeKey(namespace, key));
  }

  /** Search entries by keyword across key, value, and tags */
  search(query: string, namespace?: string): MemoryEntry[] {
    this.evictExpired();
    const terms = query.toLowerCase().split(/\s+/);
    const results: MemoryEntry[] = [];

    for (const entry of this.store.values()) {
      if (namespace && entry.namespace !== namespace) continue;
      const haystack = `${entry.key} ${(entry.tags ?? []).join(' ')} ${
        typeof entry.value === 'string' ? entry.value : ''
      }`.toLowerCase();
      if (terms.some(t => haystack.includes(t))) {
        results.push(entry);
      }
    }

    return results.sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0));
  }

  /** Search entries by tag */
  searchByTag(tag: string, namespace?: string): SearchResult {
    this.evictExpired();
    const entries: MemoryEntry[] = [];
    for (const entry of this.store.values()) {
      if (namespace && entry.namespace !== namespace) continue;
      if ((entry.tags ?? []).includes(tag)) entries.push(entry);
    }
    entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return { entries, totalMatches: entries.length };
  }

  /** Add tags to an existing entry */
  addTags(key: string, tags: string[], namespace = 'default'): boolean {
    const ck = this.compositeKey(namespace, key);
    const entry = this.store.get(ck);
    if (!entry) return false;
    const tagSet = new Set([...(entry.tags ?? []), ...tags]);
    entry.tags = [...tagSet];
    entry.timestamp = new Date();
    return true;
  }

  /** Remove tags from an existing entry */
  removeTags(key: string, tags: string[], namespace = 'default'): boolean {
    const ck = this.compositeKey(namespace, key);
    const entry = this.store.get(ck);
    if (!entry) return false;
    const removeSet = new Set(tags);
    entry.tags = (entry.tags ?? []).filter(t => !removeSet.has(t));
    entry.timestamp = new Date();
    return true;
  }

  /** Consolidate: remove low-importance old entries */
  consolidate(thresholdMs = 86400000): number {
    const now = Date.now();
    let removed = 0;
    for (const [key, entry] of this.store) {
      if ((entry.importance ?? 0) < 0.3 && now - entry.timestamp.getTime() > thresholdMs) {
        this.store.delete(key);
        removed++;
      }
    }
    return removed;
  }

  /** Get all namespaces */
  getNamespaces(): string[] {
    this.evictExpired();
    const ns = new Set<string>();
    for (const entry of this.store.values()) ns.add(entry.namespace);
    return [...ns];
  }

  /** Clear all entries in a namespace */
  clearNamespace(namespace: string): number {
    let count = 0;
    for (const [ck, entry] of this.store.entries()) {
      if (entry.namespace === namespace) {
        this.store.delete(ck);
        count++;
      }
    }
    return count;
  }

  /** Clear all entries */
  clearAll(): number {
    const count = this.store.size;
    this.store.clear();
    return count;
  }

  /** Get memory statistics */
  getStats(namespace?: string): MemoryStats {
    this.evictExpired();
    const namespaces = new Set<string>();
    let totalEntries = 0;
    let totalAccessCount = 0;
    let totalImportance = 0;
    let oldest: number | null = null;
    let newest: number | null = null;

    for (const entry of this.store.values()) {
      if (namespace && entry.namespace !== namespace) continue;
      namespaces.add(entry.namespace);
      totalEntries++;
      totalAccessCount += entry.accessCount;
      totalImportance += entry.importance ?? 0;
      const ts = entry.timestamp.getTime();
      if (oldest === null || ts < oldest) oldest = ts;
      if (newest === null || ts > newest) newest = ts;
    }

    return {
      totalEntries,
      namespaces: [...namespaces],
      oldestEntry: oldest,
      newestEntry: newest,
      totalAccessCount,
      averageImportance: totalEntries > 0 ? totalImportance / totalEntries : 0,
    };
  }

  /** Set TTL on an existing entry */
  setTtl(key: string, ttlMs: number, namespace = 'default'): boolean {
    const ck = this.compositeKey(namespace, key);
    const entry = this.store.get(ck);
    if (!entry) return false;
    entry.expiresAt = Date.now() + ttlMs;
    entry.timestamp = new Date();
    return true;
  }

  /** Remove TTL from an existing entry */
  removeTtl(key: string, namespace = 'default'): boolean {
    const ck = this.compositeKey(namespace, key);
    const entry = this.store.get(ck);
    if (!entry) return false;
    entry.expiresAt = null;
    entry.timestamp = new Date();
    return true;
  }

  /** Export all entries (for backup/migration) */
  exportAll(namespace?: string): MemoryEntry[] {
    this.evictExpired();
    const entries: MemoryEntry[] = [];
    for (const entry of this.store.values()) {
      if (namespace && entry.namespace !== namespace) continue;
      entries.push({ ...entry });
    }
    return entries;
  }

  /** Import entries (for backup/migration) */
  importEntries(entries: MemoryEntry[], overwrite = false): number {
    let imported = 0;
    for (const entry of entries) {
      const ck = this.compositeKey(entry.namespace, entry.key);
      if (!overwrite && this.store.has(ck)) continue;
      this.store.set(ck, { ...entry });
      imported++;
    }
    return imported;
  }

  /** Evict all expired entries */
  private evictExpired(): number {
    const now = Date.now();
    let count = 0;
    for (const [ck, entry] of this.store.entries()) {
      if (entry.expiresAt !== null && now > entry.expiresAt) {
        this.store.delete(ck);
        count++;
      }
    }
    return count;
  }
}

/* ── Singleton ─────────────────────────────────────────────────────── */

let _memory: LongTermMemory | undefined;

export function getLongTermMemory(): LongTermMemory {
  if (!_memory) _memory = new LongTermMemory();
  return _memory;
}
