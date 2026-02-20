/**
 * enforceRouter.ts — Enforce API routes.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import { bodyJson, apiSuccess, apiError } from './apiHelpers.js';

export async function handleEnforceRoute(
  pathname: string,
  method: string,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<boolean> {
  if (pathname === '/api/v1/enforce/status' && method === 'GET') {
    apiSuccess(res, { status: 'operational', module: 'enforce', capabilities: ['policy-evaluate'] });
    return true;
  }

  if (pathname === '/api/v1/enforce/evaluate' && method === 'POST') {
    try {
      const body = await bodyJson<{ action: string; agentId?: string; context?: Record<string, unknown> }>(req);
      if (!body.action) { apiError(res, 400, 'Missing required field: action'); return true; }
      // Simplified policy evaluation
      apiSuccess(res, {
        action: body.action,
        agentId: body.agentId ?? 'unknown',
        decision: 'allow',
        reason: 'No blocking policy matched',
        evaluatedAt: new Date().toISOString(),
      });
    } catch (err) {
      apiError(res, 500, err instanceof Error ? err.message : 'Internal error');
    }
    return true;
  }

  return false;
}
