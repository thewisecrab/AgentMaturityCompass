/**
 * apiHelpers.ts — Shared utilities for API route handlers.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';

/* ── Parse JSON body ─────────────────────────────────────────────── */

export async function bodyJson<T = unknown>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf-8');
        resolve(raw.length > 0 ? JSON.parse(raw) : ({} as T));
      } catch (err) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

/* ── Query parameter extraction ──────────────────────────────────── */

export function queryParam(url: string, key: string): string | undefined {
  const idx = url.indexOf('?');
  if (idx === -1) return undefined;
  const params = new URLSearchParams(url.slice(idx + 1));
  return params.get(key) ?? undefined;
}

/* ── Path parameter extraction (/api/v1/foo/:id) ─────────────────── */

export function pathParam(pathname: string, template: string): Record<string, string> | null {
  const tParts = template.split('/');
  const pParts = pathname.split('/');
  if (tParts.length !== pParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < tParts.length; i++) {
    if (tParts[i]!.startsWith(':')) {
      params[tParts[i]!.slice(1)] = pParts[i]!;
    } else if (tParts[i] !== pParts[i]) {
      return null;
    }
  }
  return params;
}

/* ── Response helpers ────────────────────────────────────────────── */

export function apiSuccess(res: ServerResponse, data: unknown, status = 200): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true, data }));
}

export function apiError(res: ServerResponse, status: number, message: string): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, error: message }));
}

/* ── Method guard ────────────────────────────────────────────────── */

export function requireMethod(req: IncomingMessage, res: ServerResponse, method: string): boolean {
  if (req.method?.toUpperCase() === method.toUpperCase()) return true;
  apiError(res, 405, `Method ${req.method} not allowed, expected ${method}`);
  return false;
}
