import { promptProviderAnthropicSchema } from "../promptPackSchema.js";

export function buildAnthropicProviderTemplate(system: string) {
  return promptProviderAnthropicSchema.parse({
    v: 1,
    system,
    maxTokensHint: 1024
  });
}
