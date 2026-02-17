export interface MechanicDimensionSummary {
  dimensionId: string;
  measuredAverage: number;
  targetAverage: number;
  unknownCount: number;
}

export interface MechanicQuestionSummary {
  qId: string;
  measured: number;
  desired: number;
  gap: number;
  status: "OK" | "UNKNOWN" | "BLOCKED";
  reasons: string[];
  evidenceCoverage: number;
}

export interface MechanicDashboardModel {
  readiness: "READY" | "NEEDS_EVIDENCE" | "UNTRUSTED";
  integrityIndex: number;
  correlationRatio: number;
  dimensions: MechanicDimensionSummary[];
  questions: MechanicQuestionSummary[];
}

