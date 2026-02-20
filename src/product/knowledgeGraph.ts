/**
 * knowledgeGraph.ts — Entity/relationship graph with BFS shortest path,
 * subgraph extraction, neighbor traversal, and statistics.
 */

import { randomUUID } from 'node:crypto';

/* ── Interfaces ──────────────────────────────────────────────────── */

export type EntityType = 'customer' | 'contract' | 'invoice' | 'product' | 'contact' | 'task' | 'workflow' | 'generic';
export type RelType = 'has_contract' | 'has_invoice' | 'references' | 'relates_to' | 'depends_on' | 'owns';

export interface KGEntity {
  entityId: string;
  entityType: EntityType;
  name: string;
  properties: Record<string, unknown>;
  createdAt: number;
}

export interface KGRelationship {
  relId: string;
  fromEntityId: string;
  toEntityId: string;
  relType: RelType;
  weight: number;
  createdAt: number;
}

export interface GraphPath {
  nodes: KGEntity[];
  relationships: KGRelationship[];
  length: number;
  totalWeight: number;
}

/** Backward-compat shape from stubs.ts */
export interface KnowledgeNode { id: string; label: string; relations: string[]; }

/* ── Class ───────────────────────────────────────────────────────── */

export class KnowledgeGraph {
  private entities = new Map<string, KGEntity>();
  private relationships = new Map<string, KGRelationship>();
  private outgoing = new Map<string, KGRelationship[]>();
  private incoming = new Map<string, KGRelationship[]>();

  addEntity(type: EntityType, name: string, properties: Record<string, unknown> = {}): KGEntity {
    const entity: KGEntity = {
      entityId: randomUUID(), entityType: type, name, properties,
      createdAt: Date.now(),
    };
    this.entities.set(entity.entityId, entity);
    this.outgoing.set(entity.entityId, []);
    this.incoming.set(entity.entityId, []);
    return entity;
  }

  getEntity(entityId: string): KGEntity | undefined {
    return this.entities.get(entityId);
  }

  findEntities(type?: EntityType, name?: string): KGEntity[] {
    let results = [...this.entities.values()];
    if (type) results = results.filter(e => e.entityType === type);
    if (name) {
      const lower = name.toLowerCase();
      results = results.filter(e => e.name.toLowerCase().includes(lower));
    }
    return results;
  }

  addRelationship(fromId: string, toId: string, relType: RelType, weight = 1.0): KGRelationship {
    if (!this.entities.has(fromId)) throw new Error(`Entity ${fromId} not found`);
    if (!this.entities.has(toId)) throw new Error(`Entity ${toId} not found`);
    const rel: KGRelationship = {
      relId: randomUUID(), fromEntityId: fromId, toEntityId: toId,
      relType, weight, createdAt: Date.now(),
    };
    this.relationships.set(rel.relId, rel);
    this.outgoing.get(fromId)!.push(rel);
    this.incoming.get(toId)!.push(rel);
    return rel;
  }

  getNeighbors(entityId: string, direction: 'out' | 'in' | 'both' = 'both'): KGEntity[] {
    const ids = new Set<string>();
    if (direction === 'out' || direction === 'both') {
      for (const rel of this.outgoing.get(entityId) ?? []) ids.add(rel.toEntityId);
    }
    if (direction === 'in' || direction === 'both') {
      for (const rel of this.incoming.get(entityId) ?? []) ids.add(rel.fromEntityId);
    }
    return [...ids].map(id => this.entities.get(id)!).filter(Boolean);
  }

  /** BFS shortest path */
  shortestPath(fromId: string, toId: string, maxDepth = 10): GraphPath | null {
    if (!this.entities.has(fromId) || !this.entities.has(toId)) return null;
    if (fromId === toId) {
      return { nodes: [this.entities.get(fromId)!], relationships: [], length: 0, totalWeight: 0 };
    }

    const visited = new Set<string>();
    const queue: Array<{ entityId: string; path: string[]; rels: KGRelationship[] }> = [
      { entityId: fromId, path: [fromId], rels: [] },
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.path.length - 1 > maxDepth) continue;
      if (visited.has(current.entityId)) continue;
      visited.add(current.entityId);

      const outRels = this.outgoing.get(current.entityId) ?? [];
      const inRels = this.incoming.get(current.entityId) ?? [];
      const allRels = [...outRels, ...inRels.map(r => ({
        ...r, fromEntityId: r.toEntityId, toEntityId: r.fromEntityId,
      }))];

      for (const rel of allRels) {
        const nextId = rel.toEntityId;
        if (visited.has(nextId)) continue;
        const origRel = this.relationships.get(rel.relId) ?? rel;
        const newPath = [...current.path, nextId];
        const newRels = [...current.rels, origRel];

        if (nextId === toId) {
          const nodes = newPath.map(id => this.entities.get(id)!);
          const totalWeight = newRels.reduce((sum, r) => sum + r.weight, 0);
          return { nodes, relationships: newRels, length: newRels.length, totalWeight };
        }

        queue.push({ entityId: nextId, path: newPath, rels: newRels });
      }
    }
    return null;
  }

  /** Get subgraph around an entity via BFS */
  getSubgraph(entityId: string, depth = 2): { entities: KGEntity[]; relationships: KGRelationship[] } {
    const entityIds = new Set<string>();
    const relIds = new Set<string>();
    const queue: Array<{ id: string; d: number }> = [{ id: entityId, d: 0 }];

    while (queue.length > 0) {
      const { id, d } = queue.shift()!;
      if (entityIds.has(id)) continue;
      entityIds.add(id);
      if (d >= depth) continue;

      for (const rel of this.outgoing.get(id) ?? []) {
        relIds.add(rel.relId);
        if (!entityIds.has(rel.toEntityId)) queue.push({ id: rel.toEntityId, d: d + 1 });
      }
      for (const rel of this.incoming.get(id) ?? []) {
        relIds.add(rel.relId);
        if (!entityIds.has(rel.fromEntityId)) queue.push({ id: rel.fromEntityId, d: d + 1 });
      }
    }

    return {
      entities: [...entityIds].map(id => this.entities.get(id)!),
      relationships: [...relIds].map(id => this.relationships.get(id)!),
    };
  }

  getStats(): { entities: number; relationships: number; entityTypes: Record<string, number> } {
    const entityTypes: Record<string, number> = {};
    for (const e of this.entities.values()) {
      entityTypes[e.entityType] = (entityTypes[e.entityType] ?? 0) + 1;
    }
    return { entities: this.entities.size, relationships: this.relationships.size, entityTypes };
  }
}

/* ── Legacy compat ───────────────────────────────────────────────── */

export function addKnowledgeNode(label: string): KnowledgeNode {
  return { id: randomUUID(), label, relations: [] };
}
