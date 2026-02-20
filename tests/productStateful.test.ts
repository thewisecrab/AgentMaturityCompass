/**
 * productStateful.test.ts — Tests for all 10 Tier B (stateful) product modules.
 */

import { describe, expect, test, beforeEach } from 'vitest';

// Compensation
import { CompensationLog, CompensationSaga } from '../src/product/compensation.js';

// Improvement
import { suggestImprovement, applyImprovement, recordAfter, setThresholds, getThresholds } from '../src/product/improvement.js';

// ToolFallback
import { withFallback, recordSuccess, recordFailure, executeWithFallback, exportChains, importChains } from '../src/product/toolFallback.js';

// AsyncCallback
import { CallbackRegistry, registerAsyncCallback } from '../src/product/asyncCallback.js';

// ToolCostEstimator
import { estimateCost, estimateBatchCost, compareModelCosts, getModelPricing, listModels, registerModelPricing } from '../src/product/toolCostEstimator.js';

// Escalation
import { EscalationManager, escalateIssue } from '../src/product/escalation.js';

// SyncConnector
import { SyncManager, validateMapping, syncData } from '../src/product/syncConnector.js';

// WhiteLabel
import { WhiteLabelManager, renderTemplate, createWhiteLabel } from '../src/product/whiteLabel.js';

// FixGenerator
import { generateFix, generateFixPlan } from '../src/product/fixGenerator.js';

// PersonalizedOutput
import { getProfile, updateProfile, deleteProfile, applyStyle, applyStyleWithProfile, getPreferenceHistory } from '../src/product/personalizedOutput.js';

/* ── CompensationLog ─────────────────────────────────────────────── */

describe('CompensationLog', () => {
  test('record and compensate', () => {
    const log = new CompensationLog();
    let reversed = false;
    log.recordAction('a1', 'create-user', () => { reversed = true; });
    log.compensate('a1');
    expect(reversed).toBe(true);
    expect(log.getLog()[0]!.outcome).toBe('success');
  });

  test('double compensation throws', () => {
    const log = new CompensationLog();
    log.recordAction('a1', 'create-user', () => {});
    log.compensate('a1');
    expect(() => log.compensate('a1')).toThrow('Already compensated');
  });

  test('compensation failure is tracked', () => {
    const log = new CompensationLog();
    log.recordAction('a1', 'bad', () => { throw new Error('rollback failed'); });
    expect(() => log.compensate('a1')).toThrow('rollback failed');
    expect(log.getLog()[0]!.outcome).toBe('failed');
  });
});

/* ── CompensationSaga ────────────────────────────────────────────── */

describe('CompensationSaga', () => {
  test('successful saga completes all steps', async () => {
    const saga = new CompensationSaga();
    const order: string[] = [];
    saga.addStep({ name: 'step1', execute: () => { order.push('e1'); }, compensate: () => {} });
    saga.addStep({ name: 'step2', execute: () => { order.push('e2'); }, compensate: () => {} });
    const result = await saga.run();
    expect(result.status).toBe('completed');
    expect(result.stepsExecuted).toBe(2);
    expect(order).toEqual(['e1', 'e2']);
  });

  test('failed step triggers LIFO compensation', async () => {
    const saga = new CompensationSaga();
    const order: string[] = [];
    saga.addStep({ name: 's1', execute: () => { order.push('e1'); }, compensate: () => { order.push('c1'); } });
    saga.addStep({ name: 's2', execute: () => { order.push('e2'); }, compensate: () => { order.push('c2'); } });
    saga.addStep({ name: 's3', execute: () => { throw new Error('fail'); }, compensate: () => {} });
    const result = await saga.run();
    expect(result.status).toBe('compensated');
    // LIFO: c2 before c1
    expect(order).toEqual(['e1', 'e2', 'c2', 'c1']);
  });
});

/* ── Improvement ─────────────────────────────────────────────────── */

describe('Improvement', () => {
  test('suggests improvements for high error rate', () => {
    const suggestions = suggestImprovement({ errorRate: 0.5, latencyMs: 500 });
    expect(Array.isArray(suggestions)).toBe(true);
    const arr = suggestions as any[];
    expect(arr.some(s => s.area === 'reliability')).toBe(true);
  });

  test('suggests no improvement when within thresholds', () => {
    const suggestions = suggestImprovement({ errorRate: 0.01, latencyMs: 100, throughput: 100, costPerCall: 0.01 });
    expect(Array.isArray(suggestions)).toBe(true);
    const arr = suggestions as any[];
    expect(arr[0].area).toBe('general');
  });

  test('apply and recordAfter tracks impact', () => {
    const suggestions = suggestImprovement({ errorRate: 0.5 }) as any[];
    const id = applyImprovement('agent-1', suggestions[0], { errorRate: 0.5 });
    const record = recordAfter(id, { errorRate: 0.1 });
    expect(record).toBeDefined();
    expect(record!.improvement).toBeDefined();
    expect(record!.improvement!).toBeGreaterThan(0);
  });

  test('setThresholds and getThresholds work', () => {
    setThresholds('api-calls', { maxLatencyMs: 500 });
    const t = getThresholds('api-calls');
    expect(t.maxLatencyMs).toBe(500);
    const defaults = getThresholds();
    expect(defaults.maxLatencyMs).toBe(1000);
  });
});

/* ── ToolFallback ────────────────────────────────────────────────── */

describe('ToolFallback', () => {
  test('withFallback creates chain with health scores', () => {
    const chain = withFallback('gpt4', ['claude', 'gemini']);
    expect(chain.primary).toBe('gpt4');
    expect(chain.fallbacks).toEqual(['claude', 'gemini']);
    expect(chain.healthScores.get('gpt4')).toBe(1.0);
  });

  test('recordFailure decreases health', () => {
    const chain = withFallback('tool-a', ['tool-b']);
    recordFailure('tool-a', 'error');
    expect(chain.healthScores.get('tool-a')!).toBeLessThan(1.0);
  });

  test('recordSuccess increases health', () => {
    const chain = withFallback('tool-x', ['tool-y']);
    recordFailure('tool-x', 'err');
    const lowHealth = chain.healthScores.get('tool-x')!;
    recordSuccess('tool-x');
    expect(chain.healthScores.get('tool-x')!).toBeGreaterThan(lowHealth);
  });

  test('executeWithFallback tries alternatives', async () => {
    withFallback('primary-z', ['fallback-z']);
    const { result, fallbackResult } = await executeWithFallback('primary-z', async (toolId) => {
      if (toolId === 'primary-z') throw new Error('fail');
      return 'ok';
    });
    expect(result).toBe('ok');
    expect(fallbackResult.fallbackUsed).toBe(true);
    expect(fallbackResult.tool).toBe('fallback-z');
  });

  test('export and import chains', () => {
    withFallback('exp-primary', ['exp-fallback']);
    const exported = exportChains();
    expect(exported.length).toBeGreaterThan(0);
    const count = importChains(exported);
    expect(count).toBeGreaterThan(0);
  });
});

/* ── AsyncCallback ───────────────────────────────────────────────── */

describe('AsyncCallback', () => {
  test('register and trigger in-process callback', () => {
    const registry = new CallbackRegistry();
    let received: unknown = null;
    registry.registerCallback('test-event', (payload) => { received = payload; });
    const count = registry.triggerEvent('test-event', { data: 42 });
    expect(count).toBe(1);
    expect(received).toEqual({ data: 42 });
  });

  test('filter callback skips non-matching events', () => {
    const registry = new CallbackRegistry();
    let called = false;
    registry.registerCallback('evt', () => { called = true; }, (p) => (p as any).important === true);
    registry.triggerEvent('evt', { important: false });
    expect(called).toBe(false);
    registry.triggerEvent('evt', { important: true });
    expect(called).toBe(true);
  });

  test('deregister callback', () => {
    const registry = new CallbackRegistry();
    const id = registry.registerCallback('evt', () => {});
    expect(registry.listCallbacks().length).toBe(1);
    registry.deregisterCallback(id);
    expect(registry.listCallbacks().length).toBe(0);
  });

  test('legacy registerAsyncCallback works', () => {
    const result = registerAsyncCallback('https://example.com/webhook');
    expect(result.registered).toBe(true);
    expect(result.url).toBe('https://example.com/webhook');
  });
});

/* ── ToolCostEstimator ───────────────────────────────────────────── */

describe('ToolCostEstimator', () => {
  test('estimateCost returns valid estimate', () => {
    const est = estimateCost('web_search', { query: 'hello' });
    expect(est.toolName).toBe('web_search');
    expect(est.estimatedTokens).toBeGreaterThan(0);
    expect(est.estimatedCost).toBeGreaterThan(0);
    expect(est.currency).toBe('USD');
  });

  test('model-specific pricing works', () => {
    const est = estimateCost('any_tool', { data: 'test' }, 'gpt-4o');
    expect(est.model).toBe('gpt-4o');
    expect(est.estimatedCost).toBeGreaterThan(0);
  });

  test('estimateBatchCost aggregates', () => {
    const batch = estimateBatchCost([
      { toolName: 'web_search', args: { q: 'a' } },
      { toolName: 'code_interpreter', args: { code: 'print(1)' } },
    ]);
    expect(batch.breakdown.length).toBe(2);
    expect(batch.totalCost).toBeGreaterThan(0);
    expect(batch.totalTokens).toBeGreaterThan(0);
  });

  test('budget tracking works', () => {
    const batch = estimateBatchCost(
      [{ toolName: 'web_search', args: { q: 'test' } }],
      undefined,
      1.0,
    );
    expect(batch.budgetRemaining).toBeDefined();
    expect(batch.budgetRemaining!).toBeLessThan(1.0);
  });

  test('compareModelCosts compares across models', () => {
    const result = compareModelCosts(
      [{ toolName: 'test', args: { data: 'hello world' } }],
      ['gpt-4o', 'claude-3-haiku'],
    );
    expect(result['gpt-4o']).toBeDefined();
    expect(result['claude-3-haiku']).toBeDefined();
    expect(result['gpt-4o']!.totalCost).toBeGreaterThan(0);
  });

  test('listModels returns known models', () => {
    const models = listModels();
    expect(models).toContain('gpt-4o');
    expect(models).toContain('claude-3.5-sonnet');
  });

  test('getModelPricing returns pricing', () => {
    const pricing = getModelPricing('gpt-4o');
    expect(pricing).toBeDefined();
    expect(pricing!.contextWindow).toBe(128000);
  });
});

/* ── Escalation ──────────────────────────────────────────────────── */

describe('EscalationManager', () => {
  test('escalate creates record', () => {
    const mgr = new EscalationManager();
    const record = mgr.escalate('System down', 5);
    expect(record.issue).toBe('System down');
    expect(record.severity).toBe(5);
    expect(record.status).toBe('open');
  });

  test('auto-routing assigns by rule', () => {
    const mgr = new EscalationManager();
    mgr.addRule(/security/i, 5, 'security-team', 'Security issues');
    const record = mgr.escalate('Security breach detected', 3);
    expect(record.status).toBe('routed');
    expect(record.assignedTo).toBe('security-team');
    expect(record.routedBy).toBe('auto-rule');
  });

  test('resolve marks record', () => {
    const mgr = new EscalationManager();
    const record = mgr.escalate('Bug report', 2);
    const resolved = mgr.resolve(record.id, 'Fixed in v2.1');
    expect(resolved!.status).toBe('resolved');
    expect(resolved!.resolution).toBe('Fixed in v2.1');
  });

  test('stats works', () => {
    const mgr = new EscalationManager();
    mgr.escalate('Issue 1', 1);
    mgr.escalate('Issue 2', 3);
    const r = mgr.escalate('Issue 3', 2);
    mgr.resolve(r.id, 'done');
    const stats = mgr.stats();
    expect(stats.total).toBe(3);
    expect(stats.resolved).toBe(1);
  });

  test('legacy escalateIssue works', () => {
    const result = escalateIssue('Legacy issue', 2);
    expect(result.escalationId).toBeDefined();
    expect(result.level).toBe(2);
  });
});

/* ── SyncConnector ───────────────────────────────────────────────── */

describe('SyncConnector', () => {
  test('createSync and runSync with data', () => {
    const mgr = new SyncManager();
    const sync = mgr.createSync('source-db', 'target-db', [
      { sourceField: 'name', targetField: 'full_name', transform: 'uppercase' },
      { sourceField: 'email', targetField: 'email_address', transform: 'lowercase' },
    ]);
    const result = mgr.runSync(sync.id, [
      { name: 'John Doe', email: 'JOHN@EXAMPLE.COM' },
      { name: 'Jane', email: 'JANE@TEST.COM' },
    ]);
    expect(result.status).toBe('completed');
    expect(result.recordsTransferred).toBe(2);
  });

  test('batchSync maps records', () => {
    const mgr = new SyncManager();
    const sync = mgr.createSync('a', 'b', [
      { sourceField: 'x', targetField: 'y', transform: 'trim' },
    ]);
    const { records, errors } = mgr.batchSync(sync.id, [
      { x: '  hello  ' },
      { x: '  world  ' },
    ]);
    expect(records.length).toBe(2);
    expect(records[0]!.y).toBe('hello');
  });

  test('validateMapping detects duplicate targets', () => {
    const result = validateMapping(
      [
        { sourceField: 'a', targetField: 'x' },
        { sourceField: 'b', targetField: 'x' },
      ],
      [{ a: 1, b: 2 }],
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Duplicate'))).toBe(true);
  });

  test('required field missing fails validation', () => {
    const result = validateMapping(
      [{ sourceField: 'missing', targetField: 'out', required: true }],
      [{ name: 'test' }],
    );
    expect(result.valid).toBe(false);
  });

  test('legacy syncData works', () => {
    const result = syncData('src', 'dest');
    expect(result.synced).toBe(true);
  });
});

/* ── WhiteLabel ──────────────────────────────────────────────────── */

describe('WhiteLabelManager', () => {
  test('create and apply branding', () => {
    const mgr = new WhiteLabelManager();
    const b = mgr.createBranding({ brand: 'Acme' });
    mgr.applyBranding('agent-1', b.id);
    const retrieved = mgr.getBranding('agent-1');
    expect(retrieved).toBeDefined();
    expect(retrieved!.config.brand).toBe('Acme');
  });

  test('template rendering substitutes variables', () => {
    const result = renderTemplate('Welcome to {{brand}}! Your theme is {{theme}}.', { brand: 'Acme', theme: 'dark' });
    expect(result).toBe('Welcome to Acme! Your theme is dark.');
  });

  test('tenant feature gates work', () => {
    const mgr = new WhiteLabelManager();
    const b = mgr.createBranding({ brand: 'TenantCo' });
    mgr.createTenant('t1', b.id, { darkMode: true, beta: false });
    mgr.setFeatureDefault('analytics', true);
    expect(mgr.isFeatureEnabled('t1', 'darkMode')).toBe(true);
    expect(mgr.isFeatureEnabled('t1', 'beta')).toBe(false);
    expect(mgr.isFeatureEnabled('t1', 'analytics')).toBe(true);
    expect(mgr.isFeatureEnabled('t1', 'unknown')).toBe(false);
  });

  test('renderForTenant includes brand', () => {
    const mgr = new WhiteLabelManager();
    const b = mgr.createBranding({ brand: 'TestBrand', colors: { primary: '#ff0000' } });
    mgr.createTenant('t2', b.id);
    const result = mgr.renderForTenant('t2', 'Welcome to {{brand}}!');
    expect(result).toBe('Welcome to TestBrand!');
  });

  test('legacy createWhiteLabel works', () => {
    const wl = createWhiteLabel('Brand', { primary: 'blue' });
    expect(wl.brand).toBe('Brand');
    expect(wl.configId).toBeDefined();
  });
});

/* ── FixGenerator ────────────────────────────────────────────────── */

describe('FixGenerator', () => {
  test('generateFix finds match for known dimension', () => {
    const gap = { qid: 'Q1', description: 'No shield scanning', dimension: 'shield' };
    const fix = generateFix(gap, ['shield/analyzer', 'vault/dlp']);
    expect(fix).not.toBeNull();
    expect(fix!.moduleName).toBe('shield/analyzer');
    expect(fix!.effort).toBeDefined();
  });

  test('generateFix returns null for unknown dimension', () => {
    const gap = { qid: 'Q2', description: 'Unknown gap', dimension: 'quantum' };
    const fix = generateFix(gap, ['shield/analyzer']);
    expect(fix).toBeNull();
  });

  test('generateFixPlan produces plan with coverage', () => {
    const gaps = [
      { qid: 'Q1', description: 'No scanning', dimension: 'shield' },
      { qid: 'Q2', description: 'No vault', dimension: 'vault' },
      { qid: 'Q3', description: 'Unknown', dimension: 'quantum' },
    ];
    const plan = generateFixPlan(gaps, ['shield/analyzer', 'vault/dlp']);
    expect(plan.fixes.length).toBe(2);
    expect(plan.unfixed.length).toBe(1);
    expect(plan.coverage).toBeCloseTo(2 / 3, 1);
    expect(plan.effortSummary.low + plan.effortSummary.medium + plan.effortSummary.high).toBe(2);
  });
});

/* ── PersonalizedOutput ──────────────────────────────────────────── */

describe('PersonalizedOutput', () => {
  test('getProfile creates default profile', () => {
    const profile = getProfile('test-user-' + Date.now());
    expect(profile.tone).toBe('neutral');
    expect(profile.length).toBe('standard');
    expect(profile.format).toBe('prose');
  });

  test('updateProfile changes profile and tracks history', () => {
    const userId = 'upd-user-' + Date.now();
    getProfile(userId);
    updateProfile(userId, { tone: 'formal', length: 'detailed' });
    const profile = getProfile(userId);
    expect(profile.tone).toBe('formal');
    expect(profile.length).toBe('detailed');
    const hist = getPreferenceHistory(userId);
    expect(hist.length).toBeGreaterThanOrEqual(2);
  });

  test('applyStyle applies tone transformations', () => {
    const userId = 'style-user-' + Date.now();
    updateProfile(userId, { tone: 'formal' });
    const result = applyStyle("You can't do it and it's not allowed.", userId);
    expect(result.content).toContain('cannot');
    expect(result.content).toContain('it is');
  });

  test('applyStyleWithProfile works inline', () => {
    const result = applyStyleWithProfile(
      "This is a test sentence. Here is another one. And a third one.",
      { format: 'bullet' },
    );
    expect(result.content).toContain('•');
  });

  test('deleteProfile removes profile', () => {
    const userId = 'del-user-' + Date.now();
    getProfile(userId);
    expect(deleteProfile(userId)).toBe(true);
  });
});
