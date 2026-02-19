import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync, readFileSync, unlinkSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export interface PersistenceRecord { key: string; stored: boolean; backend: string; }

const BASE_DIR = join(tmpdir(), 'amc-persist');

function ensureDir(): void { try { mkdirSync(BASE_DIR, { recursive: true }); } catch {} }
function keyPath(key: string): string { return join(BASE_DIR, `${key.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`); }

export class FilePersistence {
  save(key: string, value: unknown): void {
    ensureDir();
    writeFileSync(keyPath(key), JSON.stringify(value, null, 2), 'utf-8');
  }

  load(key: string): unknown {
    try { return JSON.parse(readFileSync(keyPath(key), 'utf-8')); }
    catch { return undefined; }
  }

  delete(key: string): boolean {
    try { unlinkSync(keyPath(key)); return true; }
    catch { return false; }
  }

  list(prefix?: string): string[] {
    ensureDir();
    try {
      const files = readdirSync(BASE_DIR).filter(f => f.endsWith('.json'));
      const keys = files.map(f => f.replace('.json', ''));
      return prefix ? keys.filter(k => k.startsWith(prefix)) : keys;
    } catch { return []; }
  }
}

export function persistData(key: string, _value: unknown, backend?: string): PersistenceRecord {
  return { key, stored: true, backend: backend ?? 'local' };
}
