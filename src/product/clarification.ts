/**
 * clarification.ts — Ambiguity detection and clarification question generation.
 *
 * Detects: ambiguous pronouns, missing context, vague quantifiers,
 * temporal ambiguity, and implicit references.
 */

export interface ClarificationResult {
  needsClarification: boolean;
  questions: string[];
  ambiguityScore: number;
  detectedIssues: AmbiguityIssue[];
}

export interface AmbiguityIssue {
  type: 'pronoun' | 'missing-context' | 'vague-quantifier' | 'temporal' | 'implicit-reference';
  snippet: string;
  suggestion: string;
}

/* ── Pattern definitions ─────────────────────────────────────────── */

const AMBIGUOUS_PRONOUNS = /\b(it|they|this|that|these|those|them)\b/gi;
const VAGUE_QUANTIFIERS = /\b(some|many|few|several|a lot|lots of|a number of|various|multiple|certain)\b/gi;
const TEMPORAL_VAGUE = /\b(soon|later|recently|eventually|at some point|when possible|sometime|asap)\b/gi;
const IMPLICIT_REFS = /\b(the file|the thing|the issue|the problem|the error|the bug|the item|the one)\b/gi;

/* ── Detection ───────────────────────────────────────────────────── */

function findAll(pattern: RegExp, text: string): string[] {
  const matches: string[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(pattern.source, pattern.flags);
  while ((m = re.exec(text)) !== null) matches.push(m[0]);
  return matches;
}

function detectIssues(input: string): AmbiguityIssue[] {
  const issues: AmbiguityIssue[] = [];
  const wordCount = input.trim().split(/\s+/).length;

  if (wordCount < 5) {
    issues.push({
      type: 'missing-context',
      snippet: input.trim(),
      suggestion: 'Can you provide more details about what you need?',
    });
  }

  for (const match of findAll(AMBIGUOUS_PRONOUNS, input)) {
    issues.push({ type: 'pronoun', snippet: match, suggestion: `What does "${match}" refer to?` });
  }

  for (const match of findAll(VAGUE_QUANTIFIERS, input)) {
    issues.push({ type: 'vague-quantifier', snippet: match, suggestion: `Can you be more specific about "${match}"? (e.g., an exact number or range)` });
  }

  for (const match of findAll(TEMPORAL_VAGUE, input)) {
    issues.push({ type: 'temporal', snippet: match, suggestion: `Can you specify a timeframe instead of "${match}"?` });
  }

  for (const match of findAll(IMPLICIT_REFS, input)) {
    issues.push({ type: 'implicit-reference', snippet: match, suggestion: `Which specific ${match.replace(/^the\s+/, '')} are you referring to?` });
  }

  return issues;
}

/* ── Ambiguity score (0-1) ───────────────────────────────────────── */

function computeAmbiguityScore(issues: AmbiguityIssue[]): number {
  const weights: Record<AmbiguityIssue['type'], number> = {
    'pronoun': 0.15,
    'missing-context': 0.3,
    'vague-quantifier': 0.1,
    'temporal': 0.1,
    'implicit-reference': 0.15,
  };
  let score = 0;
  for (const issue of issues) score += weights[issue.type] ?? 0.1;
  return Math.min(1, score);
}

/* ── Public API ───────────────────────────────────────────────────── */

export function checkClarification(input: string): ClarificationResult {
  const issues = detectIssues(input);
  const ambiguityScore = computeAmbiguityScore(issues);
  const questions = [...new Set(issues.map(i => i.suggestion))];

  return {
    needsClarification: ambiguityScore > 0.2,
    questions,
    ambiguityScore,
    detectedIssues: issues,
  };
}
