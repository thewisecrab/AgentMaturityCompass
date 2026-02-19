import { emitGuardEvent } from './evidenceEmitter.js';
/**
 * Model routing switchboard.
 */

export interface EnforceRouteDecision {
  model: string;
  provider: string;
  reason: string;
  estimatedCost: number;
}

export interface EnforceRoutingProfile {
  name: string;
  model: string;
  provider: string;
  costPer1kTokens: number;
  qualityScore: number;
}

const DEFAULT_PROFILES: EnforceRoutingProfile[] = [
  { name: 'gpt-4o', model: 'gpt-4o', provider: 'openai', costPer1kTokens: 0.005, qualityScore: 0.95 },
  { name: 'claude-sonnet', model: 'claude-sonnet-4-20250514', provider: 'anthropic', costPer1kTokens: 0.003, qualityScore: 0.93 },
  { name: 'gemini-pro', model: 'gemini-pro', provider: 'google', costPer1kTokens: 0.001, qualityScore: 0.88 },
];

export class ModelSwitchboard {
  private profiles: EnforceRoutingProfile[] = [...DEFAULT_PROFILES];

  route(taskType: string, qualityRequirement?: number): EnforceRouteDecision {
    const minQuality = qualityRequirement ?? 0.8;
    const eligible = this.profiles.filter(p => p.qualityScore >= minQuality);
    const chosen = eligible.length > 0
      ? eligible.sort((a, b) => a.costPer1kTokens - b.costPer1kTokens)[0]!
      : this.profiles[0]!;

    return {
      model: chosen.model,
      provider: chosen.provider,
      reason: `Best cost/quality for ${taskType}: ${chosen.name}`,
      estimatedCost: chosen.costPer1kTokens,
    };
  }

  addProfile(profile: EnforceRoutingProfile): void {
    this.profiles.push(profile);
  }
}