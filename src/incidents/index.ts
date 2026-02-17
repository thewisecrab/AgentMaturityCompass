export type {
  IncidentSeverity,
  IncidentState,
  CausalRelationship,
  CausalEdge,
  Incident,
  IncidentTransition
} from "./incidentTypes.js";

export { VALID_INCIDENT_TRANSITIONS } from "./incidentTypes.js";

export type { IncidentStoreInstance } from "./incidentStore.js";

export {
  createIncidentStore,
  verifyIncidentSignature,
  computeIncidentHash
} from "./incidentStore.js";

export { IncidentGraph } from "./incidentGraph.js";

export { IncidentTimeline } from "./incidentTimeline.js";

export {
  assembleFromDrift,
  assembleFromAssuranceFailure,
  assembleFromFreeze,
  assembleFromBudgetExceed,
  autoDetectAndAssemble
} from "./autoAssembly.js";

export {
  inferCausalLinks,
  rankCausalHypotheses,
  explainCausalLink,
  explainIncidentCausality,
  identifyRootCauses,
  traceImpactChain
} from "./causalInference.js";
