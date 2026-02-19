/**
 * Tool cost estimation — estimates token and dollar costs.
 */

export interface CostEstimate {
  toolName: string;
  estimatedTokens: number;
  estimatedCost: number;
  currency: 'USD';
}

const COST_TABLE: Record<string, { tokensPerCall: number; costPer1kTokens: number }> = {
  'web_search': { tokensPerCall: 500, costPer1kTokens: 0.002 },
  'web_fetch': { tokensPerCall: 2000, costPer1kTokens: 0.002 },
  'code_interpreter': { tokensPerCall: 1000, costPer1kTokens: 0.003 },
  'image_generation': { tokensPerCall: 1500, costPer1kTokens: 0.02 },
  'embedding': { tokensPerCall: 300, costPer1kTokens: 0.0001 },
};

const DEFAULT_COST = { tokensPerCall: 500, costPer1kTokens: 0.003 };

export function estimateCost(toolName: string, args: Record<string, unknown>): CostEstimate {
  const info = COST_TABLE[toolName] ?? DEFAULT_COST;
  const argSize = JSON.stringify(args).length;
  const estimatedTokens = info.tokensPerCall + Math.ceil(argSize / 4);
  const estimatedCost = (estimatedTokens / 1000) * info.costPer1kTokens;

  return { toolName, estimatedTokens, estimatedCost, currency: 'USD' };
}
