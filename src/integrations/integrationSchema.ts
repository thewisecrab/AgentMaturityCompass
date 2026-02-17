import { z } from "zod";

export const integrationChannelSchema = z.object({
  id: z.string().min(1),
  type: z.literal("webhook"),
  url: z.string().url(),
  secretRef: z.string().startsWith("vault:"),
  enabled: z.boolean()
});

export const integrationsConfigSchema = z.object({
  integrations: z.object({
    version: z.literal(1),
    channels: z.array(integrationChannelSchema).min(1),
    routing: z.record(z.string().min(1), z.array(z.string().min(1)))
  })
});

export type IntegrationsConfig = z.infer<typeof integrationsConfigSchema>;
