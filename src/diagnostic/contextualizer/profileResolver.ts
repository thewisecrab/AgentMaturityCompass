import { resolveAgentId } from "../../fleet/paths.js";
import { loadAgentConfig } from "../../fleet/registry.js";
import { openLedger } from "../../ledger/ledger.js";
import { loadTrustConfig } from "../../trust/trustConfig.js";
import { loadInstalledPluginsLock } from "../../plugins/pluginStore.js";
import { loadLatestForecastArtifact } from "../../forecast/forecastStore.js";
import { loadBenchComparison } from "../../bench/benchPolicyStore.js";
import { agentProfileSchema, type AgentProfile } from "./agentProfile.js";

function parseMeta(metaJson: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(metaJson) as unknown;
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // ignore
  }
  return {};
}

function classifyAgentType(params: {
  role: string;
  domain: string;
  name: string;
}): AgentProfile["agentType"] {
  const text = `${params.role} ${params.domain} ${params.name}`.toLowerCase();
  if (/(code|dev|engineer|software|program|repo|git)/.test(text)) {
    return "code-agent";
  }
  if (/(support|helpdesk|customer|service|ticket)/.test(text)) {
    return "support-agent";
  }
  if (/(ops|sre|infra|platform|incident|runbook)/.test(text)) {
    return "ops-agent";
  }
  if (/(research|analysis|analyst|insight|science)/.test(text)) {
    return "research-agent";
  }
  if (/(sales|revenue|pipeline|crm|account)/.test(text)) {
    return "sales-agent";
  }
  return "other";
}

function modelFamily(model: string): string {
  const value = model.trim().toLowerCase();
  if (!value) {
    return "unknown";
  }
  if (value.startsWith("gpt-") || value.includes("openai")) return "gpt";
  if (value.startsWith("claude")) return "claude";
  if (value.startsWith("gemini")) return "gemini";
  if (value.startsWith("grok")) return "grok";
  if (value.includes("llama")) return "llama";
  if (value.includes("mistral")) return "mistral";
  return value.split(/[/:.\s-]+/)[0] ?? "unknown";
}

function toolFamily(toolName: string): string {
  const normalized = toolName.trim().toLowerCase();
  if (!normalized) {
    return "unknown";
  }
  return normalized.split(/[.:/\s-]+/)[0] ?? "unknown";
}

function inferOperatingMode(params: {
  stdinCount: number;
  toolActionCount: number;
  processStartCount: number;
}): AgentProfile["operatingMode"] {
  if (params.stdinCount > 0) {
    return "interactive";
  }
  if (params.toolActionCount >= 10 && params.processStartCount > 0) {
    return "autonomous";
  }
  if (params.processStartCount > 0) {
    return "batch";
  }
  return "interactive";
}

export function resolveAgentProfile(params: {
  workspace: string;
  agentId?: string;
}): AgentProfile {
  const agentId = resolveAgentId(params.workspace, params.agentId ?? "default");
  const cfg = loadAgentConfig(params.workspace, agentId);

  const modelFamilies = new Set<string>();
  const toolFamilies = new Set<string>();
  let stdinCount = 0;
  let toolActionCount = 0;
  let processStartCount = 0;

  const ledger = openLedger(params.workspace);
  try {
    const events = ledger.getAllEvents();
    for (const event of events) {
      const meta = parseMeta(event.meta_json);
      const eventAgentId = typeof meta.agentId === "string" ? meta.agentId : null;
      if (eventAgentId && eventAgentId !== agentId) {
        continue;
      }
      if (event.event_type === "stdin") {
        stdinCount += 1;
      }
      if (event.event_type === "agent_process_started") {
        processStartCount += 1;
      }
      if (event.event_type === "tool_action") {
        toolActionCount += 1;
      }
      const model = typeof meta.model === "string" ? meta.model : null;
      if (model) {
        modelFamilies.add(modelFamily(model));
      }
      const toolName = typeof meta.toolName === "string" ? meta.toolName : null;
      if (toolName) {
        toolFamilies.add(toolFamily(toolName));
      }
    }
  } finally {
    ledger.close();
  }

  const trust = loadTrustConfig(params.workspace);
  const plugins = loadInstalledPluginsLock(params.workspace);
  const forecast = loadLatestForecastArtifact(params.workspace, {
    type: "AGENT",
    id: agentId
  });
  const bench = loadBenchComparison(params.workspace);

  return agentProfileSchema.parse({
    v: 1,
    agentId,
    agentType: classifyAgentType({
      role: cfg.role,
      domain: cfg.domain,
      name: cfg.agentName
    }),
    toolFamilies: [...toolFamilies].sort((a, b) => a.localeCompare(b)),
    modelFamilies: [...modelFamilies].sort((a, b) => a.localeCompare(b)),
    riskTier: cfg.riskTier,
    operatingMode: inferOperatingMode({
      stdinCount,
      toolActionCount,
      processStartCount
    }),
    capabilities: {
      notary: trust.trust.mode === "NOTARY",
      plugins: plugins.installed.length > 0,
      forecast: Boolean(forecast),
      benchmarks: Boolean(bench)
    },
    generatedTs: Date.now()
  });
}
