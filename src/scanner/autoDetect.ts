export interface DetectionResult {
  framework: "langchain" | "crewai" | "autogen" | "llamaindex" | "custom" | "unknown";
  confidence: number;
  signals: string[];
  securityPosture: "strong" | "moderate" | "weak" | "unknown";
  toolUsage: string[];
  governanceArtifacts: string[];
}

const FRAMEWORK_PATTERNS: Record<string, RegExp[]> = {
  langchain: [/langchain/i, /from langchain/i, /@langchain/i, /ChatOpenAI|LLMChain|AgentExecutor/],
  crewai: [/crewai/i, /from crewai/i, /CrewBase|Agent\(|Task\(/],
  autogen: [/autogen/i, /from autogen/i, /AssistantAgent|UserProxyAgent|GroupChat/],
  llamaindex: [/llamaindex/i, /llama.index/i, /VectorStoreIndex|ServiceContext/],
};

const SECURITY_PATTERNS = {
  strong: [/rate.?limit/i, /auth/i, /encrypt/i, /sanitiz/i, /guardrail/i, /validation/i],
  moderate: [/api.?key/i, /token/i, /permission/i],
  weak: [/eval\(/, /exec\(/, /hardcoded.*secret/i],
};

const GOVERNANCE_PATTERNS = [
  { pattern: /policy/i, artifact: "policy-config" },
  { pattern: /audit/i, artifact: "audit-logging" },
  { pattern: /compliance/i, artifact: "compliance-check" },
  { pattern: /monitor/i, artifact: "monitoring" },
  { pattern: /guardrail/i, artifact: "guardrails" },
  { pattern: /\.env/i, artifact: "env-config" },
];

export function detectFromContent(files: Array<{ path: string; content: string }>): DetectionResult {
  const signals: string[] = [];
  const toolUsage: string[] = [];
  const governanceArtifacts: string[] = [];
  let framework: DetectionResult["framework"] = "unknown";
  let maxConfidence = 0;

  const allContent = files.map(f => f.content).join("\n");

  for (const [fw, patterns] of Object.entries(FRAMEWORK_PATTERNS)) {
    const matches = patterns.filter(p => p.test(allContent)).length;
    const conf = matches / patterns.length;
    if (conf > maxConfidence) {
      maxConfidence = conf;
      framework = fw as DetectionResult["framework"];
      signals.push(`Detected ${fw} (${matches}/${patterns.length} patterns)`);
    }
  }

  if (maxConfidence < 0.25) { framework = "custom"; signals.push("No known framework detected, likely custom"); }

  // Security posture
  let secStrong = 0, secWeak = 0;
  for (const p of SECURITY_PATTERNS.strong) { if (p.test(allContent)) secStrong++; }
  for (const p of SECURITY_PATTERNS.weak) { if (p.test(allContent)) secWeak++; }
  const securityPosture: DetectionResult["securityPosture"] = secWeak > 2 ? "weak" : secStrong > 3 ? "strong" : secStrong > 0 ? "moderate" : "unknown";

  // Tool detection
  if (/tool|function.?call|plugin/i.test(allContent)) toolUsage.push("tool-calling");
  if (/retriev|rag|vector/i.test(allContent)) toolUsage.push("retrieval-augmented");
  if (/search|web.*search/i.test(allContent)) toolUsage.push("web-search");
  if (/code.*exec|sandbox/i.test(allContent)) toolUsage.push("code-execution");

  // Governance artifacts
  for (const { pattern, artifact } of GOVERNANCE_PATTERNS) {
    if (pattern.test(allContent)) governanceArtifacts.push(artifact);
  }

  return { framework, confidence: maxConfidence, signals, securityPosture, toolUsage, governanceArtifacts };
}
