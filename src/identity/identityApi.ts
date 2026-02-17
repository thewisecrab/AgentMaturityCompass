import {
  appendHostAudit,
  authenticateHostUser,
  listAccessibleWorkspaces,
  listHostUsers
} from "../workspaces/hostDb.js";
import type { IdentityConfig } from "./identityConfig.js";
import { createIdentitySession, resolveIdentitySession, revokeIdentitySession } from "./sessionStore.js";
import { clearIdentitySessionCookie, identitySessionTokenFromCookie, setIdentitySessionCookie } from "./sessionCookie.js";

export function localPasswordLogin(params: {
  hostDir: string;
  config: IdentityConfig;
  username: string;
  password: string;
  setCookie: (token: string, maxAgeSeconds: number) => void;
}): {
  ok: boolean;
  status: number;
  error?: string;
  user?: { userId: string; username: string; isHostAdmin: boolean };
} {
  if (!params.config.identity.localAuth.enabled || !params.config.identity.localAuth.passwordLoginEnabled) {
    return {
      ok: false,
      status: 403,
      error: "local password login disabled by identity policy"
    };
  }
  const auth = authenticateHostUser({
    hostDir: params.hostDir,
    username: params.username,
    password: params.password
  });
  if (!auth.ok || !auth.user) {
    appendHostAudit(params.hostDir, "HUMAN_LOGIN_FAILED", params.username || null, {
      route: "/host/api/login"
    });
    return {
      ok: false,
      status: 401,
      error: auth.error ?? "invalid credentials"
    };
  }
  const session = createIdentitySession({
    hostDir: params.hostDir,
    userId: auth.user.userId,
    authType: "LOCAL",
    providerId: null,
    ttlMinutes: params.config.identity.session.ttlMinutes
  });
  const maxAge = Math.floor((session.payload.expTs - session.payload.issuedTs) / 1000);
  params.setCookie(session.token, maxAge);
  appendHostAudit(params.hostDir, "HUMAN_LOGIN_SUCCESS", auth.user.username, {
    route: "/host/api/login"
  });
  return {
    ok: true,
    status: 200,
    user: {
      userId: auth.user.userId,
      username: auth.user.username,
      isHostAdmin: auth.user.isHostAdmin
    }
  };
}

export function resolveIdentityRequestContext(params: {
  hostDir: string;
  config: IdentityConfig;
  cookieHeader: string | undefined;
}): {
  ok: boolean;
  status: number;
  error?: string;
  user?: {
    userId: string;
    username: string;
    isHostAdmin: boolean;
    csrfToken: string;
  };
} {
  const token = identitySessionTokenFromCookie(params.cookieHeader, params.config);
  const session = resolveIdentitySession({
    hostDir: params.hostDir,
    token
  });
  if (!session.ok || !session.session) {
    return { ok: false, status: 401, error: session.error ?? "unauthorized" };
  }
  return {
    ok: true,
    status: 200,
    user: {
      userId: session.session.user.userId,
      username: session.session.user.username,
      isHostAdmin: session.session.user.isHostAdmin,
      csrfToken: session.session.csrfToken
    }
  };
}

export function logoutIdentitySession(params: {
  hostDir: string;
  config: IdentityConfig;
  cookieHeader: string | undefined;
  clearCookie: () => void;
}): void {
  const token = identitySessionTokenFromCookie(params.cookieHeader, params.config);
  const session = resolveIdentitySession({
    hostDir: params.hostDir,
    token
  });
  if (session.ok && session.session) {
    revokeIdentitySession(params.hostDir, session.session.payload.sessionId);
  }
  params.clearCookie();
}

export function hostPortfolioForUser(params: {
  hostDir: string;
  username: string;
}): {
  workspaces: ReturnType<typeof listAccessibleWorkspaces>;
  usersCount: number;
} {
  return {
    workspaces: listAccessibleWorkspaces(params.hostDir, params.username),
    usersCount: listHostUsers(params.hostDir).length
  };
}

export function setIdentityCookieHeader(params: {
  config: IdentityConfig;
  setHeader: (name: string, value: string) => void;
  token: string;
  maxAgeSeconds: number;
}): void {
  setIdentitySessionCookie({
    config: params.config,
    token: params.token,
    maxAgeSeconds: params.maxAgeSeconds,
    res: { setHeader: params.setHeader }
  });
}

export function clearIdentityCookieHeader(params: {
  config: IdentityConfig;
  setHeader: (name: string, value: string) => void;
}): void {
  clearIdentitySessionCookie({
    config: params.config,
    res: { setHeader: params.setHeader }
  });
}
