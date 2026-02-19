/**
 * Step-up authentication — human approval workflow.
 */

import { randomUUID } from 'node:crypto';

export type RiskLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical';

export interface StepUpRequest {
  requestId: string;
  action: string;
  riskLevel: RiskLevel;
  createdAt: Date;
}

export interface StepUpDecision {
  approved: boolean;
  approver: string;
  requestId: string;
}

export class StepUpAuth {
  private requests = new Map<string, StepUpRequest>();

  createRequest(action: string, risk: RiskLevel): StepUpRequest {
    const req: StepUpRequest = {
      requestId: randomUUID(),
      action,
      riskLevel: risk,
      createdAt: new Date(),
    };
    this.requests.set(req.requestId, req);
    return req;
  }

  approve(requestId: string, approver: string): StepUpDecision {
    return { approved: true, approver, requestId };
  }

  deny(requestId: string, approver: string): StepUpDecision {
    return { approved: false, approver, requestId };
  }
}
