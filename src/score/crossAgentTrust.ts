/**
 * Cross-Agent Trust Protocol
 *
 * From Moltbook research: agents struggle with cross-platform identity,
 * trust bootstrapping, and web-of-trust without human intermediary.
 *
 * AMC-native agent-to-agent trust verification protocol.
 */

import { createHash, createHmac } from 'node:crypto';

export interface AgentIdentityClaim {
  agentId: string;
  publicKeyHash: string;           // SHA-256 of agent's public signing key
  amcPassportId?: string;          // Agent Passport ID (if issued)
  amcScore?: number;               // Last known AMC score
  amcLevel?: string;               // e.g. 'L3'
  issuingWorkspace: string;        // AMC workspace that issued this identity
  issuedAt: Date;
  expiresAt?: Date;
  signature: string;               // HMAC-SHA256 of claim fields
}

export interface TrustVerificationResult {
  trusted: boolean;
  trustLevel: 'full' | 'conditional' | 'limited' | 'untrusted';
  reasons: string[];
  score: number;           // 0–100 composite trust score
  grantedScopes: string[]; // what this agent is allowed to do
  requiredActions?: string[];
}

export interface TrustPolicyRule {
  minAmcScore?: number;
  minAmcLevel?: string;
  requirePassport: boolean;
  requireFreshness: boolean;       // claim must be < 24h old
  allowedWorkspaces?: string[];    // whitelist of trusted workspaces
}

const LEVEL_ORDER = ['L1', 'L2', 'L3', 'L4', 'L5'];

function levelToNum(level: string): number {
  return LEVEL_ORDER.indexOf(level);
}

export function verifyAgentClaim(
  claim: AgentIdentityClaim,
  policy: TrustPolicyRule,
  sharedSecret: string,
): TrustVerificationResult {
  const reasons: string[] = [];
  let score = 0;

  // 1. Signature check
  const payload = `${claim.agentId}:${claim.publicKeyHash}:${claim.issuingWorkspace}:${claim.issuedAt.toISOString()}`;
  const expectedSig = createHmac('sha256', sharedSecret).update(payload).digest('hex');
  const sigValid = claim.signature === expectedSig;
  if (sigValid) { score += 30; reasons.push('Signature valid'); }
  else { reasons.push('SIGNATURE INVALID — claim may be forged'); }

  // 2. Freshness check
  const ageHours = (Date.now() - claim.issuedAt.getTime()) / 3600000;
  const expired = claim.expiresAt && claim.expiresAt < new Date();
  if (!policy.requireFreshness || (ageHours < 24 && !expired)) {
    score += 15;
    reasons.push(`Claim is fresh (${ageHours.toFixed(1)}h old)`);
  } else {
    reasons.push(`Claim is stale (${ageHours.toFixed(1)}h old) — exceeds 24h freshness requirement`);
  }

  // 3. AMC Score check
  if (policy.minAmcScore !== undefined) {
    const agentScore = claim.amcScore ?? 0;
    if (agentScore >= policy.minAmcScore) {
      score += 20;
      reasons.push(`AMC score ${agentScore} meets minimum ${policy.minAmcScore}`);
    } else {
      reasons.push(`AMC score ${agentScore} below required ${policy.minAmcScore}`);
    }
  } else {
    score += 20;
  }

  // 4. AMC Level check
  if (policy.minAmcLevel && claim.amcLevel) {
    if (levelToNum(claim.amcLevel) >= levelToNum(policy.minAmcLevel)) {
      score += 15;
      reasons.push(`AMC level ${claim.amcLevel} meets minimum ${policy.minAmcLevel}`);
    } else {
      reasons.push(`AMC level ${claim.amcLevel} below required ${policy.minAmcLevel}`);
    }
  } else {
    score += 15;
  }

  // 5. Passport check
  if (!policy.requirePassport || claim.amcPassportId) {
    score += 10;
    if (claim.amcPassportId) reasons.push(`AMC Passport present: ${claim.amcPassportId}`);
  } else {
    reasons.push('AMC Passport required but not present');
  }

  // 6. Workspace check
  if (!policy.allowedWorkspaces || policy.allowedWorkspaces.includes(claim.issuingWorkspace)) {
    score += 10;
  } else {
    reasons.push(`Workspace '${claim.issuingWorkspace}' not in trusted workspace list`);
  }

  const trustLevel: TrustVerificationResult['trustLevel'] =
    !sigValid ? 'untrusted' :
    score >= 80 ? 'full' :
    score >= 60 ? 'conditional' :
    score >= 40 ? 'limited' :
    'untrusted';

  const grantedScopes =
    trustLevel === 'full' ? ['read', 'write', 'execute', 'delegate'] :
    trustLevel === 'conditional' ? ['read', 'write'] :
    trustLevel === 'limited' ? ['read'] :
    [];

  const requiredActions: string[] = [];
  if (!claim.amcPassportId) requiredActions.push('Issue AMC Passport: amc passport create --agent ' + claim.agentId);
  if (ageHours > 24) requiredActions.push('Refresh identity claim: amc identity refresh --agent ' + claim.agentId);

  return {
    trusted: trustLevel !== 'untrusted',
    trustLevel, reasons, score,
    grantedScopes,
    requiredActions: requiredActions.length ? requiredActions : undefined,
  };
}

export function createAgentClaim(
  agentId: string,
  publicKeyHash: string,
  issuingWorkspace: string,
  sharedSecret: string,
  opts?: { amcScore?: number; amcLevel?: string; amcPassportId?: string; ttlHours?: number },
): AgentIdentityClaim {
  const issuedAt = new Date();
  const expiresAt = opts?.ttlHours ? new Date(issuedAt.getTime() + opts.ttlHours * 3600000) : undefined;
  const payload = `${agentId}:${publicKeyHash}:${issuingWorkspace}:${issuedAt.toISOString()}`;
  const signature = createHmac('sha256', sharedSecret).update(payload).digest('hex');

  return {
    agentId, publicKeyHash, issuingWorkspace, issuedAt, expiresAt, signature,
    amcScore: opts?.amcScore,
    amcLevel: opts?.amcLevel,
    amcPassportId: opts?.amcPassportId,
  };
}
