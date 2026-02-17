import { z } from "zod";

export const bridgeProviderSchema = z.enum([
  "openai",
  "anthropic",
  "gemini",
  "openrouter",
  "xai",
  "local"
]);

export type BridgeProvider = z.infer<typeof bridgeProviderSchema>;

export const bridgeProviderConfigSchema = z.object({
  enabled: z.boolean().default(true),
  gatewayRoute: z.string().startsWith("/"),
  modelAllowlist: z.array(z.string().min(1)).min(1).default(["*"])
});

export const bridgeConfigSchema = z.object({
  bridge: z.object({
    version: z.literal(1),
    providers: z.object({
      openai: bridgeProviderConfigSchema,
      anthropic: bridgeProviderConfigSchema,
      gemini: bridgeProviderConfigSchema,
      openrouter: bridgeProviderConfigSchema,
      xai: bridgeProviderConfigSchema,
      local: bridgeProviderConfigSchema
    }),
    redaction: z.object({
      redactPromptText: z.boolean().default(true),
      maxSummaryChars: z.number().int().min(64).max(8192).default(512)
    })
  })
});

export type BridgeConfig = z.infer<typeof bridgeConfigSchema>;

export function defaultBridgeConfig(): BridgeConfig {
  return bridgeConfigSchema.parse({
    bridge: {
      version: 1,
      providers: {
        openai: {
          enabled: true,
          gatewayRoute: "/openai",
          modelAllowlist: ["gpt-*", "o1-*", "o3-*"]
        },
        anthropic: {
          enabled: true,
          gatewayRoute: "/anthropic",
          modelAllowlist: ["claude-*"]
        },
        gemini: {
          enabled: true,
          gatewayRoute: "/gemini",
          modelAllowlist: ["gemini-*"]
        },
        openrouter: {
          enabled: true,
          gatewayRoute: "/openrouter",
          modelAllowlist: ["openrouter/*", "gpt-*", "claude-*", "gemini-*", "grok-*"]
        },
        xai: {
          enabled: true,
          gatewayRoute: "/grok",
          modelAllowlist: ["grok-*"]
        },
        local: {
          enabled: true,
          gatewayRoute: "/local",
          modelAllowlist: ["local-*", "gpt-*"]
        }
      },
      redaction: {
        redactPromptText: true,
        maxSummaryChars: 512
      }
    }
  });
}
