import { z } from "zod";

export const releaseManifestSchema = z.object({
  v: z.literal(1),
  package: z.object({
    name: z.literal("agent-maturity-compass"),
    version: z.string().min(1),
    node: z.string().min(1),
    git: z.object({
      commit: z.string().min(1),
      tag: z.string().nullable(),
      dirty: z.boolean()
    })
  }),
  generatedTs: z.number().int().nonnegative(),
  artifacts: z.object({
    npmTgzSha256: z.string().regex(/^[a-f0-9]{64}$/),
    sbomSha256: z.string().regex(/^[a-f0-9]{64}$/),
    licensesSha256: z.string().regex(/^[a-f0-9]{64}$/),
    provenanceSha256: z.string().regex(/^[a-f0-9]{64}$/),
    secretScanSha256: z.string().regex(/^[a-f0-9]{64}$/),
    dockerImageSha256: z.string().regex(/^[a-f0-9]{64}$/)
  }),
  signing: z.object({
    algorithm: z.literal("ed25519"),
    pubkeyFingerprint: z.string().regex(/^[a-f0-9]{64}$/)
  })
});

export type ReleaseManifest = z.infer<typeof releaseManifestSchema>;
