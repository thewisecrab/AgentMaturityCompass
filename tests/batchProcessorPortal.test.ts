/**
 * batchProcessorPortal.test.ts — Tests for BatchProcessor and PortalManager.
 * Uses in-memory SQLite via temporary db paths.
 */

import { describe, expect, test, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// Batch processor and portal use openProductDb() which caches a singleton.
// We need to reset the singleton between tests by using closeProductDb().
import { closeProductDb } from '../src/product/productDb.js';
import { BatchProcessor } from '../src/product/batchProcessor.js';
import { PortalManager } from '../src/product/portal.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'amc-test-'));
  // Set env for productDb path resolution
  process.env['AMC_PRODUCT_DB_PATH'] = join(tmpDir, 'test.db');
});

afterEach(() => {
  closeProductDb();
  delete process.env['AMC_PRODUCT_DB_PATH'];
  try { rmSync(tmpDir, { recursive: true }); } catch { /* ignore */ }
});

/* ── BatchProcessor ──────────────────────────────────────────────── */

describe('BatchProcessor', () => {
  test('createBatch creates batch with items', () => {
    const bp = new BatchProcessor();
    const batch = bp.createBatch('test-batch', ['a', 'b', 'c']);
    expect(batch.id).toBeDefined();
    expect(batch.name).toBe('test-batch');
    expect(batch.status).toBe('pending');
    expect(batch.totalItems).toBe(3);
  });

  test('startBatch transitions to running', () => {
    const bp = new BatchProcessor();
    const batch = bp.createBatch('batch1', [1, 2]);
    const started = bp.startBatch(batch.id);
    expect(started.status).toBe('running');
    expect(started.startedAt).toBeDefined();
  });

  test('claimItems marks items as processing', () => {
    const bp = new BatchProcessor();
    const batch = bp.createBatch('batch2', ['x', 'y', 'z']);
    bp.startBatch(batch.id);
    const items = bp.claimItems(batch.id, 'worker-1', 2);
    expect(items.length).toBe(2);
    items.forEach(item => {
      expect(item.status).toBe('processing');
      expect(item.claimedBy).toBe('worker-1');
    });
  });

  test('completeItem updates counters', () => {
    const bp = new BatchProcessor();
    const batch = bp.createBatch('batch3', ['item1']);
    bp.startBatch(batch.id);
    const items = bp.claimItems(batch.id, 'worker', 1);
    bp.completeItem(items[0]!.id, { result: 'done' });

    const progress = bp.getProgress(batch.id);
    expect(progress.completed).toBe(1);
    expect(progress.percentComplete).toBe(100);
  });

  test('failItem updates failed count', () => {
    const bp = new BatchProcessor();
    const batch = bp.createBatch('batch4', ['item1', 'item2']);
    bp.startBatch(batch.id);
    const items = bp.claimItems(batch.id, 'worker', 2);
    bp.failItem(items[0]!.id, 'some error');
    bp.completeItem(items[1]!.id, 'ok');

    const progress = bp.getProgress(batch.id);
    expect(progress.failed).toBe(1);
    expect(progress.completed).toBe(1);
  });

  test('pauseBatch and resumeBatch toggle status', () => {
    const bp = new BatchProcessor();
    const batch = bp.createBatch('batch5', [1]);
    bp.startBatch(batch.id);
    bp.pauseBatch(batch.id);
    expect(bp.getBatch(batch.id)!.status).toBe('paused');
    bp.resumeBatch(batch.id);
    expect(bp.getBatch(batch.id)!.status).toBe('running');
  });

  test('cancelBatch sets cancelled status', () => {
    const bp = new BatchProcessor();
    const batch = bp.createBatch('batch6', [1, 2, 3]);
    bp.startBatch(batch.id);
    bp.cancelBatch(batch.id);
    expect(bp.getBatch(batch.id)!.status).toBe('cancelled');
  });

  test('getResult aggregates completed items', () => {
    const bp = new BatchProcessor();
    const batch = bp.createBatch('batch7', ['a', 'b']);
    bp.startBatch(batch.id);
    const items = bp.claimItems(batch.id, 'w', 2);
    bp.completeItem(items[0]!.id, { val: 1 });
    bp.completeItem(items[1]!.id, { val: 2 });

    const result = bp.getResult(batch.id);
    expect(result.completedItems).toBe(2);
    expect(result.results.length).toBe(2);
  });

  test('getProgress with metadata', () => {
    const bp = new BatchProcessor();
    const batch = bp.createBatch('batch8', [1, 2, 3], { source: 'test' });
    expect(batch.metadata.source).toBe('test');
  });
});

/* ── PortalManager ───────────────────────────────────────────────── */

describe('PortalManager', () => {
  test('submitJob creates job', () => {
    const pm = new PortalManager();
    const job = pm.submitJob('test-job', 'analysis', 'user-1', { input: 'data' });
    expect(job.id).toBeDefined();
    expect(job.name).toBe('test-job');
    expect(job.status).toBe('submitted');
    expect(job.submittedBy).toBe('user-1');
  });

  test('job lifecycle: submit -> queue -> start -> complete', () => {
    const pm = new PortalManager();
    const job = pm.submitJob('lifecycle', 'test', 'u1');

    const queued = pm.queueJob(job.id);
    expect(queued.status).toBe('queued');

    const started = pm.startJob(job.id);
    expect(started.status).toBe('running');

    const completed = pm.completeJob(job.id, { answer: 42 });
    expect(completed.status).toBe('completed');
    expect(completed.result!.answer).toBe(42);
    expect(completed.progress).toBe(100);
  });

  test('invalid state transition throws', () => {
    const pm = new PortalManager();
    const job = pm.submitJob('bad-trans', 'test', 'u1');
    // Cannot go directly from submitted to running
    expect(() => pm.startJob(job.id)).toThrow('Cannot transition');
  });

  test('failJob records error', () => {
    const pm = new PortalManager();
    const job = pm.submitJob('fail-job', 'test', 'u1');
    pm.queueJob(job.id);
    pm.startJob(job.id);
    const failed = pm.failJob(job.id, 'Something went wrong');
    expect(failed.status).toBe('failed');
    expect(failed.error).toBe('Something went wrong');
  });

  test('cancelJob works from submitted', () => {
    const pm = new PortalManager();
    const job = pm.submitJob('cancel-test', 'test', 'u1');
    const cancelled = pm.cancelJob(job.id);
    expect(cancelled.status).toBe('cancelled');
  });

  test('updateProgress tracks progress events', () => {
    const pm = new PortalManager();
    const job = pm.submitJob('progress-test', 'analysis', 'u1');
    pm.queueJob(job.id);
    pm.startJob(job.id);
    pm.updateProgress(job.id, 25, 'Processing chunk 1/4');
    pm.updateProgress(job.id, 50, 'Processing chunk 2/4');

    const history = pm.getProgressHistory(job.id);
    expect(history.length).toBe(2);
    expect(history[0]!.progress).toBe(25);
    expect(history[1]!.message).toBe('Processing chunk 2/4');
  });

  test('addResultFile and getResultFiles', () => {
    const pm = new PortalManager();
    const job = pm.submitJob('file-test', 'report', 'u1');
    pm.queueJob(job.id);
    pm.startJob(job.id);

    pm.addResultFile(job.id, 'report.pdf', '/tmp/report.pdf', 'application/pdf', 12345);
    pm.addResultFile(job.id, 'data.csv', '/tmp/data.csv', 'text/csv', 5678);

    const files = pm.getResultFiles(job.id);
    expect(files.length).toBe(2);
    expect(files[0]!.filename).toBe('report.pdf');
    expect(files[1]!.sizeBytes).toBe(5678);
  });

  test('listJobs with filters', () => {
    const pm = new PortalManager();
    pm.submitJob('j1', 'analysis', 'u1');
    pm.submitJob('j2', 'report', 'u2');
    pm.submitJob('j3', 'analysis', 'u1');

    const all = pm.listJobs();
    expect(all.length).toBe(3);

    const byType = pm.listJobs({ type: 'analysis' });
    expect(byType.length).toBe(2);

    const byUser = pm.listJobs({ submittedBy: 'u2' });
    expect(byUser.length).toBe(1);
  });

  test('completed jobs cannot transition further', () => {
    const pm = new PortalManager();
    const job = pm.submitJob('done-job', 'test', 'u1');
    pm.queueJob(job.id);
    pm.startJob(job.id);
    pm.completeJob(job.id);
    expect(() => pm.cancelJob(job.id)).toThrow('Cannot transition');
  });
});
