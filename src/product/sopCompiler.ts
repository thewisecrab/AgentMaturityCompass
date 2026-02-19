import { randomUUID } from 'node:crypto';

export interface SopStep { id: string; text: string; type: 'condition' | 'action' | 'validation' | 'info'; order: number; }
export interface CompiledSop { id: string; steps: SopStep[]; valid: boolean; errors: string[]; }
export interface CompiledSOP { sopId: string; steps: string[]; version: string; }

export function compileSop(sopText: string): CompiledSop {
  const lines = sopText.split('\n').map(l => l.trim()).filter(Boolean);
  const steps: SopStep[] = [];
  for (const line of lines) {
    const cleaned = line.replace(/^[\d]+[.)]\s*|^[-*]\s*/, '').trim();
    if (!cleaned) continue;
    let type: SopStep['type'] = 'info';
    if (/^(if|when|unless|provided)\b/i.test(cleaned)) type = 'condition';
    else if (/^(do|execute|send|run|create|update|delete|call)\b/i.test(cleaned)) type = 'action';
    else if (/^(verify|check|ensure|confirm|validate|assert)\b/i.test(cleaned)) type = 'validation';
    steps.push({ id: randomUUID(), text: cleaned, type, order: steps.length });
  }
  return { id: randomUUID(), steps, valid: steps.length > 0, errors: steps.length === 0 ? ['No steps found'] : [] };
}

export function validateSop(sop: CompiledSop): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (sop.steps.length === 0) errors.push('SOP has no steps');
  const actions = sop.steps.filter(s => s.type === 'action');
  if (actions.length === 0) errors.push('SOP has no action steps');
  return { valid: errors.length === 0, errors };
}

export function compileSOP(steps: string[]): CompiledSOP {
  return { sopId: randomUUID(), steps, version: '1.0' };
}
