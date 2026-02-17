export type { CorrectionTriggerType, CorrectionStatus, CorrectionEvent, CorrectionEffectivenessReport } from "./correctionTypes.js";

export {
  initCorrectionTables,
  insertCorrection,
  updateCorrectionVerification,
  getCorrectionsByAgent,
  getCorrectionsByQuestion,
  getPendingCorrections,
  getLastCorrectionHash,
  getCorrectionById,
  getVerifiedCorrections,
  getCorrectionsByTriggerType,
  getCorrectionsByWindow
} from "./correctionStore.js";

export {
  verifyCorrection,
  autoVerifyPendingCorrections,
  computeCorrectionHash,
  computeEffectivenessReport,
  type VerificationResult
} from "./correctionTracker.js";
