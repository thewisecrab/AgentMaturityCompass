import { randomUUID } from 'node:crypto';

export interface ToolDef { id: string; name: string; inputType?: string; outputType?: string; }
export interface Chain { id: string; tools: ToolDef[]; valid: boolean; }
export interface ToolChain { chainId: string; tools: string[]; }

export class ToolChainBuilder {
  private chains = new Map<string, Chain>();

  buildChain(tools: ToolDef[], _goal?: string): Chain {
    // Order tools by input/output type compatibility
    const ordered: ToolDef[] = [];
    const remaining = [...tools];
    if (remaining.length > 0) ordered.push(remaining.shift()!);
    while (remaining.length > 0) {
      const last = ordered[ordered.length - 1];
      const lastOutput = last?.outputType;
      const idx = remaining.findIndex(t => t.inputType === lastOutput);
      ordered.push(idx >= 0 ? remaining.splice(idx, 1)[0]! : remaining.shift()!);
    }
    const chain: Chain = { id: randomUUID(), tools: ordered, valid: true };
    this.chains.set(chain.id, chain);
    return chain;
  }

  executeChain(chainId: string, input: unknown): { steps: { tool: string; output: string }[] } {
    const chain = this.chains.get(chainId);
    if (!chain) throw new Error('Chain not found');
    return { steps: chain.tools.map(t => ({ tool: t.name, output: `[${t.name} output]` })) };
  }

  validateChain(chain: Chain): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const seen = new Set<string>();
    for (const t of chain.tools) {
      if (seen.has(t.id)) errors.push(`Duplicate tool: ${t.name}`);
      seen.add(t.id);
    }
    return { valid: errors.length === 0, errors };
  }
}

export function buildToolChain(tools: string[]): ToolChain {
  return { chainId: randomUUID(), tools };
}
