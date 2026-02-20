/**
 * syncConnector.ts — Field mapping transforms, batch sync,
 * and mapping validation.
 */

import { randomUUID } from 'node:crypto';

export type TransformType = 'uppercase' | 'lowercase' | 'trim' | 'none' | 'date-iso' | 'number' | 'boolean' | 'json-parse' | 'custom';

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: TransformType;
  customTransform?: (value: unknown) => unknown;
  required?: boolean;
  defaultValue?: unknown;
}

export interface SyncRecord {
  id: string;
  source: string;
  target: string;
  mapping: FieldMapping[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  recordsTransferred: number;
  errors: string[];
  startedAt?: number;
  completedAt?: number;
}

export interface SyncResult {
  synced: boolean;
  recordCount: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/* ── Transform engine ────────────────────────────────────────────── */

function applyTransform(value: unknown, transform: TransformType, customFn?: (v: unknown) => unknown): unknown {
  if (value === null || value === undefined) return value;
  switch (transform) {
    case 'uppercase': return String(value).toUpperCase();
    case 'lowercase': return String(value).toLowerCase();
    case 'trim': return String(value).trim();
    case 'date-iso': return new Date(String(value)).toISOString();
    case 'number': return Number(value);
    case 'boolean': return Boolean(value);
    case 'json-parse': try { return JSON.parse(String(value)); } catch { return value; }
    case 'custom': return customFn ? customFn(value) : value;
    case 'none': default: return value;
  }
}

function mapRecord(record: Record<string, unknown>, mapping: FieldMapping[]): { result: Record<string, unknown>; errors: string[] } {
  const result: Record<string, unknown> = {};
  const errors: string[] = [];

  for (const m of mapping) {
    const sourceVal = record[m.sourceField];
    if (sourceVal === undefined) {
      if (m.required && m.defaultValue === undefined) {
        errors.push(`Missing required field: ${m.sourceField}`);
        continue;
      }
      result[m.targetField] = m.defaultValue ?? null;
    } else {
      result[m.targetField] = applyTransform(sourceVal, m.transform ?? 'none', m.customTransform);
    }
  }

  return { result, errors };
}

/* ── Validate mapping against sample data ────────────────────────── */

export function validateMapping(mapping: FieldMapping[], sampleData: Record<string, unknown>[]): ValidationResult {
  const errors: string[] = [];

  // Check for duplicate target fields
  const targets = mapping.map(m => m.targetField);
  const dupes = targets.filter((t, i) => targets.indexOf(t) !== i);
  if (dupes.length > 0) errors.push(`Duplicate target fields: ${[...new Set(dupes)].join(', ')}`);

  // Check required fields exist in sample
  if (sampleData.length > 0) {
    const sampleKeys = new Set(Object.keys(sampleData[0]!));
    for (const m of mapping) {
      if (m.required && !sampleKeys.has(m.sourceField) && m.defaultValue === undefined) {
        errors.push(`Required source field "${m.sourceField}" not found in sample data`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/* ── SyncManager ─────────────────────────────────────────────────── */

export class SyncManager {
  private syncs = new Map<string, SyncRecord>();

  createSync(source: string, target: string, mapping: FieldMapping[]): SyncRecord {
    const s: SyncRecord = {
      id: randomUUID(), source, target, mapping,
      status: 'pending', recordsTransferred: 0, errors: [],
    };
    this.syncs.set(s.id, s);
    return s;
  }

  runSync(syncId: string, data?: Record<string, unknown>[]): SyncRecord {
    const s = this.syncs.get(syncId);
    if (!s) throw new Error('Sync not found');
    s.status = 'running';
    s.startedAt = Date.now();
    s.errors = [];

    if (data) {
      let transferred = 0;
      for (const record of data) {
        const { errors } = mapRecord(record, s.mapping);
        if (errors.length > 0) {
          s.errors.push(...errors);
        } else {
          transferred++;
        }
      }
      s.recordsTransferred = transferred;
      s.status = s.errors.length > 0 && transferred === 0 ? 'failed' : 'completed';
    } else {
      s.recordsTransferred = 0;
      s.status = 'completed';
    }

    s.completedAt = Date.now();
    return s;
  }

  /** Run batch sync on array of records */
  batchSync(syncId: string, data: Record<string, unknown>[]): { records: Record<string, unknown>[]; errors: string[] } {
    const s = this.syncs.get(syncId);
    if (!s) throw new Error('Sync not found');

    const results: Record<string, unknown>[] = [];
    const allErrors: string[] = [];

    for (const record of data) {
      const { result, errors } = mapRecord(record, s.mapping);
      results.push(result);
      allErrors.push(...errors);
    }

    return { records: results, errors: allErrors };
  }

  getSyncStatus(syncId: string): SyncRecord | undefined { return this.syncs.get(syncId); }
  listSyncs(): SyncRecord[] { return [...this.syncs.values()]; }
}

/* ── Legacy compat ───────────────────────────────────────────────── */

export function syncData(_source: string, _dest: string): SyncResult {
  return { synced: true, recordCount: 0 };
}
