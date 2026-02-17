export const FOUR_CS = ["Concept", "Culture", "Capabilities", "Configuration"] as const;

export type FourC = (typeof FOUR_CS)[number];

export const FOUR_C_DEFINITIONS: Record<FourC, string> = {
  Concept:
    "Concept: the what and why of the agent’s role, value creation, ecosystem context, and north-star intent.",
  Culture:
    "Culture: the agent’s operational values, ethics, honesty, and trust discipline in outputs and behavior.",
  Capabilities:
    "Capabilities: the ability to create and manage value through skills, learning-in-action, and validated performance.",
  Configuration:
    "Configuration: the systems, policies, guardrails, tools, and observability that make behavior sustainable and safe in realtime."
};

export function normalizeFourC(input: string): FourC {
  const value = input.trim();
  if (value === "Concept" || value === "Culture" || value === "Capabilities" || value === "Configuration") {
    return value;
  }
  throw new Error(`Invalid 4C value: ${input}`);
}

export function fourCDefinitionsMarkdown(): string {
  return FOUR_CS.map((id) => `- ${FOUR_C_DEFINITIONS[id]}`).join("\n");
}
