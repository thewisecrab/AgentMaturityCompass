/**
 * Validate and repair LLM JSON output against a schema.
 */

export interface ValidateAndRepairResult {
  valid: boolean;
  repaired: boolean;
  output: unknown;
  issues: string[];
}

export function validateAndRepair(output: string, schema: Record<string, unknown>): ValidateAndRepairResult {
  const issues: string[] = [];
  let parsed: unknown;
  let repaired = false;

  // Try parse as-is
  try {
    parsed = JSON.parse(output);
  } catch (_e) {
    // Try to repair common issues
    let fixed = output.trim();
    // Remove markdown code fences
    fixed = fixed.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
    // Remove trailing commas before } or ]
    fixed = fixed.replace(/,\s*([}\]])/g, '$1');
    // Try again
    try {
      parsed = JSON.parse(fixed);
      repaired = true;
      issues.push('Repaired: removed code fences or trailing commas');
    } catch (_e2) {
      return { valid: false, repaired: false, output: null, issues: ['Failed to parse JSON'] };
    }
  }

  // Validate against schema (basic property type checking)
  const props = schema.properties as Record<string, { type?: string }> | undefined;
  const required = schema.required as string[] | undefined;

  if (props && typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
    const obj = parsed as Record<string, unknown>;

    if (required) {
      for (const key of required) {
        if (!(key in obj)) {
          issues.push(`Missing required field: ${key}`);
          // Attempt repair with defaults
          const propSchema = props[key];
          if (propSchema?.type === 'string') { obj[key] = ''; repaired = true; }
          else if (propSchema?.type === 'number') { obj[key] = 0; repaired = true; }
          else if (propSchema?.type === 'boolean') { obj[key] = false; repaired = true; }
          else if (propSchema?.type === 'array') { obj[key] = []; repaired = true; }
          else if (propSchema?.type === 'object') { obj[key] = {}; repaired = true; }
        }
      }
    }

    for (const [key, value] of Object.entries(obj)) {
      const propSchema = props[key];
      if (!propSchema) continue;
      if (propSchema.type && typeof value !== propSchema.type) {
        if (propSchema.type === 'number' && typeof value === 'string') {
          const num = Number(value);
          if (!isNaN(num)) { obj[key] = num; repaired = true; issues.push(`Coerced ${key} from string to number`); }
        } else if (propSchema.type === 'string' && typeof value === 'number') {
          obj[key] = String(value); repaired = true; issues.push(`Coerced ${key} from number to string`);
        }
      }
    }
    parsed = obj;
  }

  return { valid: issues.filter(i => i.startsWith('Missing')).length === 0 || repaired, repaired, output: parsed, issues };
}
