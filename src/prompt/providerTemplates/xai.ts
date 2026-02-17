import { promptProviderOpenAiSchema } from "../promptPackSchema.js";

export function buildXaiProviderTemplate(systemMessage: string) {
  return promptProviderOpenAiSchema.parse({
    v: 1,
    systemMessage,
    responseHints: {
      preferJson: true,
      responseFormatJson: true
    }
  });
}
