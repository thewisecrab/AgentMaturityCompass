/**
 * instructionFormatter.ts — Instruction formatting with token estimation,
 * XML-style output, and budget enforcement.
 */

export interface FormattedInstruction {
  formatted: string;
  tokenEstimate: number;
  style: FormatStyle;
  withinBudget: boolean;
}

export type FormatStyle = 'concise' | 'detailed' | 'structured' | 'xml';

/* ── Token estimation (~4 chars per token) ───────────────────────── */

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/* ── Filler word removal ─────────────────────────────────────────── */

const FILLER_WORDS = /\b(just|really|very|basically|actually|simply|literally|quite|rather|somewhat|perhaps|maybe|definitely|certainly|probably)\b/gi;

function removeFiller(text: string): string {
  return text.replace(FILLER_WORDS, '').replace(/\s{2,}/g, ' ').trim();
}

/* ── Style formatters ────────────────────────────────────────────── */

function formatConcise(instruction: string): string {
  return removeFiller(instruction);
}

function formatDetailed(instruction: string): string {
  const clean = removeFiller(instruction);
  return [
    'Context: The following instruction should be executed carefully.',
    '',
    `Instruction: ${clean}`,
    '',
    'Requirements:',
    '- Execute all steps in order',
    '- Verify each step completes successfully',
    '- Report any issues encountered',
  ].join('\n');
}

function formatStructured(instruction: string): string {
  const sentences = instruction.split(/[.;]\s*/).filter(s => s.trim().length > 0);
  if (sentences.length <= 1) {
    return `1. ${removeFiller(instruction)}`;
  }
  return sentences.map((s, i) => `${i + 1}. ${removeFiller(s.trim())}`).join('\n');
}

function formatXml(instruction: string): string {
  const clean = removeFiller(instruction);
  const sentences = clean.split(/[.;]\s*/).filter(s => s.trim().length > 0);
  const steps = sentences.map((s, i) =>
    `  <step order="${i + 1}">${s.trim()}</step>`
  ).join('\n');
  return `<instruction>\n${steps}\n</instruction>`;
}

/* ── Budget enforcement ──────────────────────────────────────────── */

function enforeBudget(formatted: string, maxTokens: number): string {
  const tokens = estimateTokens(formatted);
  if (tokens <= maxTokens) return formatted;

  // Progressive truncation: keep within budget
  const charBudget = maxTokens * 4;
  return formatted.slice(0, charBudget).trim() + '...';
}

/* ── Public API ───────────────────────────────────────────────────── */

export function formatInstruction(
  instruction: string,
  style?: FormatStyle,
  maxTokens?: number,
): FormattedInstruction {
  const s = style ?? 'concise';
  let formatted: string;

  switch (s) {
    case 'concise':    formatted = formatConcise(instruction); break;
    case 'detailed':   formatted = formatDetailed(instruction); break;
    case 'structured': formatted = formatStructured(instruction); break;
    case 'xml':        formatted = formatXml(instruction); break;
  }

  const budget = maxTokens ?? Infinity;
  const withinBudget = estimateTokens(formatted) <= budget;
  if (!withinBudget && maxTokens) {
    formatted = enforeBudget(formatted, maxTokens);
  }

  return {
    formatted,
    tokenEstimate: estimateTokens(formatted),
    style: s,
    withinBudget,
  };
}

/* ── Batch formatting ────────────────────────────────────────────── */

export function formatInstructions(
  instructions: string[],
  style?: FormatStyle,
  totalBudget?: number,
): FormattedInstruction[] {
  const perItemBudget = totalBudget ? Math.floor(totalBudget / Math.max(instructions.length, 1)) : undefined;
  return instructions.map(inst => formatInstruction(inst, style, perItemBudget));
}
