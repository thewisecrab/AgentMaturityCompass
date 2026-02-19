import { emitGuardEvent } from './evidenceEmitter.js';

export interface FieldSchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  enum?: unknown[];
  min?: number;
  max?: number;
  pattern?: string;
  properties?: Record<string, FieldSchema>;
  items?: FieldSchema;
}

export interface SchemaDefinition {
  type?: string;
  required?: string[];
  properties?: Record<string, FieldSchema>;
  additionalProperties?: boolean;
}

export interface SchemaValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  coercionAttempts: string[];
  repaired?: unknown;
}

function validateField(value: unknown, schema: FieldSchema, path: string): { errors: string[]; warnings: string[]; coercions: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const coercions: string[] = [];

  if (value === undefined || value === null) {
    if (schema.required) errors.push(`${path}: required field missing`);
    return { errors, warnings, coercions };
  }

  const actualType = Array.isArray(value) ? 'array' : typeof value;
  if (actualType !== schema.type) {
    if (schema.type === 'number' && typeof value === 'string' && !isNaN(Number(value))) {
      coercions.push(`${path}: string "${value}" could be coerced to number`);
    } else if (schema.type === 'boolean' && typeof value === 'string' && ['true','false','0','1'].includes(value)) {
      coercions.push(`${path}: string "${value}" could be coerced to boolean`);
    } else {
      errors.push(`${path}: expected ${schema.type}, got ${actualType}`);
    }
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${path}: value not in enum [${schema.enum.join(', ')}]`);
  }

  if (schema.min !== undefined && typeof value === 'number' && value < schema.min) {
    errors.push(`${path}: ${value} < min ${schema.min}`);
  }
  if (schema.max !== undefined && typeof value === 'number' && value > schema.max) {
    errors.push(`${path}: ${value} > max ${schema.max}`);
  }

  if (schema.min !== undefined && typeof value === 'string' && value.length < schema.min) {
    errors.push(`${path}: string length ${value.length} < min ${schema.min}`);
  }
  if (schema.max !== undefined && typeof value === 'string' && value.length > schema.max) {
    errors.push(`${path}: string length ${value.length} > max ${schema.max}`);
  }

  if (schema.pattern && typeof value === 'string') {
    if (!new RegExp(schema.pattern).test(value)) {
      errors.push(`${path}: does not match pattern ${schema.pattern}`);
    }
  }

  if (schema.properties && typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    for (const [k, fieldSchema] of Object.entries(schema.properties)) {
      const r = validateField(obj[k], fieldSchema, `${path}.${k}`);
      errors.push(...r.errors); warnings.push(...r.warnings); coercions.push(...r.coercions);
    }
  }

  return { errors, warnings, coercions };
}

export function validateSchema(data: unknown, schema: SchemaDefinition): SchemaValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const coercionAttempts: string[] = [];

  if (schema.type === 'object' && (typeof data !== 'object' || data === null || Array.isArray(data))) {
    errors.push('Expected object at root');
    return { valid: false, errors, warnings, coercionAttempts };
  }

  if (schema.required && typeof data === 'object' && data !== null) {
    for (const field of schema.required) {
      if (!(field in (data as Record<string, unknown>))) errors.push(`Missing required field: ${field}`);
    }
  }

  if (schema.properties && typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    for (const [k, fieldSchema] of Object.entries(schema.properties)) {
      const r = validateField(obj[k], fieldSchema, k);
      errors.push(...r.errors); warnings.push(...r.warnings); coercionAttempts.push(...r.coercions);
    }

    if (schema.additionalProperties === false) {
      for (const k of Object.keys(obj)) {
        if (!schema.properties[k]) {
          const dangerous = ['__proto__', 'constructor', 'prototype'];
          if (dangerous.includes(k)) errors.push(`Dangerous field detected: ${k}`);
          else warnings.push(`Unexpected field: ${k}`);
        }
      }
    }
  }

  const result = { valid: errors.length === 0, errors, warnings, coercionAttempts };
  emitGuardEvent({
    agentId: 'system', moduleCode: 'E6',
    decision: result.valid ? 'allow' : 'deny',
    reason: result.valid ? 'Schema valid' : `Schema errors: ${errors.join('; ')}`,
    severity: result.valid ? 'low' : 'medium',
    meta: { errorCount: errors.length, warningCount: warnings.length },
  });
  return result;
}
