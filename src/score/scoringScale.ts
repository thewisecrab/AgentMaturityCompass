/**
 * AMC Scoring Scale Configuration
 *
 * Internal computation always uses 0–1 (canonical M(a,d,t) model).
 * User-facing output is scaled to the configured display scale.
 *
 * Default: 0–100 (human-friendly).
 * Alternative: 0–1 (mathematical, research-friendly).
 *
 * Changeable via AMC settings / CLI: `amc config set scoring.scale 100`
 */

import { type MaturityLevel } from "./formalSpec.js";

// ── Scale Configuration ────────────────────────────────────────────────────

export type ScaleMode = 100 | 1;

export interface ScoringConfig {
  /** Display scale: 100 (default) or 1 */
  scale: ScaleMode;
  /** Decimal places for display (default: 1 for scale=100, 3 for scale=1) */
  precision: number;
}

let _config: ScoringConfig = {
  scale: 100,
  precision: 1,
};

/**
 * Get the current scoring configuration.
 */
export function getScoringConfig(): Readonly<ScoringConfig> {
  return _config;
}

/**
 * Update the scoring configuration.
 */
export function setScoringConfig(config: Partial<ScoringConfig>): void {
  if (config.scale !== undefined) {
    _config.scale = config.scale;
    // Auto-adjust precision if not explicitly set
    if (config.precision === undefined) {
      _config.precision = config.scale === 100 ? 1 : 3;
    }
  }
  if (config.precision !== undefined) {
    _config.precision = config.precision;
  }
}

// ── Score Conversion ───────────────────────────────────────────────────────

/**
 * Convert an internal 0–1 score to the configured display scale.
 */
export function toDisplayScore(internal: number): number {
  const scaled = internal * _config.scale;
  const factor = Math.pow(10, _config.precision);
  return Math.round(scaled * factor) / factor;
}

/**
 * Convert a display-scale score back to internal 0–1.
 */
export function toInternalScore(display: number): number {
  return display / _config.scale;
}

/**
 * Convert 0–1 to L0–L5 maturity level.
 */
export function scoreToLevel(internal: number): MaturityLevel {
  if (internal >= 0.9) return "L5";
  if (internal >= 0.75) return "L4";
  if (internal >= 0.55) return "L3";
  if (internal >= 0.35) return "L2";
  if (internal >= 0.15) return "L1";
  return "L0";
}

/**
 * Get the display-scale threshold for a maturity level.
 */
export function levelThreshold(level: MaturityLevel): number {
  const thresholds: Record<MaturityLevel, number> = {
    L0: 0, L1: 0.15, L2: 0.35, L3: 0.55, L4: 0.75, L5: 0.90,
  };
  return toDisplayScore(thresholds[level]);
}

/**
 * Format a score for display: "75.0 (L4)" or "0.750 (L4)"
 */
export function formatScore(internal: number): string {
  return `${toDisplayScore(internal)} (${scoreToLevel(internal)})`;
}

/**
 * Create a scored result with both display and internal values.
 */
export function scoredResult(internal: number): { score: number; level: MaturityLevel; internal: number } {
  return {
    score: toDisplayScore(internal),
    level: scoreToLevel(internal),
    internal,
  };
}
