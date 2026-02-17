import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { DiagnosticReport, GatePolicy } from "../types.js";
import { evaluateGatePolicy, parseGatePolicy, verifyGatePolicySignature } from "../ci/gate.js";
import { getAgentPaths } from "../fleet/paths.js";

export function predictCiGateOutcome(params: {
  workspace: string;
  agentId: string;
  report: DiagnosticReport;
  eventTrustTier?: Map<string, string>;
}): {
  hasPolicy: boolean;
  signatureValid: boolean;
  pass: boolean;
  reasons: string[];
  policy: GatePolicy | null;
} {
  const paths = getAgentPaths(params.workspace, params.agentId);
  const policyPath = join(params.workspace, paths.gatePolicy);
  if (!existsSync(policyPath)) {
    return {
      hasPolicy: false,
      signatureValid: false,
      pass: false,
      reasons: ["No gate policy configured for this agent."],
      policy: null
    };
  }
  const raw = JSON.parse(readFileSync(policyPath, "utf8")) as unknown;
  const policy = parseGatePolicy(raw);
  const signature = verifyGatePolicySignature({
    workspace: params.workspace,
    policyPath: paths.gatePolicy
  });
  const evalResult = evaluateGatePolicy({
    report: params.report,
    policy,
    eventTrustTier: params.eventTrustTier
  });
  const reasons = [...evalResult.reasons];
  if (!signature.valid) {
    reasons.unshift(`Gate policy signature invalid: ${signature.reason ?? "unknown reason"}`);
  }
  return {
    hasPolicy: true,
    signatureValid: signature.valid,
    pass: signature.valid && evalResult.pass,
    reasons,
    policy
  };
}

