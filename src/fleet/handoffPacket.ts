/**
 * Handoff Packet Schema
 *
 * Signed handoff packets for agent-to-agent delegation.
 * Receiving agents must verify the packet before acting.
 */

import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { readdirSync, readFileSync } from "node:fs";
import { z } from "zod";
import { sha256Hex } from "../utils/hash.js";
import { canonicalize } from "../utils/json.js";
import { ensureDir, pathExists, writeFileAtomic } from "../utils/fs.js";
import { getPrivateKeyPem, getPublicKeyHistory, signHexDigest, verifyHexDigestAny } from "../crypto/keys.js";
import { fleetRoot } from "./paths.js";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const handoffPacketSchema = z.object({
  packetId: z.string().min(1),
  fromAgentId: z.string().min(1),
  toAgentId: z.string().min(1),
  goal: z.string().min(1),
  currentState: z.string(),
  nextAction: z.string(),
  constraints: z.array(z.string()),
  knownUnknowns: z.array(z.string()),
  artifactPaths: z.array(z.string()),
  stopConditions: z.array(z.string()),
  contextHash: z.string(),
  evidenceSnapshot: z.array(z.string()),
  trustState: z.object({
    level: z.number(),
    confidence: z.number(),
    integrityIndex: z.number(),
  }),
  delegationScope: z.array(z.string()),
  createdTs: z.number(),
  expiryTs: z.number(),
  signature: z.string(),
});

export type HandoffPacket = z.infer<typeof handoffPacketSchema>;

export interface HandoffVerificationResult {
  valid: boolean;
  expired: boolean;
  signatureValid: boolean;
  errors: string[];
  packet: HandoffPacket | null;
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

function handoffDir(workspace: string): string {
  return join(fleetRoot(workspace), "handoffs");
}

function handoffFilePath(workspace: string, packetId: string): string {
  return join(handoffDir(workspace), `${packetId}.json`);
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export function createHandoffPacket(
  workspace: string,
  params: {
    fromAgentId: string;
    toAgentId: string;
    goal: string;
    currentState?: string;
    nextAction?: string;
    constraints?: string[];
    knownUnknowns?: string[];
    artifactPaths?: string[];
    stopConditions?: string[];
    contextHash?: string;
    evidenceSnapshot?: string[];
    trustState?: { level: number; confidence: number; integrityIndex: number };
    delegationScope?: string[];
    ttlMs?: number;
  },
): HandoffPacket {
  ensureDir(handoffDir(workspace));

  const packetId = `handoff_${randomUUID().slice(0, 12)}`;
  const now = Date.now();
  const ttl = params.ttlMs ?? 3600_000; // 1 hour default

  const body = {
    packetId,
    fromAgentId: params.fromAgentId,
    toAgentId: params.toAgentId,
    goal: params.goal,
    currentState: params.currentState ?? "",
    nextAction: params.nextAction ?? "",
    constraints: params.constraints ?? [],
    knownUnknowns: params.knownUnknowns ?? [],
    artifactPaths: params.artifactPaths ?? [],
    stopConditions: params.stopConditions ?? [],
    contextHash: params.contextHash ?? sha256Hex(Buffer.from(params.goal, "utf8")),
    evidenceSnapshot: params.evidenceSnapshot ?? [],
    trustState: params.trustState ?? { level: 0, confidence: 0, integrityIndex: 0 },
    delegationScope: params.delegationScope ?? [],
    createdTs: now,
    expiryTs: now + ttl,
  };

  const digest = sha256Hex(Buffer.from(canonicalize(body), "utf8"));
  let signature = "unsigned";
  try {
    signature = signHexDigest(digest, getPrivateKeyPem(workspace, "auditor"));
  } catch { /* unsigned */ }

  const packet = handoffPacketSchema.parse({ ...body, signature });
  writeFileAtomic(handoffFilePath(workspace, packetId), JSON.stringify(packet, null, 2), 0o644);
  return packet;
}

// ---------------------------------------------------------------------------
// Load & List
// ---------------------------------------------------------------------------

export function loadHandoffPacket(workspace: string, packetId: string): HandoffPacket {
  const file = handoffFilePath(workspace, packetId);
  if (!pathExists(file)) {
    throw new Error(`Handoff packet not found: ${packetId}`);
  }
  return handoffPacketSchema.parse(JSON.parse(readFileSync(file, "utf8")) as unknown);
}

export function listHandoffPackets(workspace: string): string[] {
  const dir = handoffDir(workspace);
  if (!pathExists(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""))
    .sort();
}

// ---------------------------------------------------------------------------
// Verify
// ---------------------------------------------------------------------------

export function verifyHandoffPacket(workspace: string, packetId: string): HandoffVerificationResult {
  const errors: string[] = [];

  let packet: HandoffPacket;
  try {
    packet = loadHandoffPacket(workspace, packetId);
  } catch (e) {
    return { valid: false, expired: false, signatureValid: false, errors: [String(e)], packet: null };
  }

  const expired = Date.now() > packet.expiryTs;
  if (expired) {
    errors.push(`Packet expired at ${new Date(packet.expiryTs).toISOString()}`);
  }

  // Verify signature
  const { signature, ...body } = packet;
  const digest = sha256Hex(Buffer.from(canonicalize(body), "utf8"));
  let signatureValid = false;

  if (signature === "unsigned") {
    errors.push("Packet is unsigned");
  } else {
    try {
      const keys = getPublicKeyHistory(workspace, "auditor");
      signatureValid = verifyHexDigestAny(digest, signature, keys);
      if (!signatureValid) {
        errors.push("Signature verification failed");
      }
    } catch (e) {
      errors.push(`Signature check error: ${String(e)}`);
    }
  }

  return {
    valid: errors.length === 0,
    expired,
    signatureValid,
    errors,
    packet,
  };
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

export function renderHandoffPacketMarkdown(packet: HandoffPacket): string {
  const lines = [
    "# Handoff Packet",
    "",
    `- Packet ID: ${packet.packetId}`,
    `- From: ${packet.fromAgentId}`,
    `- To: ${packet.toAgentId}`,
    `- Goal: ${packet.goal}`,
    `- Created: ${new Date(packet.createdTs).toISOString()}`,
    `- Expires: ${new Date(packet.expiryTs).toISOString()}`,
    `- Context Hash: ${packet.contextHash}`,
    "",
    `## Current State`,
    packet.currentState || "(none)",
    "",
    `## Next Action`,
    packet.nextAction || "(none)",
    "",
    `## Trust State`,
    `- Level: ${packet.trustState.level}`,
    `- Confidence: ${packet.trustState.confidence}`,
    `- Integrity Index: ${packet.trustState.integrityIndex}`,
    "",
  ];

  if (packet.constraints.length > 0) {
    lines.push("## Constraints");
    for (const c of packet.constraints) lines.push(`- ${c}`);
    lines.push("");
  }

  if (packet.delegationScope.length > 0) {
    lines.push("## Delegation Scope");
    for (const s of packet.delegationScope) lines.push(`- ${s}`);
    lines.push("");
  }

  if (packet.stopConditions.length > 0) {
    lines.push("## Stop Conditions");
    for (const s of packet.stopConditions) lines.push(`- ${s}`);
    lines.push("");
  }

  return lines.join("\n");
}
