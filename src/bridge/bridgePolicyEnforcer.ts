import { wildcardMatch, type VerifyLeaseResult } from "../leases/leaseVerifier.js";
import type { BridgeConfig, BridgeProvider } from "./bridgeConfigSchema.js";
import { taxonomyAllowsModel, verifyModelTaxonomySignature } from "./modelTaxonomy.js";

export interface BridgePolicyDecision {
  ok: boolean;
  status: number;
  auditType: string | null;
  reason: string | null;
}

function providerEnabled(config: BridgeConfig, provider: BridgeProvider): boolean {
  return config.bridge.providers[provider].enabled;
}

function routeAllowed(config: BridgeConfig, provider: BridgeProvider, routePath: string): boolean {
  const route = config.bridge.providers[provider].gatewayRoute;
  return routePath.startsWith(route);
}

function modelAllowed(config: BridgeConfig, provider: BridgeProvider, model: string | null): boolean {
  const allowlist = config.bridge.providers[provider].modelAllowlist;
  if (!model || model.trim().length === 0) {
    return allowlist.some((pattern) => pattern === "*");
  }
  return allowlist.some((pattern) => wildcardMatch(pattern, model));
}

export function enforceBridgePolicy(params: {
  workspace: string;
  config: BridgeConfig;
  provider: BridgeProvider;
  routePath: string;
  model: string | null;
  leaseVerification: VerifyLeaseResult;
}): BridgePolicyDecision {
  if (!providerEnabled(params.config, params.provider)) {
    return {
      ok: false,
      status: 403,
      auditType: "BRIDGE_PROVIDER_DENIED",
      reason: `provider disabled: ${params.provider}`
    };
  }
  if (!routeAllowed(params.config, params.provider, params.routePath)) {
    return {
      ok: false,
      status: 403,
      auditType: "BRIDGE_PROVIDER_DENIED",
      reason: `provider route denied: ${params.provider}`
    };
  }
  if (!modelAllowed(params.config, params.provider, params.model)) {
    return {
      ok: false,
      status: 403,
      auditType: "BRIDGE_MODEL_DENIED",
      reason: `model denied by bridge allowlist: ${params.model ?? "(empty)"}`
    };
  }
  const taxonomySig = verifyModelTaxonomySignature(params.workspace);
  if (taxonomySig.signatureExists && !taxonomySig.valid) {
    return {
      ok: false,
      status: 503,
      auditType: "BRIDGE_TAXONOMY_UNTRUSTED",
      reason: `model taxonomy signature invalid: ${taxonomySig.reason ?? "unknown"}`
    };
  }
  if (!taxonomyAllowsModel(params.workspace, params.provider, params.model)) {
    return {
      ok: false,
      status: 403,
      auditType: "BRIDGE_MODEL_DENIED",
      reason: `model denied by taxonomy: ${params.model ?? "(empty)"}`
    };
  }
  if (!params.leaseVerification.ok) {
    return {
      ok: false,
      status: 401,
      auditType: "LEASE_INVALID_OR_MISSING",
      reason: params.leaseVerification.error ?? "lease verification failed"
    };
  }
  return {
    ok: true,
    status: 200,
    auditType: null,
    reason: null
  };
}
