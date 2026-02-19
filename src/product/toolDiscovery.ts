import { randomUUID } from 'node:crypto';

export interface ToolSpec { id: string; name: string; description: string; capabilities: string[]; }
export interface DiscoveredTool { name: string; description: string; score: number; }

export class ToolDiscovery {
  private tools = new Map<string, ToolSpec>();

  register(spec: Omit<ToolSpec, 'id'>): ToolSpec {
    const tool: ToolSpec = { id: randomUUID(), ...spec };
    this.tools.set(tool.id, tool);
    return tool;
  }

  discover(capability: string): ToolSpec[] {
    const cap = capability.toLowerCase();
    return [...this.tools.values()].filter(t => t.capabilities.some(c => c.toLowerCase().includes(cap)));
  }

  listTools(): ToolSpec[] { return [...this.tools.values()]; }
  getToolSpec(toolId: string): ToolSpec | undefined { return this.tools.get(toolId); }

  rankTools(task: string): { tool: ToolSpec; score: number }[] {
    const words = new Set(task.toLowerCase().split(/\W+/));
    return [...this.tools.values()].map(t => {
      const desc = `${t.name} ${t.description} ${t.capabilities.join(' ')}`.toLowerCase().split(/\W+/);
      const score = desc.filter(w => words.has(w)).length / Math.max(words.size, 1);
      return { tool: t, score };
    }).sort((a, b) => b.score - a.score);
  }
}

export function discoverTools(query: string, catalog: Array<{ name: string; description: string }>): DiscoveredTool[] {
  return catalog.map(t => ({ ...t, score: t.description.includes(query) ? 1 : 0.5 }));
}
