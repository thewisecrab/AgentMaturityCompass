/**
 * RAG pipeline injection guard — detects instruction injection in retrieved docs.
 */

export interface RagGuardResult {
  safe: boolean;
  injectionAttempts: number;
  sanitizedChunks: string[];
}

const INJECTION_PATTERNS = [
  /ignore\s+(previous|all|above)\s+(instructions|prompts)/i,
  /you\s+are\s+now\b/i,
  /\bsystem\s*:\s*/i,
  /\bact\s+as\b/i,
  /\bforget\s+(everything|all)\b/i,
  /\bnew\s+instructions?\s*:/i,
  /\b(assistant|system)\s*role\s*:/i,
];

export function guardRagChunks(chunks: string[]): RagGuardResult {
  let injectionAttempts = 0;
  const sanitizedChunks: string[] = [];

  for (const chunk of chunks) {
    let sanitized = chunk;
    let injected = false;
    for (const pat of INJECTION_PATTERNS) {
      if (pat.test(chunk)) {
        injected = true;
        sanitized = sanitized.replace(pat, '[INJECTION_REMOVED]');
      }
    }
    if (injected) injectionAttempts++;
    sanitizedChunks.push(sanitized);
  }

  return { safe: injectionAttempts === 0, injectionAttempts, sanitizedChunks };
}
