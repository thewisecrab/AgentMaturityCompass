/**
 * errorTranslator.ts — Dynamic error pattern registry with recovery
 * suggestions and batch translation.
 */

export interface TranslatedError {
  userMessage: string;
  technicalMessage: string;
  code: string;
  recovery?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorPattern {
  code: string;
  pattern?: RegExp;
  user: string;
  recovery: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/* ── Built-in patterns ───────────────────────────────────────────── */

const BUILT_IN_PATTERNS: ErrorPattern[] = [
  { code: 'ECONNREFUSED', user: 'Unable to connect to the service.', recovery: 'Check if the service is running and try again.', severity: 'high' },
  { code: 'ECONNRESET', user: 'The connection was unexpectedly closed.', recovery: 'Retry the request. If persistent, check network stability.', severity: 'medium' },
  { code: 'ETIMEDOUT', user: 'The request timed out.', recovery: 'Try again with a longer timeout or check the service status.', severity: 'medium' },
  { code: 'ENOENT', user: 'The requested resource was not found.', recovery: 'Verify the file path or resource name exists.', severity: 'medium' },
  { code: 'EPERM', user: 'Permission denied.', recovery: 'Check your permissions or contact an administrator.', severity: 'high' },
  { code: 'EACCES', user: 'Access denied.', recovery: 'Run with appropriate permissions or check file ownership.', severity: 'high' },
  { code: 'ENOSPC', user: 'Disk space is full.', recovery: 'Free up disk space and retry the operation.', severity: 'critical' },
  { code: 'ENOMEM', user: 'Out of memory.', recovery: 'Reduce memory usage or increase available memory.', severity: 'critical' },
  { code: 'TypeError', user: 'An unexpected data format was encountered.', recovery: 'Ensure the input data matches the expected format.', severity: 'medium' },
  { code: 'SyntaxError', user: 'Invalid syntax in input.', recovery: 'Check for syntax errors (e.g., malformed JSON).', severity: 'medium' },
  { code: 'RangeError', user: 'A value is out of the expected range.', recovery: 'Check input values are within acceptable bounds.', severity: 'medium' },
  { code: 'ERR_HTTP_429', pattern: /429|rate.?limit|too many requests/i, user: 'Rate limit exceeded.', recovery: 'Wait before retrying. Consider implementing exponential backoff.', severity: 'medium' },
  { code: 'ERR_HTTP_5XX', pattern: /5\d{2}|internal server error|service unavailable/i, user: 'Server error occurred.', recovery: 'The service may be temporarily unavailable. Retry after a brief wait.', severity: 'high' },
];

/* ── Pattern registry ────────────────────────────────────────────── */

const customPatterns: ErrorPattern[] = [];

export function registerErrorPattern(pattern: ErrorPattern): void {
  customPatterns.push(pattern);
}

export function clearCustomPatterns(): void {
  customPatterns.length = 0;
}

/* ── Pattern matching ────────────────────────────────────────────── */

function findPattern(code: string, message: string): ErrorPattern | undefined {
  // Check custom patterns first (higher priority)
  for (const p of customPatterns) {
    if (p.code === code) return p;
    if (p.pattern && p.pattern.test(message)) return p;
  }
  // Built-in patterns
  for (const p of BUILT_IN_PATTERNS) {
    if (p.code === code) return p;
    if (p.pattern && p.pattern.test(message)) return p;
  }
  // Fallback: search by code substring in message
  for (const p of BUILT_IN_PATTERNS) {
    if (message.includes(p.code)) return p;
  }
  return undefined;
}

/* ── Translate single error ──────────────────────────────────────── */

export function translateError(
  error: Error | { message: string; code?: string },
  audience?: 'user' | 'developer' | 'ops',
): TranslatedError {
  const msg = error.message ?? String(error);
  const code = ('code' in error && typeof error.code === 'string')
    ? error.code
    : error.constructor?.name ?? 'ERR_GENERIC';
  const matched = findPattern(code, msg);
  const aud = audience ?? 'user';
  const severity = matched?.severity ?? 'medium';

  if (aud === 'developer') {
    return { userMessage: msg, technicalMessage: msg, code, recovery: matched?.recovery, severity };
  }
  if (aud === 'ops') {
    return {
      userMessage: `[${code}] ${msg}`,
      technicalMessage: msg,
      code,
      recovery: matched?.recovery ?? 'Check logs and monitoring dashboards.',
      severity,
    };
  }
  return {
    userMessage: matched?.user ?? 'An error occurred. Please try again.',
    technicalMessage: msg,
    code,
    recovery: matched?.recovery,
    severity,
  };
}

/* ── Batch translation ───────────────────────────────────────────── */

export function translateErrors(
  errors: Array<Error | { message: string; code?: string }>,
  audience?: 'user' | 'developer' | 'ops',
): TranslatedError[] {
  return errors.map(e => translateError(e, audience));
}

/* ── Error summary ───────────────────────────────────────────────── */

export function errorSummary(errors: TranslatedError[]): { total: number; bySeverity: Record<string, number>; uniqueCodes: string[] } {
  const bySeverity: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  const codes = new Set<string>();
  for (const e of errors) {
    bySeverity[e.severity] = (bySeverity[e.severity] ?? 0) + 1;
    codes.add(e.code);
  }
  return { total: errors.length, bySeverity, uniqueCodes: [...codes] };
}
