/**
 * nlpMetrics.ts — Standard NLP evaluation metrics
 *
 * Implements table-stakes NLP metrics for the AMC eval framework:
 *   1. BLEU score (BiLingual Evaluation Understudy)
 *   2. ROUGE-N and ROUGE-L (Recall-Oriented Understudy for Gisting Evaluation)
 *   3. METEOR (Metric for Evaluation of Translation with Explicit ORdering)
 *   4. Perplexity (token-level surprise)
 *   5. Levenshtein distance (character/word edit distance)
 *
 * All metrics are zero-dependency, pure TypeScript implementations.
 */

/* ── Tokenization helpers ───────────────────────────────────────── */

/**
 * Simple whitespace + punctuation tokenizer. Lowercases and strips punctuation.
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

/**
 * Extract character n-grams from a string.
 */
function charNgrams(text: string, n: number): string[] {
  const grams: string[] = [];
  for (let i = 0; i <= text.length - n; i++) {
    grams.push(text.slice(i, i + n));
  }
  return grams;
}

/**
 * Extract word n-grams from a token list.
 */
function wordNgrams(tokens: string[], n: number): string[] {
  const grams: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    grams.push(tokens.slice(i, i + n).join(" "));
  }
  return grams;
}

/**
 * Count occurrences of each element in an array.
 */
function countMap(arr: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of arr) {
    map.set(item, (map.get(item) ?? 0) + 1);
  }
  return map;
}

/* ── BLEU Score ─────────────────────────────────────────────────── */

export interface BLEUInput {
  /** The candidate/generated text */
  candidate: string;
  /** One or more reference texts */
  references: string[];
  /** Maximum n-gram order (default: 4) */
  maxN?: number;
  /** Weights for each n-gram order (default: uniform) */
  weights?: number[];
}

export interface BLEUResult {
  /** Overall BLEU score (0-1) */
  score: number;
  /** Per-n-gram precision values */
  precisions: number[];
  /** Brevity penalty applied */
  brevityPenalty: number;
  /** Candidate length in tokens */
  candidateLength: number;
  /** Effective reference length (closest to candidate) */
  referenceLength: number;
}

/**
 * Compute BLEU score.
 *
 * Uses modified n-gram precision with clipping, brevity penalty,
 * and geometric mean of n-gram precisions (standard BLEU formula).
 */
export function computeBLEU(input: BLEUInput): BLEUResult {
  const maxN = input.maxN ?? 4;
  const weights = input.weights ?? Array(maxN).fill(1 / maxN);

  if (weights.length !== maxN) {
    throw new Error(`weights length (${weights.length}) must equal maxN (${maxN})`);
  }

  const candidateTokens = tokenize(input.candidate);
  const referencesTokens = input.references.map(tokenize);

  if (candidateTokens.length === 0) {
    return {
      score: 0,
      precisions: Array(maxN).fill(0),
      brevityPenalty: 0,
      candidateLength: 0,
      referenceLength: referencesTokens[0]?.length ?? 0,
    };
  }

  // Effective reference length: closest to candidate length
  const refLengths = referencesTokens.map((r) => r.length);
  const referenceLength = refLengths.reduce((best: number, len: number) =>
    Math.abs(len - candidateTokens.length) < Math.abs(best - candidateTokens.length) ? len : best,
    refLengths[0]!
  );

  // Brevity penalty
  const bp =
    candidateTokens.length >= referenceLength
      ? 1
      : Math.exp(1 - referenceLength / candidateTokens.length);

  // Modified n-gram precisions
  const precisions: number[] = [];
  for (let n = 1; n <= maxN; n++) {
    const candNgrams = wordNgrams(candidateTokens, n);
    const candCounts = countMap(candNgrams);

    // Max reference counts (clipping)
    const maxRefCounts = new Map<string, number>();
    for (const refTokens of referencesTokens) {
      const refNgrams = wordNgrams(refTokens, n);
      const refCounts = countMap(refNgrams);
      refCounts.forEach((count, gram) => {
        maxRefCounts.set(gram, Math.max(maxRefCounts.get(gram) ?? 0, count));
      });
    }

    // Clipped counts
    let clippedTotal = 0;
    let totalCand = 0;
    candCounts.forEach((count, gram) => {
      const maxRef = maxRefCounts.get(gram) ?? 0;
      clippedTotal += Math.min(count, maxRef);
      totalCand += count;
    });

    precisions.push(totalCand === 0 ? 0 : clippedTotal / totalCand);
  }

  // Geometric mean with smoothing for zero precisions
  // Use +1 smoothing (BLEU-smooth variant) to avoid log(0)
  let logSum = 0;
  let hasZero = false;
  for (let i = 0; i < maxN; i++) {
    if (precisions[i] === 0) {
      hasZero = true;
      break;
    }
    logSum += (weights[i] ?? 0) * Math.log(precisions[i] ?? 0);
  }

  const score = hasZero ? 0 : bp * Math.exp(logSum);

  return {
    score: Math.min(1, Math.max(0, score)),
    precisions,
    brevityPenalty: bp,
    candidateLength: candidateTokens.length,
    referenceLength,
  };
}

/* ── ROUGE Scores ───────────────────────────────────────────────── */

export interface ROUGEInput {
  /** The candidate/system summary */
  candidate: string;
  /** The reference/gold summary */
  reference: string;
}

export interface ROUGEScores {
  /** Precision (matched / candidate n-grams) */
  precision: number;
  /** Recall (matched / reference n-grams) */
  recall: number;
  /** F1 harmonic mean of precision and recall */
  f1: number;
}

export interface ROUGEResult {
  /** ROUGE-1 (unigram overlap) */
  rouge1: ROUGEScores;
  /** ROUGE-2 (bigram overlap) */
  rouge2: ROUGEScores;
  /** ROUGE-L (longest common subsequence) */
  rougeL: ROUGEScores;
}

function computeROUGEN(
  candidateTokens: string[],
  referenceTokens: string[],
  n: number
): ROUGEScores {
  const candNgrams = wordNgrams(candidateTokens, n);
  const refNgrams = wordNgrams(referenceTokens, n);

  if (candNgrams.length === 0 && refNgrams.length === 0) {
    return { precision: 1, recall: 1, f1: 1 };
  }
  if (candNgrams.length === 0 || refNgrams.length === 0) {
    return { precision: 0, recall: 0, f1: 0 };
  }

  const candCounts = countMap(candNgrams);
  const refCounts = countMap(refNgrams);

  let overlap = 0;
  candCounts.forEach((count, gram) => {
    overlap += Math.min(count, refCounts.get(gram) ?? 0);
  });

  const precision = overlap / candNgrams.length;
  const recall = overlap / refNgrams.length;
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);

  return { precision, recall, f1 };
}

/**
 * Compute length of Longest Common Subsequence between two token arrays.
 */
function lcsLength(a: string[], b: string[]): number {
  const m = a.length;
  const n = b.length;
  // Space-optimized: two rows
  let prev = new Array(n + 1).fill(0);
  let curr = new Array(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        curr[j] = (prev[j - 1] ?? 0) + 1;
      } else {
        curr[j] = Math.max(prev[j] ?? 0, curr[j - 1] ?? 0);
      }
    }
    [prev, curr] = [curr, prev];
    curr.fill(0);
  }

  return prev[n] ?? 0;
}

/**
 * Compute ROUGE scores: ROUGE-1, ROUGE-2, ROUGE-L.
 */
export function computeROUGE(input: ROUGEInput): ROUGEResult {
  const candidateTokens = tokenize(input.candidate);
  const referenceTokens = tokenize(input.reference);

  const rouge1 = computeROUGEN(candidateTokens, referenceTokens, 1);
  const rouge2 = computeROUGEN(candidateTokens, referenceTokens, 2);

  // ROUGE-L via LCS
  const lcs = lcsLength(candidateTokens, referenceTokens);
  let rougeL: ROUGEScores;
  if (candidateTokens.length === 0 && referenceTokens.length === 0) {
    rougeL = { precision: 1, recall: 1, f1: 1 };
  } else if (candidateTokens.length === 0 || referenceTokens.length === 0) {
    rougeL = { precision: 0, recall: 0, f1: 0 };
  } else {
    const precision = lcs / candidateTokens.length;
    const recall = lcs / referenceTokens.length;
    const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
    rougeL = { precision, recall, f1 };
  }

  return { rouge1, rouge2, rougeL };
}

/* ── METEOR Score ───────────────────────────────────────────────── */

export interface METEORInput {
  /** The candidate/generated text */
  candidate: string;
  /** The reference text */
  reference: string;
  /** Weight for precision vs recall (default: 0.9, recall-heavy) */
  alpha?: number;
  /** Penalty for fragmentation (default: 0.5) */
  beta?: number;
  /** Maximum chunks penalty exponent (default: 3) */
  gamma?: number;
}

export interface METEORResult {
  /** Overall METEOR score (0-1) */
  score: number;
  /** Unigram precision */
  precision: number;
  /** Unigram recall */
  recall: number;
  /** Harmonic mean before penalty */
  fMean: number;
  /** Fragmentation penalty */
  penalty: number;
  /** Number of matching chunks */
  chunks: number;
  /** Number of unigram matches */
  matches: number;
}

/**
 * Compute METEOR score.
 *
 * Simplified METEOR: exact unigram matching + fragmentation penalty.
 * Uses harmonic mean weighted toward recall (alpha=0.9 default).
 */
export function computeMETEOR(input: METEORInput): METEORResult {
  const alpha = input.alpha ?? 0.9;
  const beta = input.beta ?? 0.5;
  const gamma = input.gamma ?? 3;

  const candTokens = tokenize(input.candidate);
  const refTokens = tokenize(input.reference);

  if (candTokens.length === 0 && refTokens.length === 0) {
    return { score: 1, precision: 1, recall: 1, fMean: 1, penalty: 0, chunks: 0, matches: 0 };
  }
  if (candTokens.length === 0 || refTokens.length === 0) {
    return { score: 0, precision: 0, recall: 0, fMean: 0, penalty: 0, chunks: 0, matches: 0 };
  }

  // Greedy unigram alignment (exact match)
  const refUsed = new Array(refTokens.length).fill(false);
  const alignment: Array<{ candIdx: number; refIdx: number }> = [];

  for (let ci = 0; ci < candTokens.length; ci++) {
    for (let ri = 0; ri < refTokens.length; ri++) {
      if (!refUsed[ri] && candTokens[ci] === refTokens[ri]) {
        alignment.push({ candIdx: ci, refIdx: ri });
        refUsed[ri] = true;
        break;
      }
    }
  }

  const matches = alignment.length;

  if (matches === 0) {
    return { score: 0, precision: 0, recall: 0, fMean: 0, penalty: 0, chunks: 0, matches: 0 };
  }

  const precision = matches / candTokens.length;
  const recall = matches / refTokens.length;

  // Weighted harmonic mean (alpha weights recall)
  const fMean =
    precision === 0 || recall === 0
      ? 0
      : (precision * recall) / (alpha * precision + (1 - alpha) * recall);

  // Count chunks: consecutive aligned pairs form a chunk
  // Sort alignment by candidate index
  const sorted = alignment.slice().sort((a, b) => a.candIdx - b.candIdx);
  let chunks = 1;
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i]!;
    const prev = sorted[i - 1]!;
    // A new chunk starts when either candidate or reference indices are not consecutive
    if (cur.candIdx !== prev.candIdx + 1 || cur.refIdx !== prev.refIdx + 1) {
      chunks++;
    }
  }

  // Fragmentation penalty
  const fragRatio = chunks / matches;
  const penalty = beta * Math.pow(fragRatio, gamma);

  const score = Math.max(0, fMean * (1 - penalty));

  return { score, precision, recall, fMean, penalty, chunks, matches };
}

/* ── Perplexity ─────────────────────────────────────────────────── */

export interface PerplexityInput {
  /** Per-token log probabilities (base e). Must all be ≤ 0. */
  logProbs: number[];
}

export interface PerplexityResult {
  /** Perplexity value (lower = better model fit) */
  perplexity: number;
  /** Average negative log-likelihood */
  avgNLL: number;
  /** Number of tokens */
  tokenCount: number;
}

/**
 * Compute perplexity from per-token log probabilities.
 *
 * perplexity = exp(-1/N * Σ log P(token_i))
 *
 * Expects log probabilities (≤ 0). Higher perplexity = more surprised.
 */
export function computePerplexity(input: PerplexityInput): PerplexityResult {
  const { logProbs } = input;

  if (logProbs.length === 0) {
    return { perplexity: 1, avgNLL: 0, tokenCount: 0 };
  }

  // Validate: log probs should be ≤ 0
  for (let i = 0; i < logProbs.length; i++) {
    if ((logProbs[i] ?? 0) > 0) {
      throw new Error(`logProbs[${i}] = ${logProbs[i]} is positive; log probabilities must be ≤ 0`);
    }
  }

  const sumLogProbs = logProbs.reduce((sum, lp) => sum + lp, 0);
  const avgNLL = -sumLogProbs / logProbs.length;
  const perplexity = Math.exp(avgNLL);

  return {
    perplexity,
    avgNLL,
    tokenCount: logProbs.length,
  };
}

/* ── Levenshtein Distance ───────────────────────────────────────── */

export interface LevenshteinInput {
  /** Source string */
  source: string;
  /** Target string */
  target: string;
  /** Operate on word tokens instead of characters (default: false) */
  wordLevel?: boolean;
}

export interface LevenshteinResult {
  /** Raw edit distance */
  distance: number;
  /** Normalized distance (0-1, where 0 = identical) */
  normalized: number;
  /** Similarity (1 - normalized, 0-1 where 1 = identical) */
  similarity: number;
  /** Length of source sequence */
  sourceLength: number;
  /** Length of target sequence */
  targetLength: number;
}

/**
 * Compute Levenshtein edit distance.
 *
 * Supports both character-level and word-level distance.
 * Uses Wagner-Fischer algorithm with O(min(m,n)) space.
 */
export function computeLevenshtein(input: LevenshteinInput): LevenshteinResult {
  const wordLevel = input.wordLevel ?? false;

  const sourceSeq: string[] = wordLevel ? tokenize(input.source) : Array.from(input.source);
  const targetSeq: string[] = wordLevel ? tokenize(input.target) : Array.from(input.target);

  const m = sourceSeq.length;
  const n = targetSeq.length;

  if (m === 0 && n === 0) {
    return { distance: 0, normalized: 0, similarity: 1, sourceLength: 0, targetLength: 0 };
  }
  if (m === 0) {
    return { distance: n, normalized: 1, similarity: 0, sourceLength: 0, targetLength: n };
  }
  if (n === 0) {
    return { distance: m, normalized: 1, similarity: 0, sourceLength: m, targetLength: 0 };
  }

  // Ensure we iterate over the longer dimension in the outer loop for space efficiency
  // We use two rows: prev and curr
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let curr = new Array(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = sourceSeq[i - 1] === targetSeq[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        (prev[j] ?? 0) + 1,       // deletion
        (curr[j - 1] ?? 0) + 1,   // insertion
        (prev[j - 1] ?? 0) + cost  // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }

  const distance = prev[n] ?? 0;
  const maxLen = Math.max(m, n);
  const normalized = distance / maxLen;

  return {
    distance,
    normalized,
    similarity: 1 - normalized,
    sourceLength: m,
    targetLength: n,
  };
}
