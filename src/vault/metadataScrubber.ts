/**
 * Metadata scrubber — removes metadata fields from content.
 */

export interface ScrubResult {
  scrubbed: string;
  fieldsRemoved: string[];
}

const DEFAULT_FIELDS = ['author', 'creator', 'producer', 'created', 'modified', 'title', 'subject', 'keywords', 'company', 'manager'];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function scrubMetadata(content: unknown, fields?: string[]): ScrubResult {
  const targetFields = fields ?? DEFAULT_FIELDS;
  const fieldsRemoved: string[] = [];

  if (isPlainObject(content)) {
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(content)) {
      const normalized = k.toLowerCase();
      const shouldRemove = k.startsWith('_') || targetFields.includes(normalized) || targetFields.includes(normalized.replace(/^_/, ''));
      if (shouldRemove) {
        fieldsRemoved.push(normalized);
      } else {
        sanitized[k] = v;
      }
    }
    return {
      scrubbed: JSON.stringify(sanitized),
      fieldsRemoved: [...new Set(fieldsRemoved)],
    };
  }

  let scrubbed =
    typeof content === 'string'
      ? content
      : content === undefined || content === null
        ? ''
        : JSON.stringify(content);

  for (const field of targetFields) {
    const patterns = [
      new RegExp(`"${field}"\\s*:\\s*"[^"]*"`, 'gi'),
      new RegExp(`<${field}>[^<]*</${field}>`, 'gi'),
      new RegExp(`${field}\\s*[:=]\\s*[^\\n]+`, 'gi'),
    ];
    for (const pat of patterns) {
      if (pat.test(scrubbed)) {
        fieldsRemoved.push(field);
        scrubbed = scrubbed.replace(pat, '');
        break;
      }
    }
  }

  return { scrubbed: (typeof scrubbed === 'string' ? scrubbed : JSON.stringify(scrubbed)).trim(), fieldsRemoved: [...new Set(fieldsRemoved)] };
}
