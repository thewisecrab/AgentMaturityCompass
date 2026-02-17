import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import YAML from "yaml";
import { getPrivateKeyPem, getPublicKeyHistory, signHexDigest, verifyHexDigestAny } from "../crypto/keys.js";
import { ensureDir, pathExists, readUtf8, writeFileAtomic } from "../utils/fs.js";
import { sha256Hex } from "../utils/hash.js";
import type { ActionClass } from "../types.js";
import { approvalPolicySchema, type ApprovalClassPolicy, type ApprovalPolicy } from "./approvalPolicySchema.js";
import { appendTransparencyEntry } from "../transparency/logChain.js";

interface SignaturePayload {
  digestSha256: string;
  signature: string;
  signedTs: number;
  signer: "auditor";
}

export function approvalPolicyPath(workspace: string): string {
  return join(workspace, ".amc", "approval-policy.yaml");
}

export function approvalPolicySigPath(workspace: string): string {
  return `${approvalPolicyPath(workspace)}.sig`;
}

export function defaultApprovalPolicy(): ApprovalPolicy {
  return approvalPolicySchema.parse({
    approvalPolicy: {
      version: 1,
      defaults: {
        simulateAlwaysAllowed: true
      },
      actionClasses: {
        READ_ONLY: {
          requiredApprovals: 0,
          rolesAllowed: ["APPROVER", "OWNER"],
          requireDistinctUsers: false,
          ttlMinutes: 60
        },
        WRITE_LOW: {
          requiredApprovals: 1,
          rolesAllowed: ["APPROVER", "OWNER"],
          requireDistinctUsers: false,
          ttlMinutes: 60
        },
        WRITE_HIGH: {
          requiredApprovals: 2,
          rolesAllowed: ["APPROVER", "OWNER"],
          requireDistinctUsers: true,
          ttlMinutes: 15
        },
        DEPLOY: {
          requiredApprovals: 2,
          rolesAllowed: ["APPROVER", "OWNER"],
          requireDistinctUsers: true,
          ttlMinutes: 15,
          requireAssurancePacks: {
            unsafe_tooling: {
              minScore: 85,
              maxSucceeded: 0
            }
          }
        },
        SECURITY: {
          requiredApprovals: 2,
          rolesAllowed: ["OWNER", "AUDITOR"],
          requireDistinctUsers: true,
          ttlMinutes: 10
        },
        FINANCIAL: {
          requiredApprovals: 2,
          rolesAllowed: ["OWNER", "AUDITOR"],
          requireDistinctUsers: true,
          ttlMinutes: 10
        },
        NETWORK_EXTERNAL: {
          requiredApprovals: 2,
          rolesAllowed: ["APPROVER", "OWNER"],
          requireDistinctUsers: true,
          ttlMinutes: 15
        },
        DATA_EXPORT: {
          requiredApprovals: 2,
          rolesAllowed: ["OWNER", "AUDITOR"],
          requireDistinctUsers: true,
          ttlMinutes: 10
        },
        IDENTITY: {
          requiredApprovals: 2,
          rolesAllowed: ["OWNER", "AUDITOR"],
          requireDistinctUsers: true,
          ttlMinutes: 10
        }
      }
    }
  });
}

export function loadApprovalPolicy(workspace: string, explicitPath?: string): ApprovalPolicy {
  const file = explicitPath ? resolve(workspace, explicitPath) : approvalPolicyPath(workspace);
  if (!pathExists(file)) {
    if (!explicitPath) {
      return defaultApprovalPolicy();
    }
    throw new Error(`approval policy not found: ${file}`);
  }
  return approvalPolicySchema.parse(YAML.parse(readUtf8(file)) as unknown);
}

export function signApprovalPolicy(workspace: string, explicitPath?: string): string {
  const path = explicitPath ? resolve(workspace, explicitPath) : approvalPolicyPath(workspace);
  if (!pathExists(path)) {
    throw new Error(`approval policy not found: ${path}`);
  }
  const digest = sha256Hex(readFileSync(path));
  const payload: SignaturePayload = {
    digestSha256: digest,
    signature: signHexDigest(digest, getPrivateKeyPem(workspace, "auditor")),
    signedTs: Date.now(),
    signer: "auditor"
  };
  const sigPath = `${path}.sig`;
  writeFileAtomic(sigPath, JSON.stringify(payload, null, 2), 0o644);
  appendTransparencyEntry({
    workspace,
    type: "APPROVAL_POLICY_SIGNED",
    agentId: "system",
    artifact: {
      kind: "policy",
      sha256: digest,
      id: "approval-policy"
    }
  });
  return sigPath;
}

export function initApprovalPolicy(workspace: string, policy?: ApprovalPolicy): {
  path: string;
  sigPath: string;
} {
  ensureDir(join(workspace, ".amc"));
  const path = approvalPolicyPath(workspace);
  writeFileAtomic(path, YAML.stringify(approvalPolicySchema.parse(policy ?? defaultApprovalPolicy())), 0o644);
  return {
    path,
    sigPath: signApprovalPolicy(workspace)
  };
}

export function verifyApprovalPolicySignature(workspace: string, explicitPath?: string): {
  valid: boolean;
  signatureExists: boolean;
  reason: string | null;
  path: string;
  sigPath: string;
} {
  const path = explicitPath ? resolve(workspace, explicitPath) : approvalPolicyPath(workspace);
  const sigPath = `${path}.sig`;
  if (!pathExists(path)) {
    return { valid: false, signatureExists: false, reason: "approval policy missing", path, sigPath };
  }
  if (!pathExists(sigPath)) {
    return { valid: false, signatureExists: false, reason: "approval policy signature missing", path, sigPath };
  }
  try {
    const sig = JSON.parse(readUtf8(sigPath)) as SignaturePayload;
    const digest = sha256Hex(readFileSync(path));
    if (digest !== sig.digestSha256) {
      return { valid: false, signatureExists: true, reason: "digest mismatch", path, sigPath };
    }
    const valid = verifyHexDigestAny(digest, sig.signature, getPublicKeyHistory(workspace, "auditor"));
    return {
      valid,
      signatureExists: true,
      reason: valid ? null : "signature verification failed",
      path,
      sigPath
    };
  } catch (error) {
    return {
      valid: false,
      signatureExists: true,
      reason: String(error),
      path,
      sigPath
    };
  }
}

export function approvalRuleForAction(policy: ApprovalPolicy, actionClass: ActionClass): ApprovalClassPolicy {
  return policy.approvalPolicy.actionClasses[actionClass] ?? defaultApprovalPolicy().approvalPolicy.actionClasses[actionClass]!;
}
