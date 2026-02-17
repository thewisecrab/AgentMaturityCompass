import { promptLatestPackPath } from "./promptPolicyStore.js";
import { listPromptSnapshots } from "./promptPackStore.js";
import { inspectPromptPackArtifact } from "./promptPackArtifact.js";
import { pathExists } from "../utils/fs.js";

export interface PromptDiffResult {
  agentId: string;
  basePackId: string | null;
  comparePackId: string | null;
  changed: boolean;
  fields: Array<{ path: string; before: string; after: string }>;
}

export function diffLatestPromptPack(workspace: string, agentId: string): PromptDiffResult {
  const latestPath = promptLatestPackPath(workspace, agentId);
  if (!pathExists(latestPath)) {
    return {
      agentId,
      basePackId: null,
      comparePackId: null,
      changed: false,
      fields: []
    };
  }
  const snapshots = listPromptSnapshots(workspace, agentId);
  const latest = inspectPromptPackArtifact(latestPath);
  const previousPath = snapshots.filter((row) => row !== latestPath).sort((a, b) => a.localeCompare(b)).at(-2) ?? null;
  if (!previousPath || !pathExists(previousPath)) {
    return {
      agentId,
      basePackId: null,
      comparePackId: latest.pack.packId,
      changed: true,
      fields: [{ path: "pack", before: "<none>", after: latest.pack.packId }]
    };
  }
  const previous = inspectPromptPackArtifact(previousPath);
  const fields: Array<{ path: string; before: string; after: string }> = [];
  if (previous.pack.templateId !== latest.pack.templateId) {
    fields.push({ path: "templateId", before: previous.pack.templateId, after: latest.pack.templateId });
  }
  if (previous.providerFiles.openai.systemMessage !== latest.providerFiles.openai.systemMessage) {
    fields.push({ path: "provider.openai.systemMessage", before: previous.providerFiles.openai.systemMessage, after: latest.providerFiles.openai.systemMessage });
  }
  if (previous.providerFiles.anthropic.system !== latest.providerFiles.anthropic.system) {
    fields.push({ path: "provider.anthropic.system", before: previous.providerFiles.anthropic.system, after: latest.providerFiles.anthropic.system });
  }
  if (previous.providerFiles.gemini.systemInstruction !== latest.providerFiles.gemini.systemInstruction) {
    fields.push({
      path: "provider.gemini.systemInstruction",
      before: previous.providerFiles.gemini.systemInstruction,
      after: latest.providerFiles.gemini.systemInstruction
    });
  }
  return {
    agentId,
    basePackId: previous.pack.packId,
    comparePackId: latest.pack.packId,
    changed: fields.length > 0,
    fields
  };
}
