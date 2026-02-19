import { randomUUID } from 'node:crypto';

export interface ScaffoldResult { id: string; archetype: string; name: string; files: Record<string, string>; }
export interface Scaffold { scaffoldId: string; template: string; files: string[]; }

const ARCHETYPES: Record<string, { description: string; files: Record<string, string> }> = {
  chatbot: { description: 'Conversational AI agent', files: {
    'agent.ts': 'export class ChatbotAgent {\n  async respond(input: string): Promise<string> {\n    return `Echo: ${input}`;\n  }\n}',
    'config.json': '{"model":"default","maxTurns":50,"temperature":0.7}',
  }},
  'data-processor': { description: 'Data ingestion and transformation agent', files: {
    'agent.ts': 'export class DataProcessorAgent {\n  async process(data: unknown[]): Promise<unknown[]> {\n    return data;\n  }\n}',
    'pipeline.ts': 'export const stages = ["ingest", "validate", "transform", "output"];',
  }},
  'workflow-agent': { description: 'Multi-step workflow orchestrator', files: {
    'agent.ts': 'export class WorkflowAgent {\n  async execute(steps: string[]): Promise<void> {}\n}',
    'workflow.json': '{"steps":[],"retryPolicy":{"maxRetries":3}}',
  }},
  'research-agent': { description: 'Information gathering and synthesis agent', files: {
    'agent.ts': 'export class ResearchAgent {\n  async research(query: string): Promise<string> {\n    return `Research results for: ${query}`;\n  }\n}',
    'sources.json': '{"sources":["web","docs","knowledge-base"]}',
  }},
};

export function scaffoldAgent(archetype: string, name: string): ScaffoldResult {
  const tmpl = ARCHETYPES[archetype] ?? ARCHETYPES['chatbot']!;
  const files: Record<string, string> = {};
  for (const [file, content] of Object.entries(tmpl!.files)) files[`${name}/${file}`] = content;
  return { id: randomUUID(), archetype, name, files };
}

export function listArchetypes(): { name: string; description: string }[] {
  return Object.entries(ARCHETYPES).map(([name, { description }]) => ({ name, description }));
}

export function createScaffold(template: string, files: string[]): Scaffold {
  return { scaffoldId: randomUUID(), template, files };
}
