import type { UserRole } from "./roles.js";

export interface SessionPrincipal {
  userId: string;
  username: string;
  roles: UserRole[];
}

export interface AccessContext {
  isAdminToken: boolean;
  principal: SessionPrincipal | null;
}

export function hasRole(roles: readonly UserRole[], role: UserRole): boolean {
  return roles.includes(role);
}

export function hasAnyRole(roles: readonly UserRole[], required: readonly UserRole[]): boolean {
  for (const role of required) {
    if (roles.includes(role)) {
      return true;
    }
  }
  return false;
}

export function canSignWithVault(roles: readonly UserRole[]): boolean {
  return hasRole(roles, "OWNER");
}

export function enforceRoleOrAdmin(params: {
  access: AccessContext;
  requiredAny: readonly UserRole[];
  usersConfigValid: boolean;
}): {
  ok: boolean;
  status: number;
  error?: string;
} {
  if (params.access.isAdminToken) {
    return { ok: true, status: 200 };
  }
  if (!params.usersConfigValid) {
    return {
      ok: false,
      status: 403,
      error: "users signature invalid; console is read-only"
    };
  }
  if (!params.access.principal) {
    return {
      ok: false,
      status: 401,
      error: "authentication required"
    };
  }
  if (!hasAnyRole(params.access.principal.roles, params.requiredAny)) {
    return {
      ok: false,
      status: 403,
      error: `requires role: ${params.requiredAny.join("|")}`
    };
  }
  return { ok: true, status: 200 };
}
