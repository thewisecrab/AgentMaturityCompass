import { randomUUID } from 'node:crypto';

export interface Outcome { type: string; complexity: number; value: number; }
export interface ROIEstimate { roi: number; breakEvenCalls: number; monthlySavings: number; }
export interface TierPrice { tier: string; price: number; features: string[]; }
export interface OutcomePrice { priceId: string; outcome: string; price: number; }

const TIERS: Record<string, TierPrice> = {
  free: { tier: 'free', price: 0, features: ['5 agents', '100 calls/day', 'community support'] },
  starter: { tier: 'starter', price: 49, features: ['20 agents', '1000 calls/day', 'email support', 'basic analytics'] },
  pro: { tier: 'pro', price: 199, features: ['unlimited agents', '10000 calls/day', 'priority support', 'advanced analytics', 'custom tools'] },
  enterprise: { tier: 'enterprise', price: 999, features: ['unlimited everything', 'SLA', 'dedicated support', 'custom integrations', 'on-prem option'] },
};

export function calculateOutcomePrice(outcome: Outcome, baseCost: number): number {
  const complexityMultiplier = 1 + (outcome.complexity - 1) * 0.25;
  const valueMultiplier = outcome.value > 1000 ? 1.5 : outcome.value > 100 ? 1.2 : 1;
  return Math.round(baseCost * complexityMultiplier * valueMultiplier * 100) / 100;
}

export function estimateROI(agentType: string, usage: { calls: number; savings: number; errors: number }): ROIEstimate {
  const costPerCall = agentType === 'premium' ? 0.05 : 0.01;
  const totalCost = usage.calls * costPerCall;
  const errorCost = usage.errors * 2;
  const netSavings = usage.savings - totalCost - errorCost;
  const roi = totalCost > 0 ? netSavings / totalCost : 0;
  const breakEvenCalls = usage.savings > 0 ? Math.ceil(totalCost / (usage.savings / Math.max(usage.calls, 1))) : Infinity;
  return { roi: Math.round(roi * 100) / 100, breakEvenCalls, monthlySavings: Math.round(netSavings * 100) / 100 };
}

export function getPrice(tierId: string): TierPrice | undefined { return TIERS[tierId]; }

export function priceOutcome(outcome: string, basePrice: number): OutcomePrice {
  return { priceId: randomUUID(), outcome, price: basePrice };
}
