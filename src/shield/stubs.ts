/**
 * Shield stubs — thin wrappers for modules with existing AMC equivalents.
 */

// s6_manifest
export interface ManifestResult { valid: boolean; permissions: string[]; warnings: string[]; }
export function validateManifest(manifest: Record<string, unknown>): ManifestResult {
  const permissions = (manifest['permissions'] as string[]) ?? [];
  const warnings: string[] = [];
  if (permissions.includes('*')) warnings.push('Wildcard permission detected');
  if (!manifest['name']) warnings.push('Missing manifest name');
  if (!manifest['version']) warnings.push('Missing manifest version');
  return { valid: warnings.length === 0, permissions, warnings };
}

// s7_registry
export interface RegistryCheckResult { registered: boolean; version: string; trusted: boolean; }
export function checkRegistry(skillId: string): RegistryCheckResult {
  return { registered: skillId.length > 0, version: '0.0.0', trusted: false };
}

// s8_ingress
export interface IngressResult { allowed: boolean; sanitized: string; blocked: string[]; }
export function checkIngress(input: string): IngressResult {
  const blocked: string[] = [];
  let sanitized = input;
  const patterns = [/<script\b[^>]*>/gi, /javascript:/gi, /on\w+\s*=/gi];
  for (const p of patterns) {
    if (p.test(input)) {
      blocked.push(p.source);
      sanitized = sanitized.replace(new RegExp(p.source, p.flags), '[BLOCKED]');
    }
  }
  return { allowed: blocked.length === 0, sanitized, blocked };
}

// s9_sanitizer
export interface SanitizeResult { sanitized: string; removedCount: number; }
export function sanitize(input: string): SanitizeResult {
  let removedCount = 0;
  const sanitized = input.replace(/<[^>]+>/g, () => { removedCount++; return ''; });
  return { sanitized, removedCount };
}

// s10_detector
export interface DetectorResult { detected: boolean; attackType: string | null; confidence: number; }
export function detect(input: string): DetectorResult {
  const injectionRe = /(\b(union|select|drop|insert|delete|update)\b.*\b(from|table|where)\b)/i;
  if (injectionRe.test(input)) return { detected: true, attackType: 'sql_injection', confidence: 0.85 };
  return { detected: false, attackType: null, confidence: 0 };
}

// s12_oauth_scope
export interface OAuthScopeResult { valid: boolean; excessive: string[]; missing: string[]; }
export function checkOAuthScopes(requested: string[], allowed: string[]): OAuthScopeResult {
  const allowedSet = new Set(allowed);
  const excessive = requested.filter(s => !allowedSet.has(s));
  return { valid: excessive.length === 0, excessive, missing: [] };
}
