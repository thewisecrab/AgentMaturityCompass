/**
 * contentModerationBot.ts — Keyword + pattern-based content classification
 * with multi-category violation detection.
 */

import { AMCAgentBase } from './agentBase.js';

export type ContentCategory = 'safe' | 'unsafe' | 'uncertain';
export type ViolationType = 'hate_speech' | 'harassment' | 'violence' | 'spam' | 'sexual' | 'self_harm' | 'none';

export interface ModerationDecision {
  category: ContentCategory;
  violationType: ViolationType;
  confidence: number;
  flags: string[];
  reasoning: string;
}

/* ── Pattern definitions ─────────────────────────────────────────── */

const VIOLATION_PATTERNS: Record<ViolationType, RegExp[]> = {
  hate_speech: [
    /\b(hate|slur|racist|bigot|xenophob)\w*\b/i,
    /\b(kill\s+all|exterminate|genocide)\b/i,
  ],
  harassment: [
    /\b(stalk|doxx|threaten|intimidat)\w*\b/i,
    /\b(i\s+will\s+(find|hurt|harm|get)\s+you|watch\s+your\s+back)\b/i,
    /\b(destroy\s+(you|everything)|ruin\s+your)\b/i,
  ],
  violence: [
    /\b(bomb|weapon|attack|murder|assault|kill|hurt|harm|destroy)\w*\b/i,
    /\b(how\s+to\s+make\s+a\s+(bomb|weapon))\b/i,
    /\b(i\s+will\s+(hurt|kill|attack|destroy))\b/i,
  ],
  spam: [
    /\b(buy\s+now|limited\s+offer|act\s+fast|click\s+here)\b/i,
    /\b(nigerian\s+prince|congratulations\s+you\s+won)\b/i,
    /(http\S+){3,}/i, // Multiple URLs
  ],
  sexual: [
    /\b(explicit|nsfw|xxx|porn)\w*\b/i,
  ],
  self_harm: [
    /\b(kill\s+myself|end\s+it\s+all|want\s+to\s+die)\b/i,
    /\b(self[- ]harm|suicid)\w*\b/i,
  ],
  none: [],
};

/* ── Moderation logic ────────────────────────────────────────────── */

function classifyContent(content: string): ModerationDecision {
  const flags: string[] = [];
  let worstViolation: ViolationType = 'none';
  let maxConfidence = 0;
  const reasons: string[] = [];

  for (const [type, patterns] of Object.entries(VIOLATION_PATTERNS) as Array<[ViolationType, RegExp[]]>) {
    if (type === 'none') continue;
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        flags.push(`${type}:${pattern.source.slice(0, 30)}`);
        const confidence = 0.6 + Math.random() * 0.3; // Simulate varying confidence
        if (confidence > maxConfidence) {
          maxConfidence = confidence;
          worstViolation = type;
        }
        reasons.push(`Detected ${type} pattern`);
      }
    }
  }

  if (flags.length === 0) {
    return { category: 'safe', violationType: 'none', confidence: 0.95, flags: [], reasoning: 'No violations detected' };
  }

  const category: ContentCategory = maxConfidence > 0.8 ? 'unsafe' : 'uncertain';
  return {
    category,
    violationType: worstViolation,
    confidence: maxConfidence,
    flags,
    reasoning: reasons.join('; '),
  };
}

/* ── Agent class ─────────────────────────────────────────────────── */

export class ContentModerationBot extends AMCAgentBase {
  constructor() {
    super({ name: 'ContentModerationBot', type: 'content-moderation' });
  }

  async run(input: unknown): Promise<ModerationDecision> {
    const content = typeof input === 'string' ? input : JSON.stringify(input);
    let result!: ModerationDecision;

    await this.executeAction('moderate', async () => {
      result = classifyContent(content);
    });

    return result;
  }

  /** Moderate a batch of content */
  async moderateBatch(contents: string[]): Promise<ModerationDecision[]> {
    const results: ModerationDecision[] = [];
    for (const content of contents) {
      results.push(await this.run(content));
    }
    return results;
  }
}

/** Convenience function */
export function moderate(content: string): ModerationDecision {
  return classifyContent(content);
}
