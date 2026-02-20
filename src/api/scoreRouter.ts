/**
 * scoreRouter.ts — Score/diagnostic API routes.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import { bodyJson, apiSuccess, apiError, pathParam } from './apiHelpers.js';
import { randomUUID } from 'node:crypto';

/* ── In-memory session store ─────────────────────────────────────── */

interface DiagSession {
  id: string;
  agentId: string;
  answers: Record<string, { value: number; notes?: string }>;
  createdAt: string;
  completedAt?: string;
}

const sessions = new Map<string, DiagSession>();

export async function handleScoreRoute(
  pathname: string,
  method: string,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<boolean> {
  if (pathname === '/api/v1/score/status' && method === 'GET') {
    apiSuccess(res, { status: 'operational', module: 'score', activeSessions: sessions.size });
    return true;
  }

  // POST /api/v1/score/session — create diagnostic session
  if (pathname === '/api/v1/score/session' && method === 'POST') {
    try {
      const body = await bodyJson<{ agentId: string }>(req);
      if (!body.agentId) { apiError(res, 400, 'Missing required field: agentId'); return true; }
      const session: DiagSession = {
        id: randomUUID(),
        agentId: body.agentId,
        answers: {},
        createdAt: new Date().toISOString(),
      };
      sessions.set(session.id, session);
      apiSuccess(res, { sessionId: session.id, agentId: session.agentId }, 201);
    } catch (err) {
      apiError(res, 500, err instanceof Error ? err.message : 'Internal error');
    }
    return true;
  }

  // GET /api/v1/score/question/:sessionId
  const qParams = pathParam(pathname, '/api/v1/score/question/:sessionId');
  if (qParams && method === 'GET') {
    const session = sessions.get(qParams.sessionId!);
    if (!session) { apiError(res, 404, 'Session not found'); return true; }
    try {
      const { questionBank } = await import('../diagnostic/questionBank.js');
      const answered = new Set(Object.keys(session.answers));
      const next = questionBank.find(q => !answered.has(q.id));
      if (!next) {
        apiSuccess(res, { complete: true, answeredCount: answered.size });
      } else {
        apiSuccess(res, { complete: false, question: next, answeredCount: answered.size, totalQuestions: questionBank.length });
      }
    } catch (err) {
      apiError(res, 500, err instanceof Error ? err.message : 'Internal error');
    }
    return true;
  }

  // POST /api/v1/score/answer
  if (pathname === '/api/v1/score/answer' && method === 'POST') {
    try {
      const body = await bodyJson<{ sessionId: string; questionId: string; value: number; notes?: string }>(req);
      if (!body.sessionId || !body.questionId || body.value === undefined) {
        apiError(res, 400, 'Missing required fields: sessionId, questionId, value');
        return true;
      }
      const session = sessions.get(body.sessionId);
      if (!session) { apiError(res, 404, 'Session not found'); return true; }
      session.answers[body.questionId] = { value: body.value, notes: body.notes };
      apiSuccess(res, { recorded: true, answeredCount: Object.keys(session.answers).length });
    } catch (err) {
      apiError(res, 500, err instanceof Error ? err.message : 'Internal error');
    }
    return true;
  }

  // GET /api/v1/score/result/:sessionId
  const rParams = pathParam(pathname, '/api/v1/score/result/:sessionId');
  if (rParams && method === 'GET') {
    const session = sessions.get(rParams.sessionId!);
    if (!session) { apiError(res, 404, 'Session not found'); return true; }
    const answeredCount = Object.keys(session.answers).length;
    const totalScore = Object.values(session.answers).reduce((s, a) => s + a.value, 0);
    const maxPossible = answeredCount * 5;
    const percentage = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;
    const level = percentage >= 80 ? 5 : percentage >= 60 ? 4 : percentage >= 40 ? 3 : percentage >= 20 ? 2 : 1;

    apiSuccess(res, {
      sessionId: session.id,
      agentId: session.agentId,
      answeredCount,
      totalScore,
      maxPossible,
      percentage,
      level,
      createdAt: session.createdAt,
    });
    return true;
  }

  return false;
}
