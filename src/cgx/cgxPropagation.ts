/**
 * Enhanced CGX Edge Semantics & Risk Propagation
 *
 * Extends the core CGX graph with fine-grained semantic edges beyond the 10 generic
 * operational edge types. Adds:
 *
 * - REQUIRES, CONTRADICTS, PATCHES, DEPRECATES, BLOCKS with impact propagation
 * - Per-edge confidence and evidence refs
 * - Per-edge freshness and verification timestamps
 * - Breakage/risk propagation simulation ("if this node changes, what risks move")
 * - Graph-diff between runs/releases
 * - Graph integrity checks as CI gates
 * - "Hotspot" detection for contradiction-heavy graph regions
 *
 * This module operates as an overlay on the core CgxGraph — it doesn't modify
 * the base schema but adds a semantic edge layer that can be composed with it.
 */

import { z } from "zod";
import { randomUUID } from "node:crypto";
import { sha256Hex } from "../utils/hash.js";
import { canonicalize } from "../utils/json.js";
import type { CgxGraph, CgxNode, CgxEdge } from "./cgxSchema.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SemanticEdgeType =
  | "REQUIRES"     // A requires B to function
  | "CONTRADICTS"  // A contradicts B (logical conflict)
  | "PATCHES"      // A patches B (fix or workaround)
  | "DEPRECATES"   // A deprecates B (B is obsolete)
  | "BLOCKS"       // A blocks B (prevents execution)
  | "WEAKENS"      // A weakens B (reduces trust/confidence)
  | "STRENGTHENS"  // A strengthens B (increases trust/confidence)
  | "CONFLICTS_WITH"; // A conflicts with B (policy/config conflict)

export const semanticEdgeTypeSchema = z.enum([
  "REQUIRES",
  "CONTRADICTS",
  "PATCHES",
  "DEPRECATES",
  "BLOCKS",
  "WEAKENS",
  "STRENGTHENS",
  "CONFLICTS_WITH",
]);

export interface SemanticEdge {
  edgeId: string;
  type: SemanticEdgeType;
  fromNodeId: string;
  toNodeId: string;
  confidence: number; // 0.0-1.0 — how sure we are about this relationship
  evidenceRefs: string[]; // evidence event IDs supporting this edge
  createdTs: number;
  verifiedTs: number | null; // when this edge was last verified
  stale: boolean; // whether this edge needs re-verification
  description: string; // human-readable explanation
  impactWeight: number; // 0.0-1.0 — how much impact propagates through this edge
  hash: string;
}

export interface SemanticEdgeOverlay {
  v: 1;
  baseGraphHash: string; // SHA256 of the base CgxGraph this overlay applies to
  generatedTs: number;
  edges: SemanticEdge[];
  stats: {
    edgeCount: number;
    contradictionCount: number;
    blockCount: number;
    staleEdgeCount: number;
  };
}

export interface PropagationResult {
  /** The node we started from */
  sourceNodeId: string;
  /** All nodes affected with their risk scores */
  affectedNodes: Array<{
    nodeId: string;
    nodeLabel: string;
    riskScore: number; // 0.0-1.0
    pathLength: number; // hops from source
    pathEdgeTypes: SemanticEdgeType[]; // edge types traversed
    reason: string;
  }>;
  /** Blast radius as a fraction of total graph nodes */
  blastRadius: number;
  /** Risk propagation chains */
  chains: Array<{
    path: string[];
    totalRisk: number;
  }>;
}

export interface GraphDiffResult {
  /** Nodes added in new graph */
  nodesAdded: string[];
  /** Nodes removed from old graph */
  nodesRemoved: string[];
  /** Nodes with changed hashes */
  nodesModified: string[];
  /** Semantic edges added */
  edgesAdded: string[];
  /** Semantic edges removed */
  edgesRemoved: string[];
  /** Summary of changes */
  summary: string;
  /** Trust impact: positive = safer, negative = riskier */
  trustImpact: number;
}

export interface GraphIntegrityCheckResult {
  pass: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    contradictionCount: number;
    staleEdgeCount: number;
    orphanedNodeCount: number;
    maxPropagationDepth: number;
    hotspotCount: number;
  };
}

export interface GraphHotspot {
  nodeId: string;
  nodeLabel: string;
  contradictionCount: number;
  blockCount: number;
  incomingEdgeCount: number;
  outgoingEdgeCount: number;
  riskScore: number;
}

// ---------------------------------------------------------------------------
// Semantic edge overlay builder
// ---------------------------------------------------------------------------

function computeEdgeHash(edge: Omit<SemanticEdge, "hash">): string {
  // Intentionally exclude edgeId/timestamps so semantically identical edges hash identically
  // across runs. This improves deterministic diffing/reporting.
  return sha256Hex(canonicalize({
    type: edge.type,
    fromNodeId: edge.fromNodeId,
    toNodeId: edge.toNodeId,
    confidence: edge.confidence,
    description: edge.description,
    impactWeight: edge.impactWeight,
  }));
}

function semanticEdgeIdentity(edge: SemanticEdge): string {
  return [edge.type, edge.fromNodeId, edge.toNodeId, edge.hash].join("|");
}

/**
 * Create a new semantic edge overlay for a base graph.
 */
export function createSemanticOverlay(
  baseGraph: CgxGraph,
): SemanticEdgeOverlay {
  const graphHash = sha256Hex(canonicalize(baseGraph));
  return {
    v: 1,
    baseGraphHash: graphHash,
    generatedTs: Date.now(),
    edges: [],
    stats: {
      edgeCount: 0,
      contradictionCount: 0,
      blockCount: 0,
      staleEdgeCount: 0,
    },
  };
}

/**
 * Add a semantic edge to an overlay.
 */
export function addSemanticEdge(
  overlay: SemanticEdgeOverlay,
  params: {
    type: SemanticEdgeType;
    fromNodeId: string;
    toNodeId: string;
    confidence?: number;
    evidenceRefs?: string[];
    description: string;
    impactWeight?: number;
  },
): SemanticEdge {
  const now = Date.now();
  const edgeBody: Omit<SemanticEdge, "hash"> = {
    edgeId: `se_${randomUUID().slice(0, 12)}`,
    type: params.type,
    fromNodeId: params.fromNodeId,
    toNodeId: params.toNodeId,
    confidence: params.confidence ?? 0.8,
    evidenceRefs: params.evidenceRefs ?? [],
    createdTs: now,
    verifiedTs: null,
    stale: false,
    description: params.description,
    impactWeight: params.impactWeight ?? 0.5,
  };

  const edge: SemanticEdge = {
    ...edgeBody,
    hash: computeEdgeHash(edgeBody),
  };

  overlay.edges.push(edge);

  // Update stats
  overlay.stats.edgeCount = overlay.edges.length;
  overlay.stats.contradictionCount = overlay.edges.filter(
    (e) => e.type === "CONTRADICTS" || e.type === "CONFLICTS_WITH",
  ).length;
  overlay.stats.blockCount = overlay.edges.filter(
    (e) => e.type === "BLOCKS",
  ).length;
  overlay.stats.staleEdgeCount = overlay.edges.filter(
    (e) => e.stale,
  ).length;

  return edge;
}

/**
 * Mark an edge as verified.
 */
export function verifySemanticEdge(
  overlay: SemanticEdgeOverlay,
  edgeId: string,
): boolean {
  const edge = overlay.edges.find((e) => e.edgeId === edgeId);
  if (!edge) return false;
  edge.verifiedTs = Date.now();
  edge.stale = false;
  return true;
}

/**
 * Mark edges as stale based on age threshold.
 */
export function markStaleEdges(
  overlay: SemanticEdgeOverlay,
  maxAgeMs: number,
): string[] {
  const now = Date.now();
  const staleIds: string[] = [];

  for (const edge of overlay.edges) {
    const lastChecked = edge.verifiedTs ?? edge.createdTs;
    if (now - lastChecked > maxAgeMs) {
      edge.stale = true;
      staleIds.push(edge.edgeId);
    }
  }

  overlay.stats.staleEdgeCount = overlay.edges.filter((e) => e.stale).length;
  return staleIds;
}

// ---------------------------------------------------------------------------
// Risk propagation simulation
// ---------------------------------------------------------------------------

/**
 * Simulate risk propagation from a source node through the semantic edge network.
 * Answers: "If this node changes, what trust risks propagate and where?"
 */
export function simulateRiskPropagation(
  baseGraph: CgxGraph,
  overlay: SemanticEdgeOverlay,
  sourceNodeId: string,
  options?: {
    maxDepth?: number;
    minRiskThreshold?: number;
  },
): PropagationResult {
  const maxDepth = options?.maxDepth ?? 5;
  const minRiskThreshold = options?.minRiskThreshold ?? 0.05;

  const nodeMap = new Map(baseGraph.nodes.map((n) => [n.id, n]));

  // BFS propagation
  interface QueueEntry {
    nodeId: string;
    riskScore: number;
    depth: number;
    pathEdgeTypes: SemanticEdgeType[];
    path: string[];
  }

  const visited = new Map<string, number>(); // nodeId → best risk score
  const queue: QueueEntry[] = [
    { nodeId: sourceNodeId, riskScore: 1.0, depth: 0, pathEdgeTypes: [], path: [sourceNodeId] },
  ];
  visited.set(sourceNodeId, 1.0);

  const affectedNodes: PropagationResult["affectedNodes"] = [];
  const chains: PropagationResult["chains"] = [];

  // Risk propagation weights by edge type
  const edgeRiskMultiplier: Record<SemanticEdgeType, number> = {
    REQUIRES: 0.8,      // high propagation: if dependency breaks, requirer breaks
    CONTRADICTS: 0.6,   // medium: contradiction may invalidate
    PATCHES: 0.3,       // low: if patch is removed, original issue returns
    DEPRECATES: 0.4,    // medium: deprecation signals pending breakage
    BLOCKS: 0.9,        // very high: blocking is direct impact
    WEAKENS: 0.5,       // medium: weakening propagates partial risk
    STRENGTHENS: 0.1,   // very low: losing a strength is minor risk
    CONFLICTS_WITH: 0.6, // medium: conflicts create uncertainty
  };

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.depth >= maxDepth) continue;

    // Find outgoing semantic edges from this node
    const outgoing = overlay.edges.filter(
      (e) => e.fromNodeId === current.nodeId && !e.stale,
    );

    for (const edge of outgoing) {
      const propagatedRisk = current.riskScore * edge.impactWeight *
        (edgeRiskMultiplier[edge.type] ?? 0.5) * edge.confidence;

      if (propagatedRisk < minRiskThreshold) continue;

      const existingRisk = visited.get(edge.toNodeId) ?? 0;
      if (propagatedRisk <= existingRisk) continue;

      visited.set(edge.toNodeId, propagatedRisk);

      const targetNode = nodeMap.get(edge.toNodeId);
      const newPath = [...current.path, edge.toNodeId];
      const newEdgeTypes = [...current.pathEdgeTypes, edge.type];

      affectedNodes.push({
        nodeId: edge.toNodeId,
        nodeLabel: targetNode?.label ?? edge.toNodeId,
        riskScore: Number(propagatedRisk.toFixed(4)),
        pathLength: current.depth + 1,
        pathEdgeTypes: newEdgeTypes,
        reason: `Risk propagated via ${edge.type} edge (impact: ${edge.impactWeight})`,
      });

      chains.push({
        path: newPath,
        totalRisk: Number(propagatedRisk.toFixed(4)),
      });

      queue.push({
        nodeId: edge.toNodeId,
        riskScore: propagatedRisk,
        depth: current.depth + 1,
        pathEdgeTypes: newEdgeTypes,
        path: newPath,
      });
    }
  }

  // Deduplicate affected nodes (keep highest risk per node)
  const bestPerNode = new Map<string, PropagationResult["affectedNodes"][number]>();
  for (const node of affectedNodes) {
    const existing = bestPerNode.get(node.nodeId);
    if (!existing || node.riskScore > existing.riskScore) {
      bestPerNode.set(node.nodeId, node);
    }
  }

  const totalNodes = baseGraph.nodes.length;
  const blastRadius = totalNodes > 0 ? bestPerNode.size / totalNodes : 0;

  return {
    sourceNodeId,
    affectedNodes: Array.from(bestPerNode.values()).sort(
      (a, b) => (b.riskScore - a.riskScore) || a.nodeId.localeCompare(b.nodeId),
    ),
    blastRadius: Number(blastRadius.toFixed(4)),
    chains: chains
      .sort((a, b) => (b.totalRisk - a.totalRisk) || a.path.join("→").localeCompare(b.path.join("→")))
      .slice(0, 20),
  };
}

// ---------------------------------------------------------------------------
// Graph diff
// ---------------------------------------------------------------------------

/**
 * Compute differences between two graph snapshots (old → new).
 */
export function diffGraphs(
  oldGraph: CgxGraph,
  newGraph: CgxGraph,
  oldOverlay?: SemanticEdgeOverlay,
  newOverlay?: SemanticEdgeOverlay,
): GraphDiffResult {
  const oldNodeIds = new Set(oldGraph.nodes.map((n) => n.id));
  const newNodeIds = new Set(newGraph.nodes.map((n) => n.id));
  const oldNodeHashes = new Map(oldGraph.nodes.map((n) => [n.id, n.hash]));
  const newNodeHashes = new Map(newGraph.nodes.map((n) => [n.id, n.hash]));

  const nodesAdded = [...newNodeIds].filter((id) => !oldNodeIds.has(id));
  const nodesRemoved = [...oldNodeIds].filter((id) => !newNodeIds.has(id));
  const nodesModified: string[] = [];

  for (const id of newNodeIds) {
    if (oldNodeIds.has(id) && oldNodeHashes.get(id) !== newNodeHashes.get(id)) {
      nodesModified.push(id);
    }
  }

  // Edge diffs (semantic overlay), compared by semantic identity (not random edgeId)
  const oldEdges = oldOverlay?.edges ?? [];
  const newEdges = newOverlay?.edges ?? [];
  const oldEdgeIdentitySet = new Set(oldEdges.map(semanticEdgeIdentity));
  const newEdgeIdentitySet = new Set(newEdges.map(semanticEdgeIdentity));

  const edgesAdded = newEdges
    .filter((edge) => !oldEdgeIdentitySet.has(semanticEdgeIdentity(edge)))
    .map((edge) => edge.edgeId);
  const edgesRemoved = oldEdges
    .filter((edge) => !newEdgeIdentitySet.has(semanticEdgeIdentity(edge)))
    .map((edge) => edge.edgeId);

  // Trust impact heuristic
  const addedConflicts = newEdges.filter(
    (e) => !oldEdgeIdentitySet.has(semanticEdgeIdentity(e)) &&
      (e.type === "CONTRADICTS" || e.type === "BLOCKS" || e.type === "CONFLICTS_WITH"),
  ).length;

  const removedConflicts = oldEdges.filter(
    (e) => !newEdgeIdentitySet.has(semanticEdgeIdentity(e)) &&
      (e.type === "CONTRADICTS" || e.type === "BLOCKS" || e.type === "CONFLICTS_WITH"),
  ).length;

  const trustImpact = removedConflicts - addedConflicts; // positive = safer

  const parts: string[] = [];
  if (nodesAdded.length > 0) parts.push(`+${nodesAdded.length} nodes`);
  if (nodesRemoved.length > 0) parts.push(`-${nodesRemoved.length} nodes`);
  if (nodesModified.length > 0) parts.push(`~${nodesModified.length} nodes`);
  if (edgesAdded.length > 0) parts.push(`+${edgesAdded.length} semantic edges`);
  if (edgesRemoved.length > 0) parts.push(`-${edgesRemoved.length} semantic edges`);
  const summary = parts.length > 0 ? parts.join(", ") : "No changes";

  return {
    nodesAdded,
    nodesRemoved,
    nodesModified,
    edgesAdded,
    edgesRemoved,
    summary,
    trustImpact,
  };
}

// ---------------------------------------------------------------------------
// Graph integrity checks
// ---------------------------------------------------------------------------

/**
 * Run integrity checks on a graph + semantic overlay as a CI gate.
 */
export function checkGraphIntegrity(
  graph: CgxGraph,
  overlay: SemanticEdgeOverlay,
  options?: {
    maxContradictions?: number;
    maxStaleEdgeRatio?: number;
    maxOrphanedNodes?: number;
  },
): GraphIntegrityCheckResult {
  const maxContradictions = options?.maxContradictions ?? 5;
  const maxStaleEdgeRatio = options?.maxStaleEdgeRatio ?? 0.3;
  const maxOrphanedNodes = options?.maxOrphanedNodes ?? 10;

  const errors: string[] = [];
  const warnings: string[] = [];
  const nodeIds = new Set(graph.nodes.map((n) => n.id));

  // Check for contradictions
  const contradictionCount = overlay.edges.filter(
    (e) => e.type === "CONTRADICTS" || e.type === "CONFLICTS_WITH",
  ).length;

  if (contradictionCount > maxContradictions) {
    errors.push(
      `${contradictionCount} contradictions exceed max ${maxContradictions}`,
    );
  } else if (contradictionCount > 0) {
    warnings.push(`${contradictionCount} contradiction(s) detected`);
  }

  // Check for stale edges
  const staleEdgeCount = overlay.edges.filter((e) => e.stale).length;
  const staleRatio = overlay.edges.length > 0 ? staleEdgeCount / overlay.edges.length : 0;

  if (staleRatio > maxStaleEdgeRatio) {
    errors.push(
      `Stale edge ratio ${(staleRatio * 100).toFixed(0)}% exceeds max ${(maxStaleEdgeRatio * 100).toFixed(0)}%`,
    );
  }

  // Check for orphaned nodes (nodes referenced in edges but not in graph)
  const edgeNodeIds = new Set<string>();
  for (const edge of overlay.edges) {
    edgeNodeIds.add(edge.fromNodeId);
    edgeNodeIds.add(edge.toNodeId);
  }
  const orphanedNodeIds = [...edgeNodeIds].filter((id) => !nodeIds.has(id));

  if (orphanedNodeIds.length > maxOrphanedNodes) {
    errors.push(
      `${orphanedNodeIds.length} orphaned node references exceed max ${maxOrphanedNodes}`,
    );
  } else if (orphanedNodeIds.length > 0) {
    warnings.push(`${orphanedNodeIds.length} orphaned node reference(s) detected`);
  }

  // Compute max propagation depth (BFS on edges)
  let maxPropagationDepth = 0;
  for (const node of graph.nodes) {
    const visited = new Set<string>();
    const queue: Array<{ id: string; depth: number }> = [{ id: node.id, depth: 0 }];
    visited.add(node.id);

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.depth > maxPropagationDepth) {
        maxPropagationDepth = current.depth;
      }
      if (current.depth >= 10) break; // safety cap

      const outgoing = overlay.edges.filter((e) => e.fromNodeId === current.id);
      for (const edge of outgoing) {
        if (!visited.has(edge.toNodeId)) {
          visited.add(edge.toNodeId);
          queue.push({ id: edge.toNodeId, depth: current.depth + 1 });
        }
      }
    }
  }

  // Find hotspots
  const hotspots = detectHotspots(graph, overlay);
  const hotspotCount = hotspots.length;

  if (hotspotCount > 5) {
    warnings.push(`${hotspotCount} graph hotspots detected`);
  }

  return {
    pass: errors.length === 0,
    errors,
    warnings,
    stats: {
      contradictionCount,
      staleEdgeCount,
      orphanedNodeCount: orphanedNodeIds.length,
      maxPropagationDepth,
      hotspotCount,
    },
  };
}

// ---------------------------------------------------------------------------
// Hotspot detection
// ---------------------------------------------------------------------------

/**
 * Detect "hotspot" nodes — areas with high contradiction/block density.
 */
export function detectHotspots(
  graph: CgxGraph,
  overlay: SemanticEdgeOverlay,
  minScore?: number,
): GraphHotspot[] {
  const threshold = minScore ?? 0.5;
  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));
  const hotspots: GraphHotspot[] = [];

  for (const node of graph.nodes) {
    const incoming = overlay.edges.filter((e) => e.toNodeId === node.id);
    const outgoing = overlay.edges.filter((e) => e.fromNodeId === node.id);
    const allEdges = [...incoming, ...outgoing];

    const contradictionCount = allEdges.filter(
      (e) => e.type === "CONTRADICTS" || e.type === "CONFLICTS_WITH",
    ).length;
    const blockCount = allEdges.filter((e) => e.type === "BLOCKS").length;

    // Risk score based on problem edge density
    const totalEdges = allEdges.length;
    const problemEdges = contradictionCount + blockCount;
    const riskScore = totalEdges > 0 ? problemEdges / totalEdges : 0;

    if (riskScore >= threshold || contradictionCount >= 2) {
      hotspots.push({
        nodeId: node.id,
        nodeLabel: node.label,
        contradictionCount,
        blockCount,
        incomingEdgeCount: incoming.length,
        outgoingEdgeCount: outgoing.length,
        riskScore: Number(riskScore.toFixed(4)),
      });
    }
  }

  return hotspots.sort((a, b) => (b.riskScore - a.riskScore) || a.nodeId.localeCompare(b.nodeId));
}

// ---------------------------------------------------------------------------
// Markdown rendering
// ---------------------------------------------------------------------------

export function renderPropagationMarkdown(result: PropagationResult): string {
  const lines: string[] = [
    "# Risk Propagation Report",
    "",
    `- Source node: ${result.sourceNodeId}`,
    `- Blast radius: ${(result.blastRadius * 100).toFixed(1)}%`,
    `- Affected nodes: ${result.affectedNodes.length}`,
    "",
  ];

  if (result.affectedNodes.length > 0) {
    lines.push("## Affected Nodes");
    lines.push("| Node | Risk Score | Hops | Edge Types | Reason |");
    lines.push("|---|---:|---:|---|---|");
    for (const n of result.affectedNodes.slice(0, 20)) {
      const label = n.nodeLabel.length > 30 ? `${n.nodeLabel.slice(0, 27)}...` : n.nodeLabel;
      lines.push(
        `| ${label} | ${n.riskScore.toFixed(3)} | ${n.pathLength} | ${n.pathEdgeTypes.join("→")} | ${n.reason.slice(0, 50)} |`,
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function renderGraphDiffMarkdown(diff: GraphDiffResult): string {
  const lines: string[] = [
    "# Graph Diff Report",
    "",
    `- Summary: ${diff.summary}`,
    `- Trust impact: ${diff.trustImpact > 0 ? "+" : ""}${diff.trustImpact} (${diff.trustImpact >= 0 ? "safer" : "riskier"})`,
    "",
  ];

  if (diff.nodesAdded.length > 0) {
    lines.push(`## Nodes Added (${diff.nodesAdded.length})`);
    for (const id of diff.nodesAdded.slice(0, 10)) {
      lines.push(`- ${id}`);
    }
    lines.push("");
  }

  if (diff.nodesRemoved.length > 0) {
    lines.push(`## Nodes Removed (${diff.nodesRemoved.length})`);
    for (const id of diff.nodesRemoved.slice(0, 10)) {
      lines.push(`- ${id}`);
    }
    lines.push("");
  }

  if (diff.nodesModified.length > 0) {
    lines.push(`## Nodes Modified (${diff.nodesModified.length})`);
    for (const id of diff.nodesModified.slice(0, 10)) {
      lines.push(`- ${id}`);
    }
    lines.push("");
  }

  if (diff.edgesAdded.length > 0) {
    lines.push(`## Semantic Edges Added (${diff.edgesAdded.length})`);
    for (const id of diff.edgesAdded.slice(0, 10)) {
      lines.push(`- ${id}`);
    }
    lines.push("");
  }

  if (diff.edgesRemoved.length > 0) {
    lines.push(`## Semantic Edges Removed (${diff.edgesRemoved.length})`);
    for (const id of diff.edgesRemoved.slice(0, 10)) {
      lines.push(`- ${id}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function renderIntegrityCheckMarkdown(result: GraphIntegrityCheckResult): string {
  const lines: string[] = [
    "# Graph Integrity Check",
    "",
    `- Status: ${result.pass ? "PASS ✓" : "FAIL ✗"}`,
    `- Contradictions: ${result.stats.contradictionCount}`,
    `- Stale edges: ${result.stats.staleEdgeCount}`,
    `- Orphaned nodes: ${result.stats.orphanedNodeCount}`,
    `- Max propagation depth: ${result.stats.maxPropagationDepth}`,
    `- Hotspots: ${result.stats.hotspotCount}`,
    "",
  ];

  if (result.errors.length > 0) {
    lines.push("## Errors");
    for (const e of result.errors) {
      lines.push(`- ${e}`);
    }
    lines.push("");
  }

  if (result.warnings.length > 0) {
    lines.push("## Warnings");
    for (const w of result.warnings) {
      lines.push(`- ${w}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
