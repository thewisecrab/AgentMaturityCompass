export interface GlossaryEntry {
  id: string;
  term: string;
  definition: string;
  domain: string;
  aliases: string[];
}

const terms = new Map<string, GlossaryEntry>();

function normalize(term: string): string {
  return term.trim().toLowerCase();
}

export class GlossaryManager {
  define(term: string, definition: string, domain = "general"): string {
    const id = `g_${normalize(term)}_${Date.now()}`;
    terms.set(normalize(term), {
      id,
      term,
      definition,
      domain,
      aliases: []
    });
    return id;
  }

  lookup(term: string): GlossaryEntry | undefined {
    return terms.get(normalize(term));
  }
}
