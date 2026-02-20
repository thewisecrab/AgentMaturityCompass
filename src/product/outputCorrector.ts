/**
 * outputCorrector.ts — Rule-based output correction with configurable
 * pattern rules, batch processing, and correction statistics.
 */

/* ── Interfaces ──────────────────────────────────────────────────── */

export interface CorrectionRule {
  pattern: RegExp;
  replacement: string;
  category: string;
}

/** Backward-compat shape from stubs.ts */
export interface CorrectionResult { corrected: string; corrections: number; }

export interface CorrectionReport {
  corrected: string;
  corrections: number;
  rulesApplied: string[];
  originalLength: number;
  correctedLength: number;
}

/* ── Built-in rules ──────────────────────────────────────────────── */

const BUILTIN_RULES: CorrectionRule[] = [
  { pattern: /[ \t]+$/gm, replacement: '', category: 'whitespace' },
  { pattern: / {2,}/g, replacement: ' ', category: 'whitespace' },
  { pattern: /\n{3,}/g, replacement: '\n\n', category: 'whitespace' },
  { pattern: /^(#{1,6})([^ #\n])/gm, replacement: '$1 $2', category: 'markdown' },
  { pattern: /(\w)"(\w)/g, replacement: "$1' $2", category: 'quotes' },
];

/* ── Class ───────────────────────────────────────────────────────── */

export class OutputCorrector {
  private rules: CorrectionRule[] = [...BUILTIN_RULES];
  private totalCorrections = 0;
  private totalRuns = 0;

  addRule(pattern: RegExp, replacement: string, category: string): number {
    this.rules.push({ pattern, replacement, category });
    return this.rules.length - 1;
  }

  removeRule(idx: number): boolean {
    if (idx < 0 || idx >= this.rules.length) return false;
    this.rules.splice(idx, 1);
    return true;
  }

  listRules(): Array<{ index: number; category: string; pattern: string }> {
    return this.rules.map((r, i) => ({
      index: i, category: r.category, pattern: r.pattern.source,
    }));
  }

  correct(output: string): CorrectionReport {
    let corrected = output;
    const rulesApplied: string[] = [];

    for (const rule of this.rules) {
      // Re-create regex to reset lastIndex for global patterns
      const re = new RegExp(rule.pattern.source, rule.pattern.flags);
      const before = corrected;
      corrected = corrected.replace(re, rule.replacement);
      if (corrected !== before) {
        rulesApplied.push(rule.category);
      }
    }

    const corrections = rulesApplied.length;
    this.totalCorrections += corrections;
    this.totalRuns++;

    return {
      corrected,
      corrections,
      rulesApplied: [...new Set(rulesApplied)],
      originalLength: output.length,
      correctedLength: corrected.length,
    };
  }

  batchCorrect(outputs: string[]): CorrectionReport[] {
    return outputs.map(o => this.correct(o));
  }

  getStats(): { totalRuns: number; totalCorrections: number; ruleCount: number; avgCorrectionsPerRun: number } {
    return {
      totalRuns: this.totalRuns,
      totalCorrections: this.totalCorrections,
      ruleCount: this.rules.length,
      avgCorrectionsPerRun: this.totalRuns > 0
        ? Math.round((this.totalCorrections / this.totalRuns) * 100) / 100
        : 0,
    };
  }
}

/* ── Legacy compat ───────────────────────────────────────────────── */

const defaultCorrector = new OutputCorrector();

export function correctOutput(output: string): CorrectionResult {
  const report = defaultCorrector.correct(output);
  return { corrected: report.corrected, corrections: report.corrections };
}
