/**
 * Cost/latency routing — routes tasks to optimal model profiles.
 */

export interface RoutingProfile {
  name: string;
  model: string;
  estimatedCostPer1k: number;
  estimatedLatencyMs: number;
  qualityScore: number;
}

export interface RouteResult {
  profile: RoutingProfile;
  rationale: string;
}

const DEFAULT_PROFILES: RoutingProfile[] = [
  { name: 'gpt-4o', model: 'gpt-4o', estimatedCostPer1k: 0.005, estimatedLatencyMs: 800, qualityScore: 0.95 },
  { name: 'claude-sonnet', model: 'claude-sonnet-4-20250514', estimatedCostPer1k: 0.003, estimatedLatencyMs: 600, qualityScore: 0.93 },
  { name: 'gemini-flash', model: 'gemini-flash', estimatedCostPer1k: 0.0005, estimatedLatencyMs: 300, qualityScore: 0.82 },
];

export class CostLatencyRouter {
  private profiles: RoutingProfile[] = [...DEFAULT_PROFILES];

  route(taskType: string, maxCost?: number, maxLatency?: number): RouteResult {
    let eligible = this.profiles;
    if (maxCost !== undefined) eligible = eligible.filter(p => p.estimatedCostPer1k <= maxCost);
    if (maxLatency !== undefined) eligible = eligible.filter(p => p.estimatedLatencyMs <= maxLatency);
    if (eligible.length === 0) eligible = this.profiles;

    const chosen = eligible.sort((a, b) => (b.qualityScore / b.estimatedCostPer1k) - (a.qualityScore / a.estimatedCostPer1k))[0]!;
    return { profile: chosen, rationale: `Best value for ${taskType}: ${chosen.name}` };
  }

  addProfile(profile: RoutingProfile): void {
    this.profiles.push(profile);
  }
}
