/**
 * Evidence Coverage Gap Detection.
 */

import { questionIds } from "../diagnostic/questionBank.js";

export interface EvidenceCoverageReport {
  totalQIDs: number;
  automatedCoverage: number;
  manualRequired: number;
  coveragePercent: number;
  automatedQIDs: string[];
  manualQIDs: string[];
  improvementPlan: string[];
}

const AUTOMATED_PREFIXES = ["AMC-1.", "AMC-2.", "AMC-3.", "AMC-MEM-"];

export function getEvidenceCoverageReport(_agentId: string): EvidenceCoverageReport {
  const all = [...questionIds];
  const automatedQIDs = all.filter((qid) => AUTOMATED_PREFIXES.some((prefix) => qid.startsWith(prefix)));
  const manualQIDs = all.filter((qid) => !AUTOMATED_PREFIXES.some((prefix) => qid.startsWith(prefix)));

  const totalQIDs = all.length;
  const automatedCoverage = automatedQIDs.length;
  const manualRequired = manualQIDs.length;
  const coveragePercent = totalQIDs === 0 ? 0 : Math.round((automatedCoverage / totalQIDs) * 100);

  return {
    totalQIDs,
    automatedCoverage,
    manualRequired,
    coveragePercent,
    automatedQIDs,
    manualQIDs,
    improvementPlan: [
      "Add audit emitters for strategy, culture, and governance evidence (AMC-4/5).",
      "Collect structured review and committee records as evidence events.",
      "Integrate memory-module telemetry for all AMC-MEM-* checks.",
      "Add scheduled evidence tasks for policy review and continuity checkpoints."
    ]
  };
}
