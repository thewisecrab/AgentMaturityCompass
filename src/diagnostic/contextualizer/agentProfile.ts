import { z } from "zod";

export const agentProfileSchema = z.object({
  v: z.literal(1),
  agentId: z.string().min(1),
  agentType: z.enum(["code-agent", "support-agent", "ops-agent", "research-agent", "sales-agent", "other"]),
  toolFamilies: z.array(z.string().min(1)).default([]),
  modelFamilies: z.array(z.string().min(1)).default([]),
  riskTier: z.enum(["low", "med", "high", "critical"]),
  operatingMode: z.enum(["interactive", "batch", "autonomous"]),
  capabilities: z.object({
    notary: z.boolean(),
    plugins: z.boolean(),
    forecast: z.boolean(),
    benchmarks: z.boolean()
  }),
  generatedTs: z.number().int()
});

export type AgentProfile = z.infer<typeof agentProfileSchema>;
