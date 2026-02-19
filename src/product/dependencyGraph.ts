export interface DepGraph { nodes: string[]; edges: Array<[string, string]>; }

export function buildDependencyGraph(modules: Record<string, string[]>): DepGraph {
  const nodes = Object.keys(modules);
  const edges: Array<[string, string]> = [];
  for (const [mod, deps] of Object.entries(modules)) { for (const dep of deps) edges.push([mod, dep]); }
  return { nodes, edges };
}
