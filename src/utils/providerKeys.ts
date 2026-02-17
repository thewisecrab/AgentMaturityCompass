export const PROVIDER_KEY_ENV_NAMES = [
  "OPENAI_API_KEY",
  "AZURE_OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "GEMINI_API_KEY",
  "GOOGLE_API_KEY",
  "XAI_API_KEY",
  "OPENROUTER_API_KEY",
  "GROQ_API_KEY",
  "MISTRAL_API_KEY",
  "COHERE_API_KEY",
  "TOGETHER_API_KEY",
  "FIREWORKS_API_KEY",
  "PERPLEXITY_API_KEY",
  "DEEPSEEK_API_KEY",
  "QWEN_API_KEY"
] as const;

export function stripProviderKeys(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const next: NodeJS.ProcessEnv = { ...env };
  for (const key of PROVIDER_KEY_ENV_NAMES) {
    delete next[key];
  }
  return next;
}

export function dummyProviderKeyEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of PROVIDER_KEY_ENV_NAMES) {
    out[key] = "amc_dummy";
  }
  return out;
}
