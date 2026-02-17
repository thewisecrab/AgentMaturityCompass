// Public exports from claims module

export type {
  ClaimProvenanceTag,
  ClaimLifecycleState,
  Claim,
  ClaimTransition
} from "./claimTypes.js";

export {
  insertClaim,
  insertClaimTransition,
  getClaimsByAgent,
  getClaimsByQuestion,
  getClaimsByState,
  getLatestClaimForQuestion,
  getClaimHistory,
  getClaimTransitions,
  getLastClaimHash,
  getClaimById
} from "./claimStore.js";

export {
  createClaimFromScore
} from "./claimFactory.js";

export {
  verifyClaim,
  verifyClaimChain,
  isClaimExpired,
  computeClaimHash,
  validateProvenanceTag,
  verifyClaimComprehensive
} from "./claimVerify.js";

export type { QuarantinePolicy } from "./quarantine.js";

export {
  loadQuarantinePolicy,
  saveQuarantinePolicy,
  verifyQuarantinePolicy
} from "./quarantine.js";

export type {
  PromotionEvaluation,
  EvidenceSummary
} from "./promotionGate.js";

export {
  evaluatePromotion,
  checkStaleClaims
} from "./promotionGate.js";

export {
  transitionClaim,
  deprecateClaim,
  revokeClaim,
  autoExpireStale
} from "./claimLifecycle.js";

// Governance lineage exports
export type {
  ClaimTransparencyLink,
  PolicyChangeCategory,
  PolicyChangeIntent,
  ClaimPolicyLink,
  ClaimLineageView,
  GovernanceLineageReport
} from "./governanceLineage.js";

export {
  initGovernanceLineageTables,
  policyChangeIntentSchema,
  linkTransitionToTransparency,
  getTransparencyLinksForClaim,
  getTransparencyLinkByTransition,
  getAllTransparencyLinks,
  getLastIntentHash,
  recordPolicyChangeIntent,
  getPolicyIntentById,
  getPolicyIntentsByAgent,
  getPolicyIntentsByClaim,
  linkClaimToPolicy,
  getClaimPolicyLinks,
  getPolicyClaimLinks,
  buildClaimLineageView,
  buildAgentClaimLineage,
  generateGovernanceLineageReport,
  renderGovernanceLineageMarkdown,
  renderClaimLineageMarkdown
} from "./governanceLineage.js";

// Per-Claim Confidence exports
export type {
  ConfidenceDomain,
  CitationQualityScore,
  ClaimConfidenceAssessment,
  ConfidencePenalty,
  ConfidenceThresholdPolicy,
  ConfidenceHistogram,
  ConfidenceHistogramBin,
  ClaimConfidenceReport
} from "./claimConfidence.js";

export {
  defaultConfidenceThresholdPolicy,
  classifyConfidenceDomain,
  computeCitationQuality,
  assessClaimConfidence,
  assessAgentClaimConfidence,
  checkConfidenceGate,
  buildConfidenceHistograms,
  generateClaimConfidenceReport,
  renderClaimConfidenceMarkdown
} from "./claimConfidence.js";
