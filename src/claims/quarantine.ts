import { z } from "zod";
import { readUtf8, pathExists, writeFileAtomic, ensureDir } from "../utils/fs.js";
import { join } from "node:path";
import YAML from "yaml";
import { signHexDigest, verifyHexDigestAny } from "../crypto/keys.js";
import { sha256Hex } from "../utils/hash.js";
import { canonicalize } from "../utils/json.js";

/**
 * Quarantine policy configuration for claim promotion gates
 * Prevents claims from being promoted from QUARANTINE/PROVISIONAL to PROMOTED
 * without sufficient cross-session evidence, inspired by the prior art's Pathfinder system
 */

export const QuarantinePolicySchema = z.object({
  // Minimum distinct sessions that must contain supporting evidence
  minDistinctSessions: z.number().int().min(1).default(3),
  // Minimum distinct calendar days evidence must span
  minDistinctDays: z.number().int().min(1).default(2),
  // Minimum number of evidence events supporting the claim
  minEvidenceEvents: z.number().int().min(1).default(5),
  // Require at least one OBSERVED-tier evidence ref
  requireObservedEvidence: z.boolean().default(true),
  // Maximum age (ms) before a QUARANTINE claim auto-expires
  quarantineTtlMs: z.number().int().min(0).default(30 * 24 * 60 * 60 * 1000), // 30 days
  // Maximum age (ms) before a PROVISIONAL claim must be re-verified
  provisionalTtlMs: z.number().int().min(0).default(14 * 24 * 60 * 60 * 1000), // 14 days
  // Require owner or auditor co-signature for promotion to PROMOTED
  requireOwnerCoSign: z.boolean().default(true),
  // Minimum confidence score required for promotion
  minConfidenceForPromotion: z.number().min(0).max(1).default(0.7),
  // Claims with these provenance tags can NEVER be promoted beyond PROVISIONAL
  nonPromotableTags: z.array(z.string()).default(["SESSION_LOCAL", "REFERENCE_ONLY"])
});

export type QuarantinePolicy = z.infer<typeof QuarantinePolicySchema>;

interface QuarantinePolicyFile {
  policy: QuarantinePolicy;
  policy_hash: string;
  signature: string;
}

function quarantinePolicyPath(workspace: string): string {
  return join(workspace, ".amc", "claims", "quarantine-policy.yaml");
}

/**
 * Load quarantine policy from workspace, return defaults if missing
 */
export function loadQuarantinePolicy(workspace: string): QuarantinePolicy {
  const path = quarantinePolicyPath(workspace);

  if (!pathExists(path)) {
    // Return defaults
    return QuarantinePolicySchema.parse({});
  }

  try {
    const content = readUtf8(path);
    const data = YAML.parse(content) as Record<string, unknown>;

    // Extract policy object (ignore signature/hash during load)
    const policyData = data.policy as Record<string, unknown>;
    return QuarantinePolicySchema.parse(policyData);
  } catch (err) {
    throw new Error(
      `Failed to load quarantine policy from ${path}: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

/**
 * Save quarantine policy with signature
 */
export function saveQuarantinePolicy(
  workspace: string,
  policy: QuarantinePolicy,
  signFn: (digestHex: string) => string
): void {
  const path = quarantinePolicyPath(workspace);

  // Validate policy
  const validated = QuarantinePolicySchema.parse(policy);

  // Compute hash of canonical policy
  const canonical = canonicalize(validated);
  const policyHash = sha256Hex(canonical);

  // Sign the hash
  const signature = signFn(policyHash);

  // Build file structure
  const fileContent: QuarantinePolicyFile = {
    policy: validated,
    policy_hash: policyHash,
    signature
  };

  // Write as YAML
  ensureDir(join(workspace, ".amc", "claims"));
  const yamlString = YAML.stringify(fileContent, { indent: 2 });
  writeFileAtomic(path, yamlString, 0o644);
}

/**
 * Verify quarantine policy signature and integrity
 */
export function verifyQuarantinePolicy(
  workspace: string,
  publicKeys: string[]
): { valid: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const path = quarantinePolicyPath(workspace);

  if (!pathExists(path)) {
    // Missing policy is valid - uses defaults
    return { valid: true, reasons: ["Using default policy (file not found)"] };
  }

  try {
    const content = readUtf8(path);
    const data = YAML.parse(content) as Record<string, unknown>;

    const policyHash = data.policy_hash as string | undefined;
    const signature = data.signature as string | undefined;
    const policyData = data.policy as Record<string, unknown>;

    if (!policyHash) {
      reasons.push("policy_hash field missing");
      return { valid: false, reasons };
    }

    if (!signature) {
      reasons.push("signature field missing");
      return { valid: false, reasons };
    }

    // Verify policy can be parsed
    const policy = QuarantinePolicySchema.parse(policyData);

    // Verify hash matches canonical form
    const canonical = canonicalize(policy);
    const expectedHash = sha256Hex(canonical);

    if (expectedHash !== policyHash) {
      reasons.push(
        `policy_hash mismatch: expected ${expectedHash}, got ${policyHash}`
      );
      return { valid: false, reasons };
    }

    // Verify signature
    if (!verifyHexDigestAny(policyHash, signature, publicKeys)) {
      reasons.push("signature verification failed against provided public keys");
      return { valid: false, reasons };
    }

    reasons.push("Policy signature verified");
    return { valid: true, reasons };
  } catch (err) {
    reasons.push(
      `Failed to verify policy: ${err instanceof Error ? err.message : String(err)}`
    );
    return { valid: false, reasons };
  }
}
