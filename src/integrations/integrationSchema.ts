import { z } from "zod";

export const webhookIntegrationChannelSchema = z.object({
  id: z.string().min(1),
  type: z.literal("webhook"),
  url: z.string().url(),
  secretRef: z.string().startsWith("vault:"),
  enabled: z.boolean()
});

export const slackWebhookIntegrationChannelSchema = z.object({
  id: z.string().min(1),
  type: z.literal("slack_webhook"),
  webhookUrlRef: z.string().startsWith("vault:"),
  channel: z.string().min(1).optional(),
  enabled: z.boolean()
});

export const integrationChannelSchema = z.union([
  webhookIntegrationChannelSchema,
  slackWebhookIntegrationChannelSchema
]);

export const integrationsConfigSchema = z.object({
  integrations: z.object({
    version: z.literal(1),
    channels: z.array(integrationChannelSchema).min(1),
    routing: z.record(z.string().min(1), z.array(z.string().min(1)))
  })
});

export type IntegrationsConfig = z.infer<typeof integrationsConfigSchema>;
