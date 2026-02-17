import {
  createHostSessionRow,
  findHostUserById,
  getHostSessionRow,
  revokeHostSessionRow,
  touchHostSession
} from "../workspaces/hostDb.js";
import { issueIdentitySessionToken, verifyIdentitySessionToken, type IdentitySessionPayload } from "./session.js";

export interface ActiveIdentitySession {
  payload: IdentitySessionPayload;
  user: {
    userId: string;
    username: string;
    email: string | null;
    isHostAdmin: boolean;
    disabled: boolean;
  };
  csrfToken: string;
}

export function createIdentitySession(params: {
  hostDir: string;
  userId: string;
  authType: "LOCAL" | "OIDC" | "SAML" | "SCIM";
  providerId?: string | null;
  ttlMinutes: number;
}): { token: string; payload: IdentitySessionPayload } {
  const issued = issueIdentitySessionToken({
    hostDir: params.hostDir,
    userId: params.userId,
    authType: params.authType,
    providerId: params.providerId ?? null,
    ttlMinutes: params.ttlMinutes
  });
  createHostSessionRow({
    hostDir: params.hostDir,
    sessionId: issued.payload.sessionId,
    userId: issued.payload.userId,
    csrfToken: issued.payload.csrfToken,
    authType: issued.payload.authType,
    providerId: issued.payload.providerId,
    issuedTs: issued.payload.issuedTs,
    expTs: issued.payload.expTs
  });
  return issued;
}

export function revokeIdentitySession(hostDir: string, sessionId: string): void {
  revokeHostSessionRow(hostDir, sessionId);
}

export function resolveIdentitySession(params: {
  hostDir: string;
  token: string | null;
}): { ok: boolean; session: ActiveIdentitySession | null; error?: string } {
  if (!params.token) {
    return { ok: false, session: null, error: "missing session cookie" };
  }
  const verified = verifyIdentitySessionToken({
    hostDir: params.hostDir,
    token: params.token
  });
  if (!verified.ok || !verified.payload) {
    return { ok: false, session: null, error: verified.error ?? "invalid session" };
  }
  const row = getHostSessionRow(params.hostDir, verified.payload.sessionId);
  if (!row || row.revoked) {
    return { ok: false, session: null, error: "session revoked" };
  }
  if (Date.now() > row.expTs) {
    return { ok: false, session: null, error: "session expired" };
  }
  const user = findHostUserById(params.hostDir, row.userId);
  if (!user) {
    return { ok: false, session: null, error: "user missing" };
  }
  if (user.disabled) {
    return { ok: false, session: null, error: "user disabled" };
  }
  touchHostSession(params.hostDir, row.sessionId);
  return {
    ok: true,
    session: {
      payload: verified.payload,
      user,
      csrfToken: row.csrfToken
    }
  };
}
