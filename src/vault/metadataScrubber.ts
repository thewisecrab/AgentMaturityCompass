/**
 * Metadata scrubber — removes metadata fields from content.
 */

export interface ScrubResult {
  scrubbed: string;
  fieldsRemoved: string[];
}

const DEFAULT_FIELDS = ['author', 'creator', 'producer', 'created', 'modified', 'title', 'subject', 'keywords', 'company', 'manager'];

export function scrubMetadata(content: string, fields?: string[]): ScrubResult {
  const targetFields = fields ?? DEFAULT_FIELDS;
  const fieldsRemoved: string[] = [];
  let scrubbed = content;

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

  return { scrubbed: scrubbed.trim(), fieldsRemoved: [...new Set(fieldsRemoved)] };
}
