export interface ValidationPolicy { maxLength?: number; requiredSections?: string[]; bannedPhrases?: string[]; formatRules?: ('json' | 'has-headers' | 'no-html')[]; }
export interface ValidationResult { valid: boolean; errors: string[]; }

export function validate(response: string | unknown, policyOrRules?: ValidationPolicy | string[]): ValidationResult {
  if (Array.isArray(policyOrRules) || !policyOrRules) {
    const errors: string[] = [];
    if (!response) errors.push('Empty response');
    return { valid: errors.length === 0, errors };
  }
  const policy = policyOrRules;
  const text = typeof response === 'string' ? response : JSON.stringify(response);
  const errors: string[] = [];
  if (policy.maxLength && text.length > policy.maxLength) errors.push(`Exceeds max length: ${text.length}/${policy.maxLength}`);
  if (policy.requiredSections) {
    for (const s of policy.requiredSections) { if (!text.includes(s)) errors.push(`Missing required section: ${s}`); }
  }
  if (policy.bannedPhrases) {
    for (const p of policy.bannedPhrases) { if (text.toLowerCase().includes(p.toLowerCase())) errors.push(`Contains banned phrase: ${p}`); }
  }
  if (policy.formatRules) {
    for (const rule of policy.formatRules) {
      if (rule === 'json') { try { JSON.parse(text); } catch { errors.push('Not valid JSON'); } }
      if (rule === 'has-headers' && !/^#+\s/m.test(text) && !/<h[1-6]/i.test(text)) errors.push('Missing headers');
      if (rule === 'no-html' && /<[a-z][\s\S]*>/i.test(text)) errors.push('Contains HTML');
    }
  }
  return { valid: errors.length === 0, errors };
}

export function validateResponse(response: unknown, rules: string[]): ValidationResult {
  return validate(response, rules);
}
