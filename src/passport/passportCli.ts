import { resolve } from "node:path";
import YAML from "yaml";
import { readUtf8 } from "../utils/fs.js";
import {
  passportBadgeForApi,
  passportCreateForApi,
  passportExportLatestForApi,
  passportPolicyApplyForApi,
  passportPolicyForApi,
  passportVerifyForApi
} from "./passportApi.js";
import { inspectPassportArtifact } from "./passportArtifact.js";

function parseJsonOrYaml(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return YAML.parse(raw) as unknown;
  }
}

function renderBadge(passport: ReturnType<typeof inspectPassportArtifact>["passport"]): string {
  const status = passport.status.label === "INFORMATIONAL" ? "INFO" : passport.status.label;
  const maturity = typeof passport.maturity.overall === "number" ? passport.maturity.overall.toFixed(1) : "UNKNOWN";
  const assurance = typeof passport.checkpoints.lastAssuranceCert.riskAssuranceScore === "number"
    ? String(Math.round(passport.checkpoints.lastAssuranceCert.riskAssuranceScore))
    : "UNKNOWN";
  const riskValues = [
    passport.strategyFailureRisks.ecosystemFocusRisk,
    passport.strategyFailureRisks.clarityPathRisk,
    passport.strategyFailureRisks.economicSignificanceRisk,
    passport.strategyFailureRisks.riskAssuranceRisk,
    passport.strategyFailureRisks.digitalDualityRisk
  ].filter((row): row is number => typeof row === "number");
  const riskSummary = riskValues.length > 0
    ? (() => {
        const avg = riskValues.reduce((sum, row) => sum + row, 0) / riskValues.length;
        if (avg >= 80) return "HIGH";
        if (avg >= 60) return "ELEVATED";
        return "MODERATE";
      })()
    : "UNKNOWN";
  const value = typeof passport.valueDimensions.valueScore === "number"
    ? String(Math.round(passport.valueDimensions.valueScore))
    : "UNKNOWN";
  return `AMC ${status} • maturity=${maturity}/5 • assurance=${assurance} • risks=${riskSummary} • value=${value} • ts=${new Date(passport.generatedTs).toISOString()}`;
}

export function passportInitCli(workspace: string) {
  return passportPolicyForApi(workspace);
}

export function passportVerifyPolicyCli(workspace: string) {
  return passportPolicyForApi(workspace).signature;
}

export function passportPolicyPrintCli(workspace: string) {
  return passportPolicyForApi(workspace).policy;
}

export function passportPolicyApplyCli(params: {
  workspace: string;
  file: string;
}) {
  return passportPolicyApplyForApi({
    workspace: params.workspace,
    policy: parseJsonOrYaml(readUtf8(resolve(params.file)))
  });
}

export function passportCreateCli(params: {
  workspace: string;
  scope: "workspace" | "node" | "agent";
  id?: string;
  outFile: string;
}) {
  return passportCreateForApi({
    workspace: params.workspace,
    scopeType: params.scope.toUpperCase(),
    scopeId: params.id,
    outFile: resolve(params.workspace, params.outFile)
  });
}

export function passportVerifyCli(params: {
  workspace?: string;
  file: string;
  pubkeyPath?: string;
}) {
  return passportVerifyForApi({
    workspace: params.workspace,
    file: resolve(params.file),
    publicKeyPath: params.pubkeyPath ? resolve(params.pubkeyPath) : undefined
  });
}

export function passportShowCli(params: {
  file: string;
  format: "json" | "badge";
}) {
  const inspected = inspectPassportArtifact(resolve(params.file));
  if (params.format === "badge") {
    return renderBadge(inspected.passport);
  }
  return inspected;
}

export function passportBadgeCli(params: {
  workspace: string;
  agentId: string;
}) {
  return passportBadgeForApi({
    workspace: params.workspace,
    agentId: params.agentId
  });
}

export function passportExportLatestCli(params: {
  workspace: string;
  scope: "workspace" | "node" | "agent";
  id?: string;
  outFile: string;
}) {
  return passportExportLatestForApi({
    workspace: params.workspace,
    scopeType: params.scope.toUpperCase(),
    scopeId: params.id,
    outFile: resolve(params.workspace, params.outFile)
  });
}
