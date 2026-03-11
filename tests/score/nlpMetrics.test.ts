import { describe, it, expect } from "vitest";
import {
  tokenize,
  computeBLEU,
  computeROUGE,
  computeMETEOR,
  computePerplexity,
  computeLevenshtein,
} from "../../src/score/nlpMetrics.js";

/* ── Tokenizer ─────────────────────────────────────────────────── */

describe("tokenize", () => {
  it("lowercases and strips punctuation", () => {
    expect(tokenize("Hello, World!")).toEqual(["hello", "world"]);
  });

  it("handles empty string", () => {
    expect(tokenize("")).toEqual([]);
  });

  it("handles multiple spaces", () => {
    expect(tokenize("  one   two  ")).toEqual(["one", "two"]);
  });
});

/* ── BLEU ──────────────────────────────────────────────────────── */

describe("computeBLEU", () => {
  it("returns 1.0 for identical candidate and reference", () => {
    const result = computeBLEU({
      candidate: "the cat sat on the mat",
      references: ["the cat sat on the mat"],
    });
    expect(result.score).toBeCloseTo(1.0, 2);
    expect(result.brevityPenalty).toBe(1);
  });

  it("returns 0 for empty candidate", () => {
    const result = computeBLEU({
      candidate: "",
      references: ["the cat sat on the mat"],
    });
    expect(result.score).toBe(0);
    expect(result.candidateLength).toBe(0);
  });

  it("returns 0 for completely different texts", () => {
    const result = computeBLEU({
      candidate: "xyz abc def",
      references: ["the cat sat on the mat"],
    });
    expect(result.score).toBe(0);
    expect(result.precisions[0]).toBe(0);
  });

  it("applies brevity penalty when candidate is shorter", () => {
    const result = computeBLEU({
      candidate: "the cat",
      references: ["the cat sat on the mat"],
    });
    expect(result.brevityPenalty).toBeLessThan(1);
  });

  it("handles multiple references (picks closest length)", () => {
    const result = computeBLEU({
      candidate: "the cat sat on the mat",
      references: [
        "the cat sat on the mat",
        "a cat is sitting on the mat in the room",
      ],
    });
    expect(result.referenceLength).toBe(6); // closest to candidate length 6
    expect(result.score).toBeCloseTo(1.0, 2);
  });

  it("supports custom maxN", () => {
    const result = computeBLEU({
      candidate: "the cat sat",
      references: ["the cat sat on the mat"],
      maxN: 2,
      weights: [0.5, 0.5],
    });
    expect(result.precisions).toHaveLength(2);
  });

  it("throws on weights/maxN mismatch", () => {
    expect(() =>
      computeBLEU({
        candidate: "hello",
        references: ["hello"],
        maxN: 4,
        weights: [0.5, 0.5],
      })
    ).toThrow("weights length");
  });

  it("partial overlap gives score between 0 and 1", () => {
    const result = computeBLEU({
      candidate: "the cat sat on a mat",
      references: ["the cat sat on the mat"],
    });
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(1);
  });
});

/* ── ROUGE ─────────────────────────────────────────────────────── */

describe("computeROUGE", () => {
  it("returns perfect scores for identical texts", () => {
    const result = computeROUGE({
      candidate: "the cat sat on the mat",
      reference: "the cat sat on the mat",
    });
    expect(result.rouge1.f1).toBeCloseTo(1.0, 2);
    expect(result.rouge2.f1).toBeCloseTo(1.0, 2);
    expect(result.rougeL.f1).toBeCloseTo(1.0, 2);
  });

  it("returns 0 for completely different texts", () => {
    const result = computeROUGE({
      candidate: "xyz abc",
      reference: "the cat sat",
    });
    expect(result.rouge1.f1).toBe(0);
    expect(result.rouge2.f1).toBe(0);
    expect(result.rougeL.f1).toBe(0);
  });

  it("handles empty candidate", () => {
    const result = computeROUGE({
      candidate: "",
      reference: "the cat sat",
    });
    expect(result.rouge1.f1).toBe(0);
    expect(result.rougeL.f1).toBe(0);
  });

  it("handles both empty", () => {
    const result = computeROUGE({ candidate: "", reference: "" });
    expect(result.rouge1.f1).toBe(1);
    expect(result.rougeL.f1).toBe(1);
  });

  it("ROUGE-1 recall measures unigram coverage", () => {
    const result = computeROUGE({
      candidate: "the cat",
      reference: "the cat sat on the mat",
    });
    // candidate has "the", "cat" → 2 matches out of 6 ref unigrams
    // but "the" appears twice in ref, once in candidate
    expect(result.rouge1.recall).toBeGreaterThan(0);
    expect(result.rouge1.recall).toBeLessThan(1);
  });

  it("ROUGE-L captures longest common subsequence", () => {
    const result = computeROUGE({
      candidate: "the cat is on the mat today",
      reference: "the cat sat on the mat",
    });
    expect(result.rougeL.f1).toBeGreaterThan(0);
    expect(result.rougeL.f1).toBeLessThan(1);
  });

  it("ROUGE-2 captures bigram overlap", () => {
    const result = computeROUGE({
      candidate: "the cat sat on the mat",
      reference: "the cat sat on a mat",
    });
    // Most bigrams match except "the mat" vs "a mat"
    expect(result.rouge2.f1).toBeGreaterThan(0.5);
  });
});

/* ── METEOR ────────────────────────────────────────────────────── */

describe("computeMETEOR", () => {
  it("returns 1.0 for identical texts", () => {
    const result = computeMETEOR({
      candidate: "the cat sat on the mat",
      reference: "the cat sat on the mat",
    });
    // Perfect match, single chunk, low penalty
    expect(result.score).toBeGreaterThan(0.9);
    expect(result.matches).toBeGreaterThan(0);
  });

  it("returns 0 for completely different texts", () => {
    const result = computeMETEOR({
      candidate: "xyz abc def",
      reference: "the cat sat on the mat",
    });
    expect(result.score).toBe(0);
    expect(result.matches).toBe(0);
  });

  it("handles empty candidate", () => {
    const result = computeMETEOR({ candidate: "", reference: "hello world" });
    expect(result.score).toBe(0);
  });

  it("handles both empty", () => {
    const result = computeMETEOR({ candidate: "", reference: "" });
    expect(result.score).toBe(1);
  });

  it("penalizes fragmented matches", () => {
    // Reordered words → more chunks → higher penalty
    const aligned = computeMETEOR({
      candidate: "the cat sat on the mat",
      reference: "the cat sat on the mat",
    });
    const fragmented = computeMETEOR({
      candidate: "mat the on sat cat the",
      reference: "the cat sat on the mat",
    });
    expect(aligned.score).toBeGreaterThan(fragmented.score);
  });

  it("precision and recall are computed correctly", () => {
    const result = computeMETEOR({
      candidate: "the cat sat",
      reference: "the cat sat on the mat",
    });
    expect(result.precision).toBeCloseTo(1.0, 2); // all candidate tokens match
    expect(result.recall).toBeLessThan(1); // not all ref tokens matched
  });

  it("respects custom alpha parameter", () => {
    const recallHeavy = computeMETEOR({
      candidate: "the cat",
      reference: "the cat sat on the mat",
      alpha: 0.9,
    });
    const precisionHeavy = computeMETEOR({
      candidate: "the cat",
      reference: "the cat sat on the mat",
      alpha: 0.1,
    });
    // recall-heavy penalizes low recall less
    expect(precisionHeavy.fMean).toBeGreaterThan(recallHeavy.fMean);
  });
});

/* ── Perplexity ────────────────────────────────────────────────── */

describe("computePerplexity", () => {
  it("returns 1 for empty input", () => {
    const result = computePerplexity({ logProbs: [] });
    expect(result.perplexity).toBe(1);
    expect(result.tokenCount).toBe(0);
  });

  it("computes correct perplexity for uniform distribution", () => {
    // log(1/10) = -2.302... for 10-way uniform → perplexity = 10
    const logP = Math.log(1 / 10);
    const result = computePerplexity({ logProbs: [logP, logP, logP] });
    expect(result.perplexity).toBeCloseTo(10, 1);
    expect(result.tokenCount).toBe(3);
  });

  it("returns lower perplexity for higher probability tokens", () => {
    const highProb = computePerplexity({ logProbs: [Math.log(0.9), Math.log(0.9)] });
    const lowProb = computePerplexity({ logProbs: [Math.log(0.1), Math.log(0.1)] });
    expect(highProb.perplexity).toBeLessThan(lowProb.perplexity);
  });

  it("throws for positive log probabilities", () => {
    expect(() => computePerplexity({ logProbs: [0.5] })).toThrow("positive");
  });

  it("accepts log prob of 0 (probability 1)", () => {
    const result = computePerplexity({ logProbs: [0, 0, 0] });
    expect(result.perplexity).toBeCloseTo(1, 5);
  });

  it("computes correct avgNLL", () => {
    const logProbs = [Math.log(0.5), Math.log(0.25)];
    const result = computePerplexity({ logProbs });
    const expectedAvgNLL = -(logProbs[0] + logProbs[1]) / 2;
    expect(result.avgNLL).toBeCloseTo(expectedAvgNLL, 5);
  });
});

/* ── Levenshtein ───────────────────────────────────────────────── */

describe("computeLevenshtein", () => {
  it("returns 0 distance for identical strings", () => {
    const result = computeLevenshtein({ source: "hello", target: "hello" });
    expect(result.distance).toBe(0);
    expect(result.similarity).toBe(1);
  });

  it("returns target length for empty source", () => {
    const result = computeLevenshtein({ source: "", target: "abc" });
    expect(result.distance).toBe(3);
    expect(result.normalized).toBe(1);
  });

  it("returns source length for empty target", () => {
    const result = computeLevenshtein({ source: "abc", target: "" });
    expect(result.distance).toBe(3);
  });

  it("returns 0 for both empty", () => {
    const result = computeLevenshtein({ source: "", target: "" });
    expect(result.distance).toBe(0);
    expect(result.similarity).toBe(1);
  });

  it("computes correct distance for kitten→sitting", () => {
    const result = computeLevenshtein({ source: "kitten", target: "sitting" });
    expect(result.distance).toBe(3); // k→s, e→i, +g
  });

  it("computes correct distance for simple substitution", () => {
    const result = computeLevenshtein({ source: "cat", target: "bat" });
    expect(result.distance).toBe(1);
  });

  it("computes normalized distance correctly", () => {
    const result = computeLevenshtein({ source: "abc", target: "def" });
    expect(result.distance).toBe(3);
    expect(result.normalized).toBeCloseTo(1.0, 5);
    expect(result.similarity).toBeCloseTo(0, 5);
  });

  it("supports word-level distance", () => {
    const result = computeLevenshtein({
      source: "the cat sat",
      target: "the dog sat",
      wordLevel: true,
    });
    expect(result.distance).toBe(1); // cat → dog
    expect(result.sourceLength).toBe(3);
    expect(result.targetLength).toBe(3);
  });

  it("word-level handles insertion and deletion", () => {
    const result = computeLevenshtein({
      source: "the cat sat on the mat",
      target: "the cat on the mat",
      wordLevel: true,
    });
    expect(result.distance).toBe(1); // delete "sat"
  });

  it("similarity is between 0 and 1", () => {
    const result = computeLevenshtein({ source: "hello", target: "world" });
    expect(result.similarity).toBeGreaterThanOrEqual(0);
    expect(result.similarity).toBeLessThanOrEqual(1);
  });
});
