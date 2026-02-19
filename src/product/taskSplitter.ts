import { randomUUID } from 'node:crypto';

export interface SubTask { id: string; description: string; order: number; }
export interface SplitTask { taskId: string; description: string; order: number; }
export interface ChunkResult { chunks: string[]; totalChunks: number; }

export function split(task: string, maxSubtasks = 5): SubTask[] {
  // Split on numbered items, semicolons, "and", or newlines
  let parts = task.split(/\d+[.)]\s+/).filter(Boolean);
  if (parts.length <= 1) parts = task.split(/;\s*/);
  if (parts.length <= 1) parts = task.split(/\band\b/i);
  if (parts.length <= 1) parts = task.split(/\n+/);
  const subtasks = parts.filter(p => p.trim().length > 3).slice(0, maxSubtasks).map((p, i) => ({
    id: randomUUID(), description: p.trim(), order: i,
  }));
  return subtasks.length > 0 ? subtasks : [{ id: randomUUID(), description: task.trim(), order: 0 }];
}

export function splitTask(description: string, parts: number): SplitTask[] {
  return Array.from({ length: parts }, (_, i) => ({ taskId: randomUUID(), description: `${description} (part ${i + 1})`, order: i }));
}

export function chunkText(text: string, maxChunkSize?: number): { chunks: string[]; totalChunks: number } {
  const size = maxChunkSize ?? 1000;
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) chunks.push(text.slice(i, i + size));
  return { chunks, totalChunks: chunks.length };
}
