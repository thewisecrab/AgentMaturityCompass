import { emitGuardEvent } from '../enforce/evidenceEmitter.js';

export interface SanitizeOptions {
  maxLength?: number;
  stripHtml?: boolean;
  stripUrls?: boolean;
  normalizeUnicode?: boolean;
}

export interface SanitizeResult {
  sanitized: string;
  removedCount: number;
}

const CONFUSABLES: Record<string, string> = {
  '\u0410': 'A', '\u0412': 'B', '\u0421': 'C', '\u0415': 'E', '\u041D': 'H',
  '\u041A': 'K', '\u041C': 'M', '\u041E': 'O', '\u0420': 'P', '\u0422': 'T',
  '\u0425': 'X', '\u0430': 'a', '\u0435': 'e', '\u043E': 'o', '\u0440': 'p',
  '\u0441': 'c', '\u0443': 'y', '\u0445': 'x',
  '\uff21': 'A', '\uff22': 'B', '\uff23': 'C',
};

export function sanitize(text: string, options: SanitizeOptions = {}): SanitizeResult {
  let result = text;
  let removedCount = 0;

  // Strip script tags
  result = result.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, () => { removedCount++; return ''; });

  // Strip event handlers
  result = result.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, () => { removedCount++; return ''; });

  // Strip javascript: URIs
  result = result.replace(/javascript\s*:/gi, () => { removedCount++; return ''; });

  // Strip data: URIs
  result = result.replace(/data\s*:[^;\s,]+;[^"'\s)]+/gi, () => { removedCount++; return ''; });

  // Strip CSS expressions
  result = result.replace(/expression\s*\([^)]*\)/gi, () => { removedCount++; return ''; });

  if (options.stripHtml) {
    result = result.replace(/<[^>]+>/g, () => { removedCount++; return ''; });
  }

  if (options.stripUrls) {
    result = result.replace(/https?:\/\/[^\s<>"']+/gi, () => { removedCount++; return '[URL]'; });
  }

  if (options.normalizeUnicode) {
    result = result.split('').map(ch => CONFUSABLES[ch] ?? ch).join('');
  }

  if (options.maxLength && result.length > options.maxLength) {
    result = result.slice(0, options.maxLength);
  }

  emitGuardEvent({
    agentId: 'system', moduleCode: 'S4',
    decision: removedCount > 0 ? 'warn' : 'allow',
    reason: removedCount > 0 ? `Sanitized ${removedCount} items` : 'Input clean',
    severity: removedCount > 0 ? 'medium' : 'low',
    meta: { removedCount },
  });
  return { sanitized: result, removedCount };
}
