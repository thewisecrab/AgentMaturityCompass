import { randomUUID } from 'node:crypto';

export interface CoachingResult { suggestions: string[]; quality: number; issues: { type: string; description: string }[]; }

const FALLACY_PATTERNS: { pattern: RegExp; type: string; description: string }[] = [
  { pattern: /everyone knows|it's obvious|clearly/i, type: 'appeal_to_common_belief', description: 'Appeal to common belief without evidence' },
  { pattern: /experts say|studies show|research proves/i, type: 'vague_authority', description: 'Vague appeal to authority without specific citation' },
  { pattern: /always|never|every single/i, type: 'hasty_generalization', description: 'Hasty generalization using absolute terms' },
  { pattern: /therefore.*because.*therefore|because.*therefore.*because/i, type: 'circular_reasoning', description: 'Possible circular reasoning detected' },
  { pattern: /if we allow.*then.*will/i, type: 'slippery_slope', description: 'Slippery slope argument without intermediate justification' },
];

export function coachReasoning(output: string, criteria?: string[]): CoachingResult {
  const suggestions: string[] = [];
  const issues: CoachingResult['issues'] = [];

  for (const f of FALLACY_PATTERNS) {
    if (f.pattern.test(output)) issues.push({ type: f.type, description: f.description });
  }

  if (output.length < 50) suggestions.push('Provide more detailed reasoning');
  if (!output.includes('because') && !output.includes('since') && !output.includes('due to'))
    suggestions.push('Include causal explanations (because, since, due to)');
  if (!/\d/.test(output)) suggestions.push('Consider including quantitative evidence');
  if (!output.includes('however') && !output.includes('although') && !output.includes('but'))
    suggestions.push('Consider addressing counterarguments');

  if (criteria) {
    for (const c of criteria) {
      if (!output.toLowerCase().includes(c.toLowerCase())) suggestions.push(`Missing criteria: ${c}`);
    }
  }

  const quality = Math.max(0, 1 - issues.length * 0.15 - suggestions.length * 0.1);
  return { suggestions, quality: Math.round(quality * 100) / 100, issues };
}
