import { randomUUID } from 'node:crypto';

export interface MemoryEntry { key: string; value: unknown; timestamp: Date; importance?: number; tags?: string[]; }

export class LongTermMemory {
  private store = new Map<string, MemoryEntry>();

  set(key: string, value: unknown): void {
    this.store.set(key, { key, value, timestamp: new Date() });
  }

  get(key: string): MemoryEntry | undefined { return this.store.get(key); }

  list(): MemoryEntry[] { return [...this.store.values()]; }

  store_entry(key: string, value: unknown, metadata: { importance?: number; tags?: string[] }): void {
    this.store.set(key, { key, value, timestamp: new Date(), importance: metadata.importance ?? 0.5, tags: metadata.tags ?? [] });
  }

  retrieve(key: string): MemoryEntry | undefined { return this.store.get(key); }

  search(query: string): MemoryEntry[] {
    const terms = query.toLowerCase().split(/\s+/);
    return [...this.store.values()].filter(e => {
      const haystack = `${e.key} ${(e.tags ?? []).join(' ')}`.toLowerCase();
      return terms.some(t => haystack.includes(t));
    }).sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0));
  }

  forget(key: string): boolean { return this.store.delete(key); }

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
}
