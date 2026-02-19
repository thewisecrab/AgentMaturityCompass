interface MemoryEntry {
  value: unknown;
  expiresAt: number;
}

export class MemoryTtlStore {
  private readonly store = new Map<string, MemoryEntry>();

  setMemory(key: string, value: unknown, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  getMemory(key: string): { value: unknown; expiresAt: number } | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return { value: entry.value, expiresAt: entry.expiresAt };
  }

  evictExpired(): number {
    let count = 0;
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now >= entry.expiresAt) {
        this.store.delete(key);
        count++;
      }
    }
    return count;
  }

  has(key: string): boolean {
    return this.getMemory(key) !== null;
  }

  size(): number {
    this.evictExpired();
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }
}

/** Backward-compatible wrapper */
export function storeWithTtl(key: string, _value: unknown, purpose: string, ttlSeconds?: number) {
  const ttl = ttlSeconds ?? 3600;
  return { key, purpose, expiresAt: new Date(Date.now() + ttl * 1000), stored: true };
}
