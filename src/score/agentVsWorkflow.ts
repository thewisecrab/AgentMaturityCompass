export type AgentClassification =
  | 'workflow'
  | 'smart-workflow'
  | 'proto-agent'
  | 'agent'
  | 'advanced-agent';

export interface AgentClassificationResult {
  classification: AgentClassification;
  amcLevel: 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  justification: string[];
  marketingLabel: string;
  governanceRequired: boolean;
  governanceUrgency: 'none' | 'recommended' | 'required' | 'critical';
}

export function classifyAgentVsWorkflow(scores: Record<string, number>): AgentClassificationResult {
  const vals = Object.values(scores).filter(v => typeof v === 'number' && !isNaN(v));
  const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  const justification: string[] = [];

  let classification: AgentClassification;
  let amcLevel: 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  let marketingLabel: string;
  let governanceRequired: boolean;
  let governanceUrgency: 'none' | 'recommended' | 'required' | 'critical';

  if (avg < 1) {
    classification = 'workflow';
    amcLevel = 'L0';
    marketingLabel = 'Automated Workflow';
    governanceRequired = false;
    governanceUrgency = 'none';
    justification.push('No autonomous decision-making detected');
  } else if (avg < 2) {
    classification = 'workflow';
    amcLevel = 'L1';
    marketingLabel = 'Automated Workflow';
    governanceRequired = false;
    governanceUrgency = 'none';
    justification.push('Deterministic routing with minimal LLM usage');
  } else if (avg < 3) {
    classification = 'smart-workflow';
    amcLevel = 'L2';
    marketingLabel = 'AI-Assisted Workflow';
    governanceRequired = false;
    governanceUrgency = 'recommended';
    justification.push('LLM calls present but routing is deterministic');
  } else if (avg < 4) {
    classification = 'proto-agent';
    amcLevel = 'L3';
    marketingLabel = 'AI Agent (Supervised)';
    governanceRequired = true;
    governanceUrgency = 'required';
    justification.push('Goal-directed behavior with limited autonomy');
  } else if (avg < 5) {
    classification = 'agent';
    amcLevel = 'L4';
    marketingLabel = 'Autonomous AI Agent';
    governanceRequired = true;
    governanceUrgency = 'required';
    justification.push('Genuine autonomous decision-making observed');
  } else {
    classification = 'advanced-agent';
    amcLevel = 'L5';
    marketingLabel = 'Governed Autonomous Agent';
    governanceRequired = true;
    governanceUrgency = 'critical';
    justification.push('Full autonomy with governance framework required');
  }

  return { classification, amcLevel, justification, marketingLabel, governanceRequired, governanceUrgency } satisfies AgentClassificationResult;
}
