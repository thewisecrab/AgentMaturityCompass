import { z } from "zod";

export const retentionSegmentManifestSchema = z.object({
  v: z.literal(1),
  segmentId: z.string().min(1),
  createdTs: z.number().int(),
  startTs: z.number().int(),
  endTs: z.number().int(),
  eventCount: z.number().int().min(0),
  firstEventHash: z.string(),
  lastEventHash: z.string(),
  prevSegmentLastEventHash: z.string().nullable(),
  segmentFileSha256: z.string().length(64),
  prunePolicy: z.object({
    prunePayloadsAfterDays: z.number().int().min(1),
    archivePayloadsAfterDays: z.number().int().min(1)
  })
});

export type RetentionSegmentManifest = z.infer<typeof retentionSegmentManifestSchema>;

export const retentionSegmentSignatureSchema = z.object({
  digestSha256: z.string().length(64),
  signature: z.string().min(1),
  signedTs: z.number().int(),
  signer: z.literal("auditor")
});

export type RetentionSegmentSignature = z.infer<typeof retentionSegmentSignatureSchema>;

export const blobPrunedRowSchema = z.object({
  v: z.literal(1),
  ts: z.number().int(),
  blobId: z.string().min(1),
  sha256: z.string().length(64),
  prev: z.string(),
  hash: z.string().length(64)
});

export type BlobPrunedRow = z.infer<typeof blobPrunedRowSchema>;

export const blobPrunedSealSchema = z.object({
  v: z.literal(1),
  ts: z.number().int(),
  lastHash: z.string(),
  digestSha256: z.string().length(64),
  signature: z.string().min(1),
  signer: z.literal("auditor")
});

export type BlobPrunedSeal = z.infer<typeof blobPrunedSealSchema>;

