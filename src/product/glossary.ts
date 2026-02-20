/**
 * glossary.ts — Terminology management with alias support,
 * variant enforcement scanning, and bulk import/export.
 */

export interface GlossaryEntry {
  id: string;
  term: string;
  definition: string;
  domain: string;
  aliases: string[];
  createdAt: number;
}

export interface VariantViolation {
  found: string;
  preferred: string;
  position: number;
  context: string;
}

export interface GlossaryExport {
  version: 1;
  entries: GlossaryEntry[];
  exportedAt: string;
}

/* ── Normalize ───────────────────────────────────────────────────── */

function normalize(term: string): string {
  return term.trim().toLowerCase();
}

/* ── Manager ─────────────────────────────────────────────────────── */

export class GlossaryManager {
  private terms = new Map<string, GlossaryEntry>();
  private aliasMap = new Map<string, string>(); // alias -> canonical key

  /** Define or update a term */
  define(term: string, definition: string, domain = 'general', aliases: string[] = []): string {
    const key = normalize(term);
    const id = `g_${key}_${Date.now()}`;
    const entry: GlossaryEntry = { id, term, definition, domain, aliases, createdAt: Date.now() };
    this.terms.set(key, entry);

    // Register aliases
    for (const alias of aliases) {
      this.aliasMap.set(normalize(alias), key);
    }
    return id;
  }

  /** Add alias to existing term */
  addAlias(term: string, alias: string): boolean {
    const key = normalize(term);
    const entry = this.terms.get(key);
    if (!entry) return false;
    const normAlias = normalize(alias);
    if (!entry.aliases.includes(alias)) entry.aliases.push(alias);
    this.aliasMap.set(normAlias, key);
    return true;
  }

  /** Lookup by term or alias */
  lookup(term: string): GlossaryEntry | undefined {
    const key = normalize(term);
    const entry = this.terms.get(key);
    if (entry) return entry;
    const canonical = this.aliasMap.get(key);
    return canonical ? this.terms.get(canonical) : undefined;
  }

  /** Remove a term */
  remove(term: string): boolean {
    const key = normalize(term);
    const entry = this.terms.get(key);
    if (!entry) return false;
    for (const alias of entry.aliases) {
      this.aliasMap.delete(normalize(alias));
    }
    return this.terms.delete(key);
  }

  /** List all terms, optionally filtered by domain */
  list(domain?: string): GlossaryEntry[] {
    const all = [...this.terms.values()];
    return domain ? all.filter(e => e.domain === domain) : all;
  }

  /** List unique domains */
  domains(): string[] {
    return [...new Set([...this.terms.values()].map(e => e.domain))];
  }

  /** Search terms by partial match */
  search(query: string): GlossaryEntry[] {
    const q = normalize(query);
    return [...this.terms.values()].filter(e =>
      normalize(e.term).includes(q) ||
      normalize(e.definition).includes(q) ||
      e.aliases.some(a => normalize(a).includes(q))
    );
  }

  /** Scan text for variant violations (using wrong term when canonical exists) */
  enforceVariants(text: string): VariantViolation[] {
    const violations: VariantViolation[] = [];
    for (const entry of this.terms.values()) {
      for (const alias of entry.aliases) {
        const re = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        let match: RegExpExecArray | null;
        while ((match = re.exec(text)) !== null) {
          const start = Math.max(0, match.index - 20);
          const end = Math.min(text.length, match.index + match[0].length + 20);
          violations.push({
            found: match[0],
            preferred: entry.term,
            position: match.index,
            context: text.slice(start, end),
          });
        }
      }
    }
    return violations;
  }

  /** Export all entries */
  export(): GlossaryExport {
    return {
      version: 1,
      entries: [...this.terms.values()],
      exportedAt: new Date().toISOString(),
    };
  }

  /** Import entries (merge) */
  import(data: GlossaryExport): number {
    let count = 0;
    for (const entry of data.entries) {
      this.define(entry.term, entry.definition, entry.domain, entry.aliases);
      count++;
    }
    return count;
  }

  /** Get total count */
  get size(): number {
    return this.terms.size;
  }
}
