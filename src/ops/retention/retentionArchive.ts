import { gzipSync, gunzipSync } from "node:zlib";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { getPrivateKeyPem, getPublicKeyHistory, signHexDigest, verifyHexDigestAny } from "../../crypto/keys.js";
import { ensureDir, pathExists, readUtf8, writeFileAtomic } from "../../utils/fs.js";
import { sha256Hex } from "../../utils/hash.js";
import {
  retentionSegmentManifestSchema,
  retentionSegmentSignatureSchema,
  type RetentionSegmentManifest
} from "./retentionSchema.js";

export function archiveLedgerDir(workspace: string): string {
  return join(workspace, ".amc", "archive", "ledger");
}

export function segmentFilePath(workspace: string, segmentId: string, startTs: number, endTs: number): string {
  return join(archiveLedgerDir(workspace), `segment_${startTs}_${endTs}_${segmentId}.jsonl.gz`);
}

export function segmentManifestPath(segmentPath: string): string {
  return `${segmentPath}.manifest.json`;
}

export function segmentManifestSigPath(segmentPath: string): string {
  return `${segmentPath}.manifest.sig`;
}

export function writeRetentionSegment(params: {
  workspace: string;
  segmentId: string;
  startTs: number;
  endTs: number;
  eventLines: string[];
  firstEventHash: string;
  lastEventHash: string;
  prevSegmentLastEventHash: string | null;
  prunePolicy: {
    prunePayloadsAfterDays: number;
    archivePayloadsAfterDays: number;
  };
}): {
  segmentPath: string;
  manifestPath: string;
  sigPath: string;
  manifest: RetentionSegmentManifest;
} {
  ensureDir(archiveLedgerDir(params.workspace));
  const segmentPath = segmentFilePath(params.workspace, params.segmentId, params.startTs, params.endTs);
  const raw = `${params.eventLines.join("\n")}${params.eventLines.length > 0 ? "\n" : ""}`;
  const compressed = gzipSync(Buffer.from(raw, "utf8"));
  writeFileAtomic(segmentPath, compressed, 0o644);
  const segmentFileSha256 = sha256Hex(compressed);
  const manifest = retentionSegmentManifestSchema.parse({
    v: 1,
    segmentId: params.segmentId,
    createdTs: Date.now(),
    startTs: params.startTs,
    endTs: params.endTs,
    eventCount: params.eventLines.length,
    firstEventHash: params.firstEventHash,
    lastEventHash: params.lastEventHash,
    prevSegmentLastEventHash: params.prevSegmentLastEventHash,
    segmentFileSha256,
    prunePolicy: params.prunePolicy
  });
  const manifestPath = segmentManifestPath(segmentPath);
  writeFileAtomic(manifestPath, JSON.stringify(manifest, null, 2), 0o644);
  const digest = sha256Hex(readFileSync(manifestPath));
  const sig = retentionSegmentSignatureSchema.parse({
    digestSha256: digest,
    signature: signHexDigest(digest, getPrivateKeyPem(params.workspace, "auditor")),
    signedTs: Date.now(),
    signer: "auditor"
  });
  const sigPath = segmentManifestSigPath(segmentPath);
  writeFileAtomic(sigPath, JSON.stringify(sig, null, 2), 0o644);
  return {
    segmentPath,
    manifestPath,
    sigPath,
    manifest
  };
}

export function readRetentionSegmentLines(segmentPath: string): string[] {
  const bytes = readFileSync(segmentPath);
  const text = gunzipSync(bytes).toString("utf8");
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function listRetentionSegments(workspace: string): Array<{
  segmentPath: string;
  manifestPath: string;
  sigPath: string;
  manifest: RetentionSegmentManifest | null;
}> {
  const dir = archiveLedgerDir(workspace);
  if (!pathExists(dir)) {
    return [];
  }
  return readdirSync(dir)
    .filter((name) => name.endsWith(".jsonl.gz"))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => {
      const segmentPath = join(dir, name);
      const manifestPath = segmentManifestPath(segmentPath);
      const sigPath = segmentManifestSigPath(segmentPath);
      let manifest: RetentionSegmentManifest | null = null;
      if (pathExists(manifestPath)) {
        try {
          manifest = retentionSegmentManifestSchema.parse(JSON.parse(readUtf8(manifestPath)) as unknown);
        } catch {
          manifest = null;
        }
      }
      return {
        segmentPath,
        manifestPath,
        sigPath,
        manifest
      };
    });
}

export function verifyRetentionSegment(params: {
  workspace: string;
  segmentPath: string;
  manifestPath: string;
  sigPath: string;
}): {
  ok: boolean;
  errors: string[];
  manifest: RetentionSegmentManifest | null;
} {
  const errors: string[] = [];
  if (!pathExists(params.segmentPath)) {
    errors.push(`segment missing: ${params.segmentPath}`);
    return { ok: false, errors, manifest: null };
  }
  if (!pathExists(params.manifestPath)) {
    errors.push(`segment manifest missing: ${params.manifestPath}`);
    return { ok: false, errors, manifest: null };
  }
  if (!pathExists(params.sigPath)) {
    errors.push(`segment manifest signature missing: ${params.sigPath}`);
    return { ok: false, errors, manifest: null };
  }
  let manifest: RetentionSegmentManifest | null = null;
  try {
    manifest = retentionSegmentManifestSchema.parse(JSON.parse(readUtf8(params.manifestPath)) as unknown);
  } catch (error) {
    errors.push(`invalid segment manifest: ${String(error)}`);
    return { ok: false, errors, manifest: null };
  }
  const segmentSha = sha256Hex(readFileSync(params.segmentPath));
  if (manifest.segmentFileSha256 !== segmentSha) {
    errors.push(`segment sha mismatch for ${params.segmentPath}`);
  }
  try {
    const sig = retentionSegmentSignatureSchema.parse(JSON.parse(readUtf8(params.sigPath)) as unknown);
    const digest = sha256Hex(readFileSync(params.manifestPath));
    if (sig.digestSha256 !== digest) {
      errors.push(`manifest digest mismatch for ${params.manifestPath}`);
    } else {
      const valid = verifyHexDigestAny(digest, sig.signature, getPublicKeyHistory(params.workspace, "auditor"));
      if (!valid) {
        errors.push(`manifest signature invalid for ${params.manifestPath}`);
      }
    }
  } catch (error) {
    errors.push(`invalid segment signature payload: ${String(error)}`);
  }

  const lines = readRetentionSegmentLines(params.segmentPath);
  if (lines.length !== manifest.eventCount) {
    errors.push(`segment event count mismatch for ${params.segmentPath}`);
  } else if (lines.length > 0) {
    try {
      const first = JSON.parse(lines[0]!) as { event_hash?: string };
      const last = JSON.parse(lines[lines.length - 1]!) as { event_hash?: string };
      if (String(first.event_hash ?? "") !== manifest.firstEventHash) {
        errors.push(`segment first event hash mismatch for ${params.segmentPath}`);
      }
      if (String(last.event_hash ?? "") !== manifest.lastEventHash) {
        errors.push(`segment last event hash mismatch for ${params.segmentPath}`);
      }
    } catch {
      errors.push(`segment parse failure for ${params.segmentPath}`);
    }
  }
  return {
    ok: errors.length === 0,
    errors,
    manifest
  };
}

