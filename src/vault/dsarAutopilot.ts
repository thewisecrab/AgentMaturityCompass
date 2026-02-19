/**
 * DSAR (Data Subject Access Request) automation.
 */

import { randomUUID } from 'node:crypto';

export interface DsarRequest {
  requestId: string;
  subject: string;
  type: 'access' | 'delete' | 'portability';
  status: 'pending' | 'processing' | 'complete';
}

export class DsarAutopilot {
  private requests = new Map<string, DsarRequest>();

  submitRequest(subjectOrInput: string | { subjectId: string; type: 'access' | 'deletion' | 'portability' }, type?: DsarRequest['type']): DsarRequest {
    const subjectId = typeof subjectOrInput === 'string' ? subjectOrInput : subjectOrInput.subjectId;
    const reqType =
      typeof subjectOrInput === 'string' ? (type ?? 'access') : (subjectOrInput.type === 'deletion' ? 'delete' : subjectOrInput.type);
    const req: DsarRequest = { requestId: randomUUID(), subject: subjectId, type: reqType, status: 'pending' };
    this.requests.set(req.requestId, req);
    return req;
  }

  processRequest(request: string | DsarRequest): DsarRequest {
    const requestId = typeof request === 'string' ? request : request.requestId;
    const req = this.requests.get(requestId);
    if (!req) throw new Error(`DSAR request not found: ${requestId}`);
    req.status = 'complete';
    return req;
  }

  getStatus(requestId: string): DsarRequest | undefined {
    return this.requests.get(requestId);
  }
}
