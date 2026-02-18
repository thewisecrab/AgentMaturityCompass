/**
 * Claim Expiry & Staleness Detection
 *
 * Configurable TTL per provenance tag with auto-demotion of stale claims.
 * Stale claims are demoted to PROVISIONAL and flagged for re-verification.
 */

import { randomUUID } from "node:crypto";
import Database from "better-sqlite3";
import type { Claim, ClaimLifecycleState, ClaimProvenanceTag, ClaimTransition } from "./claimTypes.js";
import { getClaimsByAgent, getClaimById, insertClaimTransition, getLastClaimHash } from "./claimStore.js";
import { sha256Hex } from "../utils/hash.js";
import { canonicalize } from "../utils/json.js";
import { signHexDigest, getPrivateKeyPem } from "../crypto/keys.js";

// ---------------------------------------------------------------------------
// TTL Configuration
// ---------------------------------------------------------------------------

/** Default TTL per provenance tag in milliseconds */
export const DEFAULT_TTL_MS: Record<string, number> = {
  HYPOTHESIS: 7 * 24 * 60 * 60 * 1000,     // 7 days
  PROVISIONAL: 30 * 24 * 60 * 60 * 1000,    // 30 days
  PROMOTED: 90 * 24 * 60 * 60 * 1000,       // 90 days
  OBSERVED_FACT: 90 * 24 * 60 * 60 * 1000,  // 90 days
  DERIVED_PATTERN: 60 * 24 * 60 * 60 * 1000, // 60 days
  SESSION_LOCAL: 1 * 24 * 60 * 60 * 1000,   // 1 day
  REFERENCE_ONLY: 365 * 24 * 60 * 60 * 1000, // 1 year
};

/** Also support TTL by lifecycle state */
export const DEFAULT_LIFECYCLE_TTL_MS: Record<string, number> = {
  QUARANTINE: 7 * 24 * 60 * 60 * 1000,
  PROVISIONAL: 30 * 24 * 60 * 60 * 1000,
  PROMOTED: 90 * 24 * 60 * 60 * 1000,
};

export interface ExpiryConfig {
  ttlByProvenance: Record<string, number>;
  ttlByLifecycle: Record<string, number>;
}

export function defaultExpiryConfig(): ExpiryConfig {
  return {
    ttlByProvenance: { ...DEFAULT_TTL_MS },
    ttlByLifecycle: { ...DEFAULT_LIFECYCLE_TTL_MS },
  };
}

// ---------------------------------------------------------------------------
// Staleness Detection
// ---------------------------------------------------------------------------

export interface StaleClaim {
  claim: Claim;
  staleSinceTs: number;
  ttlMs: number;
  overdueDays: number;
  reason: string;
}

/**
 * Determine effective TTL for a claim based on provenance and lifecycle.
 */
export function effectiveTtl(claim: Claim, config?: ExpiryConfig): number {
  const cfg = config ?? defaultExpiryConfig();
  // Explicit expiry on the claim takes precedence
  if (claim.expiryTs !== null) {
    return claim.expiryTs - claim.lastVerifiedTs;
  }
  // Provenance-based TTL (more specific)
  const provTtl = cfg.ttlByProvenance[claim.provenanceTag];
  if (provTtl !== undefined) return provTtl;
  // Lifecycle-based TTL (fallback)
  const lcTtl = cfg.ttlByLifecycle[claim.lifecycleState];
  if (lcTtl !== undefined) return lcTtl;
  // Default 30d
  return 30 * 24 * 60 * 60 * 1000;
}

/**
 * Check if a single claim is stale.
 */
export function isClaimStale(claim: Claim, now?: number, config?: ExpiryConfig): StaleClaim | null {
  const ts = now ?? Date.now();
  // Skip terminal states
  if (claim.lifecycleState === "REVOKED" || claim.lifecycleState === "DEPRECATED") {
    return null;
  }
  const ttl = effectiveTtl(claim, config);
  const deadline = claim.lastVerifiedTs + ttl;
  if (ts > deadline) {
    const overdueMs = ts - deadline;
    return {
      claim,
      staleSinceTs: deadline,
      ttlMs: ttl,
      overdueDays: Math.round(overdueMs / (24 * 60 * 60 * 1000)),
      reason: `Claim last verified ${new Date(claim.lastVerifiedTs).toISOString()}, TTL ${Math.round(ttl / (24 * 60 * 60 * 1000))}d expired`,
    };
  }
  return null;
}

/**
 * Find all stale claims for an agent.
 */
export function findStaleClaims(
  db: Database.Database,
  agentId: string,
  now?: number,
  config?: ExpiryConfig,
): StaleClaim[] {
  const claims = getClaimsByAgent(db, agentId);
  const ts = now ?? Date.now();
  const stale: StaleClaim[] = [];
  for (const claim of claims) {
    const result = isClaimStale(claim, ts, config);
    if (result) stale.push(result);
  }
  return stale.sort((a, b) => a.staleSinceTs - b.staleSinceTs);
}

// ---------------------------------------------------------------------------
// Auto-Demotion (Sweep)
// ---------------------------------------------------------------------------

export interface SweepResult {
  demoted: string[];      // claimIds that were demoted
  alreadyProvisional: string[];
  skipped: string[];
  errors: string[];
}

/**
 * Process all stale claims for an agent:
 * - PROMOTED → PROVISIONAL
 * - QUARANTINE → PROVISIONAL (and flag for re-verification)
 * Non-PROVISIONAL stale claims are demoted to PROVISIONAL.
 * Already-PROVISIONAL stale claims are flagged but not changed.
 */
export function sweepStaleClaims(
  db: Database.Database,
  agentId: string,
  workspace: string,
  now?: number,
  config?: ExpiryConfig,
): SweepResult {
  const staleClaims = findStaleClaims(db, agentId, now, config);
  const result: SweepResult = {
    demoted: [],
    alreadyProvisional: [],
    skipped: [],
    errors: [],
  };

  for (const stale of staleClaims) {
    const { claim } = stale;
    try {
      if (claim.lifecycleState === "PROVISIONAL") {
        result.alreadyProvisional.push(claim.claimId);
        continue;
      }

      // Demote to PROVISIONAL via transition
      const transitionId = randomUUID();
      const ts = now ?? Date.now();
      const transitionBody = {
        transitionId,
        claimId: claim.claimId,
        fromState: claim.lifecycleState,
        toState: "PROVISIONAL" as ClaimLifecycleState,
        reason: `Auto-demoted: ${stale.reason}`,
        evidenceRefs: [] as string[],
        ts,
      };
      const digest = sha256Hex(canonicalize(transitionBody));
      let signature = "unsigned";
      try {
        signature = signHexDigest(digest, getPrivateKeyPem(workspace, "monitor"));
      } catch { /* no key available */ }

      const transition: ClaimTransition = { ...transitionBody, signature };
      insertClaimTransition(db, transition);

      // Update claim lifecycle_state in DB
      db.prepare(
        "UPDATE claims SET lifecycle_state = ?, last_verified_ts = ? WHERE claim_id = ?"
      ).run("PROVISIONAL", ts, claim.claimId);

      result.demoted.push(claim.claimId);
    } catch (err) {
      result.errors.push(`${claim.claimId}: ${String(err)}`);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

export function renderStaleClaimsMarkdown(staleClaims: StaleClaim[], agentId: string): string {
  const lines: string[] = [
    "# Stale Claims Report",
    "",
    `Agent: ${agentId}`,
    `Checked: ${new Date().toISOString()}`,
    `Stale claims: ${staleClaims.length}`,
    "",
  ];

  if (staleClaims.length === 0) {
    lines.push("No stale claims found.");
    return lines.join("\n");
  }

  for (const s of staleClaims) {
    lines.push(`## ${s.claim.claimId}`);
    lines.push(`- Question: ${s.claim.questionId}`);
    lines.push(`- State: ${s.claim.lifecycleState}`);
    lines.push(`- Provenance: ${s.claim.provenanceTag}`);
    lines.push(`- Last verified: ${new Date(s.claim.lastVerifiedTs).toISOString()}`);
    lines.push(`- Overdue: ${s.overdueDays} day(s)`);
    lines.push(`- Reason: ${s.reason}`);
    lines.push("");
  }

  return lines.join("\n");
}

export function renderSweepResultMarkdown(result: SweepResult, agentId: string): string {
  const lines: string[] = [
    "# Claim Sweep Results",
    "",
    `Agent: ${agentId}`,
    `Demoted: ${result.demoted.length}`,
    `Already provisional: ${result.alreadyProvisional.length}`,
    `Errors: ${result.errors.length}`,
    "",
  ];

  if (result.demoted.length > 0) {
    lines.push("## Demoted to PROVISIONAL");
    for (const id of result.demoted) {
      lines.push(`- ${id}`);
    }
    lines.push("");
  }

  if (result.errors.length > 0) {
    lines.push("## Errors");
    for (const err of result.errors) {
      lines.push(`- ${err}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
