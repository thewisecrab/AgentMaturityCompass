import { randomUUID } from 'node:crypto';

export interface FieldDef { name: string; type: 'string' | 'number' | 'boolean' | 'date'; required?: boolean; }
export interface StructuredOutput { format: string; data: unknown; valid: boolean; }

export function extract(text: string, schema: { fields: FieldDef[] }): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const field of schema.fields) {
    const pattern = new RegExp(`${field.name}[:\\s]+([^\\n,;]+)`, 'i');
    const match = text.match(pattern);
    if (match) result[field.name] = coerce(match[1]!.trim(), field.type);
    else if (field.required) result[field.name] = null;
  }
  return result;
}

export function validate(output: unknown, schema: { fields: FieldDef[] }): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (typeof output !== 'object' || !output) { errors.push('Output is not an object'); return { valid: false, errors }; }
  const obj = output as Record<string, unknown>;
  for (const field of schema.fields) {
    if (field.required && !(field.name in obj)) errors.push(`Missing required field: ${field.name}`);
    if (field.name in obj && obj[field.name] != null) {
      const actual = typeof obj[field.name];
      if (field.type === 'number' && actual !== 'number') errors.push(`${field.name}: expected number, got ${actual}`);
      if (field.type === 'boolean' && actual !== 'boolean') errors.push(`${field.name}: expected boolean, got ${actual}`);
      if (field.type === 'string' && actual !== 'string') errors.push(`${field.name}: expected string, got ${actual}`);
    }
  }
  return { valid: errors.length === 0, errors };
}

export function coerce(value: unknown, targetType: 'string' | 'number' | 'boolean' | 'date'): unknown {
  const str = String(value).trim();
  if (targetType === 'number') return Number(str) || 0;
  if (targetType === 'boolean') return str === 'true' || str === '1' || str === 'yes';
  if (targetType === 'date') return new Date(str).toISOString();
  return str;
}

export function formatStructuredOutput(data: unknown, format: string): StructuredOutput {
  return { format, data, valid: true };
}
