import { loadLatestCgxGraph } from "./cgxStore.js";
import type { CgxGraph, CgxScope } from "./cgxSchema.js";

export function queryCgxGraph(params: {
  workspace: string;
  scope: CgxScope;
  nodeType?: CgxGraph["nodes"][number]["type"];
  nodeId?: string;
}): {
  graph: CgxGraph | null;
  nodes: CgxGraph["nodes"];
  edges: CgxGraph["edges"];
} {
  const graph = loadLatestCgxGraph(params.workspace, params.scope);
  if (!graph) {
    return {
      graph: null,
      nodes: [],
      edges: []
    };
  }
  let nodes = graph.nodes;
  if (params.nodeType) {
    nodes = nodes.filter((row) => row.type === params.nodeType);
  }
  if (params.nodeId) {
    nodes = nodes.filter((row) => row.id === params.nodeId);
  }
  const ids = new Set(nodes.map((row) => row.id));
  const edges = graph.edges.filter((row) => ids.has(row.from) || ids.has(row.to));
  return {
    graph,
    nodes,
    edges
  };
}
