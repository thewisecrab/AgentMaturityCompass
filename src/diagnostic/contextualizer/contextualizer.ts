import { loadTargetProfile } from "../../targets/targetProfile.js";
import type { DiagnosticBank } from "../bank/bankSchema.js";
import { loadDiagnosticBank } from "../bank/bankLoader.js";
import type { AgentProfile } from "./agentProfile.js";
import { resolveAgentProfile } from "./profileResolver.js";

export interface RenderedDiagnosticQuestion {
  qId: string;
  dimensionId: number;
  title: string;
  intent: string;
  rubrics: DiagnosticBank["diagnosticBank"]["questions"][number]["rubrics"];
  evidenceMap: DiagnosticBank["diagnosticBank"]["questions"][number]["evidenceMap"];
  upgradeHints: DiagnosticBank["diagnosticBank"]["questions"][number]["upgradeHints"];
  howThisApplies: string;
  tailoredEvidenceExamples: string[];
  ownerTarget: number | null;
}

export interface ContextualizedDiagnosticRender {
  v: 1;
  generatedTs: number;
  agentId: string;
  profile: AgentProfile;
  dimensions: DiagnosticBank["diagnosticBank"]["dimensions"];
  questions: RenderedDiagnosticQuestion[];
}

function evidenceExamples(profile: AgentProfile): string[] {
  const models = profile.modelFamilies.length > 0 ? profile.modelFamilies.join(", ") : "no observed model families yet";
  const tools = profile.toolFamilies.length > 0 ? profile.toolFamilies.join(", ") : "no observed tool families yet";
  return [
    `Bridge receipts and runtime evidence for model families: ${models}.`,
    `ToolHub receipts and execution traces for tool families: ${tools}.`,
    `Approval, policy, and transparency events bound to this agent (${profile.agentId}).`
  ];
}

export function renderContextualizedDiagnostic(params: {
  workspace: string;
  agentId?: string;
  bank?: DiagnosticBank;
  profile?: AgentProfile;
}): ContextualizedDiagnosticRender {
  const bank = params.bank ?? loadDiagnosticBank(params.workspace);
  const profile = params.profile ?? resolveAgentProfile({
    workspace: params.workspace,
    agentId: params.agentId
  });
  const target = (() => {
    try {
      return loadTargetProfile(params.workspace, "default", profile.agentId);
    } catch {
      return null;
    }
  })();

  const renderedQuestions: RenderedDiagnosticQuestion[] = bank.diagnosticBank.questions
    .slice()
    .sort((a, b) => a.qId.localeCompare(b.qId))
    .map((question) => ({
      qId: question.qId,
      dimensionId: question.dimensionId,
      title: question.title,
      intent: question.intent,
      rubrics: question.rubrics,
      evidenceMap: question.evidenceMap,
      upgradeHints: question.upgradeHints,
      howThisApplies: question.contextualVariants[profile.agentType],
      tailoredEvidenceExamples: evidenceExamples(profile),
      ownerTarget: target ? target.mapping[question.qId] ?? null : null
    }));

  return {
    v: 1,
    generatedTs: Date.now(),
    agentId: profile.agentId,
    profile,
    dimensions: bank.diagnosticBank.dimensions,
    questions: renderedQuestions
  };
}
