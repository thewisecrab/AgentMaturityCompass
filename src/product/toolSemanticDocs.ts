import { randomUUID } from 'node:crypto';

export interface ToolSpec { id: string; name: string; description: string; params?: { name: string; type: string }[]; }
export interface SemanticDoc { toolName: string; summary: string; examples: string[]; params: string[]; }

export function generateDocs(toolSpec: ToolSpec): SemanticDoc {
  const params = (toolSpec.params ?? []).map(p => `${p.name}: ${p.type}`);
  const examples = [`Use ${toolSpec.name} to ${toolSpec.description.toLowerCase()}`, `Example: await ${toolSpec.name}(${params.map(p => p.split(':')[0]).join(', ')})`];
  return { toolName: toolSpec.name, summary: toolSpec.description, examples, params };
}

export function searchTools(query: string, tools: ToolSpec[]): { tool: ToolSpec; score: number }[] {
  const terms = new Set(query.toLowerCase().split(/\W+/));
  return tools.map(t => {
    const words = `${t.name} ${t.description}`.toLowerCase().split(/\W+/);
    const score = words.filter(w => terms.has(w)).length / Math.max(terms.size, 1);
    return { tool: t, score };
  }).sort((a, b) => b.score - a.score);
}

export function enrichSpec(toolId: string, examples: string[]): SemanticDoc {
  return { toolName: toolId, summary: '', examples, params: [] };
}

export function generateSemanticDocs(toolName: string, description: string): SemanticDoc {
  return { toolName, summary: description, examples: [`Use ${toolName} to...`], params: [] };
}
