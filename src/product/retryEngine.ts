/**
 * Retry engine — exponential backoff with jitter.
 */

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitter?: boolean;
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  attempts: number;
  totalDelayMs: number;
  lastError?: string;
}

const DEFAULT_CONFIG: RetryConfig = { maxAttempts: 3, baseDelayMs: 1000, maxDelayMs: 30000, jitter: true };

export async function withRetry<T>(fn: () => Promise<T>, config?: RetryConfig): Promise<RetryResult<T>> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  let totalDelayMs = 0;
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
    try {
      const result = await fn();
      return { success: true, result, attempts: attempt, totalDelayMs };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (attempt < cfg.maxAttempts) {
        let delay = Math.min(cfg.baseDelayMs * Math.pow(2, attempt - 1), cfg.maxDelayMs);
        if (cfg.jitter) delay = delay * (0.5 + Math.random() * 0.5);
        totalDelayMs += delay;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  return { success: false, attempts: cfg.maxAttempts, totalDelayMs, lastError };
}
