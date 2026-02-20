/**
 * dataPipelineBot.ts — ETL orchestrator that accepts data + transforms
 * and runs a pipeline with validation and error handling.
 */

import { AMCAgentBase } from './agentBase.js';

export type TransformType = 'filter' | 'map' | 'reduce' | 'sort' | 'dedupe' | 'validate' | 'enrich';

export interface PipelineTransform {
  type: TransformType;
  name: string;
  config: Record<string, unknown>;
}

export interface PipelineResult {
  success: boolean;
  inputCount: number;
  outputCount: number;
  droppedCount: number;
  errors: string[];
  durationMs: number;
  data: unknown[];
  transformsApplied: string[];
}

/* ── Transform implementations ───────────────────────────────────── */

function applyTransform(data: unknown[], transform: PipelineTransform): { data: unknown[]; errors: string[] } {
  const errors: string[] = [];
  try {
    switch (transform.type) {
      case 'filter': {
        const field = transform.config.field as string;
        const value = transform.config.value;
        const op = (transform.config.op as string) ?? 'eq';
        return {
          data: data.filter(item => {
            const v = (item as Record<string, unknown>)[field];
            if (op === 'eq') return v === value;
            if (op === 'neq') return v !== value;
            if (op === 'gt') return (v as number) > (value as number);
            if (op === 'lt') return (v as number) < (value as number);
            if (op === 'contains') return String(v).includes(String(value));
            return true;
          }),
          errors,
        };
      }
      case 'map': {
        const fn = transform.config.expression as string;
        return {
          data: data.map(item => {
            const obj = item as Record<string, unknown>;
            if (fn === 'uppercase' && transform.config.field) {
              const f = transform.config.field as string;
              return { ...obj, [f]: String(obj[f] ?? '').toUpperCase() };
            }
            if (fn === 'lowercase' && transform.config.field) {
              const f = transform.config.field as string;
              return { ...obj, [f]: String(obj[f] ?? '').toLowerCase() };
            }
            return obj;
          }),
          errors,
        };
      }
      case 'sort': {
        const field = transform.config.field as string;
        const order = (transform.config.order as string) ?? 'asc';
        const sorted = [...data].sort((a, b) => {
          const va = (a as Record<string, unknown>)[field];
          const vb = (b as Record<string, unknown>)[field];
          const cmp = va! < vb! ? -1 : va! > vb! ? 1 : 0;
          return order === 'desc' ? -cmp : cmp;
        });
        return { data: sorted, errors };
      }
      case 'dedupe': {
        const field = transform.config.field as string;
        const seen = new Set<unknown>();
        return {
          data: data.filter(item => {
            const v = field ? (item as Record<string, unknown>)[field] : JSON.stringify(item);
            if (seen.has(v)) return false;
            seen.add(v);
            return true;
          }),
          errors,
        };
      }
      case 'validate': {
        const requiredFields = (transform.config.requiredFields as string[]) ?? [];
        return {
          data: data.filter(item => {
            const obj = item as Record<string, unknown>;
            const missing = requiredFields.filter(f => obj[f] === undefined || obj[f] === null);
            if (missing.length > 0) {
              errors.push(`Validation failed: missing fields ${missing.join(', ')}`);
              return false;
            }
            return true;
          }),
          errors,
        };
      }
      case 'enrich': {
        const field = transform.config.field as string;
        const value = transform.config.value;
        return {
          data: data.map(item => ({ ...(item as Record<string, unknown>), [field]: value })),
          errors,
        };
      }
      default:
        return { data, errors: [`Unknown transform type: ${transform.type}`] };
    }
  } catch (err) {
    return { data, errors: [`Transform "${transform.name}" error: ${err instanceof Error ? err.message : String(err)}`] };
  }
}

/* ── String transform parser ────────────────────────────────────── */

/**
 * Parse shorthand transform strings like "filter:age>28", "sort:name", "dedupe:email".
 * Format: "type:field" or "type:fieldOPvalue"
 */
function parseTransformString(str: string): PipelineTransform {
  const colonIdx = str.indexOf(':');
  if (colonIdx === -1) {
    return { type: str as TransformType, name: str, config: {} };
  }

  const type = str.slice(0, colonIdx).trim() as TransformType;
  const rest = str.slice(colonIdx + 1).trim();

  // Try "field>value", "field<value", "field=value"
  const opMatch = rest.match(/^(\w+)\s*([><=!]+)\s*(.+)$/);
  if (opMatch) {
    const [, field, opStr, valueStr] = opMatch;
    const op = opStr === '>' ? 'gt' : opStr === '<' ? 'lt' : opStr === '!=' ? 'neq' : 'eq';
    const numVal = Number(valueStr);
    const value = isNaN(numVal) ? valueStr : numVal;
    return { type, name: `${type}:${rest}`, config: { field, op, value } };
  }

  // Simple "field" — for sort, dedupe, etc.
  return { type, name: `${type}:${rest}`, config: { field: rest } };
}

/* ── Agent class ─────────────────────────────────────────────────── */

export class DataPipelineBot extends AMCAgentBase {
  constructor() {
    super({ name: 'DataPipelineBot', type: 'data-pipeline' });
  }

  async run(input: unknown): Promise<PipelineResult> {
    const raw = input as { data: unknown[]; transforms: unknown[] };
    const transforms = (raw.transforms ?? []).map(t => {
      if (typeof t === 'string') return parseTransformString(t);
      return t as PipelineTransform;
    });
    return this.runPipeline(raw.data, transforms);
  }

  async runPipeline(data: unknown[], transforms: PipelineTransform[]): Promise<PipelineResult> {
    const start = Date.now();
    const inputCount = data.length;
    let current = [...data];
    const allErrors: string[] = [];
    const applied: string[] = [];

    for (const transform of transforms) {
      const decision = await this.executeAction(`transform:${transform.name}`, async () => {
        const result = applyTransform(current, transform);
        current = result.data;
        allErrors.push(...result.errors);
        applied.push(transform.name);
      });

      if (decision.blocked) {
        allErrors.push(`Transform "${transform.name}" was blocked: ${decision.blockReason}`);
        break;
      }
    }

    return {
      success: allErrors.length === 0,
      inputCount,
      outputCount: current.length,
      droppedCount: inputCount - current.length,
      errors: allErrors,
      durationMs: Date.now() - start,
      data: current,
      transformsApplied: applied,
    };
  }
}
