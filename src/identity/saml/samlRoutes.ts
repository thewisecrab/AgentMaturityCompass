import { randomUUID } from "node:crypto";
import type { IdentityConfig, IdentityProvider } from "../identityConfig.js";
import { resolveIdentitySecretRef } from "../identityConfig.js";
import { evaluateRoleMapping } from "../roleMapping.js";
import { applyMembershipRolesFromSource, appendHostAudit, upsertIdentityUser } from "../../workspaces/hostDb.js";
import { createIdentitySession } from "../sessionStore.js";
import { parseCompactSamlResponse, verifyCompactSamlAssertion } from "./samlVerify.js";

interface PendingSamlRequest {
  providerId: string;
  requestId: string;
  createdTs: number;
}

const pendingRequests = new Map<string, PendingSamlRequest>();

type SamlProvider = Extract<IdentityProvider, { type: "SAML" }>;

function pendingKey(hostDir: string, requestId: string): string {
  return `${hostDir}::${requestId}`;
}

function findProvider(config: IdentityConfig, providerId: string): SamlProvider {
  const provider = config.identity.providers.find((item) => item.id === providerId);
  if (!provider || !provider.enabled || provider.type !== "SAML") {
    throw new Error(`SAML provider not enabled: ${providerId}`);
  }
  return provider;
}

export function samlMetadataXml(config: IdentityConfig, providerId: string): string {
  const provider = findProvider(config, providerId);
  const entityId = provider.saml.sp.entityId;
  const acsUrl = provider.saml.sp.acsUrl;
  return [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    `<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata" entityID="${entityId}">`,
    "  <SPSSODescriptor AuthnRequestsSigned=\"false\" WantAssertionsSigned=\"true\" protocolSupportEnumeration=\"urn:oasis:names:tc:SAML:2.0:protocol\">",
    `    <AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="${acsUrl}" index="1" isDefault="true"/>`,
    "  </SPSSODescriptor>",
    "</EntityDescriptor>"
  ].join("\n");
}

export function startSamlLogin(params: {
  hostDir: string;
  config: IdentityConfig;
  providerId: string;
}): { redirectUrl: string; relayState: string; requestId: string } {
  const provider = findProvider(params.config, params.providerId);
  const requestId = `req_${randomUUID().replace(/-/g, "")}`;
  const relayState = requestId;
  pendingRequests.set(pendingKey(params.hostDir, requestId), {
    providerId: provider.id,
    requestId,
    createdTs: Date.now()
  });
  const requestPayload = {
    requestId,
    issuer: provider.saml.sp.entityId,
    acsUrl: provider.saml.sp.acsUrl,
    ts: Date.now()
  };
  const samlRequest = Buffer.from(JSON.stringify(requestPayload), "utf8").toString("base64");
  const url = new URL(provider.saml.idp.entryPoint);
  url.searchParams.set("SAMLRequest", samlRequest);
  url.searchParams.set("RelayState", relayState);
  appendHostAudit(params.hostDir, "SAML_LOGIN_STARTED", null, {
    providerId: provider.id
  });
  return {
    redirectUrl: url.toString(),
    relayState,
    requestId
  };
}

export function completeSamlAcs(params: {
  hostDir: string;
  config: IdentityConfig;
  providerId: string;
  samlResponseB64: string;
  relayState: string;
}): { token: string; sessionId: string; userId: string; username: string } {
  const provider = findProvider(params.config, params.providerId);
  const key = pendingKey(params.hostDir, params.relayState);
  const pending = pendingRequests.get(key);
  if (!pending || pending.providerId !== provider.id) {
    throw new Error("unknown or expired SAML relay state");
  }
  pendingRequests.delete(key);
  if (Date.now() - pending.createdTs > 10 * 60_000) {
    throw new Error("SAML request expired");
  }
  const assertion = parseCompactSamlResponse(params.samlResponseB64);
  const idpCertPem = resolveIdentitySecretRef(params.hostDir, provider.saml.idp.certPemRef);
  const verified = verifyCompactSamlAssertion({
    assertion,
    idpIssuer: provider.saml.idp.issuer,
    expectedAudience: provider.saml.sp.entityId,
    inResponseTo: pending.requestId,
    idpCertPem,
    acceptedClockSkewMs: provider.saml.security.acceptedClockSkewMs
  });
  if (!verified.ok) {
    throw new Error(`invalid SAML response: ${verified.error}`);
  }
  const subject = assertion.subject;
  const email = assertion.email?.toLowerCase?.() ?? "";
  if (!subject || !email) {
    throw new Error("SAML assertion missing required subject/email");
  }
  const groups = Array.isArray(assertion.groups) ? assertion.groups : [];
  const grants = evaluateRoleMapping(params.config, {
    providerId: provider.id,
    subject,
    email,
    groups
  });
  const user = upsertIdentityUser({
    hostDir: params.hostDir,
    username: email,
    email,
    displayName: assertion.name ?? null,
    authType: "SAML",
    providerId: provider.id,
    subject,
    isHostAdmin: grants.hostAdmin
  });
  for (const workspaceGrant of grants.workspaceGrants) {
    applyMembershipRolesFromSource({
      hostDir: params.hostDir,
      userId: user.userId,
      workspaceId: workspaceGrant.workspaceId,
      roles: workspaceGrant.roles,
      sourceType: "SSO_GROUP",
      sourceId: workspaceGrant.sourceId
    });
  }
  const session = createIdentitySession({
    hostDir: params.hostDir,
    userId: user.userId,
    authType: "SAML",
    providerId: provider.id,
    ttlMinutes: params.config.identity.session.ttlMinutes
  });
  appendHostAudit(params.hostDir, "SAML_LOGIN_COMPLETED", user.username, {
    providerId: provider.id,
    workspaceGrantCount: grants.workspaceGrants.length
  });
  return {
    token: session.token,
    sessionId: session.payload.sessionId,
    userId: user.userId,
    username: user.username
  };
}
