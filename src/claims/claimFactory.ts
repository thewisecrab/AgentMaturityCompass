import { randomUUID } from "node:crypto";
import { sha256Hex } from "../utils/hash.js";
import { canonicalize } from "../utils/json.js";
import type { QuestionScore, TrustTier } from "../types.js";
import type { Claim } from "./claimTypes.js";
import { signHexDigest } from "../crypto/keys.js";

/**
 * Factory for creating Claim objects from diagnostic scoring output
 */

interface CreateClaimFromScoreInput {
  questionScore: QuestionScore;
  runId: string;
  agentId: string;
  prevClaimHash: string; // for hash chaining
  signerFn: (digestHex: string) => string; // function to sign digest (e.g., auditor key)
}

/**
 * Convert a QuestionScore into a Claim with appropriate provenance and lifecycle state
 *
 * Logic:
 * - If evidence trust tier is OBSERVED → tag as OBSERVED_FACT, state PROVISIONAL
 * - If evidence trust tier is ATTESTED → tag as DERIVED_PATTERN, state QUARANTINE
 * - If evidence trust tier is SELF_REPORTED → tag as HYPOTHESIS, state QUARANTINE
 * - Confidence from QuestionScore.confidence
 * - Hash chain: SHA256 of canonical JSON (sorted keys) of all fields except signature
 */
export function createClaimFromScore(input: CreateClaimFromScoreInput): Claim {
  const {
    questionScore,
    runId,
    agentId,
    prevClaimHash,
    signerFn
  } = input;

  const claimId = randomUUID();
  const now = Date.now();

  // Determine provenance tag and initial lifecycle state based on trust tier
  const trustTierValue = getTrustTierFromEvidence(questionScore.evidenceEventIds.length, questionScore.flags);
  const { provenanceTag, lifecycleState } = determineProvenanceAndState(trustTierValue);

  // Build the claim without signature first (for hashing)
  const claimUnsigned: Omit<Claim, 'signature'> = {
    claimId,
    agentId,
    runId,
    questionId: questionScore.questionId,
    assertionText: buildAssertionText(questionScore),
    claimedLevel: questionScore.claimedLevel,
    provenanceTag,
    lifecycleState,
    confidence: questionScore.confidence,
    evidenceRefs: questionScore.evidenceEventIds,
    trustTier: trustTierValue,
    promotedFromClaimId: null, // origin claim
    promotionEvidence: [],
    supersededByClaimId: null,
    createdTs: now,
    lastVerifiedTs: now,
    expiryTs: calculateExpiryTs(lifecycleState, now),
    prev_claim_hash: prevClaimHash,
    claim_hash: "" // will be computed
  };

  // Compute claim hash from canonical form
  const claimHashInput = canonicalize({
    claim_id: claimUnsigned.claimId,
    agent_id: claimUnsigned.agentId,
    run_id: claimUnsigned.runId,
    question_id: claimUnsigned.questionId,
    assertion_text: claimUnsigned.assertionText,
    claimed_level: claimUnsigned.claimedLevel,
    provenance_tag: claimUnsigned.provenanceTag,
    lifecycle_state: claimUnsigned.lifecycleState,
    confidence: claimUnsigned.confidence,
    evidence_refs: claimUnsigned.evidenceRefs,
    trust_tier: claimUnsigned.trustTier,
    promoted_from_claim_id: claimUnsigned.promotedFromClaimId,
    promotion_evidence: claimUnsigned.promotionEvidence,
    superseded_by_claim_id: claimUnsigned.supersededByClaimId,
    created_ts: claimUnsigned.createdTs,
    last_verified_ts: claimUnsigned.lastVerifiedTs,
    expiry_ts: claimUnsigned.expiryTs,
    prev_claim_hash: claimUnsigned.prev_claim_hash
  });

  const claimHashHex = sha256Hex(claimHashInput);
  claimUnsigned.claim_hash = claimHashHex;

  // Sign the claim hash
  const signature = signerFn(claimHashHex);

  return {
    ...claimUnsigned,
    signature
  };
}

/**
 * Build a natural language assertion text from a QuestionScore
 */
function buildAssertionText(questionScore: QuestionScore): string {
  // Extract key facts from the narrative and flags
  const parts: string[] = [];

  if (questionScore.flags.length > 0) {
    parts.push(`Flags: ${questionScore.flags.join(", ")}`);
  }

  parts.push(
    `Question ${questionScore.questionId}: ` +
    `claimed level ${questionScore.claimedLevel}, ` +
    `supported max level ${questionScore.supportedMaxLevel}, ` +
    `final level ${questionScore.finalLevel}, ` +
    `confidence ${(questionScore.confidence * 100).toFixed(0)}%`
  );

  if (questionScore.narrative) {
    parts.push(`Evidence: ${questionScore.narrative.substring(0, 200)}`);
  }

  return parts.join(" | ");
}

/**
 * Infer trust tier based on evidence quantity and flags
 */
function getTrustTierFromEvidence(
  evidenceCount: number,
  flags: string[]
): TrustTier {
  // Heuristics: OBSERVED > ATTESTED > SELF_REPORTED
  const hasSuspiciousFlag = flags.some((f) =>
    f.toLowerCase().includes("unverified") ||
    f.toLowerCase().includes("self_reported") ||
    f.toLowerCase().includes("hypothesis")
  );

  const hasWeakEvidence = flags.some((f) =>
    f.toLowerCase().includes("limited") ||
    f.toLowerCase().includes("sparse")
  );

  if (hasSuspiciousFlag) {
    return "SELF_REPORTED";
  }
  if (hasWeakEvidence || evidenceCount < 2) {
    return "ATTESTED";
  }
  return "OBSERVED";
}

/**
 * Determine provenance tag and initial lifecycle state from trust tier
 */
function determineProvenanceAndState(
  trustTier: TrustTier
): {
  provenanceTag: "OBSERVED_FACT" | "DERIVED_PATTERN" | "HYPOTHESIS";
  lifecycleState: "PROVISIONAL" | "QUARANTINE";
} {
  switch (trustTier) {
    case "OBSERVED":
    case "OBSERVED_HARDENED":
      return {
        provenanceTag: "OBSERVED_FACT",
        lifecycleState: "PROVISIONAL"
      };
    case "ATTESTED":
      return {
        provenanceTag: "DERIVED_PATTERN",
        lifecycleState: "QUARANTINE"
      };
    case "SELF_REPORTED":
      return {
        provenanceTag: "HYPOTHESIS",
        lifecycleState: "QUARANTINE"
      };
  }
}

/**
 * Calculate expiry timestamp based on lifecycle state
 * - PROVISIONAL: 90 days
 * - QUARANTINE: 30 days
 * - null otherwise (no expiry)
 */
function calculateExpiryTs(state: string, now: number): number | null {
  const DAYS_MS = 24 * 60 * 60 * 1000;

  switch (state) {
    case "PROVISIONAL":
      return now + 90 * DAYS_MS;
    case "QUARANTINE":
      return now + 30 * DAYS_MS;
    default:
      return null;
  }
}
