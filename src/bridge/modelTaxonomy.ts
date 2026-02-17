import { join } from "node:path";
import YAML from "yaml";
import { z } from "zod";
import { ensureDir, pathExists, readUtf8, writeFileAtomic } from "../utils/fs.js";
import { signFileWithAuditor, verifySignedFileWithAuditor, type SignedFileVerification } from "../org/orgSigner.js";
import type { BridgeProvider } from "./bridgeConfigSchema.js";
import { wildcardMatch } from "../leases/leaseVerifier.js";

const modelFamilySchema = z.object({
  pattern: z.string().min(1),
  tags: z.array(z.string().min(1)).default([])
});

const providerTaxonomySchema = z.object({
  provider: z.enum(["openai", "anthropic", "gemini", "openrouter", "xai", "local"]),
  families: z.array(modelFamilySchema).min(1)
});

export const modelTaxonomySchema = z.object({
  taxonomy: z.object({
    version: z.literal(1),
    providers: z.array(providerTaxonomySchema).min(1)
  })
});

export type ModelTaxonomy = z.infer<typeof modelTaxonomySchema>;

export function defaultModelTaxonomy(): ModelTaxonomy {
  return modelTaxonomySchema.parse({
    taxonomy: {
      version: 1,
      providers: [
        {
          provider: "openai",
          families: [
            { pattern: "gpt-*", tags: ["chat", "json", "tools"] },
            { pattern: "o1-*", tags: ["reasoning"] },
            { pattern: "o3-*", tags: ["reasoning"] }
          ]
        },
        {
          provider: "anthropic",
          families: [{ pattern: "claude-*", tags: ["chat", "tools"] }]
        },
        {
          provider: "gemini",
          families: [{ pattern: "gemini-*", tags: ["chat", "multimodal"] }]
        },
        {
          provider: "xai",
          families: [{ pattern: "grok-*", tags: ["chat"] }]
        },
        {
          provider: "openrouter",
          families: [
            { pattern: "openrouter/*", tags: ["aggregator"] },
            { pattern: "gpt-*", tags: ["aggregator"] },
            { pattern: "claude-*", tags: ["aggregator"] },
            { pattern: "gemini-*", tags: ["aggregator"] },
            { pattern: "grok-*", tags: ["aggregator"] }
          ]
        },
        {
          provider: "local",
          families: [
            { pattern: "local-*", tags: ["local"] },
            { pattern: "gpt-*", tags: ["local"] }
          ]
        }
      ]
    }
  });
}

export function modelTaxonomyPath(workspace: string): string {
  return join(workspace, ".amc", "model-taxonomy.yaml");
}

export function modelTaxonomySigPath(workspace: string): string {
  return `${modelTaxonomyPath(workspace)}.sig`;
}

export function saveModelTaxonomy(workspace: string, taxonomy: ModelTaxonomy): string {
  const parsed = modelTaxonomySchema.parse(taxonomy);
  const path = modelTaxonomyPath(workspace);
  ensureDir(join(workspace, ".amc"));
  writeFileAtomic(path, YAML.stringify(parsed), 0o644);
  return path;
}

export function loadModelTaxonomy(workspace: string): ModelTaxonomy {
  const path = modelTaxonomyPath(workspace);
  if (!pathExists(path)) {
    return defaultModelTaxonomy();
  }
  const parsed = YAML.parse(readUtf8(path));
  return modelTaxonomySchema.parse(parsed);
}

export function signModelTaxonomy(workspace: string): string {
  return signFileWithAuditor(workspace, modelTaxonomyPath(workspace));
}

export function verifyModelTaxonomySignature(workspace: string): SignedFileVerification {
  return verifySignedFileWithAuditor(workspace, modelTaxonomyPath(workspace));
}

export function initModelTaxonomy(workspace: string): { path: string; sigPath: string } {
  const path = saveModelTaxonomy(workspace, defaultModelTaxonomy());
  const sigPath = signModelTaxonomy(workspace);
  return { path, sigPath };
}

export function taxonomyAllowsModel(workspace: string, provider: BridgeProvider, model: string | null): boolean {
  if (!model || model.trim().length === 0) {
    return false;
  }
  const taxonomy = loadModelTaxonomy(workspace);
  const providerDef = taxonomy.taxonomy.providers.find((row) => row.provider === provider);
  if (!providerDef) {
    return false;
  }
  return providerDef.families.some((family) => wildcardMatch(family.pattern, model));
}
