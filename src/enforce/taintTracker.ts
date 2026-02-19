/**
 * Data taint propagation tracker.
 */

export interface TaintedValue {
  value: unknown;
  sources: string[];
  tainted: boolean;
}

export class TaintTracker {
  private registry = new Map<string, TaintedValue>();

  markTainted(key: string, value: unknown, source: string): void {
    const existing = this.registry.get(key);
    if (existing) {
      existing.sources.push(source);
      existing.value = value;
    } else {
      this.registry.set(key, { value, sources: [source], tainted: true });
    }
  }

  propagate(inputKey: string, outputKey: string, _transform?: string): void {
    const input = this.registry.get(inputKey);
    if (input && input.tainted) {
      const existing = this.registry.get(outputKey);
      const sources = [...input.sources];
      if (existing) {
        sources.push(...existing.sources);
      }
      this.registry.set(outputKey, { value: existing?.value ?? null, sources, tainted: true });
    }
  }

  isTainted(key: string): boolean {
    return this.registry.get(key)?.tainted ?? false;
  }

  check(key: string): TaintedValue | undefined {
    return this.registry.get(key);
  }

  getAuditTrail(key: string): string[] {
    return this.registry.get(key)?.sources ?? [];
  }
}
