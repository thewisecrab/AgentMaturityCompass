/**
 * contextOptimizer.ts — Priority-based context window packing with
 * recency weighting and relevance scoring.
 */

export interface ContextOptResult {
  optimized: string;
  tokensReduced: number;
  totalTokens: number;
  keptSections: number;
  droppedSections: number;
}

export interface ContextSection {
  label: string;
  content: string;
  priority?: number;     // 0-10, higher = more important
  recencyMs?: number;    // age in milliseconds (0 = now)
  relevance?: number;    // 0-1 relevance score
}

/* ── Token estimation (~4 chars per token) ───────────────────────── */

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/* ── Section scoring ─────────────────────────────────────────────── */

function scoreSection(section: ContextSection): number {
  const priority = section.priority ?? 5;
  const recency = section.recencyMs ?? 0;
  const relevance = section.relevance ?? 0.5;

  // Recency decay: half-life of 1 hour
  const recencyWeight = Math.exp(-recency / (3600_000 * Math.LN2));

  return (priority / 10) * 0.4 + recencyWeight * 0.3 + relevance * 0.3;
}

/* ── Simple context optimization (string input, backward-compat) ── */

export function optimizeContext(context: string, maxTokens?: number): ContextOptResult {
  const max = maxTokens ?? 4000;
  const tokens = estimateTokens(context);
  if (tokens <= max) {
    return { optimized: context, tokensReduced: 0, totalTokens: tokens, keptSections: 1, droppedSections: 0 };
  }

  const charBudget = max * 4;
  const headChars = Math.floor(charBudget * 0.6);
  const tailChars = charBudget - headChars;
  const head = context.slice(0, headChars);
  const tail = context.slice(-tailChars);
  const optimized = `${head}\n\n... (${tokens - max} tokens omitted) ...\n\n${tail}`;
  const optimizedTokens = estimateTokens(optimized);

  return {
    optimized,
    tokensReduced: tokens - optimizedTokens,
    totalTokens: optimizedTokens,
    keptSections: 1,
    droppedSections: 0,
  };
}

/* ── Section-based context packing ───────────────────────────────── */

export function packSections(sections: ContextSection[], maxTokens: number): ContextOptResult {
  if (sections.length === 0) {
    return { optimized: '', tokensReduced: 0, totalTokens: 0, keptSections: 0, droppedSections: 0 };
  }

  const scored = sections.map((s, idx) => ({
    section: s,
    score: scoreSection(s),
    tokens: estimateTokens(s.content),
    idx,
  }));
  scored.sort((a, b) => b.score - a.score);

  let budget = maxTokens;
  const kept: typeof scored = [];
  const dropped: typeof scored = [];

  for (const item of scored) {
    if (item.tokens <= budget) {
      kept.push(item);
      budget -= item.tokens;
    } else {
      dropped.push(item);
    }
  }

  kept.sort((a, b) => a.idx - b.idx);

  const parts = kept.map(k => `## ${k.section.label}\n${k.section.content}`);
  const optimized = parts.join('\n\n');
  const totalTokens = estimateTokens(optimized);
  const originalTokens = sections.reduce((sum, s) => sum + estimateTokens(s.content), 0);

  return {
    optimized,
    tokensReduced: originalTokens - totalTokens,
    totalTokens,
    keptSections: kept.length,
    droppedSections: dropped.length,
  };
}
