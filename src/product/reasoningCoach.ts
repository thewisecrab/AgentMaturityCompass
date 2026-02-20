/**
 * reasoningCoach.ts — Reasoning quality analysis with structural checks,
 * depth scoring, evidence detection, and actionable suggestions.
 */

/* ── Interfaces ──────────────────────────────────────────────────── */

/** Backward-compat shape from stubs.ts (extended) */
export interface CoachingResult { suggestions: string[]; quality: number; }

export interface ReasoningAnalysis {
  structure: number;
  depth: number;
  clarity: number;
  evidence: number;
  suggestions: string[];
  quality: number;
}

/* ── Heuristic checks ────────────────────────────────────────────── */

const CAUSAL = /\b(because|therefore|thus|hence|consequently|as a result|since|so that|due to|owing to)\b/gi;
const EVIDENCE = /\b(according to|data shows?|study|research|statistics?|survey|experiment|measured|observed|reported)\b/gi;
const CONNECTORS = /\b(however|although|moreover|furthermore|in addition|on the other hand|conversely|nevertheless|additionally|similarly)\b/gi;
const SECTIONS = /^#{1,6}\s|^\d+[.)]\s|^[-*]\s/gm;
const QUANTITATIVE = /\b\d+(\.\d+)?(%| percent|x| times| fold)\b/gi;
const COUNTER = /\b(however|on the other hand|conversely|although|despite|counterargument|objection|critic|alternatively)\b/gi;

function countMatches(text: string, re: RegExp): number {
  return (text.match(re) ?? []).length;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/* ── Analysis ────────────────────────────────────────────────────── */

export function analyzeReasoning(text: string): ReasoningAnalysis {
  const suggestions: string[] = [];
  const words = text.split(/\s+/).filter(Boolean).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

  // Structure: presence of sections, numbered items, or bullet points
  const sectionCount = countMatches(text, SECTIONS);
  const structure = clamp01(sectionCount / 3);
  if (sectionCount === 0) suggestions.push('Add structural elements (headings, bullet points, or numbered lists)');

  // Depth: causal explanations and logical connectors
  const causalCount = countMatches(text, CAUSAL);
  const connectorCount = countMatches(text, CONNECTORS);
  const depth = clamp01((causalCount * 0.3 + connectorCount * 0.2) / Math.max(sentences, 1));
  if (causalCount === 0) suggestions.push('Include causal explanations (because, therefore, thus)');
  if (connectorCount === 0) suggestions.push('Use logical connectors to link ideas (however, moreover, furthermore)');

  // Clarity: sentence length, word diversity
  const avgSentenceLen = sentences > 0 ? words / sentences : words;
  const clarity = clamp01(1 - Math.abs(avgSentenceLen - 18) / 30);
  if (avgSentenceLen > 35) suggestions.push('Consider breaking long sentences for clarity');
  if (words < 30) suggestions.push('Provide more detailed reasoning');

  // Evidence: references to data, studies, quantitative claims
  const evidenceCount = countMatches(text, EVIDENCE);
  const quantCount = countMatches(text, QUANTITATIVE);
  const evidence = clamp01((evidenceCount * 0.4 + quantCount * 0.3) / Math.max(sentences, 1));
  if (evidenceCount === 0) suggestions.push('Reference evidence or data to support claims');
  if (quantCount === 0) suggestions.push('Include quantitative evidence where possible');

  // Counterarguments
  const counterCount = countMatches(text, COUNTER);
  if (counterCount === 0) suggestions.push('Address potential counterarguments');

  // Overall quality: weighted average
  const quality = Math.round(
    (structure * 0.2 + depth * 0.3 + clarity * 0.2 + evidence * 0.3) * 100
  ) / 100;

  return {
    structure: Math.round(structure * 100) / 100,
    depth: Math.round(depth * 100) / 100,
    clarity: Math.round(clarity * 100) / 100,
    evidence: Math.round(evidence * 100) / 100,
    suggestions,
    quality,
  };
}

export function batchAnalyze(texts: string[]): ReasoningAnalysis[] {
  return texts.map(t => analyzeReasoning(t));
}

/* ── Legacy compat ───────────────────────────────────────────────── */

export function coachReasoning(reasoning: string): CoachingResult {
  const analysis = analyzeReasoning(reasoning);
  return { suggestions: analysis.suggestions, quality: analysis.quality };
}
