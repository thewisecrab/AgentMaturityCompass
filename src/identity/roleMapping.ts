import { normalizeWorkspaceId } from "../workspaces/workspaceId.js";
import type { HostUserRole } from "../workspaces/hostSchema.js";
import type { IdentityConfig } from "./identityConfig.js";

export interface IdentityClaims {
  providerId: string;
  subject: string;
  email: string;
  groups: string[];
}

export interface MappingGrant {
  hostAdmin: boolean;
  workspaceGrants: Array<{
    workspaceId: string;
    roles: HostUserRole[];
    sourceId: string;
  }>;
}

function domainFromEmail(email: string): string {
  const idx = email.lastIndexOf("@");
  if (idx < 0 || idx === email.length - 1) {
    return "";
  }
  return email.slice(idx + 1).toLowerCase();
}

function hasAnyGroup(userGroups: string[], requiredGroups: string[]): boolean {
  if (requiredGroups.length === 0) {
    return true;
  }
  const groupSet = new Set(userGroups.map((value) => value.toLowerCase()));
  return requiredGroups.some((group) => groupSet.has(group.toLowerCase()));
}

export function evaluateRoleMapping(config: IdentityConfig, claims: IdentityClaims): MappingGrant {
  let hostAdmin = false;
  const workspaceMap = new Map<string, Set<HostUserRole>>();

  for (const rule of config.identity.roleMapping.rules) {
    if (rule.match.providerId && rule.match.providerId !== claims.providerId) {
      continue;
    }
    if (rule.match.subjectEquals && rule.match.subjectEquals !== claims.subject) {
      continue;
    }
    if (rule.match.emailDomain && rule.match.emailDomain.toLowerCase() !== domainFromEmail(claims.email)) {
      continue;
    }
    if (!hasAnyGroup(claims.groups, rule.match.groupsAny)) {
      continue;
    }
    if (rule.grant.hostAdmin) {
      hostAdmin = true;
    }
    if (rule.grant.workspaceId && rule.grant.roles && rule.grant.roles.length > 0) {
      const workspaceId = normalizeWorkspaceId(rule.grant.workspaceId);
      const set = workspaceMap.get(workspaceId) ?? new Set<HostUserRole>();
      for (const role of rule.grant.roles) {
        set.add(role);
      }
      workspaceMap.set(workspaceId, set);
    }
  }

  const workspaceGrants = Array.from(workspaceMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([workspaceId, roles]) => ({
      workspaceId,
      roles: Array.from(roles).sort() as HostUserRole[],
      sourceId: `${claims.providerId}:${claims.subject}`
    }));

  return {
    hostAdmin,
    workspaceGrants
  };
}
