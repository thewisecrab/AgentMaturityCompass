import type { EvidenceEvent } from "../types.js";
import type { Incident, CausalEdge } from "./incidentTypes.js";

interface TimelineEntry {
  ts: number;
  eventId: string;
  eventType: string;
  eventHash?: string;
  causalLinks: Array<{
    edgeId: string;
    relationship: string;
    targetEventId: string;
    confidence: number;
  }>;
}

interface TimelineJson {
  incidentId: string;
  title: string;
  severity: string;
  state: string;
  entries: TimelineEntry[];
  rootCauses: string[];
  affectedQuestions: string[];
  createdTs: number;
  resolvedTs: number | null;
}

function assembleTimeline(incident: Incident, evidenceEvents: Map<string, EvidenceEvent>): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  const eventIdToEntry = new Map<string, TimelineEntry>();

  // Create entries for each timeline event
  for (const eventId of incident.timelineEventIds) {
    const event = evidenceEvents.get(eventId);
    if (event) {
      const entry: TimelineEntry = {
        ts: event.ts,
        eventId: event.id,
        eventType: event.event_type,
        eventHash: event.event_hash,
        causalLinks: []
      };
      entries.push(entry);
      eventIdToEntry.set(eventId, entry);
    }
  }

  // Add causal links
  for (const edge of incident.causalEdges) {
    const fromEntry = eventIdToEntry.get(edge.fromEventId);
    if (fromEntry) {
      fromEntry.causalLinks.push({
        edgeId: edge.edgeId,
        relationship: edge.relationship,
        targetEventId: edge.toEventId,
        confidence: edge.confidence
      });
    }
  }

  // Sort by timestamp
  entries.sort((a, b) => a.ts - b.ts);

  return entries;
}

function formatTimelineMd(incident: Incident, evidenceEvents: Map<string, EvidenceEvent>): string {
  const entries = assembleTimeline(incident, evidenceEvents);

  // Build root causes set
  const toEventIds = new Set(incident.causalEdges.map((edge) => edge.toEventId));
  const rootEventIds = incident.causalEdges
    .filter((edge) => edge.relationship === "CAUSED" && !toEventIds.has(edge.fromEventId))
    .map((edge) => edge.fromEventId);
  const uniqueRoots = Array.from(new Set(rootEventIds));

  const lines: string[] = [];

  lines.push(`## Incident: ${incident.title} [${incident.severity}/${incident.state}]`);
  lines.push("");
  lines.push(`**ID:** ${incident.incidentId}`);
  lines.push(`**Agent:** ${incident.agentId}`);
  lines.push(`**Created:** ${new Date(incident.createdTs).toISOString()}`);
  if (incident.resolvedTs) {
    lines.push(`**Resolved:** ${new Date(incident.resolvedTs).toISOString()}`);
  }
  lines.push("");

  lines.push("### Description");
  lines.push(incident.description);
  lines.push("");

  if (incident.rootCauseClaimIds.length > 0) {
    lines.push("### Root Cause Claims");
    for (const claimId of incident.rootCauseClaimIds) {
      lines.push(`- ${claimId}`);
    }
    lines.push("");
  }

  if (incident.affectedQuestionIds.length > 0) {
    lines.push("### Affected Questions");
    for (const qId of incident.affectedQuestionIds) {
      lines.push(`- ${qId}`);
    }
    lines.push("");
  }

  lines.push("### Timeline");
  for (const entry of entries) {
    const eventLabel = entry.eventType || "UNKNOWN";
    const ts = new Date(entry.ts).toISOString();
    lines.push(`- [${ts}] ${eventLabel} (${entry.eventId})`);

    if (entry.causalLinks.length > 0) {
      for (const link of entry.causalLinks) {
        const confidence = (link.confidence * 100).toFixed(0);
        lines.push(`  → ${link.relationship} → ${link.targetEventId} (${confidence}% confidence)`);
      }
    }
  }
  lines.push("");

  if (incident.causalEdges.length > 0) {
    lines.push("### Causal Graph");
    const edgesByRelationship = new Map<string, CausalEdge[]>();
    for (const edge of incident.causalEdges) {
      if (!edgesByRelationship.has(edge.relationship)) {
        edgesByRelationship.set(edge.relationship, []);
      }
      edgesByRelationship.get(edge.relationship)!.push(edge);
    }

    for (const [relationship, edges] of edgesByRelationship) {
      for (const edge of edges) {
        lines.push(`${edge.fromEventId} --${edge.relationship}--> ${edge.toEventId}`);
      }
    }
    lines.push("");
  }

  if (uniqueRoots.length > 0) {
    lines.push("### Root Causes (Events)");
    for (const rootId of uniqueRoots) {
      const event = evidenceEvents.get(rootId);
      if (event) {
        lines.push(`- ${rootId} (${event.event_type})`);
      } else {
        lines.push(`- ${rootId}`);
      }
    }
    lines.push("");
  }

  if (incident.postmortemRef) {
    lines.push("### Postmortem");
    lines.push(`Reference: ${incident.postmortemRef}`);
    lines.push("");
  }

  return lines.join("\n");
}

function formatTimelineJson(incident: Incident, evidenceEvents: Map<string, EvidenceEvent>): TimelineJson {
  const entries = assembleTimeline(incident, evidenceEvents);

  // Build root causes
  const toEventIds = new Set(incident.causalEdges.map((edge) => edge.toEventId));
  const rootEventIds = incident.causalEdges
    .filter((edge) => edge.relationship === "CAUSED" && !toEventIds.has(edge.fromEventId))
    .map((edge) => edge.fromEventId);
  const uniqueRoots = Array.from(new Set(rootEventIds));

  return {
    incidentId: incident.incidentId,
    title: incident.title,
    severity: incident.severity,
    state: incident.state,
    entries,
    rootCauses: uniqueRoots,
    affectedQuestions: incident.affectedQuestionIds,
    createdTs: incident.createdTs,
    resolvedTs: incident.resolvedTs
  };
}

export const IncidentTimeline = {
  assembleTimeline,
  formatTimelineMd,
  formatTimelineJson
};
