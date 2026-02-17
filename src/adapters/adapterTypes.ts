import { z } from "zod";

export const adapterKindSchema = z.enum(["CLI", "LIBRARY_NODE", "LIBRARY_PYTHON"]);
export const adapterRunModeSchema = z.enum(["SUPERVISE", "SANDBOX"]);
export const providerFamilySchema = z.enum([
  "OPENAI_COMPAT",
  "ANTHROPIC",
  "GEMINI",
  "XAI_GROK",
  "OPENROUTER",
  "CUSTOM_HTTP"
]);
export const leaseCarrierStrategySchema = z.enum(["ENV_API_KEY", "HEADER_X_AMC_LEASE"]);

export const adapterDefinitionSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  kind: adapterKindSchema,
  detection: z.object({
    commandCandidates: z.array(z.string().min(1)).min(1),
    versionArgs: z.array(z.string().min(1)).default(["--version"]),
    parseVersionRegex: z.string().min(1)
  }),
  providerFamily: providerFamilySchema,
  defaultRunMode: adapterRunModeSchema,
  envStrategy: z.object({
    leaseCarrier: leaseCarrierStrategySchema.default("ENV_API_KEY"),
    baseUrlEnv: z.object({
      keys: z.array(z.string().min(1)).default([]),
      valueTemplate: z.string().default("{{gatewayBase}}{{providerRoute}}")
    }),
    apiKeyEnv: z.object({
      keys: z.array(z.string().min(1)).default([]),
      valueTemplate: z.string().default("{{lease}}")
    }),
    proxyEnv: z.object({
      setHttpProxy: z.boolean().default(true),
      setHttpsProxy: z.boolean().default(true),
      noProxy: z.string().default("localhost,127.0.0.1,::1")
    })
  }),
  commandTemplate: z.object({
    executable: z.string().min(1),
    args: z.array(z.string()).default([]),
    supportsStdin: z.boolean().default(true)
  }),
  notes: z.string().optional()
});

export type AdapterDefinition = z.infer<typeof adapterDefinitionSchema>;
export type AdapterKind = z.infer<typeof adapterKindSchema>;
export type AdapterRunMode = z.infer<typeof adapterRunModeSchema>;

export interface AdapterExecutionPlan {
  adapter: AdapterDefinition;
  executable: string;
  args: string[];
  providerRoute: string;
  model: string;
  mode: AdapterRunMode;
}

