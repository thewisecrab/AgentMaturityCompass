import { randomUUID } from 'node:crypto';

export interface WfStep { id: string; name: string; type: 'action' | 'condition' | 'wait'; }
export interface WfTemplate { id: string; name: string; description: string; steps: WfStep[]; }
export interface WorkflowTemplate { templateId: string; name: string; steps: string[]; }

const BUILT_IN: WfTemplate[] = [
  { id: 'approval-flow', name: 'Approval Flow', description: 'Multi-step approval workflow', steps: [
    { id: '1', name: 'Submit Request', type: 'action' }, { id: '2', name: 'Check Policy', type: 'condition' },
    { id: '3', name: 'Route to Approver', type: 'action' }, { id: '4', name: 'Await Approval', type: 'wait' },
    { id: '5', name: 'Execute Action', type: 'action' },
  ]},
  { id: 'data-pipeline', name: 'Data Pipeline', description: 'ETL data processing', steps: [
    { id: '1', name: 'Extract', type: 'action' }, { id: '2', name: 'Validate', type: 'condition' },
    { id: '3', name: 'Transform', type: 'action' }, { id: '4', name: 'Load', type: 'action' },
  ]},
  { id: 'customer-support', name: 'Customer Support', description: 'Support ticket workflow', steps: [
    { id: '1', name: 'Classify Ticket', type: 'action' }, { id: '2', name: 'Check Knowledge Base', type: 'action' },
    { id: '3', name: 'Needs Human?', type: 'condition' }, { id: '4', name: 'Respond', type: 'action' },
  ]},
  { id: 'content-generation', name: 'Content Generation', description: 'Content creation pipeline', steps: [
    { id: '1', name: 'Research', type: 'action' }, { id: '2', name: 'Draft', type: 'action' },
    { id: '3', name: 'Review', type: 'condition' }, { id: '4', name: 'Publish', type: 'action' },
  ]},
];

export class WorkflowTemplateRegistry {
  private templates = new Map<string, WfTemplate>(BUILT_IN.map(t => [t.id, t]));

  listTemplates(): WfTemplate[] { return [...this.templates.values()]; }

  applyTemplate(agentId: string, templateId: string): WfTemplate | undefined {
    return this.templates.get(templateId);
  }

  createTemplate(spec: { name: string; description: string; steps: WfStep[] }): WfTemplate {
    const t: WfTemplate = { id: randomUUID(), ...spec };
    this.templates.set(t.id, t);
    return t;
  }

  exportTemplate(id: string): string | undefined {
    const t = this.templates.get(id);
    return t ? JSON.stringify(t, null, 2) : undefined;
  }
}

export function createWorkflowTemplate(name: string, steps: string[]): WorkflowTemplate {
  return { templateId: randomUUID(), name, steps };
}
