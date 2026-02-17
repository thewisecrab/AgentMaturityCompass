export type CorrectionTriggerType =
  | "OWNER_MANUAL"        // Owner explicitly corrected something
  | "ASSURANCE_FAILURE"   // Assurance pack identified a problem
  | "DRIFT_EVENT"         // Drift detector flagged regression
  | "EXPERIMENT_RESULT"   // A/B experiment showed regression
  | "INCIDENT_RESPONSE"   // Response to an incident
  | "POLICY_CHANGE";      // Policy update that affects behavior

export type CorrectionStatus =
  | "APPLIED"               // Correction action taken
  | "PENDING_VERIFICATION"  // Waiting for next diagnostic run
  | "VERIFIED_EFFECTIVE"    // Next run shows improvement
  | "VERIFIED_INEFFECTIVE"  // Next run shows no improvement
  | "SUPERSEDED";           // Replaced by a newer correction

export interface CorrectionEvent {
  correctionId: string;           // uuid
  agentId: string;
  triggerType: CorrectionTriggerType;
  triggerId: string;              // assurance run ID, drift advisory ID, incident ID, etc.
  questionIds: string[];          // affected AMC question IDs
  correctionDescription: string;  // what was corrected
  appliedAction: string;          // what was actually done (e.g., "updated guardrails.yaml")
  status: CorrectionStatus;
  // Effectiveness tracking
  baselineRunId: string;          // diagnostic run before correction
  baselineLevels: Record<string, number>;  // questionId -> level before
  verificationRunId: string | null; // diagnostic run after correction
  verificationLevels: Record<string, number> | null; // questionId -> level after
  effectivenessScore: number | null; // 0.0-1.0, computed when verified
  verifiedTs: number | null;
  verifiedBy: string | null;       // run ID that proved it worked
  // Metadata
  createdTs: number;
  updatedTs: number;
  prev_correction_hash: string;
  correction_hash: string;
  signature: string;
}

export interface CorrectionEffectivenessReport {
  agentId: string;
  windowStartTs: number;
  windowEndTs: number;
  totalCorrections: number;
  verifiedCorrections: number;
  effectiveCorrections: number;    // verified + improved
  ineffectiveCorrections: number;  // verified + no improvement
  pendingCorrections: number;
  overallEffectivenessRatio: number; // effective / verified
  byTriggerType: Record<CorrectionTriggerType, {
    total: number;
    effective: number;
    ineffective: number;
    ratio: number;
  }>;
  byQuestionId: Record<string, {
    total: number;
    effective: number;
    avgImprovement: number;  // average level delta
  }>;
  frequentlyIneffective: string[]; // question IDs where corrections rarely work
  recommendations: string[];
}
