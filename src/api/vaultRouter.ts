/**
 * vaultRouter.ts — Vault API routes.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import { bodyJson, apiSuccess, apiError } from './apiHelpers.js';

export async function handleVaultRoute(
  pathname: string,
  method: string,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<boolean> {
  if (pathname === '/api/v1/vault/status' && method === 'GET') {
    apiSuccess(res, { status: 'operational', module: 'vault', capabilities: ['redact', 'classify', 'dlp-scan'] });
    return true;
  }

  if (pathname === '/api/v1/vault/redact' && method === 'POST') {
    try {
      const body = await bodyJson<{ text: string; categories?: string[] }>(req);
      if (!body.text) { apiError(res, 400, 'Missing required field: text'); return true; }
      const { scanForPII } = await import('../vault/dlp.js');
      const scanResult = scanForPII(body.text);
      apiSuccess(res, scanResult);
    } catch (err) {
      apiError(res, 500, err instanceof Error ? err.message : 'Internal error');
    }
    return true;
  }

  if (pathname === '/api/v1/vault/classify' && method === 'POST') {
    try {
      const body = await bodyJson<{ content: string }>(req);
      if (!body.content) { apiError(res, 400, 'Missing required field: content'); return true; }
      // Simple classification
      const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(body.content);
      const hasPhone = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(body.content);
      const hasSSN = /\b\d{3}-?\d{2}-?\d{4}\b/.test(body.content);
      const classification = hasSSN ? 'RESTRICTED' : hasEmail || hasPhone ? 'INTERNAL' : 'PUBLIC';
      apiSuccess(res, { classification, piiDetected: { email: hasEmail, phone: hasPhone, ssn: hasSSN } });
    } catch (err) {
      apiError(res, 500, err instanceof Error ? err.message : 'Internal error');
    }
    return true;
  }

  return false;
}
