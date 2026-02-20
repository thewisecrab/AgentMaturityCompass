/**
 * approvalWorkflow.ts — Multi-stage approval workflow with chains,
 * expiry, escalation, and per-stage required approvals.
 */

import { randomUUID } from 'node:crypto';

/* ── Interfaces ──────────────────────────────────────────────────── */

export interface ApprovalChain {
  stages: string[];
  currentStage: number;
  requiredApprovals: number;
}

export interface ApprovalDecision {
  requestId: string;
  approver: string;
  decision: 'approved' | 'denied';
  reason?: string;
  decidedAt: number;
}

/** Backward-compatible with stubs.ts ApprovalRequest, extended. */
export interface ApprovalRequest {
  requestId: string;
  status: 'pending' | 'approved' | 'denied' | 'expired' | 'escalated';
  action: string;
  requester: string;
  chain?: ApprovalChain;
  reason?: string;
  expiresAt?: number;
  metadata?: Record<string, unknown>;
  decisions: ApprovalDecision[];
  createdAt: number;
}

/* ── Manager ─────────────────────────────────────────────────────── */

export class ApprovalManager {
  private requests = new Map<string, ApprovalRequest>();

  createRequest(
    action: string,
    requester: string,
    chain?: { stages: string[]; requiredApprovals?: number },
    opts?: { expiresAt?: number; metadata?: Record<string, unknown> },
  ): ApprovalRequest {
    const req: ApprovalRequest = {
      requestId: randomUUID(),
      status: 'pending',
      action,
      requester,
      chain: chain
        ? { stages: chain.stages, currentStage: 0, requiredApprovals: chain.requiredApprovals ?? 1 }
        : undefined,
      expiresAt: opts?.expiresAt,
      metadata: opts?.metadata,
      decisions: [],
      createdAt: Date.now(),
    };
    this.requests.set(req.requestId, req);
    return req;
  }

  approve(requestId: string, approver: string, reason?: string): ApprovalRequest {
    const req = this.resolveRequest(requestId);
    const decision: ApprovalDecision = {
      requestId,
      approver,
      decision: 'approved',
      reason,
      decidedAt: Date.now(),
    };
    req.decisions.push(decision);

    if (req.chain) {
      // Count approvals for the current stage
      const stage = req.chain.stages[req.chain.currentStage];
      const stageApprovals = req.decisions.filter(
        d => d.decision === 'approved',
      ).length;

      if (stageApprovals >= req.chain.requiredApprovals) {
        if (req.chain.currentStage < req.chain.stages.length - 1) {
          req.chain.currentStage++;
          // Reset decisions for next stage
          req.decisions = [];
        } else {
          req.status = 'approved';
        }
      }
    } else {
      req.status = 'approved';
    }

    return req;
  }

  deny(requestId: string, approver: string, reason?: string): ApprovalRequest {
    const req = this.resolveRequest(requestId);
    req.decisions.push({
      requestId,
      approver,
      decision: 'denied',
      reason,
      decidedAt: Date.now(),
    });
    req.status = 'denied';
    req.reason = reason;
    return req;
  }

  getStatus(requestId: string): ApprovalRequest {
    const req = this.requests.get(requestId);
    if (!req) throw new Error(`Approval request "${requestId}" not found`);
    // Check expiry
    if (req.status === 'pending' && req.expiresAt && Date.now() > req.expiresAt) {
      req.status = 'expired';
    }
    return req;
  }

  listPending(approver?: string): ApprovalRequest[] {
    const now = Date.now();
    const results: ApprovalRequest[] = [];
    for (const req of this.requests.values()) {
      // Auto-expire
      if (req.status === 'pending' && req.expiresAt && now > req.expiresAt) {
        req.status = 'expired';
      }
      if (req.status !== 'pending') continue;
      if (approver) {
        // Only include if approver is in current chain stage or no chain
        if (req.chain) {
          const currentStage = req.chain.stages[req.chain.currentStage];
          if (currentStage !== approver) continue;
        }
      }
      results.push(req);
    }
    return results;
  }

  escalate(requestId: string): ApprovalRequest {
    const req = this.resolveRequest(requestId);
    req.status = 'escalated';
    return req;
  }

  /* ── Helpers ───────────────────────────────────────────────────── */

  private resolveRequest(requestId: string): ApprovalRequest {
    const req = this.requests.get(requestId);
    if (!req) throw new Error(`Approval request "${requestId}" not found`);
    if (req.status !== 'pending') throw new Error(`Request already ${req.status}`);
    if (req.expiresAt && Date.now() > req.expiresAt) {
      req.status = 'expired';
      throw new Error('Request has expired');
    }
    return req;
  }
}

/* ── Backward-compatible free function (stubs.ts) ────────────────── */

export function createApproval(action: string): ApprovalRequest {
  const mgr = new ApprovalManager();
  return mgr.createRequest(action, 'anonymous');
}
