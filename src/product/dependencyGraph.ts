/**
 * dependencyGraph.ts — DAG analysis with topological sort, cycle detection,
 * critical-path calculation, and execution-layer planning.
 */

export interface DepGraph {
  nodes: string[];
  edges: Array<[string, string]>;
}

export interface CycleInfo {
  hasCycle: boolean;
  cycle: string[];
}

export interface TopoSortResult {
  sorted: string[];
  hasCycle: boolean;
  cycle: string[];
}

export interface CriticalPathResult {
  path: string[];
  length: number;
}

export interface ExecutionLayer {
  layer: number;
  nodes: string[];
}

/* ── Build adjacency ─────────────────────────────────────────────── */

export function buildDependencyGraph(modules: Record<string, string[]>): DepGraph {
  const nodes = Object.keys(modules);
  const edges: Array<[string, string]> = [];
  for (const [mod, deps] of Object.entries(modules)) {
    for (const dep of deps) edges.push([mod, dep]);
  }
  return { nodes, edges };
}

/* ── Adjacency helpers ───────────────────────────────────────────── */

function adjList(graph: DepGraph): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const n of graph.nodes) adj.set(n, []);
  for (const [from, to] of graph.edges) {
    if (!adj.has(from)) adj.set(from, []);
    adj.get(from)!.push(to);
    if (!adj.has(to)) adj.set(to, []);
  }
  return adj;
}

function inDegreeMap(graph: DepGraph): Map<string, number> {
  const deg = new Map<string, number>();
  for (const n of graph.nodes) deg.set(n, 0);
  for (const [, to] of graph.edges) {
    deg.set(to, (deg.get(to) ?? 0) + 1);
  }
  return deg;
}

/* ── Kahn's topological sort ─────────────────────────────────────── */

export function topoSort(graph: DepGraph): TopoSortResult {
  const adj = adjList(graph);
  const deg = inDegreeMap(graph);
  const queue: string[] = [];
  for (const [n, d] of deg) if (d === 0) queue.push(n);

  const sorted: string[] = [];
  while (queue.length > 0) {
    queue.sort();
    const node = queue.shift()!;
    sorted.push(node);
    for (const neighbour of adj.get(node) ?? []) {
      const newDeg = (deg.get(neighbour) ?? 1) - 1;
      deg.set(neighbour, newDeg);
      if (newDeg === 0) queue.push(neighbour);
    }
  }

  if (sorted.length !== new Set([...graph.nodes, ...graph.edges.flat()]).size) {
    const cycle = detectCycle(graph);
    return { sorted, hasCycle: true, cycle: cycle.cycle };
  }
  return { sorted, hasCycle: false, cycle: [] };
}

/* ── DFS cycle detection ─────────────────────────────────────────── */

export function detectCycle(graph: DepGraph): CycleInfo {
  const adj = adjList(graph);
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();
  const parent = new Map<string, string | null>();
  for (const n of adj.keys()) color.set(n, WHITE);

  for (const start of adj.keys()) {
    if (color.get(start) !== WHITE) continue;
    const stack: string[] = [start];
    while (stack.length > 0) {
      const node = stack[stack.length - 1]!;
      if (color.get(node) === WHITE) {
        color.set(node, GRAY);
        for (const nb of adj.get(node) ?? []) {
          if (color.get(nb) === GRAY) {
            const cycle: string[] = [nb, node];
            let cur = node;
            while (cur !== nb && parent.has(cur)) {
              cur = parent.get(cur)!;
              cycle.push(cur);
            }
            cycle.reverse();
            return { hasCycle: true, cycle };
          }
          if (color.get(nb) === WHITE) {
            parent.set(nb, node);
            stack.push(nb);
          }
        }
      } else {
        color.set(node, BLACK);
        stack.pop();
      }
    }
  }
  return { hasCycle: false, cycle: [] };
}

/* ── Critical path (longest path in DAG) ─────────────────────────── */

export function criticalPath(graph: DepGraph, weights?: Map<string, number>): CriticalPathResult {
  const result = topoSort(graph);
  if (result.hasCycle) return { path: [], length: 0 };

  const adj = adjList(graph);
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  for (const n of result.sorted) { dist.set(n, 0); prev.set(n, null); }

  for (const node of result.sorted) {
    const w = weights?.get(node) ?? 1;
    for (const nb of adj.get(node) ?? []) {
      const newDist = (dist.get(node) ?? 0) + w;
      if (newDist > (dist.get(nb) ?? 0)) {
        dist.set(nb, newDist);
        prev.set(nb, node);
      }
    }
  }

  let maxNode = result.sorted[0] ?? '';
  let maxDist = 0;
  for (const [n, d] of dist) {
    if (d > maxDist) { maxDist = d; maxNode = n; }
  }

  const path: string[] = [];
  let cur: string | null = maxNode;
  while (cur !== null) { path.unshift(cur); cur = prev.get(cur) ?? null; }

  return { path, length: maxDist + (weights?.get(maxNode) ?? 1) };
}

/* ── Execution layers (parallelism planner) ──────────────────────── */

export function executionLayers(graph: DepGraph): ExecutionLayer[] {
  const adj = adjList(graph);
  const deg = inDegreeMap(graph);
  const layers: ExecutionLayer[] = [];
  const remaining = new Set(graph.nodes);

  let layer = 0;
  while (remaining.size > 0) {
    const ready: string[] = [];
    for (const n of remaining) {
      if ((deg.get(n) ?? 0) === 0) ready.push(n);
    }
    if (ready.length === 0) break;
    ready.sort();
    layers.push({ layer, nodes: ready });
    for (const n of ready) {
      remaining.delete(n);
      for (const nb of adj.get(n) ?? []) {
        deg.set(nb, (deg.get(nb) ?? 1) - 1);
      }
    }
    layer++;
  }
  return layers;
}
