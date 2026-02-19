import { randomUUID } from 'node:crypto';

export interface GraphNode { id: string; entity: string; type: string; }
export interface GraphEdge { from: string; to: string; relation: string; }
export interface KnowledgeNode { id: string; label: string; relations: string[]; }

export class KnowledgeGraph {
  private nodes = new Map<string, GraphNode>();
  private adjacency = new Map<string, GraphEdge[]>();

  addNode(entity: string, type: string): GraphNode {
    const existing = [...this.nodes.values()].find(n => n.entity === entity);
    if (existing) return existing;
    const node: GraphNode = { id: randomUUID(), entity, type };
    this.nodes.set(node.id, node);
    this.adjacency.set(node.id, []);
    return node;
  }

  addEdge(from: string, to: string, relation: string): GraphEdge {
    const edge: GraphEdge = { from, to, relation };
    if (!this.adjacency.has(from)) this.adjacency.set(from, []);
    this.adjacency.get(from)!.push(edge);
    return edge;
  }

  query(entity: string): { node: GraphNode | undefined; edges: GraphEdge[] } {
    const node = [...this.nodes.values()].find(n => n.entity === entity);
    if (!node) return { node: undefined, edges: [] };
    return { node, edges: this.adjacency.get(node.id) ?? [] };
  }

  findPath(from: string, to: string): string[] | null {
    const fromNode = [...this.nodes.values()].find(n => n.entity === from);
    const toNode = [...this.nodes.values()].find(n => n.entity === to);
    if (!fromNode || !toNode) return null;
    const visited = new Set<string>();
    const queue: { id: string; path: string[] }[] = [{ id: fromNode.id, path: [fromNode.entity] }];
    while (queue.length > 0) {
      const { id, path } = queue.shift()!;
      if (id === toNode.id) return path;
      if (visited.has(id)) continue;
      visited.add(id);
      for (const edge of this.adjacency.get(id) ?? []) {
        const nextNode = this.nodes.get(edge.to);
        if (nextNode && !visited.has(edge.to)) queue.push({ id: edge.to, path: [...path, nextNode.entity] });
      }
    }
    return null;
  }
}

export function addKnowledgeNode(label: string): KnowledgeNode {
  return { id: randomUUID(), label, relations: [] };
}
