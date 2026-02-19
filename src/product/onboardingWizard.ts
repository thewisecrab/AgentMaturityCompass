import { randomUUID } from 'node:crypto';

export interface OnboardingStep { step: number; title: string; complete: boolean; }
export interface StepData { id: string; title: string; description: string; completed: boolean; data?: unknown; }
export interface Onboarding { id: string; agentId: string; steps: StepData[]; createdAt: number; }

const ARCHETYPE_STEPS: Record<string, { title: string; description: string }[]> = {
  financial: [
    { title: 'Compliance Setup', description: 'Configure regulatory compliance rules' },
    { title: 'Data Sources', description: 'Connect financial data feeds' },
    { title: 'Risk Parameters', description: 'Set risk tolerance thresholds' },
    { title: 'Audit Trail', description: 'Enable audit logging' },
    { title: 'Testing', description: 'Run compliance test suite' },
  ],
  healthcare: [
    { title: 'HIPAA Config', description: 'Configure HIPAA compliance settings' },
    { title: 'Data Encryption', description: 'Set up PHI encryption' },
    { title: 'Access Controls', description: 'Define role-based access' },
    { title: 'Integration', description: 'Connect to EHR systems' },
  ],
  general: [
    { title: 'Basic Config', description: 'Set agent name and description' },
    { title: 'Tool Setup', description: 'Configure available tools' },
    { title: 'Testing', description: 'Run initial test' },
  ],
};

export class OnboardingWizard {
  private onboardings = new Map<string, Onboarding>();

  createOnboarding(agentId: string, archetype: string): Onboarding {
    const templates = ARCHETYPE_STEPS[archetype] ?? ARCHETYPE_STEPS['general']!;
    const steps: StepData[] = templates.map((t, i) => ({ id: randomUUID(), title: t.title, description: t.description, completed: false }));
    const ob: Onboarding = { id: randomUUID(), agentId, steps, createdAt: Date.now() };
    this.onboardings.set(ob.id, ob);
    return ob;
  }

  getStep(onboardingId: string): StepData | undefined {
    const ob = this.onboardings.get(onboardingId);
    return ob?.steps.find(s => !s.completed);
  }

  completeStep(onboardingId: string, stepId: string, data?: unknown): boolean {
    const ob = this.onboardings.get(onboardingId);
    if (!ob) return false;
    const step = ob.steps.find(s => s.id === stepId);
    if (!step) return false;
    step.completed = true;
    step.data = data;
    return true;
  }

  getProgress(onboardingId: string): number {
    const ob = this.onboardings.get(onboardingId);
    if (!ob || ob.steps.length === 0) return 0;
    return ob.steps.filter(s => s.completed).length / ob.steps.length;
  }
}

export function getOnboardingSteps(): OnboardingStep[] {
  return [
    { step: 1, title: 'Configure agent', complete: false },
    { step: 2, title: 'Set policies', complete: false },
    { step: 3, title: 'Run assessment', complete: false },
  ];
}
