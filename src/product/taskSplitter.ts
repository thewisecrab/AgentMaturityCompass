/**
 * taskSplitter.ts — Task decomposition with agent type registry,
 * capability matching, and complexity estimation.
 */

import { randomUUID } from 'node:crypto';

export interface SubTask {
  id: string;
  description: string;
  order: number;
  complexity: 'low' | 'medium' | 'high';
  estimatedMs: number;
  suggestedAgentType?: string;
}

export interface SplitTask {
  taskId: string;
  description: string;
  order: number;
}

export interface ChunkResult {
  chunks: string[];
  totalChunks: number;
}

export interface AgentType {
  type: string;
  capabilities: string[];
  maxComplexity: 'low' | 'medium' | 'high';
}

/* ── Agent type registry ─────────────────────────────────────────── */

const AGENT_REGISTRY: AgentType[] = [
  { type: 'classifier', capabilities: ['classify', 'categorize', 'label', 'tag', 'sort'], maxComplexity: 'low' },
  { type: 'analyzer', capabilities: ['analyze', 'evaluate', 'assess', 'review', 'inspect', 'audit'], maxComplexity: 'high' },
  { type: 'generator', capabilities: ['generate', 'create', 'write', 'produce', 'compose', 'draft'], maxComplexity: 'high' },
  { type: 'retriever', capabilities: ['search', 'find', 'lookup', 'fetch', 'query', 'retrieve'], maxComplexity: 'medium' },
  { type: 'transformer', capabilities: ['transform', 'convert', 'translate', 'format', 'parse', 'extract'], maxComplexity: 'medium' },
  { type: 'validator', capabilities: ['validate', 'verify', 'check', 'test', 'confirm', 'assert'], maxComplexity: 'medium' },
  { type: 'orchestrator', capabilities: ['coordinate', 'orchestrate', 'manage', 'schedule', 'pipeline'], maxComplexity: 'high' },
];

const customAgents: AgentType[] = [];

export function registerAgentType(agent: AgentType): void {
  customAgents.push(agent);
}

/* ── Capability matching ─────────────────────────────────────────── */

function matchAgent(description: string): string | undefined {
  const lower = description.toLowerCase();
  const all = [...customAgents, ...AGENT_REGISTRY];
  let best: { type: string; score: number } | undefined;

  for (const agent of all) {
    const score = agent.capabilities.filter(cap => lower.includes(cap)).length;
    if (score > 0 && (!best || score > best.score)) {
      best = { type: agent.type, score };
    }
  }
  return best?.type;
}

/* ── Complexity estimation ───────────────────────────────────────── */

function estimateComplexity(description: string): 'low' | 'medium' | 'high' {
  const words = description.split(/\s+/).length;
  const complexIndicators = /\b(analyze|integrate|orchestrate|optimize|refactor|implement|design|architect)\b/i;
  const simpleIndicators = /\b(list|get|set|check|read|count|delete|remove)\b/i;

  if (complexIndicators.test(description) || words > 20) return 'high';
  if (simpleIndicators.test(description) && words < 10) return 'low';
  return 'medium';
}

function estimateMs(complexity: 'low' | 'medium' | 'high'): number {
  switch (complexity) {
    case 'low': return 1000;
    case 'medium': return 5000;
    case 'high': return 15000;
  }
}

/* ── Split task into subtasks ────────────────────────────────────── */

export function split(task: string, maxSubtasks = 5): SubTask[] {
  let parts = task.split(/\d+[.)]\s+/).filter(Boolean);
  if (parts.length <= 1) parts = task.split(/;\s*/);
  if (parts.length <= 1) parts = task.split(/\band\b/i);
  if (parts.length <= 1) parts = task.split(/\n+/);

  const subtasks = parts
    .filter(p => p.trim().length > 3)
    .slice(0, maxSubtasks)
    .map((p, i) => {
      const desc = p.trim();
      const complexity = estimateComplexity(desc);
      return {
        id: randomUUID(),
        description: desc,
        order: i,
        complexity,
        estimatedMs: estimateMs(complexity),
        suggestedAgentType: matchAgent(desc),
      };
    });

  if (subtasks.length === 0) {
    const complexity = estimateComplexity(task);
    return [{
      id: randomUUID(),
      description: task.trim(),
      order: 0,
      complexity,
      estimatedMs: estimateMs(complexity),
      suggestedAgentType: matchAgent(task),
    }];
  }
  return subtasks;
}

export function splitTask(description: string, parts: number): SplitTask[] {
  return Array.from({ length: parts }, (_, i) => ({
    taskId: randomUUID(),
    description: `${description} (part ${i + 1})`,
    order: i,
  }));
}

export function chunkText(text: string, maxChunkSize?: number): ChunkResult {
  const size = maxChunkSize ?? 1000;
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) chunks.push(text.slice(i, i + size));
  return { chunks, totalChunks: chunks.length };
}

/* ── Total estimate for a split ──────────────────────────────────── */

export function estimateTotalMs(subtasks: SubTask[]): { totalMs: number; parallelMs: number } {
  const totalMs = subtasks.reduce((sum, s) => sum + s.estimatedMs, 0);
  const parallelMs = Math.max(...subtasks.map(s => s.estimatedMs), 0);
  return { totalMs, parallelMs };
}
