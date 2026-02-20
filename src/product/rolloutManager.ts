/**
 * rolloutManager.ts — Feature rollout with percentage gates and
 * deterministic user assignment via SHA-256 hashing.
 */

import { randomUUID, createHash } from 'node:crypto';

/* ── Interfaces ──────────────────────────────────────────────────── */

export interface RolloutConfig {
  feature: string;
  percentage: number;
  enabled: boolean;
  variant?: string;
  metadata?: Record<string, unknown>;
}

/** Backward-compatible with stubs.ts RolloutStatus */
export interface RolloutStatus {
  feature: string;
  percentage: number;
  enabled: boolean;
}

export interface RolloutDecision {
  feature: string;
  enabled: boolean;
  variant: string | undefined;
  userId: string | undefined;
  reason: string;
}

export interface RolloutStats {
  feature: string;
  percentage: number;
  enabled: boolean;
  variant: string | undefined;
  checkCount: number;
  enabledCount: number;
}

/* ── Helpers ─────────────────────────────────────────────────────── */

/** Hash `${feature}:${userId}` to a deterministic 0-99 value. */
function hashToPercentage(feature: string, userId: string): number {
  const digest = createHash('sha256').update(`${feature}:${userId}`).digest();
  const val = digest.readUInt32BE(0);
  return val % 100;
}

/* ── Manager ─────────────────────────────────────────────────────── */

export class RolloutManager {
  private rollouts = new Map<string, RolloutConfig>();
  private stats = new Map<string, { checkCount: number; enabledCount: number }>();

  createRollout(feature: string, percentage: number, variant?: string): RolloutConfig {
    const cfg: RolloutConfig = {
      feature,
      percentage: Math.max(0, Math.min(100, percentage)),
      enabled: true,
      variant,
    };
    this.rollouts.set(feature, cfg);
    this.stats.set(feature, { checkCount: 0, enabledCount: 0 });
    return cfg;
  }

  updateRollout(feature: string, percentage?: number, enabled?: boolean): RolloutConfig {
    const cfg = this.rollouts.get(feature);
    if (!cfg) throw new Error(`Rollout "${feature}" not found`);
    if (percentage !== undefined) cfg.percentage = Math.max(0, Math.min(100, percentage));
    if (enabled !== undefined) cfg.enabled = enabled;
    return cfg;
  }

  checkRollout(feature: string, userId?: string): RolloutDecision {
    const cfg = this.rollouts.get(feature);
    if (!cfg) {
      return { feature, enabled: false, variant: undefined, userId, reason: 'rollout_not_found' };
    }

    const s = this.stats.get(feature) ?? { checkCount: 0, enabledCount: 0 };
    s.checkCount++;

    if (!cfg.enabled) {
      this.stats.set(feature, s);
      return { feature, enabled: false, variant: cfg.variant, userId, reason: 'rollout_disabled' };
    }

    let enabled: boolean;
    if (userId) {
      const bucket = hashToPercentage(feature, userId);
      enabled = bucket < cfg.percentage;
    } else {
      enabled = cfg.percentage >= 100;
    }

    if (enabled) s.enabledCount++;
    this.stats.set(feature, s);

    return {
      feature,
      enabled,
      variant: enabled ? cfg.variant : undefined,
      userId,
      reason: enabled ? 'within_percentage' : 'outside_percentage',
    };
  }

  listRollouts(): RolloutConfig[] {
    return [...this.rollouts.values()];
  }

  deleteRollout(feature: string): boolean {
    this.stats.delete(feature);
    return this.rollouts.delete(feature);
  }

  getStats(feature: string): RolloutStats {
    const cfg = this.rollouts.get(feature);
    const s = this.stats.get(feature) ?? { checkCount: 0, enabledCount: 0 };
    return {
      feature,
      percentage: cfg?.percentage ?? 0,
      enabled: cfg?.enabled ?? false,
      variant: cfg?.variant,
      checkCount: s.checkCount,
      enabledCount: s.enabledCount,
    };
  }
}

/* ── Backward-compatible free function (stubs.ts) ────────────────── */

export function checkRollout(feature: string, percentage?: number): RolloutStatus {
  const pct = percentage ?? 100;
  return { feature, percentage: pct, enabled: Math.random() * 100 < pct };
}
