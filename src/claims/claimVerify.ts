import { sha256Hex } from "../utils/hash.js";
import { canonicalize } from "../utils/json.js";
import { verifyHexDigestAny } from "../crypto/keys.js";
import type { Claim, ClaimProvenanceTag } from "./claimTypes.js";

/**
 * Verification functions for claim signatures and hash integrity
 */

interface VerifyClaimResult {
  valid: boolean;
  errors: string[];
}

/**
 * Verify a single claim's signature and hash integrity
 */
export function verifyClaim(
  claim: Claim,
  publicKeys: string[]
): VerifyClaimResult {
  const errors: string[] = [];

  // Verify signature using the stored claim_hash
  if (!verifyHexDigestAny(claim.claim_hash, claim.signature, publicKeys)) {
    errors.push(`claim signature verification failed for claim ${claim.claimId}`);
  }

  // Verify that claim_hash is the SHA256 of the canonical form
  const expectedHash = computeClaimHash(claim);
  if (expectedHash !== claim.claim_hash) {
    errors.push(
      `claim_hash mismatch for claim ${claim.claimId}: ` +
      `expected ${expectedHash}, got ${claim.claim_hash}`
    );
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Verify hash chain continuity for a sequence of claims
 * Each claim's prev_claim_hash must match the previous claim's claim_hash
 */
export function verifyClaimChain(claims: Claim[]): VerifyClaimResult {
  const errors: string[] = [];

  for (let i = 0; i < claims.length; i++) {
    const claim = claims[i];
    if (!claim) {
      continue;
    }

    if (i === 0) {
      // First claim should have GENESIS or valid hash
      if (claim.prev_claim_hash !== "GENESIS_CLAIMS" && claim.prev_claim_hash.length !== 64) {
        errors.push(
          `first claim ${claim.claimId} has invalid prev_claim_hash: ${claim.prev_claim_hash}`
        );
      }
    } else {
      const prevClaim = claims[i - 1];
      if (!prevClaim) {
        errors.push(`claim chain missing previous claim at index ${i - 1}`);
        continue;
      }
      if (claim.prev_claim_hash !== prevClaim.claim_hash) {
        errors.push(
          `hash chain broken at claim ${claim.claimId}: ` +
          `prev_claim_hash ${claim.prev_claim_hash} does not match ` +
          `previous claim hash ${prevClaim.claim_hash}`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if a claim is expired based on expiryTs
 */
export function isClaimExpired(claim: Claim, now: number = Date.now()): boolean {
  if (claim.expiryTs === null) {
    return false; // no expiry
  }
  return now > claim.expiryTs;
}

/**
 * Compute the claim_hash from a claim object (excluding signature)
 * Used for verification
 */
export function computeClaimHash(claim: Claim): string {
  // Reconstruct the canonical form used during creation
  const canonical = canonicalize({
    claim_id: claim.claimId,
    agent_id: claim.agentId,
    run_id: claim.runId,
    question_id: claim.questionId,
    assertion_text: claim.assertionText,
    claimed_level: claim.claimedLevel,
    provenance_tag: claim.provenanceTag,
    lifecycle_state: claim.lifecycleState,
    confidence: claim.confidence,
    evidence_refs: claim.evidenceRefs,
    trust_tier: claim.trustTier,
    promoted_from_claim_id: claim.promotedFromClaimId,
    promotion_evidence: claim.promotionEvidence,
    superseded_by_claim_id: claim.supersededByClaimId,
    created_ts: claim.createdTs,
    last_verified_ts: claim.lastVerifiedTs,
    expiry_ts: claim.expiryTs,
    prev_claim_hash: claim.prev_claim_hash
  });

  return sha256Hex(canonical);
}

/**
 * Validate provenance tag consistency with evidence
 */
export function validateProvenanceTag(
  claim: Claim
): VerifyClaimResult {
  const errors: string[] = [];

  // Basic validation: HYPOTHESIS claims should have limited evidence
  if (claim.provenanceTag === "HYPOTHESIS" && claim.evidenceRefs.length > 10) {
    errors.push(
      `HYPOTHESIS provenance tag inconsistent with high evidence count ` +
      `(${claim.evidenceRefs.length} refs) for claim ${claim.claimId}`
    );
  }

  // OBSERVED_FACT should have strong evidence
  if (claim.provenanceTag === "OBSERVED_FACT" && claim.evidenceRefs.length === 0) {
    errors.push(
      `OBSERVED_FACT provenance tag requires evidence for claim ${claim.claimId}`
    );
  }

  // Check confidence aligns with provenance
  if (claim.provenanceTag === "HYPOTHESIS" && claim.confidence > 0.7) {
    errors.push(
      `HYPOTHESIS provenance inconsistent with high confidence ` +
      `(${claim.confidence}) for claim ${claim.claimId}`
    );
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Comprehensive verification combining all checks
 */
export function verifyClaimComprehensive(
  claim: Claim,
  publicKeys: string[],
  now: number = Date.now()
): VerifyClaimResult {
  const errors: string[] = [];

  const signatureCheck = verifyClaim(claim, publicKeys);
  errors.push(...signatureCheck.errors);

  const provenanceCheck = validateProvenanceTag(claim);
  errors.push(...provenanceCheck.errors);

  if (isClaimExpired(claim, now)) {
    errors.push(`claim ${claim.claimId} is expired`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
