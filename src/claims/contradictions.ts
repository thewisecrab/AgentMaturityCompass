import { randomUUID, createHash } from "node:crypto";
import { canonicalize } from "../utils/json.js";
import { sha256Hex } from "../utils/hash.js";
import type { Claim } from "./claimTypes.js";

/**
 * Tracks claim-to-claim contradictions and conflicts
 * Used to penalize confidence and raise alerts for reviewer
 */

export interface ClaimContradiction {
  contradictionId: string; // uuid
  claimIdA: string;
  claimIdB: string;
  questionId: string; // they contradict on this question
  type: "LEVEL_CONFLICT" | "EVIDENCE_CONFLICT" | "ASSERTION_CONFLICT";
  description: string; // what the contradiction is
  severity: "LOW" | "MEDIUM" | "HIGH";
  detectedTs: number;
  resolvedTs: number | null;
  resolutionClaimId: string | null; // claim that resolved the contradiction
  signature: string;
}

/**
 * Detect contradictions within a single agent's claims
 *
 * Detection rules:
 * - LEVEL_CONFLICT: Two PROMOTED/PROVISIONAL claims for same questionId with claimedLevel delta >= 2
 * - EVIDENCE_CONFLICT: Two claims referencing same evidence events but reaching different conclusions
 * - ASSERTION_CONFLICT: Successive claims for same question where one says improving and other says degrading
 */
export function detectContradictions(claims: Claim[]): ClaimContradiction[] {
  const contradictions: ClaimContradiction[] = [];

  // Group claims by questionId
  const claimsByQuestion = new Map<string, Claim[]>();
  for (const claim of claims) {
    if (!claimsByQuestion.has(claim.questionId)) {
      claimsByQuestion.set(claim.questionId, []);
    }
    claimsByQuestion.get(claim.questionId)!.push(claim);
  }

  // Check each question's claims for contradictions
  for (const [questionId, questionClaims] of claimsByQuestion) {
    // Sort by timestamp to detect assertion conflicts
    const sortedClaims = [...questionClaims].sort((a, b) => a.createdTs - b.createdTs);

    // Check for level conflicts (PROMOTED/PROVISIONAL with delta >= 2)
    const activePromoted = sortedClaims.filter(
      (c) => c.lifecycleState === "PROMOTED" || c.lifecycleState === "PROVISIONAL"
    );

    for (let i = 0; i < activePromoted.length; i++) {
      for (let j = i + 1; j < activePromoted.length; j++) {
        const claimA = activePromoted[i];
        const claimB = activePromoted[j];
        if (!claimA || !claimB) {
          continue;
        }
        const levelDelta = Math.abs(claimA.claimedLevel - claimB.claimedLevel);

        if (levelDelta >= 2) {
          const contradiction: ClaimContradiction = {
            contradictionId: randomUUID(),
            claimIdA: claimA.claimId,
            claimIdB: claimB.claimId,
            questionId,
            type: "LEVEL_CONFLICT",
            description: `Level conflict: Claim A level ${claimA.claimedLevel}, Claim B level ${claimB.claimedLevel} (delta: ${levelDelta})`,
            severity: levelDelta >= 3 ? "HIGH" : "MEDIUM",
            detectedTs: Date.now(),
            resolvedTs: null,
            resolutionClaimId: null,
            signature: ""
          };
          contradiction.signature = computeContradictionSignature(contradiction);
          contradictions.push(contradiction);
        }
      }
    }

    // Check for evidence conflicts (same evidence refs, different conclusions)
    for (let i = 0; i < activePromoted.length; i++) {
      for (let j = i + 1; j < activePromoted.length; j++) {
        const claimA = activePromoted[i];
        const claimB = activePromoted[j];
        if (!claimA || !claimB) {
          continue;
        }

        // Check for shared evidence
        const sharedEvidence = claimA.evidenceRefs.filter((ref) =>
          claimB.evidenceRefs.includes(ref)
        );

        if (sharedEvidence.length > 0) {
          // Different conclusions from same evidence?
          // Simple heuristic: claimedLevel differs by more than 1 or confidence differs by > 0.2
          const levelDiff = Math.abs(claimA.claimedLevel - claimB.claimedLevel);
          const confidenceDiff = Math.abs(claimA.confidence - claimB.confidence);

          if (levelDiff > 1 || confidenceDiff > 0.2) {
            const contradiction: ClaimContradiction = {
              contradictionId: randomUUID(),
              claimIdA: claimA.claimId,
              claimIdB: claimB.claimId,
              questionId,
              type: "EVIDENCE_CONFLICT",
              description: `Evidence conflict: Both reference ${sharedEvidence.length} events but reach different conclusions (level delta: ${levelDiff}, confidence delta: ${confidenceDiff.toFixed(2)})`,
              severity: levelDiff >= 2 ? "HIGH" : "MEDIUM",
              detectedTs: Date.now(),
              resolvedTs: null,
              resolutionClaimId: null,
              signature: ""
            };
            contradiction.signature = computeContradictionSignature(contradiction);
            contradictions.push(contradiction);
          }
        }
      }
    }

    // Check for assertion conflicts (trend reversals)
    if (sortedClaims.length >= 2) {
      for (let i = 0; i < sortedClaims.length - 1; i++) {
        const claimA = sortedClaims[i];
        const claimB = sortedClaims[i + 1];
        if (!claimA || !claimB) {
          continue;
        }
        const prevClaim = i > 0 ? sortedClaims[i - 1] : null;

        // Determine trend: improving if claimedLevel increasing, degrading if decreasing
        const trendA = claimA.claimedLevel;
        const trendB = claimB.claimedLevel;
        const trendReversed = prevClaim
          ? (trendA < trendB && prevClaim.claimedLevel > trendA) ||
            (trendA > trendB && prevClaim.claimedLevel < trendA)
          : false;

        // If we have at least 3 claims and a clear trend reversal
        if (trendReversed && prevClaim && Math.abs(trendA - trendB) >= 1) {
          const prevTrend = prevClaim.claimedLevel;
          const currentDirection = trendB - trendA;
          const previousDirection = trendA - prevTrend;

          if (currentDirection * previousDirection < 0) {
            // Opposite signs = trend reversal
            const contradiction: ClaimContradiction = {
              contradictionId: randomUUID(),
              claimIdA: claimA.claimId,
              claimIdB: claimB.claimId,
              questionId,
              type: "ASSERTION_CONFLICT",
              description: `Assertion conflict: Claim A indicates level ${trendA}, but Claim B shifts to ${trendB} (trend reversal detected)`,
              severity: "MEDIUM",
              detectedTs: Date.now(),
              resolvedTs: null,
              resolutionClaimId: null,
              signature: ""
            };
            contradiction.signature = computeContradictionSignature(contradiction);
            contradictions.push(contradiction);
          }
        }
      }
    }
  }

  return contradictions;
}

/**
 * Detect contradictions across multiple agents
 *
 * Useful for fleet/org reports where different agents report different levels
 * for shared questions
 */
export function detectContradictionsBetweenAgents(
  claimsA: Claim[],
  claimsB: Claim[],
  sharedQuestionIds: string[]
): ClaimContradiction[] {
  const contradictions: ClaimContradiction[] = [];

  for (const questionId of sharedQuestionIds) {
    const claimsAForQ = claimsA.filter(
      (c) => c.questionId === questionId && (c.lifecycleState === "PROMOTED" || c.lifecycleState === "PROVISIONAL")
    );
    const claimsBForQ = claimsB.filter(
      (c) => c.questionId === questionId && (c.lifecycleState === "PROMOTED" || c.lifecycleState === "PROVISIONAL")
    );

    // If both agents have active claims for this question, check for conflicts
    if (claimsAForQ.length > 0 && claimsBForQ.length > 0) {
      // Use most recent claim from each agent
      const latestA = claimsAForQ[claimsAForQ.length - 1];
      const latestB = claimsBForQ[claimsBForQ.length - 1];
      if (!latestA || !latestB) {
        continue;
      }

      const levelDelta = Math.abs(latestA.claimedLevel - latestB.claimedLevel);
      if (levelDelta >= 2) {
        const contradiction: ClaimContradiction = {
          contradictionId: randomUUID(),
          claimIdA: latestA.claimId,
          claimIdB: latestB.claimId,
          questionId,
          type: "LEVEL_CONFLICT",
          description: `Cross-agent conflict on ${questionId}: Agent A level ${latestA.claimedLevel}, Agent B level ${latestB.claimedLevel}`,
          severity: levelDelta >= 3 ? "HIGH" : "MEDIUM",
          detectedTs: Date.now(),
          resolvedTs: null,
          resolutionClaimId: null,
          signature: ""
        };
        contradiction.signature = computeContradictionSignature(contradiction);
        contradictions.push(contradiction);
      }
    }
  }

  return contradictions;
}

/**
 * Filter to only unresolved contradictions
 */
export function getUnresolvedContradictions(contradictions: ClaimContradiction[]): ClaimContradiction[] {
  return contradictions.filter((c) => c.resolvedTs === null);
}

/**
 * Mark a contradiction as resolved by a new claim
 */
export function resolveContradiction(
  contradiction: ClaimContradiction,
  resolutionClaimId: string,
  signFn: (digestHex: string) => string
): ClaimContradiction {
  const resolved: ClaimContradiction = {
    ...contradiction,
    resolvedTs: Date.now(),
    resolutionClaimId
  };

  // Recompute signature with resolution info
  resolved.signature = signFn(computeContradictionHashInput(resolved));

  return resolved;
}

/**
 * Compute penalty to apply to confidence based on contradiction count
 *
 * Formula: max(0, 1 - (unresolvedCount * 0.1))
 * - 0 unresolved → 1.0 (no penalty)
 * - 1 unresolved → 0.9
 * - 5 unresolved → 0.5
 * - 10+ unresolved → 0.0 (total discount)
 */
export function computeContradictionPenalty(contradictions: ClaimContradiction[]): number {
  const unresolved = getUnresolvedContradictions(contradictions);
  const penalty = Math.max(0, 1 - unresolved.length * 0.1);
  return penalty;
}

/**
 * Helper: Compute contradiction signature
 */
function computeContradictionSignature(contradiction: ClaimContradiction): string {
  const hashInput = computeContradictionHashInput(contradiction);
  return sha256Hex(hashInput);
}

/**
 * Helper: Build canonical hash input for contradiction
 */
function computeContradictionHashInput(contradiction: ClaimContradiction): string {
  return canonicalize({
    contradiction_id: contradiction.contradictionId,
    claim_id_a: contradiction.claimIdA,
    claim_id_b: contradiction.claimIdB,
    question_id: contradiction.questionId,
    type: contradiction.type,
    description: contradiction.description,
    severity: contradiction.severity,
    detected_ts: contradiction.detectedTs,
    resolved_ts: contradiction.resolvedTs,
    resolution_claim_id: contradiction.resolutionClaimId
  });
}
