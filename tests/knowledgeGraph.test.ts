/**
 * knowledgeGraph.test.ts — Unit tests for KnowledgeGraph
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { KnowledgeGraph } from '../src/score/knowledgeGraph.js';

describe('KnowledgeGraph', () => {
  let g: KnowledgeGraph;

  beforeEach(() => {
    g = new KnowledgeGraph();
  });

  it('adds nodes and assigns unique ids', () => {
    const n1 = g.addNode({ type: 'agent', label: 'BotA', metadata: {} });
    const n2 = g.addNode({ type: 'tool', label: 'ToolX', metadata: {} });
    expect(n1.id).toBeTruthy();
    expect(n2.id).toBeTruthy();
    expect(n1.id).not.toBe(n2.id);
  });

  it('getStats returns correct node and edge counts', () => {
    const a = g.addNode({ type: 'agent', label: 'A', metadata: {} });
    const b = g.addNode({ type: 'tool', label: 'B', metadata: {} });
    g.addEdge({ from: a.id, to: b.id, type: 'REQUIRES', confidence: 1.0, metadata: {} });
    const stats = g.getStats();
    expect(stats.nodeCount).toBe(2);
    expect(stats.edgeCount).toBe(1);
  });

  it('getNode retrieves by id', () => {
    const n = g.addNode({ type: 'policy', label: 'PolicyX', metadata: { version: '1' } });
    const retrieved = g.getNode(n.id);
    expect(retrieved).toBeDefined();
    expect(retrieved!.label).toBe('PolicyX');
  });

  it('getNode returns undefined for unknown id', () => {
    expect(g.getNode('ghost')).toBeUndefined();
  });

  it('addEdge throws for unknown from/to node', () => {
    const n = g.addNode({ type: 'agent', label: 'A', metadata: {} });
    expect(() =>
      g.addEdge({ from: n.id, to: 'nonexistent', type: 'REQUIRES', confidence: 1.0, metadata: {} })
    ).toThrow();
    expect(() =>
      g.addEdge({ from: 'nonexistent', to: n.id, type: 'REQUIRES', confidence: 1.0, metadata: {} })
    ).toThrow();
  });

  it('getImpactGraph returns affected nodes for REQUIRES edge', () => {
    const agent = g.addNode({ type: 'agent', label: 'Agent', metadata: {} });
    const tool = g.addNode({ type: 'tool', label: 'Tool', metadata: {} });
    g.addEdge({ from: agent.id, to: tool.id, type: 'REQUIRES', confidence: 1.0, metadata: {} });

    const impact = g.getImpactGraph(tool.id);
    expect(impact.affectedNodes.some(n => n.id === agent.id)).toBe(true);
  });

  it('getImpactGraph riskLevel is one of the valid values', () => {
    const agent = g.addNode({ type: 'agent', label: 'Agent', metadata: {} });
    const tool = g.addNode({ type: 'tool', label: 'Tool', metadata: {} });
    g.addEdge({ from: agent.id, to: tool.id, type: 'REQUIRES', confidence: 1.0, metadata: {} });

    const impact = g.getImpactGraph(tool.id);
    expect(['low', 'medium', 'high', 'critical']).toContain(impact.riskLevel);
  });

  it('getImpactGraph returns empty for isolated node', () => {
    const isolated = g.addNode({ type: 'tool', label: 'Isolated', metadata: {} });
    const impact = g.getImpactGraph(isolated.id);
    expect(impact.affectedNodes.length).toBe(0);
  });

  it('detectConflicts finds CONTRADICTS edges', () => {
    const p1 = g.addNode({ type: 'policy', label: 'AllowAll', metadata: {} });
    const p2 = g.addNode({ type: 'policy', label: 'DenyAll', metadata: {} });
    g.addEdge({ from: p1.id, to: p2.id, type: 'CONTRADICTS', confidence: 0.9, metadata: {} });

    const report = g.detectConflicts();
    expect(report.totalConflicts).toBeGreaterThan(0);
    expect(report.conflicts.some(c => c.nodeA.id === p1.id && c.nodeB.id === p2.id)).toBe(true);
  });

  it('no conflicts when no CONTRADICTS edges', () => {
    const a = g.addNode({ type: 'agent', label: 'A', metadata: {} });
    const b = g.addNode({ type: 'tool', label: 'B', metadata: {} });
    g.addEdge({ from: a.id, to: b.id, type: 'USES', confidence: 1.0, metadata: {} });
    expect(g.detectConflicts().totalConflicts).toBe(0);
  });

  it('supports all edge types without throwing', () => {
    const edgeTypes = ['REQUIRES', 'USES', 'CONTRADICTS', 'EXTENDS', 'VALIDATES', 'PRODUCES', 'GOVERNS', 'ATTESTS'] as const;
    for (const type of edgeTypes) {
      const fresh = new KnowledgeGraph();
      const a = fresh.addNode({ type: 'agent', label: 'A', metadata: {} });
      const b = fresh.addNode({ type: 'tool', label: 'B', metadata: {} });
      expect(() => fresh.addEdge({ from: a.id, to: b.id, type, confidence: 1.0, metadata: {} })).not.toThrow();
    }
  });

  it('supports all node types', () => {
    const nodeTypes = ['agent', 'tool', 'policy', 'evidence', 'claim', 'provider', 'workspace', 'adapter'] as const;
    for (const type of nodeTypes) {
      expect(() => g.addNode({ type, label: `Node-${type}`, metadata: {} })).not.toThrow();
    }
    expect(g.getStats().nodeCount).toBe(nodeTypes.length);
  });

  it('multi-hop impact propagates through REQUIRES chain', () => {
    const a = g.addNode({ type: 'agent', label: 'A', metadata: {} });
    const b = g.addNode({ type: 'tool', label: 'B', metadata: {} });
    const c = g.addNode({ type: 'provider', label: 'C', metadata: {} });
    g.addEdge({ from: a.id, to: b.id, type: 'REQUIRES', confidence: 1.0, metadata: {} });
    g.addEdge({ from: b.id, to: c.id, type: 'REQUIRES', confidence: 1.0, metadata: {} });

    // If C changes, B and A should be affected
    const impact = g.getImpactGraph(c.id);
    const affectedIds = impact.affectedNodes.map(n => n.id);
    expect(affectedIds).toContain(b.id);
    expect(affectedIds).toContain(a.id);
  });

  it('getRelated returns outgoing neighbors', () => {
    const a = g.addNode({ type: 'agent', label: 'A', metadata: {} });
    const b = g.addNode({ type: 'tool', label: 'B', metadata: {} });
    const c = g.addNode({ type: 'tool', label: 'C', metadata: {} });
    g.addEdge({ from: a.id, to: b.id, type: 'REQUIRES', confidence: 1.0, metadata: {} });
    g.addEdge({ from: a.id, to: c.id, type: 'USES', confidence: 0.8, metadata: {} });

    const related = g.getRelated(a.id);
    expect(related.length).toBe(2);
  });

  it('getDependents returns nodes that depend on a given node', () => {
    const a = g.addNode({ type: 'agent', label: 'A', metadata: {} });
    const b = g.addNode({ type: 'tool', label: 'B', metadata: {} });
    g.addEdge({ from: a.id, to: b.id, type: 'REQUIRES', confidence: 1.0, metadata: {} });

    const dependents = g.getDependents(b.id);
    expect(dependents.some(n => n.id === a.id)).toBe(true);
  });

  it('findPaths finds route between connected nodes', () => {
    const a = g.addNode({ type: 'agent', label: 'A', metadata: {} });
    const b = g.addNode({ type: 'tool', label: 'B', metadata: {} });
    const c = g.addNode({ type: 'provider', label: 'C', metadata: {} });
    g.addEdge({ from: a.id, to: b.id, type: 'REQUIRES', confidence: 1.0, metadata: {} });
    g.addEdge({ from: b.id, to: c.id, type: 'REQUIRES', confidence: 1.0, metadata: {} });

    const paths = g.findPaths(a.id, c.id);
    expect(paths.length).toBeGreaterThan(0);
    expect(paths[0]).toContain(a.id);
    expect(paths[0]).toContain(c.id);
  });

  it('toJSON and fromJSON round-trip preserves nodes and edges', () => {
    const a = g.addNode({ type: 'agent', label: 'A', metadata: {} });
    const b = g.addNode({ type: 'tool', label: 'B', metadata: {} });
    g.addEdge({ from: a.id, to: b.id, type: 'REQUIRES', confidence: 1.0, metadata: {} });

    const json = g.toJSON() as { nodes: Record<string, unknown>; edges: Record<string, unknown> };
    const restored = KnowledgeGraph.fromJSON(json);
    expect(restored.getStats().nodeCount).toBe(2);
    expect(restored.getStats().edgeCount).toBe(1);
    expect(restored.getNode(a.id)?.label).toBe('A');
  });
});
