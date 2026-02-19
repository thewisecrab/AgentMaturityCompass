/**
 * Workflow orchestration engine.
 */

import { randomUUID } from 'node:crypto';

export interface WorkflowStep {
  id: string;
  name: string;
  action: string;
}

export interface Workflow {
  workflowId: string;
  name: string;
  steps: WorkflowStep[];
  status: 'pending' | 'running' | 'complete' | 'failed';
}

export class WorkflowEngine {
  private workflows = new Map<string, Workflow>();

  create(name: string, steps: Omit<WorkflowStep, 'id'>[]): Workflow {
    const wf: Workflow = {
      workflowId: randomUUID(),
      name,
      steps: steps.map(s => ({ ...s, id: randomUUID() })),
      status: 'pending',
    };
    this.workflows.set(wf.workflowId, wf);
    return wf;
  }

  createWorkflow(name: string, steps: Omit<WorkflowStep, 'id'>[]): Workflow {
    return this.create(name, steps);
  }

  start(workflowId: string): Workflow {
    const wf = this.workflows.get(workflowId);
    if (!wf) throw new Error(`Workflow not found: ${workflowId}`);
    wf.status = 'running';
    return wf;
  }

  getStatus(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId);
  }
}
