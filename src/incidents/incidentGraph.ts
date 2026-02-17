import { randomUUID } from "node:crypto";
import { sha256Hex } from "../utils/hash.js";
import { canonicalize } from "../utils/json.js";
import { signHexDigest } from "../crypto/keys.js";
import type { CausalEdge, Incident, CausalRelationship } from "./incidentTypes.js";

interface AddCausalEdgeParams {
  fromEventId: string;
  toEventId: string;
  relationship: CausalRelationship;
  confidence: number;
  evidence: string[];
  addedBy: "AUTO" | "OWNER" | "AUDITOR";
  privateKeyPem: string;
}

function addCausalEdge(incident: Incident, params: AddCausalEdgeParams): CausalEdge {
  const edge: CausalEdge = {
    edgeId: `edge_${randomUUID().replace(/-/g, "")}`,
    fromEventId: params.fromEventId,
    toEventId: params.toEventId,
    relationship: params.relationship,
    confidence: Math.max(0, Math.min(1, params.confidence)),
    evidence: params.evidence,
    addedTs: Date.now(),
    addedBy: params.addedBy,
    signature: ""
  };

  const digest = sha256Hex(
    canonicalize({
      edge_id: edge.edgeId,
      from_event_id: edge.fromEventId,
      to_event_id: edge.toEventId,
      relationship: edge.relationship,
      confidence: edge.confidence,
      evidence: edge.evidence,
      added_ts: edge.addedTs,
      added_by: edge.addedBy
    })
  );

  edge.signature = signHexDigest(digest, params.privateKeyPem);
  return edge;
}

function removeCausalEdge(incident: Incident, edgeId: string): Incident {
  return {
    ...incident,
    causalEdges: incident.causalEdges.filter((edge) => edge.edgeId !== edgeId),
    updatedTs: Date.now()
  };
}

function getRootCauses(incident: Incident): string[] {
  const toEventIds = new Set(incident.causalEdges.map((edge) => edge.toEventId));
  const rootEventIds = incident.causalEdges
    .map((edge) => edge.fromEventId)
    .filter((eventId) => !toEventIds.has(eventId));

  // Include events with no incoming CAUSED edges
  const uniqueRoots = new Set<string>();
  for (const edge of incident.causalEdges) {
    if (edge.relationship === "CAUSED") {
      if (!incident.causalEdges.some((e) => e.relationship === "CAUSED" && e.toEventId === edge.fromEventId)) {
        uniqueRoots.add(edge.fromEventId);
      }
    }
  }

  return Array.from(uniqueRoots).sort();
}

function getImpactChain(incident: Incident, startEventId: string): string[] {
  const visited = new Set<string>();
  const queue = [startEventId];
  const chain: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) {
      continue;
    }
    visited.add(current);
    chain.push(current);

    // Find all downstream events
    for (const edge of incident.causalEdges) {
      if (edge.fromEventId === current && !visited.has(edge.toEventId)) {
        queue.push(edge.toEventId);
      }
    }
  }

  return chain;
}

function getCausalDepth(incident: Incident): number {
  if (incident.causalEdges.length === 0) {
    return 0;
  }

  // Build adjacency list
  const adj = new Map<string, string[]>();
  for (const edge of incident.causalEdges) {
    if (!adj.has(edge.fromEventId)) {
      adj.set(edge.fromEventId, []);
    }
    adj.get(edge.fromEventId)!.push(edge.toEventId);
  }

  // Find root nodes (no incoming edges)
  const hasIncoming = new Set<string>();
  for (const edge of incident.causalEdges) {
    hasIncoming.add(edge.toEventId);
  }

  const roots: string[] = [];
  for (const [node] of adj) {
    if (!hasIncoming.has(node)) {
      roots.push(node);
    }
  }

  // If no roots, all nodes are in cycles (invalid DAG)
  if (roots.length === 0) {
    return -1;
  }

  // DFS to find max depth
  let maxDepth = 0;
  const visited = new Set<string>();

  function dfs(node: string, depth: number): void {
    if (visited.has(node)) {
      return;
    }
    visited.add(node);
    maxDepth = Math.max(maxDepth, depth);

    const neighbors = adj.get(node) ?? [];
    for (const next of neighbors) {
      dfs(next, depth + 1);
    }
  }

  for (const root of roots) {
    dfs(root, 0);
  }

  return maxDepth;
}

function validateCausalDAG(incident: Incident): { valid: boolean; cycles: string[][] } {
  if (incident.causalEdges.length === 0) {
    return { valid: true, cycles: [] };
  }

  const adj = new Map<string, Set<string>>();
  const allNodes = new Set<string>();

  for (const edge of incident.causalEdges) {
    if (!adj.has(edge.fromEventId)) {
      adj.set(edge.fromEventId, new Set());
    }
    adj.get(edge.fromEventId)!.add(edge.toEventId);
    allNodes.add(edge.fromEventId);
    allNodes.add(edge.toEventId);
  }

  // Add all nodes to adjacency list
  for (const node of allNodes) {
    if (!adj.has(node)) {
      adj.set(node, new Set());
    }
  }

  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const colors = new Map<string, number>();
  const cycles: string[][] = [];

  function hasCycleDFS(node: string, path: string[]): boolean {
    colors.set(node, GRAY);
    path.push(node);

    const neighbors = adj.get(node) ?? new Set();
    for (const neighbor of neighbors) {
      const color = colors.get(neighbor) ?? WHITE;
      if (color === WHITE) {
        if (hasCycleDFS(neighbor, [...path])) {
          return true;
        }
      } else if (color === GRAY) {
        // Found a cycle
        const cycleStart = path.indexOf(neighbor);
        if (cycleStart >= 0) {
          cycles.push([...path.slice(cycleStart), neighbor]);
        }
        return true;
      }
    }

    colors.set(node, BLACK);
    return false;
  }

  for (const node of allNodes) {
    if ((colors.get(node) ?? WHITE) === WHITE) {
      if (hasCycleDFS(node, [])) {
        return { valid: false, cycles };
      }
    }
  }

  return { valid: cycles.length === 0, cycles };
}

export const IncidentGraph = {
  addCausalEdge,
  removeCausalEdge,
  getRootCauses,
  getImpactChain,
  getCausalDepth,
  validateCausalDAG
};
