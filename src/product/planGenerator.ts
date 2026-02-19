/**
 * Task planning — generates execution plans from goals.
 */

import { randomUUID } from 'node:crypto';

export interface PlanStep {
  id: string;
  action: string;
  dependsOn: string[];
  estimatedMs: number;
  riskLevel: string;
}

export interface Plan {
  planId: string;
  goal: string;
  steps: PlanStep[];
  estimatedTotalMs: number;
}

export function generatePlan(goal: string, constraints?: string[]): Plan {
  const steps: PlanStep[] = [];
  const words = goal.toLowerCase().split(/\s+/);

  // Generate reasonable steps based on goal keywords
  const analyzeId = randomUUID();
  steps.push({ id: analyzeId, action: `Analyze: ${goal}`, dependsOn: [], estimatedMs: 2000, riskLevel: 'low' });

  const planId = randomUUID();
  steps.push({ id: planId, action: 'Create execution plan', dependsOn: [analyzeId], estimatedMs: 1000, riskLevel: 'low' });

  const execId = randomUUID();
  const risk = words.some(w => ['delete', 'deploy', 'modify'].includes(w)) ? 'high' : 'medium';
  steps.push({ id: execId, action: `Execute: ${goal}`, dependsOn: [planId], estimatedMs: 5000, riskLevel: risk });

  const verifyId = randomUUID();
  steps.push({ id: verifyId, action: 'Verify results', dependsOn: [execId], estimatedMs: 1000, riskLevel: 'low' });

  if (constraints?.length) {
    const constraintId = randomUUID();
    steps.splice(2, 0, { id: constraintId, action: `Apply constraints: ${constraints.join(', ')}`, dependsOn: [planId], estimatedMs: 500, riskLevel: 'low' });
  }

  return {
    planId: randomUUID(),
    goal,
    steps,
    estimatedTotalMs: steps.reduce((sum, s) => sum + s.estimatedMs, 0),
  };
}
