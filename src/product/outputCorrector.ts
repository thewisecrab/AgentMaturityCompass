import { randomUUID } from 'node:crypto';

export interface CorrectionResult { corrected: string; corrections: number; changes: string[]; }
export interface ValidationRule { type: 'maxLength' | 'minLength' | 'contains' | 'regex'; value: string | number; }

export function correct(output: string, schema?: { type: string; fields?: string[] }): CorrectionResult {
  let corrected = output;
  const changes: string[] = [];
  // Fix trailing commas in JSON
  const trailingComma = corrected.replace(/,\s*([}\]])/g, '$1');
  if (trailingComma !== corrected) { changes.push('Removed trailing commas'); corrected = trailingComma; }
  // Fix unclosed braces
  const opens = (corrected.match(/{/g) ?? []).length;
  const closes = (corrected.match(/}/g) ?? []).length;
  if (opens > closes) { corrected += '}'.repeat(opens - closes); changes.push(`Added ${opens - closes} closing brace(s)`); }
  const openBrackets = (corrected.match(/\[/g) ?? []).length;
  const closeBrackets = (corrected.match(/]/g) ?? []).length;
  if (openBrackets > closeBrackets) { corrected += ']'.repeat(openBrackets - closeBrackets); changes.push(`Added ${openBrackets - closeBrackets} closing bracket(s)`); }
  // Fix unquoted keys (simple heuristic)
  corrected = corrected.replace(/{\s*(\w+)\s*:/g, '{"$1":');
  if (corrected !== output && !changes.includes('Removed trailing commas')) changes.push('Fixed unquoted keys');
  return { corrected, corrections: changes.length, changes };
}

export function validate(output: string, rules: ValidationRule[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  for (const rule of rules) {
    if (rule.type === 'maxLength' && output.length > (rule.value as number)) errors.push(`Exceeds max length ${rule.value}`);
    if (rule.type === 'minLength' && output.length < (rule.value as number)) errors.push(`Below min length ${rule.value}`);
    if (rule.type === 'contains' && !output.includes(rule.value as string)) errors.push(`Missing required: ${rule.value}`);
    if (rule.type === 'regex' && !new RegExp(rule.value as string).test(output)) errors.push(`Doesn't match pattern: ${rule.value}`);
  }
  return { valid: errors.length === 0, errors };
}

export function correctOutput(output: string): CorrectionResult {
  return correct(output);
}
