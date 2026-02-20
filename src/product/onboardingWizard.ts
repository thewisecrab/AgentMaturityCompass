/**
 * onboardingWizard.ts — Multi-step onboarding with configurable steps,
 * progress tracking, and session management.
 */

import { randomUUID } from 'node:crypto';

/* ── Interfaces ──────────────────────────────────────────────────── */

export interface OnboardingConfig {
  steps: Array<{ title: string; description?: string }>;
  metadata?: Record<string, unknown>;
}

export interface OnboardingSession {
  sessionId: string;
  tenantId: string;
  currentStep: number;
  completedSteps: number[];
  status: 'in_progress' | 'completed' | 'abandoned';
  config: OnboardingConfig;
  createdAt: number;
  updatedAt: number;
}

/** Backward-compat shape from stubs.ts */
export interface OnboardingStep { step: number; title: string; complete: boolean; }

/* ── Defaults ────────────────────────────────────────────────────── */

const DEFAULT_CONFIG: OnboardingConfig = {
  steps: [
    { title: 'Configure agent', description: 'Set up agent identity and capabilities' },
    { title: 'Set policies', description: 'Define guardrails and behavioral policies' },
    { title: 'Run assessment', description: 'Execute initial maturity assessment' },
    { title: 'Review results', description: 'Review assessment findings and recommendations' },
    { title: 'Deploy', description: 'Deploy the configured agent to production' },
  ],
};

/* ── Class ───────────────────────────────────────────────────────── */

export class OnboardingWizard {
  private sessions = new Map<string, OnboardingSession>();

  createSession(tenantId: string, config?: OnboardingConfig): OnboardingSession {
    const session: OnboardingSession = {
      sessionId: randomUUID(),
      tenantId,
      currentStep: 0,
      completedSteps: [],
      status: 'in_progress',
      config: config ?? DEFAULT_CONFIG,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.sessions.set(session.sessionId, session);
    return session;
  }

  getSession(sessionId: string): OnboardingSession | undefined {
    return this.sessions.get(sessionId);
  }

  advanceStep(sessionId: string): OnboardingSession {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    if (session.status === 'completed') throw new Error('Session already completed');

    const totalSteps = session.config.steps.length;
    if (session.currentStep < totalSteps - 1) {
      session.currentStep++;
    } else {
      session.status = 'completed';
    }
    session.updatedAt = Date.now();
    return session;
  }

  completeStep(sessionId: string, stepIndex: number): OnboardingSession {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    if (stepIndex < 0 || stepIndex >= session.config.steps.length) {
      throw new Error(`Step index ${stepIndex} out of range`);
    }

    if (!session.completedSteps.includes(stepIndex)) {
      session.completedSteps.push(stepIndex);
      session.completedSteps.sort((a, b) => a - b);
    }

    // Auto-complete session if all steps done
    if (session.completedSteps.length === session.config.steps.length) {
      session.status = 'completed';
    }
    session.updatedAt = Date.now();
    return session;
  }

  getProgress(sessionId: string): { completed: number; total: number; percent: number } {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    const total = session.config.steps.length;
    const completed = session.completedSteps.length;
    return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }

  listSessions(tenantId?: string): OnboardingSession[] {
    const all = [...this.sessions.values()];
    return tenantId ? all.filter(s => s.tenantId === tenantId) : all;
  }
}

/* ── Legacy compat ───────────────────────────────────────────────── */

export function getOnboardingSteps(): OnboardingStep[] {
  return [
    { step: 1, title: 'Configure agent', complete: false },
    { step: 2, title: 'Set policies', complete: false },
    { step: 3, title: 'Run assessment', complete: false },
    { step: 4, title: 'Review results', complete: false },
    { step: 5, title: 'Deploy', complete: false },
  ];
}
