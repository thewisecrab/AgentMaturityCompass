/**
 * Publisher reputation scoring.
 */

export interface ReputationResult {
  score: number;
  trusted: boolean;
  flags: string[];
}

const TRUSTED_PUBLISHERS = new Set(['openai', 'anthropic', 'google', 'microsoft', 'meta', 'amc-official']);

export function checkReputation(publisherId: string, signals?: string[]): ReputationResult {
  const flags: string[] = [];
  let score = 50;

  if (TRUSTED_PUBLISHERS.has(publisherId.toLowerCase())) {
    score += 40;
  } else if (publisherId.length < 3) {
    score -= 20;
    flags.push('Publisher ID suspiciously short');
  }

  if (signals) {
    for (const s of signals) {
      if (s === 'verified') score += 10;
      if (s === 'new_account') { score -= 15; flags.push('New account'); }
      if (s === 'reported') { score -= 25; flags.push('Previously reported'); }
    }
  }

  score = Math.max(0, Math.min(100, score));
  return { score, trusted: score >= 70, flags };
}
