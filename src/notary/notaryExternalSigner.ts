import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createPublicKey, verify } from "node:crypto";
import { z } from "zod";
import { sha256Hex } from "../utils/hash.js";

const externalSignerResponseSchema = z.object({
  v: z.literal(1),
  alg: z.literal("ed25519"),
  pubkeyB64: z.string().min(1),
  signatureB64: z.string().min(1),
  keyFingerprint: z.string().min(1),
  claims: z.object({
    hardware: z.boolean(),
    device: z.string().min(1),
    vendor: z.string().optional(),
    model: z.string().optional(),
    serialRedacted: z.string().optional()
  }).passthrough()
});

const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

export interface ExternalSignerResult {
  signatureB64: string;
  pubkeyPem: string;
  pubkeyFingerprint: string;
  claims: Record<string, unknown>;
}

function ed25519RawToPem(raw: Buffer): string {
  const der = Buffer.concat([ED25519_SPKI_PREFIX, raw]);
  const key = createPublicKey({
    key: der,
    format: "der",
    type: "spki"
  });
  return key.export({ format: "pem", type: "spki" }).toString();
}

export function runExternalSigner(params: {
  command: string;
  args: string[];
  kind: string;
  payload: Buffer;
}): ExternalSignerResult {
  const payloadSha256 = sha256Hex(params.payload);
  const root = mkdtempSync(join(tmpdir(), "amc-notary-ext-"));
  try {
    const outFile = join(root, "signer-out.json");
    const out = spawnSync(
      params.command,
      [
        ...params.args,
        "sign",
        "--kind",
        params.kind,
        "--payload-sha256",
        payloadSha256,
        "--payload-b64",
        params.payload.toString("base64"),
        "--out",
        outFile
      ],
      {
        encoding: "utf8"
      }
    );
    if (out.status !== 0) {
      throw new Error(`external signer failed: ${(`${out.stdout ?? ""}${out.stderr ?? ""}`).trim()}`);
    }
    const parsed = externalSignerResponseSchema.parse(JSON.parse(readFileSync(outFile, "utf8")) as unknown);
    const rawPubkey = Buffer.from(parsed.pubkeyB64, "base64");
    const pubkeyPem = ed25519RawToPem(rawPubkey);
    const signature = Buffer.from(parsed.signatureB64, "base64");
    const ok = verify(null, params.payload, pubkeyPem, signature);
    if (!ok) {
      throw new Error("external signer returned invalid signature");
    }
    const rawFingerprint = sha256Hex(rawPubkey);
    const pemFingerprint = sha256Hex(Buffer.from(pubkeyPem, "utf8"));
    if (parsed.keyFingerprint !== rawFingerprint && parsed.keyFingerprint !== pemFingerprint) {
      throw new Error("external signer fingerprint mismatch");
    }
    return {
      signatureB64: parsed.signatureB64,
      pubkeyPem,
      pubkeyFingerprint: pemFingerprint,
      claims: parsed.claims
    };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

export function externalSignerPublicKeyFingerprint(params: {
  command: string;
  args: string[];
}): { fingerprint: string; pubkeyPem: string; claims: Record<string, unknown> } {
  const probe = Buffer.from("amc-notary-probe", "utf8");
  const result = runExternalSigner({
    command: params.command,
    args: params.args,
    kind: "NOTARY_PROBE",
    payload: probe
  });
  return {
    fingerprint: result.pubkeyFingerprint,
    pubkeyPem: result.pubkeyPem,
    claims: result.claims
  };
}
