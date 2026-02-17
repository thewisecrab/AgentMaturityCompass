import { promptProviderOpenAiSchema } from "../promptPackSchema.js";

export function buildOpenAiProviderTemplate(systemMessage: string, preferJson: boolean) {
  return promptProviderOpenAiSchema.parse({
    v: 1,
    systemMessage,
    responseHints: {
      preferJson,
      responseFormatJson: preferJson
    }
  });
}
