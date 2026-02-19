import { randomUUID } from 'node:crypto';

export interface ParamSchema { name: string; type: string; required?: boolean; aliases?: string[]; }
export interface AutofillResult { filled: Record<string, unknown>; missing: string[]; confidence: number; }
export interface AutofilledParams { filled: Record<string, unknown>; missing: string[]; }

function similarity(a: string, b: string): number {
  const al = a.toLowerCase(), bl = b.toLowerCase();
  if (al === bl) return 1;
  if (al.includes(bl) || bl.includes(al)) return 0.8;
  // Simple character overlap
  const setA = new Set(al.split(''));
  const setB = new Set(bl.split(''));
  const intersection = [...setA].filter(c => setB.has(c)).length;
  return intersection / Math.max(setA.size, setB.size);
}

export function autofill(schema: ParamSchema[], context: Record<string, unknown>): AutofillResult {
  const filled: Record<string, unknown> = {};
  const missing: string[] = [];
  let totalConf = 0, matched = 0;
  for (const param of schema) {
    // Direct match
    if (param.name in context) { filled[param.name] = context[param.name]; totalConf += 1; matched++; continue; }
    // Alias match
    const aliasMatch = (param.aliases ?? []).find(a => a in context);
    if (aliasMatch) { filled[param.name] = context[aliasMatch]; totalConf += 0.9; matched++; continue; }
    // Fuzzy match
    let bestKey = '', bestScore = 0;
    for (const key of Object.keys(context)) {
      const score = similarity(param.name, key);
      if (score > bestScore && score > 0.6) { bestScore = score; bestKey = key; }
    }
    if (bestKey) { filled[param.name] = context[bestKey]; totalConf += bestScore; matched++; }
    else if (param.required) missing.push(param.name);
  }
  return { filled, missing, confidence: matched > 0 ? totalConf / matched : 0 };
}

export function autofillParams(required: string[], available: Record<string, unknown>): AutofilledParams {
  const missing = required.filter(r => !(r in available));
  return { filled: available, missing };
}
