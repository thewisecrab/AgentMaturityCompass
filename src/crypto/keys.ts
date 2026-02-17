import { sign, verify } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ensureDir, pathExists, writeFileAtomic } from "../utils/fs.js";
import { sha256Hex } from "../utils/hash.js";
import { ensureVaultAndPublicKeys, getVaultPrivateKeyPem, vaultPaths } from "../vault/vault.js";

interface KeyHistoryItem {
  createdTs: number;
  fingerprint: string;
  publicKeyPem: string;
}

function keyDir(workspace: string): string {
  return join(workspace, ".amc", "keys");
}

function historyPath(workspace: string, kind: "monitor" | "auditor" | "lease" | "session"): string {
  return join(keyDir(workspace), `${kind}_history.json`);
}

function publicPath(workspace: string, kind: "monitor" | "auditor" | "lease" | "session"): string {
  return join(keyDir(workspace), `${kind}_ed25519.pub`);
}

function ensureHistoryEntry(workspace: string, kind: "monitor" | "auditor" | "lease" | "session", publicPem: string): void {
  const file = historyPath(workspace, kind);
  const existing: KeyHistoryItem[] = pathExists(file) ? JSON.parse(readFileSync(file, "utf8")) as KeyHistoryItem[] : [];
  if (!existing.some((item) => item.publicKeyPem === publicPem)) {
    existing.push({
      createdTs: Date.now(),
      fingerprint: sha256Hex(Buffer.from(publicPem, "utf8")),
      publicKeyPem: publicPem
    });
    writeFileAtomic(file, JSON.stringify(existing, null, 2), 0o644);
  }
}

export function addPublicKeyToHistory(workspace: string, kind: "monitor" | "auditor" | "lease" | "session", publicPem: string): void {
  ensureDir(keyDir(workspace));
  const file = historyPath(workspace, kind);
  if (!pathExists(file)) {
    writeFileAtomic(file, "[]", 0o644);
  }
  ensureHistoryEntry(workspace, kind, publicPem);
}

export function ensureSigningKeys(workspace: string): void {
  ensureDir(keyDir(workspace));
  ensureVaultAndPublicKeys(workspace);

  // keep key history compatible with existing verify logic
  const monitorPub = getPublicKeyPem(workspace, "monitor");
  const auditorPub = getPublicKeyPem(workspace, "auditor");
  const leasePub = getPublicKeyPem(workspace, "lease");
  const sessionPub = getPublicKeyPem(workspace, "session");
  const monitorHistoryFile = historyPath(workspace, "monitor");
  const auditorHistoryFile = historyPath(workspace, "auditor");
  const leaseHistoryFile = historyPath(workspace, "lease");
  const sessionHistoryFile = historyPath(workspace, "session");

  if (!pathExists(monitorHistoryFile)) {
    writeFileAtomic(monitorHistoryFile, "[]", 0o644);
  }
  if (!pathExists(auditorHistoryFile)) {
    writeFileAtomic(auditorHistoryFile, "[]", 0o644);
  }
  if (!pathExists(leaseHistoryFile)) {
    writeFileAtomic(leaseHistoryFile, "[]", 0o644);
  }
  if (!pathExists(sessionHistoryFile)) {
    writeFileAtomic(sessionHistoryFile, "[]", 0o644);
  }
  ensureHistoryEntry(workspace, "monitor", monitorPub);
  ensureHistoryEntry(workspace, "auditor", auditorPub);
  ensureHistoryEntry(workspace, "lease", leasePub);
  ensureHistoryEntry(workspace, "session", sessionPub);
}

export function getPrivateKeyPem(workspace: string, kind: "monitor" | "auditor" | "lease" | "session"): string {
  return getVaultPrivateKeyPem(workspace, kind);
}

export function getPublicKeyPem(workspace: string, kind: "monitor" | "auditor" | "lease" | "session"): string {
  const p = publicPath(workspace, kind);
  if (!pathExists(p)) {
    throw new Error(`Missing public key: ${p}`);
  }
  return readFileSync(p, "utf8");
}

export function getPublicKeyHistory(workspace: string, kind: "monitor" | "auditor" | "lease" | "session"): string[] {
  const file = historyPath(workspace, kind);
  if (!pathExists(file)) {
    return [getPublicKeyPem(workspace, kind)];
  }
  const entries: KeyHistoryItem[] = JSON.parse(readFileSync(file, "utf8")) as KeyHistoryItem[];
  const out = new Set<string>(entries.map((entry) => entry.publicKeyPem));
  out.add(getPublicKeyPem(workspace, kind));
  return [...out];
}

export function signHexDigest(digestHex: string, privateKeyPem: string): string {
  const signature = sign(null, Buffer.from(digestHex, "hex"), privateKeyPem);
  return signature.toString("base64");
}

export function verifyHexDigest(digestHex: string, signatureB64: string, publicKeyPem: string): boolean {
  try {
    return verify(null, Buffer.from(digestHex, "hex"), publicKeyPem, Buffer.from(signatureB64, "base64"));
  } catch {
    return false;
  }
}

export function verifyHexDigestAny(digestHex: string, signatureB64: string, publicKeys: string[]): boolean {
  return publicKeys.some((pub) => verifyHexDigest(digestHex, signatureB64, pub));
}

export function keyPaths(workspace: string): {
  vaultFile: string;
  vaultMeta: string;
  monitorPublic: string;
  auditorPublic: string;
  leasePublic: string;
  sessionPublic: string;
} {
  const paths = vaultPaths(workspace);
  return {
    vaultFile: paths.vaultFile,
    vaultMeta: paths.metaFile,
    monitorPublic: paths.monitorPublic,
    auditorPublic: paths.auditorPublic,
    leasePublic: paths.leasePublic,
    sessionPublic: paths.sessionPublic
  };
}
