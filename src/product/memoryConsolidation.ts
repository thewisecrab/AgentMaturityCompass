import { randomUUID } from 'node:crypto';

export interface Memory { id: string; content: string; topic?: string; tags?: string[]; importance?: number; timestamp?: number; }
export interface ConsolidatedResult { groups: { topic: string; memories: Memory[]; merged: string }[]; duplicatesRemoved: number; total: number; }
export interface ConsolidatedMemory { memoryId: string; entries: number; compressed: boolean; }

function jaccard(a: Set<string>, b: Set<string>): number {
  const intersection = [...a].filter(x => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

export function consolidate(memories: Memory[]): ConsolidatedResult {
  const groups = new Map<string, Memory[]>();
  for (const m of memories) {
    const topic = m.topic ?? m.tags?.[0] ?? 'general';
    if (!groups.has(topic)) groups.set(topic, []);
    groups.get(topic)!.push(m);
  }
  let duplicatesRemoved = 0;
  const result: ConsolidatedResult['groups'] = [];
  for (const [topic, mems] of groups) {
    const unique: Memory[] = [];
    for (const m of mems) {
      const words = new Set(m.content.toLowerCase().split(/\s+/));
      const isDup = unique.some(u => jaccard(words, new Set(u.content.toLowerCase().split(/\s+/))) > 0.8);
      if (isDup) { duplicatesRemoved++; } else { unique.push(m); }
    }
    for (const u of unique) {
      const freq = mems.filter(m => jaccard(new Set(m.content.toLowerCase().split(/\s+/)), new Set(u.content.toLowerCase().split(/\s+/))) > 0.5).length;
      const recency = u.timestamp ? 1 / (1 + (Date.now() - u.timestamp) / 86400000) : 0.5;
      u.importance = Math.min(1, (u.importance ?? 0.5) * 0.5 + freq * 0.1 + recency * 0.4);
    }
    result.push({ topic, memories: unique, merged: unique.map(u => u.content).join(' | ') });
  }
  return { groups: result, duplicatesRemoved, total: memories.length };
}

export function consolidateMemory(entries: unknown[]): ConsolidatedMemory {
  return { memoryId: randomUUID(), entries: entries.length, compressed: true };
}
