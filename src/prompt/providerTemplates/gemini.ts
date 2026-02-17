import { promptProviderGeminiSchema } from "../promptPackSchema.js";

export function buildGeminiProviderTemplate(systemInstruction: string) {
  return promptProviderGeminiSchema.parse({
    v: 1,
    systemInstruction,
    safetySettings: [
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" }
    ]
  });
}
