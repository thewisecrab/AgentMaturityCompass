import { randomUUID } from "node:crypto";
import type { IdentityProvider } from "../identityConfig.js";
import { discoverOidcWellKnown } from "./jwtVerify.js";
import { generatePkceVerifier, pkceChallengeS256 } from "./pkce.js";

export interface OidcAuthStart {
  state: string;
  nonce: string;
  verifier: string;
  authorizationUrl: string;
}

export async function buildOidcAuthStart(params: {
  provider: IdentityProvider;
}): Promise<OidcAuthStart> {
  if (params.provider.type !== "OIDC") {
    throw new Error("provider is not OIDC");
  }
  const state = randomUUID().replace(/-/g, "");
  const nonce = randomUUID().replace(/-/g, "");
  const verifier = generatePkceVerifier();
  const challenge = pkceChallengeS256(verifier);

  const endpoints = params.provider.oidc.discovery.useWellKnown
    ? await discoverOidcWellKnown(params.provider.oidc.issuer)
    : {
        authorizationEndpoint: params.provider.oidc.discovery.authorizationEndpoint ?? "",
        tokenEndpoint: params.provider.oidc.discovery.tokenEndpoint ?? "",
        jwksUri: params.provider.oidc.discovery.jwksUri ?? ""
      };
  if (!endpoints.authorizationEndpoint) {
    throw new Error(`missing authorization endpoint for provider ${params.provider.id}`);
  }
  const authUrl = new URL(endpoints.authorizationEndpoint);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", params.provider.oidc.clientId);
  authUrl.searchParams.set("redirect_uri", params.provider.oidc.redirectUri);
  authUrl.searchParams.set("scope", params.provider.oidc.scopes.join(" "));
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("nonce", nonce);
  authUrl.searchParams.set("code_challenge", challenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  return {
    state,
    nonce,
    verifier,
    authorizationUrl: authUrl.toString()
  };
}

export async function exchangeOidcCode(params: {
  provider: IdentityProvider;
  code: string;
  verifier: string;
  clientSecret: string;
}): Promise<{ idToken: string; accessToken: string | null }> {
  if (params.provider.type !== "OIDC") {
    throw new Error("provider is not OIDC");
  }
  const endpoints = params.provider.oidc.discovery.useWellKnown
    ? await discoverOidcWellKnown(params.provider.oidc.issuer)
    : {
        authorizationEndpoint: params.provider.oidc.discovery.authorizationEndpoint ?? "",
        tokenEndpoint: params.provider.oidc.discovery.tokenEndpoint ?? "",
        jwksUri: params.provider.oidc.discovery.jwksUri ?? ""
      };
  if (!endpoints.tokenEndpoint) {
    throw new Error(`missing token endpoint for provider ${params.provider.id}`);
  }
  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("code", params.code);
  body.set("redirect_uri", params.provider.oidc.redirectUri);
  body.set("client_id", params.provider.oidc.clientId);
  body.set("client_secret", params.clientSecret);
  body.set("code_verifier", params.verifier);

  const response = await fetch(endpoints.tokenEndpoint, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`OIDC token exchange failed: ${response.status} ${text}`);
  }
  const parsed = JSON.parse(text) as Record<string, unknown>;
  const idToken = typeof parsed.id_token === "string" ? parsed.id_token : "";
  if (!idToken) {
    throw new Error("OIDC token response missing id_token");
  }
  return {
    idToken,
    accessToken: typeof parsed.access_token === "string" ? parsed.access_token : null
  };
}

export async function resolveProviderEndpoints(provider: IdentityProvider): Promise<{
  authorizationEndpoint: string;
  tokenEndpoint: string;
  jwksUri: string;
}> {
  if (provider.type !== "OIDC") {
    throw new Error("provider is not OIDC");
  }
  if (provider.oidc.discovery.useWellKnown) {
    return discoverOidcWellKnown(provider.oidc.issuer);
  }
  const authorizationEndpoint = provider.oidc.discovery.authorizationEndpoint ?? "";
  const tokenEndpoint = provider.oidc.discovery.tokenEndpoint ?? "";
  const jwksUri = provider.oidc.discovery.jwksUri ?? "";
  if (!authorizationEndpoint || !tokenEndpoint || !jwksUri) {
    throw new Error("OIDC discovery disabled but endpoints incomplete");
  }
  return { authorizationEndpoint, tokenEndpoint, jwksUri };
}
