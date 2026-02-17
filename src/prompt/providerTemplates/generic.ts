import { promptProviderGenericSchema } from "../promptPackSchema.js";

export function buildGenericProviderTemplate(systemMessage: string) {
  return promptProviderGenericSchema.parse({
    v: 1,
    systemMessage
  });
}
