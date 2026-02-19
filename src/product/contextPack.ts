import { randomUUID } from 'node:crypto';

export interface Message { role: string; content: string; }
export interface ContextPack { packId: string; agentId: string; taskType: string; messages: Message[]; keyEntities: string[]; entries: Record<string, unknown>; }
export interface KeyContext { entities: string[]; numbers: number[]; dates: string[]; }

export function buildContextPack(agentId: string, taskType: string, messages: Message[]): ContextPack {
  const keyEntities = messages.flatMap(m => extractKeyContext(m.content).entities);
  return { packId: randomUUID(), agentId, taskType, messages, keyEntities, entries: {} };
}

export function compressContext(messages: Message[], maxTokens: number): Message[] {
  const systemMsgs = messages.filter(m => m.role === 'system');
  const others = messages.filter(m => m.role !== 'system');
  let tokenCount = systemMsgs.reduce((s, m) => s + m.content.split(/\s+/).length, 0);
  const kept: Message[] = [];
  for (let i = others.length - 1; i >= 0; i--) {
    const msg = others[i]!;
    const tokens = msg.content.split(/\s+/).length;
    if (tokenCount + tokens > maxTokens) break;
    tokenCount += tokens;
    kept.unshift(msg);
  }
  return [...systemMsgs, ...kept];
}

export function extractKeyContext(text: string): KeyContext {
  const emails = text.match(/[\w.-]+@[\w.-]+\.\w+/g) ?? [];
  const dates = text.match(/\d{4}-\d{2}-\d{2}/g) ?? [];
  const numbers = (text.match(/\b\d+\.?\d*\b/g) ?? []).map(Number);
  const entities = [...new Set([...emails, ...dates.map(d => `date:${d}`)])];
  return { entities, numbers, dates };
}

export function createContextPack(entries: Record<string, unknown>): ContextPack {
  return { packId: randomUUID(), agentId: '', taskType: '', messages: [], keyEntities: [], entries };
}
