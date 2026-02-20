/**
 * watchRouter.ts — Watch API routes.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import { bodyJson, apiSuccess, apiError, pathParam } from './apiHelpers.js';

export async function handleWatchRoute(
  pathname: string,
  method: string,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<boolean> {
  if (pathname === '/api/v1/watch/status' && method === 'GET') {
    apiSuccess(res, { status: 'operational', module: 'watch', capabilities: ['attest', 'receipts'] });
    return true;
  }

  if (pathname === '/api/v1/watch/attest' && method === 'POST') {
    try {
      const body = await bodyJson<{ output: string; agentId: string; metadata?: Record<string, unknown> }>(req);
      if (!body.output || !body.agentId) {
        apiError(res, 400, 'Missing required fields: output, agentId');
        return true;
      }
      const { attestOutput } = await import('../watch/outputAttestation.js');
      const result = attestOutput(body.output);
      apiSuccess(res, { ...result, agentId: body.agentId });
    } catch (err) {
      apiError(res, 500, err instanceof Error ? err.message : 'Internal error');
    }
    return true;
  }

  // GET /api/v1/watch/receipts/:agentId
  const receiptsParams = pathParam(pathname, '/api/v1/watch/receipts/:agentId');
  if (receiptsParams && method === 'GET') {
    try {
      apiSuccess(res, {
        agentId: receiptsParams.agentId,
        receipts: [],
        message: 'Receipt listing requires agent workspace context',
      });
    } catch (err) {
      apiError(res, 500, err instanceof Error ? err.message : 'Internal error');
    }
    return true;
  }

  return false;
}
