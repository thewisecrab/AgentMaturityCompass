/**
 * Evidence collector — gathers evidence artifacts from module outputs.
 */

import type { EvidenceArtifact } from './formalSpec.js';

export interface CollectedEvidence {
  artifacts: EvidenceArtifact[];
  trustBreakdown: Record<string, number>;
  totalTrust: number;
}

export function collectEvidence(moduleOutputs: Record<string, unknown>): CollectedEvidence {
  const artifacts: EvidenceArtifact[] = [];
  const trustBreakdown: Record<string, number> = {};
  let totalTrust = 0;

  for (const [qid, output] of Object.entries(moduleOutputs)) {
    const trust = output !== null && output !== undefined ? 0.7 : 0;
    const artifact: EvidenceArtifact = {
      qid,
      kind: 'observed',
      trust,
      payload: output,
      timestamp: new Date(),
    };
    artifacts.push(artifact);
    trustBreakdown[qid] = trust;
    totalTrust += trust;
  }

  return { artifacts, trustBreakdown, totalTrust };
}
