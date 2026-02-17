import { z } from "zod";

export const federationConfigSchema = z.object({
  federation: z.object({
    version: z.literal(1),
    orgName: z.string().min(1),
    orgId: z.string().min(1),
    publisherKeyFingerprint: z.string().length(64),
    sharePolicy: z.object({
      allowBenchmarks: z.boolean(),
      allowCerts: z.boolean(),
      allowBom: z.boolean(),
      allowTransparencyRoots: z.boolean(),
      allowPlugins: z.boolean(),
      denyEvidenceDb: z.boolean()
    })
  })
});

export const federationPeerSchema = z.object({
  v: z.literal(1),
  peerId: z.string().min(1),
  name: z.string().min(1),
  publisherPublicKeyPem: z.string().min(1),
  addedTs: z.number().int()
});

export const federationManifestSchema = z.object({
  v: z.literal(1),
  manifestId: z.string().min(1),
  createdTs: z.number().int(),
  sourceOrgName: z.string().min(1),
  sourceOrgId: z.string().min(1),
  publisherKeyFingerprint: z.string().length(64),
  files: z.array(
    z.object({
      path: z.string().min(1),
      sha256: z.string().length(64),
      size: z.number().int().min(0)
    })
  )
});

export const federationManifestSignatureSchema = z.object({
  digestSha256: z.string().length(64),
  signature: z.string().min(1),
  signedTs: z.number().int(),
  signer: z.literal("publisher")
});

export type FederationConfigFile = z.infer<typeof federationConfigSchema>;
export type FederationPeer = z.infer<typeof federationPeerSchema>;
export type FederationManifest = z.infer<typeof federationManifestSchema>;
