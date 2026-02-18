import { describe, expect, test } from "vitest";
import {
  createSemanticOverlay,
  addSemanticEdge,
  verifySemanticEdge,
  markStaleEdges,
  simulateRiskPropagation,
  diffGraphs,
  checkGraphIntegrity,
  detectHotspots,
  renderPropagationMarkdown,
  renderGraphDiffMarkdown,
  renderIntegrityCheckMarkdown,
  type SemanticEdgeOverlay,
  type SemanticEdge,
} from "../src/cgx/cgxPropagation.js";
import type { CgxGraph } from "../src/cgx/cgxSchema.js";

function makeGraph(nodes: Array<{ id: string; label: string }>, edges?: any[]): CgxGraph {
  return {
    v: 1,
    scope: { type: "workspace", id: "ws-1" },
    generatedTs: Date.now(),
    policySha256: "a".repeat(64),
    nodes: nodes.map((n) => ({
      id: n.id,
      type: "Agent" as const,
      hash: `h_${n.id}`.padEnd(64, "0"),
      label: n.label,
    })),
    edges: edges ?? [],
    stats: {
      nodeCount: nodes.length,
      edgeCount: edges?.length ?? 0,
    },
  };
}

// ---------------------------------------------------------------------------
// Semantic overlay creation
// ---------------------------------------------------------------------------
describe("createSemanticOverlay", () => {
  test("creates empty overlay from base graph", () => {
    const graph = makeGraph([{ id: "n1", label: "Node 1" }]);
    const overlay = createSemanticOverlay(graph);
    expect(overlay.v).toBe(1);
    expect(overlay.baseGraphHash).toBeTruthy();
    expect(overlay.edges.length).toBe(0);
    expect(overlay.stats.edgeCount).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Adding semantic edges
// ---------------------------------------------------------------------------
describe("addSemanticEdge", () => {
  test("adds edge and updates stats", () => {
    const graph = makeGraph([
      { id: "n1", label: "Policy A" },
      { id: "n2", label: "Policy B" },
    ]);
    const overlay = createSemanticOverlay(graph);

    const edge = addSemanticEdge(overlay, {
      type: "REQUIRES",
      fromNodeId: "n1",
      toNodeId: "n2",
      description: "Policy A requires Policy B to be active",
    });

    expect(edge.edgeId).toMatch(/^se_/);
    expect(edge.type).toBe("REQUIRES");
    expect(edge.hash).toBeTruthy();
    expect(overlay.edges.length).toBe(1);
    expect(overlay.stats.edgeCount).toBe(1);
  });

  test("tracks contradictions in stats", () => {
    const graph = makeGraph([
      { id: "n1", label: "A" },
      { id: "n2", label: "B" },
    ]);
    const overlay = createSemanticOverlay(graph);

    addSemanticEdge(overlay, {
      type: "CONTRADICTS",
      fromNodeId: "n1",
      toNodeId: "n2",
      description: "A contradicts B",
    });

    expect(overlay.stats.contradictionCount).toBe(1);
  });

  test("tracks blocks in stats", () => {
    const graph = makeGraph([
      { id: "n1", label: "A" },
      { id: "n2", label: "B" },
    ]);
    const overlay = createSemanticOverlay(graph);

    addSemanticEdge(overlay, {
      type: "BLOCKS",
      fromNodeId: "n1",
      toNodeId: "n2",
      description: "A blocks B",
    });

    expect(overlay.stats.blockCount).toBe(1);
  });

  test("uses custom confidence and impact weight", () => {
    const graph = makeGraph([{ id: "n1", label: "A" }, { id: "n2", label: "B" }]);
    const overlay = createSemanticOverlay(graph);

    const edge = addSemanticEdge(overlay, {
      type: "WEAKENS",
      fromNodeId: "n1",
      toNodeId: "n2",
      confidence: 0.5,
      impactWeight: 0.9,
      description: "A weakens B significantly",
    });

    expect(edge.confidence).toBe(0.5);
    expect(edge.impactWeight).toBe(0.9);
  });

  test("produces deterministic hash for semantically identical edges", () => {
    const graph = makeGraph([{ id: "n1", label: "A" }, { id: "n2", label: "B" }]);
    const overlayA = createSemanticOverlay(graph);
    const overlayB = createSemanticOverlay(graph);

    const edgeA = addSemanticEdge(overlayA, {
      type: "REQUIRES",
      fromNodeId: "n1",
      toNodeId: "n2",
      confidence: 0.7,
      impactWeight: 0.6,
      description: "same relationship",
    });

    const edgeB = addSemanticEdge(overlayB, {
      type: "REQUIRES",
      fromNodeId: "n1",
      toNodeId: "n2",
      confidence: 0.7,
      impactWeight: 0.6,
      description: "same relationship",
    });

    expect(edgeA.edgeId).not.toBe(edgeB.edgeId);
    expect(edgeA.hash).toBe(edgeB.hash);
  });
});

// ---------------------------------------------------------------------------
// Edge verification and staleness
// ---------------------------------------------------------------------------
describe("verifySemanticEdge", () => {
  test("marks edge as verified", () => {
    const graph = makeGraph([{ id: "n1", label: "A" }, { id: "n2", label: "B" }]);
    const overlay = createSemanticOverlay(graph);
    const edge = addSemanticEdge(overlay, {
      type: "REQUIRES",
      fromNodeId: "n1",
      toNodeId: "n2",
      description: "test",
    });

    expect(edge.verifiedTs).toBeNull();
    const result = verifySemanticEdge(overlay, edge.edgeId);
    expect(result).toBe(true);
    expect(overlay.edges[0].verifiedTs).not.toBeNull();
    expect(overlay.edges[0].stale).toBe(false);
  });

  test("returns false for nonexistent edge", () => {
    const graph = makeGraph([]);
    const overlay = createSemanticOverlay(graph);
    expect(verifySemanticEdge(overlay, "nonexistent")).toBe(false);
  });
});

describe("markStaleEdges", () => {
  test("marks old edges as stale", () => {
    const graph = makeGraph([{ id: "n1", label: "A" }, { id: "n2", label: "B" }]);
    const overlay = createSemanticOverlay(graph);
    const edge = addSemanticEdge(overlay, {
      type: "REQUIRES",
      fromNodeId: "n1",
      toNodeId: "n2",
      description: "test",
    });

    // Hack: set createdTs to the past
    overlay.edges[0].createdTs = Date.now() - 100000;

    const stale = markStaleEdges(overlay, 50000); // 50s threshold
    expect(stale).toContain(edge.edgeId);
    expect(overlay.edges[0].stale).toBe(true);
    expect(overlay.stats.staleEdgeCount).toBe(1);
  });

  test("does not mark recent edges as stale", () => {
    const graph = makeGraph([{ id: "n1", label: "A" }, { id: "n2", label: "B" }]);
    const overlay = createSemanticOverlay(graph);
    addSemanticEdge(overlay, {
      type: "REQUIRES",
      fromNodeId: "n1",
      toNodeId: "n2",
      description: "test",
    });

    const stale = markStaleEdges(overlay, 999999999); // huge threshold
    expect(stale.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Risk propagation
// ---------------------------------------------------------------------------
describe("simulateRiskPropagation", () => {
  test("propagates risk through REQUIRES edges", () => {
    const graph = makeGraph([
      { id: "n1", label: "Core Module" },
      { id: "n2", label: "Dependent A" },
      { id: "n3", label: "Dependent B" },
    ]);
    const overlay = createSemanticOverlay(graph);

    addSemanticEdge(overlay, {
      type: "REQUIRES",
      fromNodeId: "n1",
      toNodeId: "n2",
      description: "Core → A",
      impactWeight: 0.8,
    });
    addSemanticEdge(overlay, {
      type: "REQUIRES",
      fromNodeId: "n2",
      toNodeId: "n3",
      description: "A → B",
      impactWeight: 0.7,
    });

    const result = simulateRiskPropagation(graph, overlay, "n1");
    expect(result.sourceNodeId).toBe("n1");
    expect(result.affectedNodes.length).toBeGreaterThanOrEqual(1);
    expect(result.blastRadius).toBeGreaterThan(0);
  });

  test("respects maxDepth", () => {
    const graph = makeGraph([
      { id: "n1", label: "A" },
      { id: "n2", label: "B" },
      { id: "n3", label: "C" },
      { id: "n4", label: "D" },
    ]);
    const overlay = createSemanticOverlay(graph);

    addSemanticEdge(overlay, { type: "REQUIRES", fromNodeId: "n1", toNodeId: "n2", description: "1→2", impactWeight: 0.9 });
    addSemanticEdge(overlay, { type: "REQUIRES", fromNodeId: "n2", toNodeId: "n3", description: "2→3", impactWeight: 0.9 });
    addSemanticEdge(overlay, { type: "REQUIRES", fromNodeId: "n3", toNodeId: "n4", description: "3→4", impactWeight: 0.9 });

    const shallow = simulateRiskPropagation(graph, overlay, "n1", { maxDepth: 1 });
    // Should only reach n2 (1 hop)
    expect(shallow.affectedNodes.every((n) => n.pathLength <= 1)).toBe(true);
  });

  test("handles graph with no edges", () => {
    const graph = makeGraph([{ id: "n1", label: "Isolated" }]);
    const overlay = createSemanticOverlay(graph);

    const result = simulateRiskPropagation(graph, overlay, "n1");
    expect(result.affectedNodes.length).toBe(0);
    expect(result.blastRadius).toBe(0);
  });

  test("skips stale edges", () => {
    const graph = makeGraph([
      { id: "n1", label: "A" },
      { id: "n2", label: "B" },
    ]);
    const overlay = createSemanticOverlay(graph);
    const edge = addSemanticEdge(overlay, {
      type: "REQUIRES",
      fromNodeId: "n1",
      toNodeId: "n2",
      description: "stale edge",
    });
    overlay.edges[0].stale = true;

    const result = simulateRiskPropagation(graph, overlay, "n1");
    expect(result.affectedNodes.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Graph diff
// ---------------------------------------------------------------------------
describe("diffGraphs", () => {
  test("detects added and removed nodes", () => {
    const oldGraph = makeGraph([
      { id: "n1", label: "A" },
      { id: "n2", label: "B" },
    ]);
    const newGraph = makeGraph([
      { id: "n1", label: "A" },
      { id: "n3", label: "C" },
    ]);

    const diff = diffGraphs(oldGraph, newGraph);
    expect(diff.nodesAdded).toEqual(["n3"]);
    expect(diff.nodesRemoved).toEqual(["n2"]);
    expect(diff.summary).toContain("+1 nodes");
    expect(diff.summary).toContain("-1 nodes");
  });

  test("detects modified nodes", () => {
    const oldGraph = makeGraph([{ id: "n1", label: "A" }]);
    const newGraph = makeGraph([{ id: "n1", label: "A modified" }]);
    // Different labels → different hashes
    newGraph.nodes[0].hash = "b".repeat(64); // force different hash

    const diff = diffGraphs(oldGraph, newGraph);
    expect(diff.nodesModified).toEqual(["n1"]);
  });

  test("no changes produces empty diff", () => {
    const graph = makeGraph([{ id: "n1", label: "A" }]);
    const diff = diffGraphs(graph, graph);
    expect(diff.summary).toBe("No changes");
    expect(diff.trustImpact).toBe(0);
  });

  test("computes trust impact from contradictions", () => {
    const graph = makeGraph([{ id: "n1", label: "A" }, { id: "n2", label: "B" }]);
    const oldOverlay = createSemanticOverlay(graph);
    const newOverlay = createSemanticOverlay(graph);

    addSemanticEdge(newOverlay, {
      type: "CONTRADICTS",
      fromNodeId: "n1",
      toNodeId: "n2",
      description: "New contradiction",
    });

    const diff = diffGraphs(graph, graph, oldOverlay, newOverlay);
    expect(diff.trustImpact).toBeLessThan(0); // riskier
  });

  test("does not report churn when semantic edges are recreated with different IDs", () => {
    const graph = makeGraph([{ id: "n1", label: "A" }, { id: "n2", label: "B" }]);
    const oldOverlay = createSemanticOverlay(graph);
    const newOverlay = createSemanticOverlay(graph);

    addSemanticEdge(oldOverlay, {
      type: "REQUIRES",
      fromNodeId: "n1",
      toNodeId: "n2",
      confidence: 0.8,
      impactWeight: 0.5,
      description: "A requires B",
    });
    addSemanticEdge(newOverlay, {
      type: "REQUIRES",
      fromNodeId: "n1",
      toNodeId: "n2",
      confidence: 0.8,
      impactWeight: 0.5,
      description: "A requires B",
    });

    const diff = diffGraphs(graph, graph, oldOverlay, newOverlay);
    expect(diff.edgesAdded).toEqual([]);
    expect(diff.edgesRemoved).toEqual([]);
    expect(diff.summary).toBe("No changes");
  });
});

// ---------------------------------------------------------------------------
// Graph integrity
// ---------------------------------------------------------------------------
describe("checkGraphIntegrity", () => {
  test("passes for clean graph", () => {
    const graph = makeGraph([{ id: "n1", label: "A" }]);
    const overlay = createSemanticOverlay(graph);

    const result = checkGraphIntegrity(graph, overlay);
    expect(result.pass).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  test("fails when contradictions exceed max", () => {
    const graph = makeGraph([
      { id: "n1", label: "A" },
      { id: "n2", label: "B" },
    ]);
    const overlay = createSemanticOverlay(graph);

    for (let i = 0; i < 6; i++) {
      addSemanticEdge(overlay, {
        type: "CONTRADICTS",
        fromNodeId: "n1",
        toNodeId: "n2",
        description: `Contradiction ${i}`,
      });
    }

    const result = checkGraphIntegrity(graph, overlay, { maxContradictions: 5 });
    expect(result.pass).toBe(false);
    expect(result.errors.some((e) => e.includes("contradictions"))).toBe(true);
  });

  test("fails when stale edge ratio is too high", () => {
    const graph = makeGraph([{ id: "n1", label: "A" }, { id: "n2", label: "B" }]);
    const overlay = createSemanticOverlay(graph);

    addSemanticEdge(overlay, { type: "REQUIRES", fromNodeId: "n1", toNodeId: "n2", description: "test" });
    overlay.edges[0].stale = true;
    overlay.stats.staleEdgeCount = 1;

    const result = checkGraphIntegrity(graph, overlay, { maxStaleEdgeRatio: 0.5 });
    expect(result.pass).toBe(false);
    expect(result.errors.some((e) => e.includes("Stale edge ratio"))).toBe(true);
  });

  test("warns on contradictions below max", () => {
    const graph = makeGraph([{ id: "n1", label: "A" }, { id: "n2", label: "B" }]);
    const overlay = createSemanticOverlay(graph);

    addSemanticEdge(overlay, {
      type: "CONTRADICTS",
      fromNodeId: "n1",
      toNodeId: "n2",
      description: "One contradiction",
    });

    const result = checkGraphIntegrity(graph, overlay, { maxContradictions: 5 });
    expect(result.pass).toBe(true);
    expect(result.warnings.some((w) => w.includes("contradiction"))).toBe(true);
  });

  test("warns when orphaned node references exist but are within limit", () => {
    const graph = makeGraph([{ id: "n1", label: "A" }]);
    const overlay = createSemanticOverlay(graph);

    addSemanticEdge(overlay, {
      type: "REQUIRES",
      fromNodeId: "n1",
      toNodeId: "n-missing",
      description: "dangling",
    });

    const result = checkGraphIntegrity(graph, overlay, { maxOrphanedNodes: 5 });
    expect(result.pass).toBe(true);
    expect(result.warnings.some((w) => w.includes("orphaned node reference"))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Hotspot detection
// ---------------------------------------------------------------------------
describe("detectHotspots", () => {
  test("detects nodes with high contradiction density", () => {
    const graph = makeGraph([
      { id: "n1", label: "Hotspot" },
      { id: "n2", label: "Normal" },
      { id: "n3", label: "Normal 2" },
    ]);
    const overlay = createSemanticOverlay(graph);

    addSemanticEdge(overlay, { type: "CONTRADICTS", fromNodeId: "n1", toNodeId: "n2", description: "c1" });
    addSemanticEdge(overlay, { type: "CONTRADICTS", fromNodeId: "n1", toNodeId: "n3", description: "c2" });

    const hotspots = detectHotspots(graph, overlay, 0.0);
    expect(hotspots.length).toBeGreaterThan(0);
    const hotspot = hotspots.find((h) => h.nodeId === "n1");
    expect(hotspot).toBeDefined();
    expect(hotspot!.contradictionCount).toBe(2);
  });

  test("returns empty for clean graph", () => {
    const graph = makeGraph([{ id: "n1", label: "A" }]);
    const overlay = createSemanticOverlay(graph);

    const hotspots = detectHotspots(graph, overlay);
    expect(hotspots.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Markdown rendering
// ---------------------------------------------------------------------------
describe("markdown rendering", () => {
  test("renderPropagationMarkdown produces valid output", () => {
    const result = {
      sourceNodeId: "n1",
      affectedNodes: [
        { nodeId: "n2", nodeLabel: "Node 2", riskScore: 0.6, pathLength: 1, pathEdgeTypes: ["REQUIRES" as const], reason: "Risk propagated" },
      ],
      blastRadius: 0.5,
      chains: [],
    };

    const md = renderPropagationMarkdown(result);
    expect(md).toContain("# Risk Propagation Report");
    expect(md).toContain("Blast radius: 50.0%");
    expect(md).toContain("Node 2");
  });

  test("renderGraphDiffMarkdown produces valid output", () => {
    const diff = {
      nodesAdded: ["n3"],
      nodesRemoved: ["n2"],
      nodesModified: [],
      edgesAdded: ["se_1"],
      edgesRemoved: ["se_2"],
      summary: "+1 nodes, -1 nodes",
      trustImpact: 0,
    };

    const md = renderGraphDiffMarkdown(diff);
    expect(md).toContain("# Graph Diff Report");
    expect(md).toContain("Nodes Added");
    expect(md).toContain("Nodes Removed");
    expect(md).toContain("Semantic Edges Added");
    expect(md).toContain("Semantic Edges Removed");
  });

  test("renderIntegrityCheckMarkdown produces valid output", () => {
    const result = {
      pass: true,
      errors: [],
      warnings: ["1 contradiction detected"],
      stats: {
        contradictionCount: 1,
        staleEdgeCount: 0,
        orphanedNodeCount: 0,
        maxPropagationDepth: 2,
        hotspotCount: 0,
      },
    };

    const md = renderIntegrityCheckMarkdown(result);
    expect(md).toContain("# Graph Integrity Check");
    expect(md).toContain("PASS");
    expect(md).toContain("## Warnings");
  });
});
