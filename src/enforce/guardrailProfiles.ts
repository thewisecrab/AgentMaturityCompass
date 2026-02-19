export interface GuardrailDefinition {
  name: string;
  description: string;
  category: "security" | "compliance" | "quality" | "cost" | "safety";
  defaultEnabled: boolean;
}

export interface GuardrailProfile {
  name: string;
  description: string;
  guardrails: string[];
}

export const AVAILABLE_GUARDRAILS: GuardrailDefinition[] = [
  { name: "prompt-injection-detection", description: "Detect and block prompt injection attempts", category: "security", defaultEnabled: true },
  { name: "pii-redaction", description: "Automatically redact PII from agent outputs", category: "compliance", defaultEnabled: false },
  { name: "output-toxicity-filter", description: "Filter toxic or harmful agent outputs", category: "safety", defaultEnabled: true },
  { name: "hallucination-detector", description: "Flag outputs with low grounding confidence", category: "quality", defaultEnabled: false },
  { name: "cost-budget-limit", description: "Enforce per-session and daily cost limits", category: "cost", defaultEnabled: false },
  { name: "tool-call-allowlist", description: "Restrict which tools the agent can invoke", category: "security", defaultEnabled: false },
  { name: "data-exfiltration-guard", description: "Prevent sensitive data from leaving the system", category: "security", defaultEnabled: true },
  { name: "rate-limiter", description: "Limit request rate to prevent abuse", category: "security", defaultEnabled: true },
  { name: "audit-trail-enforcer", description: "Require all actions to be logged to the ledger", category: "compliance", defaultEnabled: false },
  { name: "human-approval-gate", description: "Require human approval for high-risk actions", category: "safety", defaultEnabled: false },
  { name: "model-version-pin", description: "Pin model versions to prevent unexpected behavior changes", category: "quality", defaultEnabled: false },
  { name: "context-window-guard", description: "Prevent context window overflow and truncation", category: "quality", defaultEnabled: false },
  { name: "compliance-boundary", description: "Enforce regulatory compliance boundaries (HIPAA, SOC2, etc.)", category: "compliance", defaultEnabled: false },
  { name: "credential-rotation", description: "Enforce credential rotation policies", category: "security", defaultEnabled: false },
];

export const GUARDRAIL_PROFILES: GuardrailProfile[] = [
  {
    name: "minimal",
    description: "Basic protections for development and testing",
    guardrails: ["prompt-injection-detection", "output-toxicity-filter", "rate-limiter"],
  },
  {
    name: "standard",
    description: "Recommended for production deployments",
    guardrails: ["prompt-injection-detection", "output-toxicity-filter", "data-exfiltration-guard", "rate-limiter", "audit-trail-enforcer", "cost-budget-limit"],
  },
  {
    name: "strict",
    description: "Maximum protection for high-risk environments",
    guardrails: AVAILABLE_GUARDRAILS.map(g => g.name),
  },
  {
    name: "healthcare",
    description: "HIPAA-aligned guardrails for healthcare AI agents",
    guardrails: ["prompt-injection-detection", "pii-redaction", "output-toxicity-filter", "data-exfiltration-guard", "rate-limiter", "audit-trail-enforcer", "human-approval-gate", "compliance-boundary", "credential-rotation"],
  },
  {
    name: "financial",
    description: "SOC2/PCI-aligned guardrails for financial AI agents",
    guardrails: ["prompt-injection-detection", "pii-redaction", "data-exfiltration-guard", "rate-limiter", "audit-trail-enforcer", "cost-budget-limit", "tool-call-allowlist", "compliance-boundary", "credential-rotation"],
  },
];

export interface GuardrailState {
  enabledGuardrails: Set<string>;
}

export function createGuardrailState(): GuardrailState {
  return { enabledGuardrails: new Set(AVAILABLE_GUARDRAILS.filter(g => g.defaultEnabled).map(g => g.name)) };
}

export function enableGuardrail(state: GuardrailState, name: string): boolean {
  const def = AVAILABLE_GUARDRAILS.find(g => g.name === name);
  if (!def) return false;
  state.enabledGuardrails.add(name);
  return true;
}

export function disableGuardrail(state: GuardrailState, name: string): boolean {
  return state.enabledGuardrails.delete(name);
}

export function applyProfile(state: GuardrailState, profileName: string): boolean {
  const profile = GUARDRAIL_PROFILES.find(p => p.name === profileName);
  if (!profile) return false;
  state.enabledGuardrails.clear();
  for (const g of profile.guardrails) state.enabledGuardrails.add(g);
  return true;
}

export function listGuardrailsWithStatus(state: GuardrailState): Array<GuardrailDefinition & { enabled: boolean }> {
  return AVAILABLE_GUARDRAILS.map(g => ({ ...g, enabled: state.enabledGuardrails.has(g.name) }));
}
