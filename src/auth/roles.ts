export const USER_ROLES = [
  "OWNER",
  "AUDITOR",
  "APPROVER",
  "OPERATOR",
  "VIEWER",
  "AGENT"
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function parseUserRoles(raw: string[] | readonly string[]): UserRole[] {
  const out: UserRole[] = [];
  for (const role of raw) {
    const normalized = String(role).trim().toUpperCase();
    if ((USER_ROLES as readonly string[]).includes(normalized)) {
      if (!out.includes(normalized as UserRole)) {
        out.push(normalized as UserRole);
      }
    }
  }
  return out;
}

export function roleDisplay(role: UserRole): string {
  return role;
}
