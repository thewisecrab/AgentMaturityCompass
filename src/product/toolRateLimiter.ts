import { randomUUID } from 'node:crypto';

export interface RateLimitConfig { maxCalls: number; windowMs: number; }
export interface RateLimitResult { allowed: boolean; retryAfterMs: number; }

export class RateLimiter {
  private limits = new Map<string, RateLimitConfig>();
  private usage = new Map<string, number[]>(); // toolId:userId -> timestamps

  configure(toolId: string, config: RateLimitConfig): void { this.limits.set(toolId, config); }

  checkLimit(toolId: string, userId: string): RateLimitResult {
    const config = this.limits.get(toolId) ?? { maxCalls: 100, windowMs: 60000 };
    const key = `${toolId}:${userId}`;
    const now = Date.now();
    const timestamps = (this.usage.get(key) ?? []).filter(t => t > now - config.windowMs);
    this.usage.set(key, timestamps);
    if (timestamps.length >= config.maxCalls) {
      const oldest: number = timestamps[0] ?? now;
      return { allowed: false, retryAfterMs: oldest + config.windowMs - now };
    }
    return { allowed: true, retryAfterMs: 0 };
  }

  recordUsage(toolId: string, userId: string): void {
    const key = `${toolId}:${userId}`;
    const arr = this.usage.get(key) ?? [];
    arr.push(Date.now());
    this.usage.set(key, arr);
  }

  getQuota(toolId: string, userId: string): { remaining: number; total: number } {
    const config = this.limits.get(toolId) ?? { maxCalls: 100, windowMs: 60000 };
    const key = `${toolId}:${userId}`;
    const now = Date.now();
    const used = (this.usage.get(key) ?? []).filter(t => t > now - config.windowMs).length;
    return { remaining: Math.max(0, config.maxCalls - used), total: config.maxCalls };
  }
}

export function checkRateLimit(_toolName: string): RateLimitResult {
  return { allowed: true, retryAfterMs: 0 };
}
