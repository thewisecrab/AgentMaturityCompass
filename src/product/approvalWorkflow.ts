import { randomUUID } from 'node:crypto';

export interface ApprovalRequest { requestId: string; status: 'pending' | 'approved' | 'denied'; }
export interface PendingApproval { id: string; action: string; requester: string; approvers: string[]; status: 'pending' | 'approved' | 'rejected'; approvedBy: string[]; rejectedBy?: string; reason?: string; createdAt: number; }

export class ApprovalWorkflow {
  private approvals = new Map<string, PendingApproval>();

  createApproval(action: string, requester: string, approvers: string[]): PendingApproval {
    const approval: PendingApproval = { id: randomUUID(), action, requester, approvers, status: 'pending', approvedBy: [], createdAt: Date.now() };
    this.approvals.set(approval.id, approval);
    return approval;
  }

  approve(id: string, approver: string): PendingApproval {
    const a = this.approvals.get(id);
    if (!a) throw new Error(`Approval ${id} not found`);
    if (a.status !== 'pending') throw new Error(`Approval already ${a.status}`);
    if (!a.approvers.includes(approver)) throw new Error('Not an approver');
    a.approvedBy.push(approver);
    if (a.approvedBy.length >= a.approvers.length) a.status = 'approved';
    return a;
  }

  reject(id: string, approver: string, reason: string): PendingApproval {
    const a = this.approvals.get(id);
    if (!a) throw new Error(`Approval ${id} not found`);
    if (a.status !== 'pending') throw new Error(`Approval already ${a.status}`);
    a.status = 'rejected';
    a.rejectedBy = approver;
    a.reason = reason;
    return a;
  }

  getPending(): PendingApproval[] { return [...this.approvals.values()].filter(a => a.status === 'pending'); }
  getStatus(id: string): PendingApproval | undefined { return this.approvals.get(id); }
}

export function createApproval(action: string): ApprovalRequest {
  return { requestId: randomUUID(), status: 'pending' };
}
