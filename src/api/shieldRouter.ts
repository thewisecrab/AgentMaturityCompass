/**
 * shieldRouter.ts — Shield API routes.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import { bodyJson, apiSuccess, apiError, requireMethod } from './apiHelpers.js';

export async function handleShieldRoute(
  pathname: string,
  method: string,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<boolean> {
  if (pathname === '/api/v1/shield/status' && method === 'GET') {
    apiSuccess(res, { status: 'operational', module: 'shield', capabilities: ['scan', 'injection-detect', 'sanitize'] });
    return true;
  }

  if (pathname === '/api/v1/shield/scan/skill' && method === 'POST') {
    if (!requireMethod(req, res, 'POST')) return true;
    try {
      const body = await bodyJson<{ code: string; language?: string }>(req);
      if (!body.code) { apiError(res, 400, 'Missing required field: code'); return true; }
      // Dynamic import to avoid hard dependency
      const { analyzeSkill } = await import('../shield/analyzer.js');
      const result = analyzeSkill(body.code);
      apiSuccess(res, result);
    } catch (err) {
      apiError(res, 500, err instanceof Error ? err.message : 'Internal error');
    }
    return true;
  }

  if (pathname === '/api/v1/shield/detect/injection' && method === 'POST') {
    try {
      const body = await bodyJson<{ input: string }>(req);
      if (!body.input) { apiError(res, 400, 'Missing required field: input'); return true; }
      const { detectInjection } = await import('../shield/detector.js');
      const result = detectInjection(body.input);
      apiSuccess(res, result);
    } catch (err) {
      apiError(res, 500, err instanceof Error ? err.message : 'Internal error');
    }
    return true;
  }

  if (pathname === '/api/v1/shield/sanitize' && method === 'POST') {
    try {
      const body = await bodyJson<{ input: string }>(req);
      if (!body.input) { apiError(res, 400, 'Missing required field: input'); return true; }
      const { sanitize } = await import('../shield/sanitizer.js');
      const result = sanitize(body.input);
      apiSuccess(res, result);
    } catch (err) {
      apiError(res, 500, err instanceof Error ? err.message : 'Internal error');
    }
    return true;
  }

  return false;
}
