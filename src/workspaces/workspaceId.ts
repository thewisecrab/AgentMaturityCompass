const WORKSPACE_ID_RE = /^[a-z0-9][a-z0-9-]{1,62}$/;

export const DEFAULT_WORKSPACE_ID = "default";

export function normalizeWorkspaceId(input: string): string {
  const normalized = input.trim().toLowerCase();
  if (!WORKSPACE_ID_RE.test(normalized)) {
    throw new Error(
      `Invalid workspace id '${input}'. Expected lowercase URL-safe id matching ${WORKSPACE_ID_RE.source}.`
    );
  }
  return normalized;
}

export function isWorkspaceId(input: string): boolean {
  return WORKSPACE_ID_RE.test(input);
}

export function workspaceIdFromDirectory(path: string, fallback = DEFAULT_WORKSPACE_ID): string {
  const normalized = path.replace(/\\/g, "/");
  const parts = normalized.split("/").filter((part) => part.length > 0);
  const workspacesIndex = parts.lastIndexOf("workspaces");
  if (workspacesIndex >= 0 && workspacesIndex + 1 < parts.length) {
    const candidate = parts[workspacesIndex + 1];
    if (candidate && isWorkspaceId(candidate)) {
      return candidate;
    }
  }
  // In single-workspace mode we intentionally use the configured fallback id
  // instead of deriving from arbitrary directory names.
  return fallback;
}
