import type { ValuePolicy } from "./valuePolicySchema.js";

export interface ValueGateInputs {
  integrityIndex: number;
  correlationRatio: number;
  observedShare: number;
  selfReportedShare: number;
  notaryRequired: boolean;
  notaryHealthy: boolean;
}

export interface ValueGateResult {
  ok: boolean;
  reasons: string[];
}

export function evaluateValueEvidenceGates(policy: ValuePolicy, inputs: ValueGateInputs): ValueGateResult {
  const reasons: string[] = [];
  if (inputs.integrityIndex < policy.valuePolicy.evidenceGates.minIntegrityIndexForStrongClaims) {
    reasons.push(
      `integrityIndex ${inputs.integrityIndex.toFixed(3)} < ${policy.valuePolicy.evidenceGates.minIntegrityIndexForStrongClaims.toFixed(3)}`
    );
  }
  if (inputs.correlationRatio < policy.valuePolicy.evidenceGates.minCorrelationRatioForStrongClaims) {
    reasons.push(
      `correlationRatio ${inputs.correlationRatio.toFixed(3)} < ${policy.valuePolicy.evidenceGates.minCorrelationRatioForStrongClaims.toFixed(3)}`
    );
  }
  if (inputs.observedShare < policy.valuePolicy.evidenceGates.minObservedShareForStrongClaims) {
    reasons.push(
      `observedShare ${inputs.observedShare.toFixed(3)} < ${policy.valuePolicy.evidenceGates.minObservedShareForStrongClaims.toFixed(3)}`
    );
  }
  if (inputs.selfReportedShare > policy.valuePolicy.evidenceGates.maxSelfReportedShare) {
    reasons.push(
      `selfReportedShare ${inputs.selfReportedShare.toFixed(3)} > ${policy.valuePolicy.evidenceGates.maxSelfReportedShare.toFixed(3)}`
    );
  }
  if (
    policy.valuePolicy.evidenceGates.requireNotaryForStrongClaimsWhenEnabled &&
    inputs.notaryRequired &&
    !inputs.notaryHealthy
  ) {
    reasons.push("notary required but unavailable");
  }
  return {
    ok: reasons.length === 0,
    reasons
  };
}
