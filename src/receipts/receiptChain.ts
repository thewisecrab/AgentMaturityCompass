/**
 * Cross-Agent Receipt Chaining
 *
 * Extends receipts with delegation chains for cross-agent accountability.
 * Adds parentReceiptId and delegationChain fields.
 */

import { randomUUID, sign, verify } from "node:crypto";
import { sha256Hex } from "../utils/hash.js";
import { canonicalize } from "../utils/json.js";
import type { ReceiptPayloadV1, ReceiptKind } from "./receipt.js";
import { parseReceipt, verifyReceipt } from "./receipt.js";

// ---------------------------------------------------------------------------
// Extended Receipt Types
// ---------------------------------------------------------------------------

export interface ChainedReceiptPayloadV1 extends ReceiptPayloadV1 {
  /** Parent receipt ID for delegation chains (null if root) */
  parent_receipt_id: string | null;
  /** Full delegation chain: ordered list of receipt IDs from root to this receipt */
  delegation_chain: string[];
}

export interface DelegationChainEntry {
  receiptId: string;
  agentId: string;
  kind: ReceiptKind;
  ts: number;
  parentReceiptId: string | null;
}

export interface ChainVerificationResult {
  valid: boolean;
  chainLength: number;
  entries: DelegationChainEntry[];
  errors: string[];
  rootReceiptId: string | null;
  leafReceiptId: string;
}

// ---------------------------------------------------------------------------
// In-memory Receipt Store (for chaining lookups)
// ---------------------------------------------------------------------------

const receiptStore = new Map<string, { receipt: string; payload: ChainedReceiptPayloadV1 }>();

/**
 * Register a receipt in the chain store for later lookup.
 */
export function registerChainedReceipt(
  receiptId: string,
  receipt: string,
  payload: ChainedReceiptPayloadV1,
): void {
  receiptStore.set(receiptId, { receipt, payload });
}

/**
 * Look up a stored receipt by ID.
 */
export function getStoredReceipt(receiptId: string): { receipt: string; payload: ChainedReceiptPayloadV1 } | null {
  return receiptStore.get(receiptId) ?? null;
}

// ---------------------------------------------------------------------------
// Minting Chained Receipts
// ---------------------------------------------------------------------------

function toBase64Url(bytes: Buffer): string {
  return bytes
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export interface MintChainedReceiptInput {
  kind: ReceiptKind;
  ts: number;
  agentId: string;
  providerId: string;
  model: string | null;
  eventHash: string;
  bodySha256: string;
  sessionId: string;
  privateKeyPem: string;
  parentReceiptId?: string | null;
  receiptId?: string;
}

/**
 * Mint a receipt that carries delegation chain info.
 */
export function mintChainedReceipt(input: MintChainedReceiptInput): {
  payload: ChainedReceiptPayloadV1;
  receipt: string;
  receiptSha256: string;
} {
  // Build delegation chain from parent
  let delegationChain: string[] = [];
  if (input.parentReceiptId) {
    const parent = receiptStore.get(input.parentReceiptId);
    if (parent) {
      delegationChain = [...parent.payload.delegation_chain, input.parentReceiptId];
    } else {
      delegationChain = [input.parentReceiptId];
    }
  }

  const receiptId = input.receiptId ?? randomUUID();

  const payload: ChainedReceiptPayloadV1 = {
    v: 1,
    kind: input.kind,
    receipt_id: receiptId,
    ts: input.ts,
    agentId: input.agentId || "unknown",
    providerId: input.providerId || "unknown",
    model: input.model ?? null,
    event_hash: input.eventHash,
    body_sha256: input.bodySha256,
    session_id: input.sessionId,
    parent_receipt_id: input.parentReceiptId ?? null,
    delegation_chain: delegationChain,
  };

  const payloadBytes = Buffer.from(canonicalize(payload), "utf8");
  const signatureBytes = sign(null, payloadBytes, input.privateKeyPem);
  const receipt = `${toBase64Url(payloadBytes)}.${toBase64Url(signatureBytes)}`;
  const receiptSha256 = sha256Hex(Buffer.from(receipt, "utf8"));

  // Auto-register in store
  registerChainedReceipt(receiptId, receipt, payload);

  return { payload, receipt, receiptSha256 };
}

// ---------------------------------------------------------------------------
// Chain Verification
// ---------------------------------------------------------------------------

/**
 * Verify the integrity of an entire delegation chain for a receipt.
 */
export function verifyDelegationChain(
  leafReceiptId: string,
  publicKeysPem: string[],
): ChainVerificationResult {
  const errors: string[] = [];
  const entries: DelegationChainEntry[] = [];
  let currentId: string | null = leafReceiptId;
  const visited = new Set<string>();

  while (currentId) {
    if (visited.has(currentId)) {
      errors.push(`Circular reference detected at receipt ${currentId}`);
      break;
    }
    visited.add(currentId);

    const stored = receiptStore.get(currentId);
    if (!stored) {
      errors.push(`Receipt ${currentId} not found in store`);
      break;
    }

    // Verify signature
    const verification = verifyReceipt(stored.receipt, publicKeysPem);
    if (!verification.ok) {
      errors.push(`Receipt ${currentId}: ${verification.error ?? "signature verification failed"}`);
    }

    entries.unshift({
      receiptId: stored.payload.receipt_id,
      agentId: stored.payload.agentId,
      kind: stored.payload.kind,
      ts: stored.payload.ts,
      parentReceiptId: stored.payload.parent_receipt_id,
    });

    currentId = stored.payload.parent_receipt_id;
  }

  return {
    valid: errors.length === 0,
    chainLength: entries.length,
    entries,
    errors,
    rootReceiptId: entries.length > 0 ? entries[0]!.receiptId : null,
    leafReceiptId,
  };
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

export function renderDelegationChainMarkdown(result: ChainVerificationResult): string {
  const lines: string[] = [
    "# Receipt Delegation Chain",
    "",
    `Leaf receipt: ${result.leafReceiptId}`,
    `Chain length: ${result.chainLength}`,
    `Valid: ${result.valid}`,
    "",
  ];

  if (result.errors.length > 0) {
    lines.push("## Errors");
    for (const e of result.errors) {
      lines.push(`- ${e}`);
    }
    lines.push("");
  }

  if (result.entries.length > 0) {
    lines.push("## Chain (root → leaf)");
    for (let i = 0; i < result.entries.length; i++) {
      const e = result.entries[i]!;
      const prefix = i === 0 ? "ROOT" : i === result.entries.length - 1 ? "LEAF" : `  ${i}`;
      lines.push(`${prefix}: ${e.receiptId}`);
      lines.push(`  Agent: ${e.agentId} | Kind: ${e.kind} | ts: ${new Date(e.ts).toISOString()}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Reset (for testing)
// ---------------------------------------------------------------------------

export function resetReceiptChainStore(): void {
  receiptStore.clear();
}
