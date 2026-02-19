export interface ContextOptResult { optimized: string; tokensReduced: number; }

export function optimizeContext(context: string, maxTokens?: number): ContextOptResult {
  const max = maxTokens ?? 4000;
  const tokens = context.split(/\s+/).length;
  if (tokens <= max) return { optimized: context, tokensReduced: 0 };
  const optimized = context.split(/\s+/).slice(0, max).join(' ');
  return { optimized, tokensReduced: tokens - max };
}
