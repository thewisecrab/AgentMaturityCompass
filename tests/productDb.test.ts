/**
 * productDb.test.ts — Tests for the shared product SQLite database.
 */

import { describe, expect, test, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { openProductDb, closeProductDb } from '../src/product/productDb.js';

let tmpDir: string;

afterEach(() => {
  closeProductDb();
  delete process.env['AMC_PRODUCT_DB_PATH'];
  if (tmpDir) {
    try { rmSync(tmpDir, { recursive: true }); } catch { /* ignore */ }
  }
});

describe('productDb', () => {
  test('creates database at explicit path', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'amc-db-'));
    const dbPath = join(tmpDir, 'test.db');
    const db = openProductDb(dbPath);
    expect(db).toBeDefined();
    expect(existsSync(dbPath)).toBe(true);
    closeProductDb();
  });

  test('returns singleton on second call', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'amc-db-'));
    const dbPath = join(tmpDir, 'test.db');
    const db1 = openProductDb(dbPath);
    const db2 = openProductDb(dbPath);
    expect(db1).toBe(db2); // Same reference
    closeProductDb();
  });

  test('uses AMC_PRODUCT_DB_PATH env variable', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'amc-db-'));
    const dbPath = join(tmpDir, 'env.db');
    process.env['AMC_PRODUCT_DB_PATH'] = dbPath;
    const db = openProductDb();
    expect(db).toBeDefined();
    expect(existsSync(dbPath)).toBe(true);
    closeProductDb();
  });

  test('database supports WAL mode', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'amc-db-'));
    const dbPath = join(tmpDir, 'wal.db');
    const db = openProductDb(dbPath);
    const result = db.pragma('journal_mode') as Array<{ journal_mode: string }>;
    expect(result[0]!.journal_mode).toBe('wal');
    closeProductDb();
  });

  test('database has foreign keys enabled', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'amc-db-'));
    const dbPath = join(tmpDir, 'fk.db');
    const db = openProductDb(dbPath);
    const result = db.pragma('foreign_keys') as Array<{ foreign_keys: number }>;
    expect(result[0]!.foreign_keys).toBe(1);
    closeProductDb();
  });

  test('closeProductDb is safe to call multiple times', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'amc-db-'));
    const dbPath = join(tmpDir, 'close.db');
    openProductDb(dbPath);
    closeProductDb();
    closeProductDb(); // Should not throw
    closeProductDb(); // Should not throw
  });

  test('can create tables after opening', () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'amc-db-'));
    const dbPath = join(tmpDir, 'tables.db');
    const db = openProductDb(dbPath);
    db.exec('CREATE TABLE IF NOT EXISTS test_table (id TEXT PRIMARY KEY, value TEXT)');
    db.prepare('INSERT INTO test_table (id, value) VALUES (?, ?)').run('k1', 'v1');
    const row = db.prepare('SELECT * FROM test_table WHERE id = ?').get('k1') as Record<string, unknown>;
    expect(row.value).toBe('v1');
    closeProductDb();
  });
});
