/**
 * toolCostEstimator.ts — Model-specific pricing registry with batch
 * cost estimation and budget tracking.
 */

export interface CostEstimate {
  toolName: string;
  estimatedTokens: number;
  estimatedCost: number;
  currency: 'USD';
  model?: string;
}

export interface ModelPricing {
  model: string;
  inputPer1kTokens: number;
  outputPer1kTokens: number;
  contextWindow: number;
}

export interface BatchCostEstimate {
  totalTokens: number;
  totalCost: number;
  currency: 'USD';
  breakdown: CostEstimate[];
  budgetRemaining?: number;
}

/* ── Model pricing registry ──────────────────────────────────────── */

const MODEL_PRICING: Record<string, ModelPricing> = {
  'gpt-4o': { model: 'gpt-4o', inputPer1kTokens: 0.0025, outputPer1kTokens: 0.01, contextWindow: 128000 },
  'gpt-4o-mini': { model: 'gpt-4o-mini', inputPer1kTokens: 0.00015, outputPer1kTokens: 0.0006, contextWindow: 128000 },
  'gpt-4-turbo': { model: 'gpt-4-turbo', inputPer1kTokens: 0.01, outputPer1kTokens: 0.03, contextWindow: 128000 },
  'claude-3.5-sonnet': { model: 'claude-3.5-sonnet', inputPer1kTokens: 0.003, outputPer1kTokens: 0.015, contextWindow: 200000 },
  'claude-3-opus': { model: 'claude-3-opus', inputPer1kTokens: 0.015, outputPer1kTokens: 0.075, contextWindow: 200000 },
  'claude-3-haiku': { model: 'claude-3-haiku', inputPer1kTokens: 0.00025, outputPer1kTokens: 0.00125, contextWindow: 200000 },
  'gemini-1.5-pro': { model: 'gemini-1.5-pro', inputPer1kTokens: 0.00125, outputPer1kTokens: 0.005, contextWindow: 2000000 },
  'gemini-1.5-flash': { model: 'gemini-1.5-flash', inputPer1kTokens: 0.000075, outputPer1kTokens: 0.0003, contextWindow: 1000000 },
};

const customPricing = new Map<string, ModelPricing>();

export function registerModelPricing(pricing: ModelPricing): void {
  customPricing.set(pricing.model, pricing);
}

export function getModelPricing(model: string): ModelPricing | undefined {
  return customPricing.get(model) ?? MODEL_PRICING[model];
}

export function listModels(): string[] {
  return [...new Set([...Object.keys(MODEL_PRICING), ...customPricing.keys()])];
}

/* ── Tool cost table ─────────────────────────────────────────────── */

const TOOL_COST_TABLE: Record<string, { tokensPerCall: number; costPer1kTokens: number }> = {
  'web_search': { tokensPerCall: 500, costPer1kTokens: 0.002 },
  'web_fetch': { tokensPerCall: 2000, costPer1kTokens: 0.002 },
  'code_interpreter': { tokensPerCall: 1000, costPer1kTokens: 0.003 },
  'image_generation': { tokensPerCall: 1500, costPer1kTokens: 0.02 },
  'embedding': { tokensPerCall: 300, costPer1kTokens: 0.0001 },
};

const DEFAULT_TOOL_COST = { tokensPerCall: 500, costPer1kTokens: 0.003 };

/* ── Single estimate ─────────────────────────────────────────────── */

export function estimateCost(toolName: string, args: Record<string, unknown>, model?: string): CostEstimate {
  const argSize = JSON.stringify(args).length;
  const argTokens = Math.ceil(argSize / 4);

  if (model) {
    const pricing = getModelPricing(model);
    if (pricing) {
      const estimatedTokens = argTokens + 100; // base overhead
      const inputCost = (argTokens / 1000) * pricing.inputPer1kTokens;
      const outputCost = (100 / 1000) * pricing.outputPer1kTokens;
      return { toolName, estimatedTokens, estimatedCost: inputCost + outputCost, currency: 'USD', model };
    }
  }

  const info = TOOL_COST_TABLE[toolName] ?? DEFAULT_TOOL_COST;
  const estimatedTokens = info.tokensPerCall + argTokens;
  const estimatedCost = (estimatedTokens / 1000) * info.costPer1kTokens;
  return { toolName, estimatedTokens, estimatedCost, currency: 'USD', model };
}

/* ── Batch estimate ──────────────────────────────────────────────── */

export function estimateBatchCost(
  calls: Array<{ toolName: string; args: Record<string, unknown> }>,
  model?: string,
  budget?: number,
): BatchCostEstimate {
  const breakdown = calls.map(c => estimateCost(c.toolName, c.args, model));
  const totalTokens = breakdown.reduce((s, e) => s + e.estimatedTokens, 0);
  const totalCost = breakdown.reduce((s, e) => s + e.estimatedCost, 0);
  return {
    totalTokens,
    totalCost,
    currency: 'USD',
    breakdown,
    budgetRemaining: budget !== undefined ? budget - totalCost : undefined,
  };
}

/* ── Cost comparison across models ───────────────────────────────── */

export function compareModelCosts(
  calls: Array<{ toolName: string; args: Record<string, unknown> }>,
  models: string[],
): Record<string, { totalCost: number; totalTokens: number }> {
  const result: Record<string, { totalCost: number; totalTokens: number }> = {};
  for (const model of models) {
    const est = estimateBatchCost(calls, model);
    result[model] = { totalCost: est.totalCost, totalTokens: est.totalTokens };
  }
  return result;
}
