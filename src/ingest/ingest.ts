import { randomUUID } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { openLedger, hashBinaryOrPath } from "../ledger/ledger.js";
import { canonicalize } from "../utils/json.js";
import { sha256Hex } from "../utils/hash.js";
import { resolveAgentId } from "../fleet/paths.js";

export type IngestType = "chatgpt" | "claude_console" | "gemini_ui" | "generic_json" | "generic_text";

function collectFiles(inputPath: string): string[] {
  const absolute = resolve(inputPath);
  const stat = statSync(absolute);
  if (stat.isFile()) {
    return [absolute];
  }
  const out: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = `${dir}/${entry.name}`;
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        out.push(full);
      }
    }
  };
  walk(absolute);
  return out.sort((a, b) => a.localeCompare(b));
}

function toIngestPayload(file: string, type: IngestType): string {
  const raw = readFileSync(file, "utf8");
  if (type === "generic_text") {
    return raw;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return JSON.stringify(parsed, null, 2);
  } catch {
    return raw;
  }
}

export function ingestEvidence(params: {
  workspace: string;
  agentId?: string;
  inputPath: string;
  type: IngestType;
}): {
  ingestSessionId: string;
  fileCount: number;
  eventIds: string[];
} {
  const workspace = params.workspace;
  const agentId = resolveAgentId(workspace, params.agentId);
  const files = collectFiles(params.inputPath);
  if (files.length === 0) {
    throw new Error(`No files found to ingest: ${params.inputPath}`);
  }

  const ledger = openLedger(workspace);
  const ingestSessionId = randomUUID();
  try {
    ledger.startSession({
      sessionId: ingestSessionId,
      runtime: "unknown",
      binaryPath: "ingest",
      binarySha256: hashBinaryOrPath("ingest", "1")
    });

    const eventIds: string[] = [];
    for (const file of files) {
      const payload = toIngestPayload(file, params.type);
      const eventId = ledger.appendEvidence({
        sessionId: ingestSessionId,
        runtime: "unknown",
        eventType: "review",
        payload,
        payloadExt: file.endsWith(".json") ? "json" : "txt",
        meta: {
          trustTier: "SELF_REPORTED",
          source: params.type,
          agentId,
          ingestSessionId,
          filePath: file
        }
      });
      eventIds.push(eventId);
    }
    ledger.sealSession(ingestSessionId);
    return {
      ingestSessionId,
      fileCount: files.length,
      eventIds
    };
  } finally {
    ledger.close();
  }
}

function payloadForEvent(workspace: string, event: { payload_inline: string | null; payload_path: string | null }): string {
  if (event.payload_inline !== null) {
    return event.payload_inline;
  }
  if (event.payload_path !== null) {
    return readFileSync(resolve(workspace, event.payload_path), "utf8");
  }
  return "";
}

export function attestIngestSession(params: {
  workspace: string;
  ingestSessionId: string;
  agentId?: string;
}): {
  attestedEventCount: number;
  bundleHash: string;
} {
  const workspace = params.workspace;
  const agentId = resolveAgentId(workspace, params.agentId);
  const ledger = openLedger(workspace);
  try {
    const sourceEvents = ledger
      .getAllEvents()
      .filter((event) => event.session_id === params.ingestSessionId && event.event_type === "review")
      .sort((a, b) => a.ts - b.ts);

    if (sourceEvents.length === 0) {
      throw new Error(`No ingest review events found for session ${params.ingestSessionId}`);
    }

    const bundleHash = sha256Hex(
      canonicalize(
        sourceEvents.map((event) => ({
          id: event.id,
          sha256: event.payload_sha256,
          ts: event.ts
        }))
      )
    );
    const attestationSig = ledger.signRunHash(bundleHash);

    for (const event of sourceEvents) {
      const payload = payloadForEvent(workspace, event);
      ledger.appendEvidence({
        sessionId: params.ingestSessionId,
        runtime: "unknown",
        eventType: "review",
        payload,
        payloadExt: event.payload_path?.endsWith(".json") ? "json" : "txt",
        meta: {
          trustTier: "ATTESTED",
          source: "attested_ingest",
          agentId,
          ingestSessionId: params.ingestSessionId,
          originalEventId: event.id
        }
      });
    }

    ledger.appendEvidence({
      sessionId: params.ingestSessionId,
      runtime: "unknown",
      eventType: "audit",
      payload: JSON.stringify({
        auditType: "INGEST_ATTESTED",
        severity: "LOW",
        ingestSessionId: params.ingestSessionId,
        bundleHash,
        signature: attestationSig
      }),
      payloadExt: "json",
      inline: true,
      meta: {
        auditType: "INGEST_ATTESTED",
        severity: "LOW",
        ingestSessionId: params.ingestSessionId,
        bundleHash,
        signature: attestationSig,
        trustTier: "OBSERVED",
        agentId
      }
    });

    return {
      attestedEventCount: sourceEvents.length,
      bundleHash
    };
  } finally {
    ledger.close();
  }
}

