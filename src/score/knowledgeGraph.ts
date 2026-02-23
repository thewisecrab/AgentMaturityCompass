/**
 * knowledgeGraph.ts — Typed relationship graph for AMC
 *
 * Inspired by the prior art's Atlas layer. Extends AMC's evidence model with
 * a structural understanding of how agents, tools, policies, and
 * evidence artifacts relate to each other.
 *
 * Key capability: "what breaks if this changes?" — impact analysis
 * through typed edge traversal.
 *
 * Integrates with: AMC evidence chain, Shield SBOM, Governor policies,
 * ToolHub, Notary attestations, and Mechanic upgrade planning.
 */

import { randomUUID } from 'node:crypto';

/* ── Types ────────────────────────────────────────────────────────── */

export type NodeType =
  | 'agent'       // An AMC-tracked agent
  | 'tool'        // A tool in ToolHub
  | 'policy'      // A Governor policy
  | 'evidence'    // An evidence artifact (links to AMC ledger)
  | 'claim'       // A claim (links to ClaimProvenance)
  | 'provider'    // An LLM provider (OpenAI, Anthropic, etc.)
  | 'workspace'   // An AMC workspace
  | 'adapter';    // An AMC adapter

export type EdgeType =
  | 'REQUIRES'    // B breaks/fails if A is removed/changed
  | 'USES'        // A uses B but B's absence degrades, not breaks
  | 'CONTRADICTS' // A and B assert opposing things — conflict
  | 'EXTENDS'     // A is a specialization or extension of B
  | 'VALIDATES'   // A provides evidence that validates B
  | 'PRODUCES'    // A creates/generates B as output
  | 'GOVERNS'     // A applies governance rules to B
  | 'ATTESTS';    // A cryptographically attests to B (notary)

export interface KnowledgeNode {
  id: string;
  type: NodeType;
  label: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  /** AMC trust level if applicable */
  trustLevel?: 'observed' | 'attested' | 'self_reported';
  /** Version or hash of the node content */
  contentHash?: string;
}

export interface KnowledgeEdge {
  id: string;
  from: string;       // source node ID
  to: string;         // target node ID
  type: EdgeType;
  confidence: number; // 0–1, how certain we are this relationship exists
  timestamp: Date;
  evidenceRef?: string;  // AMC evidence artifact that supports this edge
  metadata: Record<string, unknown>;
}

export interface ImpactReport {
  rootNodeId: string;
  affectedNodes: KnowledgeNode[];
  affectedEdges: KnowledgeEdge[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
}

export interface ConflictReport {
  conflicts: Array<{
    nodeA: KnowledgeNode;
    nodeB: KnowledgeNode;
    edge: KnowledgeEdge;
    description: string;
  }>;
  totalConflicts: number;
}

/* ── Knowledge Graph ──────────────────────────────────────────────── */

export class KnowledgeGraph {
  private nodes = new Map<string, KnowledgeNode>();
  private edges = new Map<string, KnowledgeEdge>();
  private adjacency = new Map<string, Set<string>>();  // nodeId → edge IDs
  private reverseAdjacency = new Map<string, Set<string>>(); // nodeId → incoming edge IDs

  addNode(node: Omit<KnowledgeNode, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): KnowledgeNode {
    const existing = node.id ? this.nodes.get(node.id) : undefined;
    if (existing) {
      // Update metadata
      const updated: KnowledgeNode = { ...existing, ...node as KnowledgeNode, updatedAt: new Date() };
      this.nodes.set(existing.id, updated);
      return updated;
    }
    const n: KnowledgeNode = {
      ...node,
      id: node.id ?? `node_${randomUUID()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: node.metadata ?? {},
    };
    this.nodes.set(n.id, n);
    return n;
  }

  addEdge(edge: Omit<KnowledgeEdge, 'id' | 'timestamp'> & { id?: string }): KnowledgeEdge {
    if (!this.nodes.has(edge.from)) throw new Error(`Source node ${edge.from} not found`);
    if (!this.nodes.has(edge.to)) throw new Error(`Target node ${edge.to} not found`);

    const e: KnowledgeEdge = {
      ...edge,
      id: edge.id ?? `edge_${randomUUID()}`,
      timestamp: new Date(),
      metadata: edge.metadata ?? {},
    };
    this.edges.set(e.id, e);

    // Update adjacency
    if (!this.adjacency.has(edge.from)) this.adjacency.set(edge.from, new Set());
    this.adjacency.get(edge.from)!.add(e.id);
    if (!this.reverseAdjacency.has(edge.to)) this.reverseAdjacency.set(edge.to, new Set());
    this.reverseAdjacency.get(edge.to)!.add(e.id);

    return e;
  }

  getNode(id: string): KnowledgeNode | undefined {
    return this.nodes.get(id);
  }

  getEdge(id: string): KnowledgeEdge | undefined {
    return this.edges.get(id);
  }

  getNodesByType(type: NodeType): KnowledgeNode[] {
    return [...this.nodes.values()].filter(n => n.type === type);
  }

  /** Get all nodes directly related to nodeId, optionally filtered by edge type */
  getRelated(nodeId: string, edgeType?: EdgeType): KnowledgeNode[] {
    const edgeIds = this.adjacency.get(nodeId) ?? new Set();
    const result: KnowledgeNode[] = [];
    for (const eid of edgeIds) {
      const edge = this.edges.get(eid);
      if (!edge) continue;
      if (edgeType && edge.type !== edgeType) continue;
      const target = this.nodes.get(edge.to);
      if (target) result.push(target);
    }
    return result;
  }

  /** Get all nodes that depend on nodeId (reverse traversal) */
  getDependents(nodeId: string, edgeType?: EdgeType): KnowledgeNode[] {
    const edgeIds = this.reverseAdjacency.get(nodeId) ?? new Set();
    const result: KnowledgeNode[] = [];
    for (const eid of edgeIds) {
      const edge = this.edges.get(eid);
      if (!edge) continue;
      if (edgeType && edge.type !== edgeType) continue;
      const source = this.nodes.get(edge.from);
      if (source) result.push(source);
    }
    return result;
  }

  /**
   * Impact analysis: "what breaks if nodeId changes?"
   * Traverses REQUIRES edges transitively to find all affected nodes.
   */
  getImpactGraph(nodeId: string): ImpactReport {
    const visited = new Set<string>();
    const affectedNodes: KnowledgeNode[] = [];
    const affectedEdges: KnowledgeEdge[] = [];
    const queue = [nodeId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      // Find all nodes that REQUIRE this node
      const edgeIds = this.reverseAdjacency.get(current) ?? new Set();
      for (const eid of edgeIds) {
        const edge = this.edges.get(eid);
        if (!edge || edge.type !== 'REQUIRES') continue;
        const source = this.nodes.get(edge.from);
        if (!source || visited.has(source.id)) continue;
        affectedNodes.push(source);
        affectedEdges.push(edge);
        queue.push(source.id);
      }
    }

    const riskLevel = affectedNodes.length === 0 ? 'low'
      : affectedNodes.length <= 2 ? 'medium'
      : affectedNodes.length <= 5 ? 'high'
      : 'critical';

    const rootNode = this.nodes.get(nodeId);
    return {
      rootNodeId: nodeId,
      affectedNodes,
      affectedEdges,
      riskLevel,
      summary: affectedNodes.length === 0
        ? `No dependents found for ${rootNode?.label ?? nodeId}`
        : `${affectedNodes.length} node(s) affected if ${rootNode?.label ?? nodeId} changes: ${affectedNodes.map(n => n.label).join(', ')}`,
    };
  }

  /**
   * Detect CONTRADICTS edges — find conflicting claims/policies
   */
  detectConflicts(): ConflictReport {
    const conflicts: ConflictReport['conflicts'] = [];

    for (const edge of this.edges.values()) {
      if (edge.type !== 'CONTRADICTS') continue;
      const nodeA = this.nodes.get(edge.from);
      const nodeB = this.nodes.get(edge.to);
      if (!nodeA || !nodeB) continue;
      conflicts.push({
        nodeA,
        nodeB,
        edge,
        description: `"${nodeA.label}" CONTRADICTS "${nodeB.label}" (confidence: ${(edge.confidence * 100).toFixed(0)}%)`,
      });
    }

    return { conflicts, totalConflicts: conflicts.length };
  }

  /**
   * Find all paths between two nodes (BFS)
   */
  findPaths(fromId: string, toId: string, maxDepth = 5): string[][] {
    const paths: string[][] = [];
    const queue: { path: string[]; visited: Set<string> }[] = [
      { path: [fromId], visited: new Set([fromId]) },
    ];

    while (queue.length > 0) {
      const { path, visited } = queue.shift()!;
      const current = path[path.length - 1]!;

      if (current === toId) {
        paths.push([...path]);
        continue;
      }

      if (path.length >= maxDepth) continue;

      const edgeIds = this.adjacency.get(current) ?? new Set();
      for (const eid of edgeIds) {
        const edge = this.edges.get(eid);
        if (!edge || visited.has(edge.to)) continue;
        queue.push({
          path: [...path, edge.to],
          visited: new Set([...visited, edge.to]),
        });
      }
    }

    return paths;
  }

  /** Statistics */
  getStats(): {
    nodeCount: number;
    edgeCount: number;
    nodesByType: Record<NodeType, number>;
    edgesByType: Record<EdgeType, number>;
    avgDegree: number;
  } {
    const nodesByType = {} as Record<NodeType, number>;
    for (const n of this.nodes.values()) {
      nodesByType[n.type] = (nodesByType[n.type] ?? 0) + 1;
    }
    const edgesByType = {} as Record<EdgeType, number>;
    for (const e of this.edges.values()) {
      edgesByType[e.type] = (edgesByType[e.type] ?? 0) + 1;
    }
    const totalDegree = [...this.adjacency.values()].reduce((s, set) => s + set.size, 0);
    return {
      nodeCount: this.nodes.size,
      edgeCount: this.edges.size,
      nodesByType,
      edgesByType,
      avgDegree: this.nodes.size > 0 ? totalDegree / this.nodes.size : 0,
    };
  }

  toJSON(): object {
    return {
      nodes: Object.fromEntries([...this.nodes.entries()].map(([id, n]) => [id, {
        ...n, createdAt: n.createdAt.toISOString(), updatedAt: n.updatedAt.toISOString(),
      }])),
      edges: Object.fromEntries([...this.edges.entries()].map(([id, e]) => [id, {
        ...e, timestamp: e.timestamp.toISOString(),
      }])),
    };
  }

  static fromJSON(data: { nodes: Record<string, unknown>; edges: Record<string, unknown> }): KnowledgeGraph {
    const g = new KnowledgeGraph();
    for (const [id, rawNode] of Object.entries(data.nodes ?? {})) {
      const n = rawNode as Record<string, unknown>;
      g.nodes.set(id, {
        ...(n as unknown as KnowledgeNode),
        createdAt: new Date(n['createdAt'] as string),
        updatedAt: new Date(n['updatedAt'] as string),
      });
    }
    for (const [id, rawEdge] of Object.entries(data.edges ?? {})) {
      const e = rawEdge as Record<string, unknown>;
      const edge = { ...(e as unknown as KnowledgeEdge), timestamp: new Date(e['timestamp'] as string) };
      g.edges.set(id, edge);
      if (!g.adjacency.has(edge.from)) g.adjacency.set(edge.from, new Set());
      g.adjacency.get(edge.from)!.add(id);
      if (!g.reverseAdjacency.has(edge.to)) g.reverseAdjacency.set(edge.to, new Set());
      g.reverseAdjacency.get(edge.to)!.add(id);
    }
    return g;
  }
}
