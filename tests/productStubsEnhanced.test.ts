/**
 * productStubsEnhanced.test.ts — Tests for all 10 Tier A (pure-logic) product modules.
 */

import { describe, expect, test } from 'vitest';

// DependencyGraph
import {
  buildDependencyGraph,
  topoSort,
  detectCycle,
  criticalPath,
  executionLayers,
} from '../src/product/dependencyGraph.js';

// Determinism
import { checkDeterminism } from '../src/product/determinism.js';

// ConversationSummarizer
import { summarizeConversation } from '../src/product/conversationSummarizer.js';

// Clarification
import { checkClarification } from '../src/product/clarification.js';

// ContextOptimizer
import { optimizeContext, packSections } from '../src/product/contextOptimizer.js';

// InstructionFormatter
import { formatInstruction, formatInstructions } from '../src/product/instructionFormatter.js';

// ErrorTranslator
import {
  translateError,
  translateErrors,
  errorSummary,
  registerErrorPattern,
  clearCustomPatterns,
} from '../src/product/errorTranslator.js';

// ToolSemanticDocs
import { buildIndex, searchTools, generateDocs } from '../src/product/toolSemanticDocs.js';

// TaskSplitter
import { split, chunkText, estimateTotalMs, registerAgentType } from '../src/product/taskSplitter.js';

// Glossary
import { GlossaryManager } from '../src/product/glossary.js';

/* ── DependencyGraph ─────────────────────────────────────────────── */

describe('DependencyGraph', () => {
  test('buildDependencyGraph creates nodes and edges', () => {
    const graph = buildDependencyGraph({ a: ['b', 'c'], b: ['c'] });
    expect(graph.nodes).toEqual(['a', 'b']);
    expect(graph.edges.length).toBe(3);
  });

  test('topoSort returns sorted order for DAG', () => {
    const graph = buildDependencyGraph({ a: ['b', 'c'], b: ['c'], c: [] });
    const result = topoSort(graph);
    expect(result.hasCycle).toBe(false);
    expect(result.sorted.indexOf('a')).toBeLessThan(result.sorted.indexOf('b'));
    expect(result.sorted.indexOf('a')).toBeLessThan(result.sorted.indexOf('c'));
  });

  test('detectCycle finds cycle', () => {
    const graph = { nodes: ['a', 'b', 'c'], edges: [['a', 'b'], ['b', 'c'], ['c', 'a']] as Array<[string, string]> };
    const result = detectCycle(graph);
    expect(result.hasCycle).toBe(true);
    expect(result.cycle.length).toBeGreaterThan(0);
  });

  test('detectCycle reports no cycle in DAG', () => {
    const graph = buildDependencyGraph({ a: ['b'], b: ['c'], c: [] });
    const result = detectCycle(graph);
    expect(result.hasCycle).toBe(false);
  });

  test('criticalPath returns longest path', () => {
    const graph = buildDependencyGraph({ a: ['b', 'c'], b: ['d'], c: ['d'], d: [] });
    const result = criticalPath(graph);
    expect(result.path.length).toBeGreaterThan(0);
    expect(result.length).toBeGreaterThan(0);
  });

  test('executionLayers generates parallel layers', () => {
    const graph = buildDependencyGraph({ a: ['c'], b: ['c'], c: [] });
    const layers = executionLayers(graph);
    expect(layers.length).toBeGreaterThanOrEqual(1);
    // a and b should be in the same layer (both depend on c, but c should be first)
  });
});

/* ── Determinism ─────────────────────────────────────────────────── */

describe('Determinism', () => {
  test('identical results are deterministic', () => {
    const result = checkDeterminism(['hello', 'hello', 'hello']);
    expect(result.deterministic).toBe(true);
    expect(result.entropy).toBe(0);
    expect(result.uniqueCount).toBe(1);
  });

  test('varied results are non-deterministic', () => {
    const result = checkDeterminism(['a', 'b', 'c']);
    expect(result.deterministic).toBe(false);
    expect(result.entropy).toBeGreaterThan(0);
    expect(result.uniqueCount).toBe(3);
  });

  test('empty input returns deterministic', () => {
    const result = checkDeterminism([]);
    expect(result.deterministic).toBe(true);
    expect(result.totalCount).toBe(0);
  });

  test('numeric outlier detection works', () => {
    const result = checkDeterminism(['1', '2', '1', '2', '1', '2', '100']);
    expect(result.outliers.length).toBeGreaterThan(0);
  });

  test('coefficient of variation calculated for numeric arrays', () => {
    const result = checkDeterminism(['10', '10', '11', '10']);
    expect(result.coefficientOfVariation).toBeGreaterThanOrEqual(0);
  });
});

/* ── ConversationSummarizer ──────────────────────────────────────── */

describe('ConversationSummarizer', () => {
  test('empty messages returns empty summary', () => {
    const result = summarizeConversation([]);
    expect(result.summary).toBe('');
    expect(result.turnCount).toBe(0);
  });

  test('extractive strategy works for small conversations', () => {
    const msgs = [
      { role: 'user', content: 'How does authentication work?' },
      { role: 'assistant', content: 'Authentication uses JWT tokens with HMAC signing.' },
    ];
    const result = summarizeConversation(msgs, 'extractive');
    expect(result.strategy).toBe('extractive');
    expect(result.turnCount).toBe(2);
    expect(result.summary.length).toBeGreaterThan(0);
  });

  test('sliding strategy for medium conversations', () => {
    const msgs = Array.from({ length: 15 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Message number ${i} about topic ${i % 3}`,
    }));
    const result = summarizeConversation(msgs, 'sliding');
    expect(result.strategy).toBe('sliding');
    expect(result.summary).toContain('omitted');
  });

  test('topicChange strategy for long conversations', () => {
    const msgs = [
      { role: 'user', content: 'Tell me about databases and SQL queries' },
      { role: 'assistant', content: 'Databases store data in structured tables with SQL' },
      { role: 'user', content: 'Now lets talk about frontend React components' },
      { role: 'assistant', content: 'React components use JSX and virtual DOM rendering' },
    ];
    const result = summarizeConversation(msgs, 'topicChange');
    expect(result.strategy).toBe('topicChange');
    expect(result.topicSegments).toBeDefined();
  });

  test('auto-selects strategy based on message count', () => {
    const msgs = Array.from({ length: 5 }, (_, i) => ({ role: 'user', content: `msg ${i}` }));
    const result = summarizeConversation(msgs);
    expect(result.strategy).toBe('extractive');
  });
});

/* ── Clarification ───────────────────────────────────────────────── */

describe('Clarification', () => {
  test('short input needs clarification', () => {
    const result = checkClarification('fix it');
    expect(result.needsClarification).toBe(true);
    expect(result.detectedIssues.some(i => i.type === 'missing-context')).toBe(true);
  });

  test('ambiguous pronouns detected', () => {
    const result = checkClarification('Please update it and send them the results when they are ready');
    const pronounIssues = result.detectedIssues.filter(i => i.type === 'pronoun');
    expect(pronounIssues.length).toBeGreaterThan(0);
  });

  test('vague quantifiers detected', () => {
    const result = checkClarification('Please process some of the items and return several results from various sources');
    const vague = result.detectedIssues.filter(i => i.type === 'vague-quantifier');
    expect(vague.length).toBeGreaterThan(0);
  });

  test('temporal ambiguity detected', () => {
    const result = checkClarification('Please complete this task soon and deliver the report later');
    const temporal = result.detectedIssues.filter(i => i.type === 'temporal');
    expect(temporal.length).toBeGreaterThan(0);
  });

  test('clear input has low ambiguity', () => {
    const result = checkClarification('Deploy version 2.5.1 of the authentication service to the production server at 10am UTC on 2024-01-15');
    expect(result.ambiguityScore).toBeLessThan(1);
  });
});

/* ── ContextOptimizer ────────────────────────────────────────────── */

describe('ContextOptimizer', () => {
  test('small context passes through', () => {
    const result = optimizeContext('Hello world', 4000);
    expect(result.optimized).toBe('Hello world');
    expect(result.tokensReduced).toBe(0);
  });

  test('large context is truncated', () => {
    const big = 'x'.repeat(50_000);
    const result = optimizeContext(big, 1000);
    expect(result.tokensReduced).toBeGreaterThan(0);
    expect(result.optimized.length).toBeLessThan(big.length);
  });

  test('packSections respects token budget', () => {
    const sections = [
      { label: 'High', content: 'A'.repeat(400), priority: 9 },
      { label: 'Low', content: 'B'.repeat(400), priority: 1 },
      { label: 'Med', content: 'C'.repeat(400), priority: 5 },
    ];
    const result = packSections(sections, 300); // ~300 tokens = 1200 chars
    expect(result.keptSections).toBeLessThanOrEqual(3);
    expect(result.droppedSections + result.keptSections).toBe(3);
  });

  test('packSections handles empty input', () => {
    const result = packSections([], 1000);
    expect(result.keptSections).toBe(0);
    expect(result.optimized).toBe('');
  });
});

/* ── InstructionFormatter ────────────────────────────────────────── */

describe('InstructionFormatter', () => {
  test('concise style removes filler words', () => {
    const result = formatInstruction('Just basically really do the thing');
    expect(result.style).toBe('concise');
    expect(result.formatted).not.toContain('just');
    expect(result.formatted).not.toContain('basically');
  });

  test('xml style wraps in XML tags', () => {
    const result = formatInstruction('Step one; Step two', 'xml');
    expect(result.style).toBe('xml');
    expect(result.formatted).toContain('<instruction>');
    expect(result.formatted).toContain('</instruction>');
    expect(result.formatted).toContain('<step');
  });

  test('structured style creates numbered list', () => {
    const result = formatInstruction('Do first; Then second; Finally third', 'structured');
    expect(result.formatted).toContain('1.');
    expect(result.formatted).toContain('2.');
  });

  test('budget enforcement truncates', () => {
    const result = formatInstruction('A'.repeat(1000), 'concise', 10);
    expect(result.withinBudget).toBe(false);
    expect(result.tokenEstimate).toBeLessThanOrEqual(11);
  });

  test('formatInstructions batch works', () => {
    const results = formatInstructions(['Do A', 'Do B', 'Do C']);
    expect(results.length).toBe(3);
    results.forEach(r => expect(r.formatted.length).toBeGreaterThan(0));
  });
});

/* ── ErrorTranslator ─────────────────────────────────────────────── */

describe('ErrorTranslator', () => {
  test('translates known error codes', () => {
    const err = Object.assign(new Error('connection refused'), { code: 'ECONNREFUSED' });
    const result = translateError(err);
    expect(result.code).toBe('ECONNREFUSED');
    expect(result.severity).toBe('high');
    expect(result.recovery).toBeDefined();
  });

  test('translates unknown error with fallback', () => {
    const result = translateError(new Error('something unknown'));
    expect(result.code).toBeDefined();
    expect(result.userMessage).toBeDefined();
  });

  test('developer audience returns raw message', () => {
    const err = Object.assign(new Error('DB timeout'), { code: 'ETIMEDOUT' });
    const result = translateError(err, 'developer');
    expect(result.userMessage).toBe('DB timeout');
  });

  test('batch translation works', () => {
    const errors = [
      Object.assign(new Error('conn'), { code: 'ECONNREFUSED' }),
      Object.assign(new Error('perm'), { code: 'EPERM' }),
    ];
    const results = translateErrors(errors);
    expect(results.length).toBe(2);
  });

  test('custom pattern registration', () => {
    clearCustomPatterns();
    registerErrorPattern({
      code: 'CUSTOM_ERR',
      user: 'Custom error occurred',
      recovery: 'Try custom fix',
      severity: 'critical',
    });
    const err = Object.assign(new Error('custom'), { code: 'CUSTOM_ERR' });
    const result = translateError(err);
    expect(result.code).toBe('CUSTOM_ERR');
    expect(result.severity).toBe('critical');
    clearCustomPatterns();
  });

  test('errorSummary aggregates', () => {
    const translated = [
      { userMessage: 'a', technicalMessage: 'a', code: 'A', severity: 'high' as const },
      { userMessage: 'b', technicalMessage: 'b', code: 'B', severity: 'low' as const },
      { userMessage: 'c', technicalMessage: 'c', code: 'A', severity: 'high' as const },
    ];
    const summary = errorSummary(translated);
    expect(summary.total).toBe(3);
    expect(summary.uniqueCodes.length).toBe(2);
    expect(summary.bySeverity.high).toBe(2);
  });
});

/* ── ToolSemanticDocs ────────────────────────────────────────────── */

describe('ToolSemanticDocs', () => {
  const tools = [
    { id: 'search', name: 'search', description: 'Search the web for information', tags: ['web', 'search'] },
    { id: 'code', name: 'code_interpreter', description: 'Execute code snippets', tags: ['code', 'execution'] },
    { id: 'image', name: 'image_gen', description: 'Generate images from text', tags: ['image', 'generation'] },
  ];

  test('buildIndex creates valid index', () => {
    const index = buildIndex(tools);
    expect(index.tools.length).toBe(3);
    expect(index.idf.size).toBeGreaterThan(0);
  });

  test('searchTools finds relevant results', () => {
    const results = searchTools('search web', tools);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.tool.id).toBe('search');
    expect(results[0]!.matchedTerms.length).toBeGreaterThan(0);
  });

  test('generateDocs creates documentation', () => {
    const doc = generateDocs(tools[0]!, tools);
    expect(doc.toolName).toBe('search');
    expect(doc.summary).toBe('Search the web for information');
    expect(doc.examples.length).toBeGreaterThan(0);
  });
});

/* ── TaskSplitter ────────────────────────────────────────────────── */

describe('TaskSplitter', () => {
  test('splits numbered task list', () => {
    const subtasks = split('1) Analyze data 2) Generate report 3) Send email');
    expect(subtasks.length).toBe(3);
    subtasks.forEach(s => {
      expect(s.complexity).toBeDefined();
      expect(s.estimatedMs).toBeGreaterThan(0);
    });
  });

  test('splits semicolon-separated tasks', () => {
    const subtasks = split('Search database; Transform results; Validate output');
    expect(subtasks.length).toBe(3);
  });

  test('suggests agent types', () => {
    const subtasks = split('1) Classify the documents 2) Analyze the results 3) Generate a summary');
    const types = subtasks.map(s => s.suggestedAgentType).filter(Boolean);
    expect(types.length).toBeGreaterThan(0);
  });

  test('chunkText works', () => {
    const result = chunkText('abcdefghij', 3);
    expect(result.totalChunks).toBe(4); // abc, def, ghi, j
    expect(result.chunks[0]).toBe('abc');
  });

  test('estimateTotalMs calculates times', () => {
    const subtasks = split('1) Check status 2) Analyze data 3) Generate report');
    const times = estimateTotalMs(subtasks);
    expect(times.totalMs).toBeGreaterThan(0);
    expect(times.parallelMs).toBeLessThanOrEqual(times.totalMs);
  });
});

/* ── Glossary ────────────────────────────────────────────────────── */

describe('GlossaryManager', () => {
  test('define and lookup term', () => {
    const gm = new GlossaryManager();
    gm.define('AMC', 'Agent Maturity Compass', 'core');
    const entry = gm.lookup('AMC');
    expect(entry).toBeDefined();
    expect(entry!.definition).toBe('Agent Maturity Compass');
  });

  test('alias lookup works', () => {
    const gm = new GlossaryManager();
    gm.define('Shield', 'Security scanning module', 'security', ['S1', 'SecurityShield']);
    const entry = gm.lookup('S1');
    expect(entry).toBeDefined();
    expect(entry!.term).toBe('Shield');
  });

  test('addAlias works', () => {
    const gm = new GlossaryManager();
    gm.define('Vault', 'Data protection module', 'privacy');
    gm.addAlias('Vault', 'DLP');
    const entry = gm.lookup('DLP');
    expect(entry).toBeDefined();
  });

  test('remove deletes term and aliases', () => {
    const gm = new GlossaryManager();
    gm.define('Test', 'Test term', 'test', ['T1']);
    gm.remove('Test');
    expect(gm.lookup('Test')).toBeUndefined();
    expect(gm.lookup('T1')).toBeUndefined();
  });

  test('search finds matching terms', () => {
    const gm = new GlossaryManager();
    gm.define('Shield', 'Security scanning', 'security');
    gm.define('Vault', 'Data protection', 'privacy');
    const results = gm.search('security');
    expect(results.length).toBe(1);
    expect(results[0]!.term).toBe('Shield');
  });

  test('enforceVariants detects alias usage', () => {
    const gm = new GlossaryManager();
    gm.define('Agent Maturity Compass', 'The AMC framework', 'core', ['AMC framework', 'maturity compass']);
    const violations = gm.enforceVariants('The AMC framework is a maturity compass for agents');
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0]!.preferred).toBe('Agent Maturity Compass');
  });

  test('export and import roundtrip', () => {
    const gm1 = new GlossaryManager();
    gm1.define('Term1', 'Def1', 'dom1');
    gm1.define('Term2', 'Def2', 'dom2');
    const exported = gm1.export();
    expect(exported.version).toBe(1);
    expect(exported.entries.length).toBe(2);

    const gm2 = new GlossaryManager();
    const count = gm2.import(exported);
    expect(count).toBe(2);
    expect(gm2.lookup('Term1')).toBeDefined();
  });

  test('domains lists unique domains', () => {
    const gm = new GlossaryManager();
    gm.define('A', 'def', 'security');
    gm.define('B', 'def', 'privacy');
    gm.define('C', 'def', 'security');
    const doms = gm.domains();
    expect(doms.length).toBe(2);
  });
});
