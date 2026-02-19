import { randomUUID } from 'node:crypto';

export interface TranslatedError { userMessage: string; technicalMessage: string; code: string; recovery?: string; }

const ERROR_MAP: Record<string, { user: string; recovery: string }> = {
  ECONNREFUSED: { user: 'Unable to connect to the service. It may be temporarily unavailable.', recovery: 'Check if the service is running and try again in a few moments.' },
  ENOENT: { user: 'The requested resource was not found.', recovery: 'Verify the file path or resource name exists.' },
  EPERM: { user: 'You do not have permission to perform this action.', recovery: 'Check your permissions or contact an administrator.' },
  TypeError: { user: 'An unexpected data format was encountered.', recovery: 'Ensure the input data matches the expected format.' },
  SyntaxError: { user: 'The input could not be understood due to a formatting issue.', recovery: 'Check for syntax errors in your input (e.g., invalid JSON).' },
};

export function translateError(error: Error | { message: string; code?: string }, audience?: 'user' | 'developer' | 'ops'): TranslatedError {
  const msg = error.message ?? String(error);
  const code = ('code' in error && typeof error.code === 'string') ? error.code : error.constructor?.name ?? 'ERR_GENERIC';
  const mapped = ERROR_MAP[code] ?? Object.entries(ERROR_MAP).find(([k]) => msg.includes(k))?.[1];
  const aud = audience ?? 'user';
  if (aud === 'developer') return { userMessage: msg, technicalMessage: msg, code, recovery: mapped?.recovery };
  if (aud === 'ops') return { userMessage: `[${code}] ${msg}`, technicalMessage: msg, code, recovery: mapped?.recovery ?? 'Check logs and monitoring dashboards.' };
  return { userMessage: mapped?.user ?? 'An error occurred. Please try again.', technicalMessage: msg, code, recovery: mapped?.recovery };
}
