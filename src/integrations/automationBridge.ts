/**
 * AMC Automation Bridge — n8n / Make / Zapier governance layer
 *
 * "I built an AI Agent Army in n8n that completely replaced my personal assistant"
 * (1973↑ r/n8n) — zero governance awareness.
 *
 * These builders are creating exactly what AMC governs but with no governance.
 * This bridge provides: AMC governance for no-code automation workflows.
 *
 * "Your workflow just became an agent. AMC makes it trustworthy."
 */

import { emitGuardEvent } from '../enforce/evidenceEmitter.js';

export type AutomationPlatform = 'n8n' | 'make' | 'zapier' | 'power-automate' | 'generic';

export interface AutomationWorkflowManifest {
  platform: AutomationPlatform;
  workflowId: string;
  workflowName: string;
  agentId: string;         // AMC agent ID mapped to this workflow

  // Risk profile (determined from workflow structure)
  hasExternalHTTPCalls: boolean;
  hasFileSystemAccess: boolean;
  hasEmailAccess: boolean;
  hasCalendarAccess: boolean;
  hasDatabaseAccess: boolean;
  hasCodeExecution: boolean;
  hasAINode: boolean;          // Uses an LLM node (OpenAI, Anthropic, etc.)
  hasWebhookTrigger: boolean;  // Triggered by external webhook
  usesCredentials: string[];   // List of credential names used

  // Operating context
  triggeredByHuman: boolean;   // Manual trigger vs automated
  runsOnSchedule: boolean;     // Scheduled automation
  processesPII: boolean;       // Handles personal data
}

export interface AutomationGovernanceResult {
  allowed: boolean;
  riskScore: number;          // 0–100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  requiredApprovals: string[];
  automationMode: 'SIMULATE' | 'EXECUTE';   // AMC Governor mode
  warnings: string[];
  recommendations: string[];
  amcPolicyRef: string[];     // which AMC policies were applied
}

export interface AutomationAuditEntry {
  timestamp: Date;
  workflowId: string;
  platform: AutomationPlatform;
  agentId: string;
  action: string;
  outcome: 'allowed' | 'blocked' | 'step-up';
  riskScore: number;
  approvedBy?: string;
}

/**
 * Assess an automation workflow's risk and apply AMC governance.
 * Call this before allowing a workflow to execute.
 */
export function assessAutomationWorkflow(
  manifest: AutomationWorkflowManifest,
): AutomationGovernanceResult {
  let riskScore = 0;
  const warnings: string[] = [];
  const requiredApprovals: string[] = [];
  const recommendations: string[] = [];
  const policyRef: string[] = [];

  // Score risk factors
  if (manifest.hasCodeExecution) { riskScore += 30; warnings.push('Workflow executes arbitrary code — highest risk'); policyRef.push('E2 (ExecGuard)'); }
  if (manifest.hasAINode && manifest.hasExternalHTTPCalls) { riskScore += 20; warnings.push('AI node with external HTTP — potential exfiltration via LLM'); policyRef.push('E4 (EgressProxy)'); }
  if (manifest.processesPII && !manifest.hasAINode) { riskScore += 15; warnings.push('PII processed without AI content controls'); policyRef.push('V3 (DLP)'); }
  if (manifest.processesPII && manifest.hasAINode) { riskScore += 25; warnings.push('PII fed to LLM — GDPR/HIPAA risk'); policyRef.push('V3 (DLP)', 'V1 (SecretBlind)'); }
  if (manifest.hasDatabaseAccess && !manifest.triggeredByHuman) { riskScore += 15; warnings.push('Automated database writes without human trigger'); policyRef.push('E1 (PolicyFirewall)'); }
  if (manifest.hasWebhookTrigger) { riskScore += 10; warnings.push('Webhook trigger — susceptible to SSRF or payload injection'); policyRef.push('S8 (Ingress)', 'S1 (Analyzer)'); }
  if (manifest.hasEmailAccess && manifest.hasAINode) { riskScore += 15; warnings.push('AI reads/writes email — indirect prompt injection surface'); policyRef.push('S1 (Analyzer)'); }
  if (manifest.usesCredentials.length > 3) { riskScore += 10; warnings.push(`${manifest.usesCredentials.length} credentials in scope — minimize blast radius`); }

  riskScore = Math.min(100, riskScore);
  const riskLevel: AutomationGovernanceResult['riskLevel'] =
    riskScore >= 60 ? 'critical' :
    riskScore >= 40 ? 'high' :
    riskScore >= 20 ? 'medium' : 'low';

  // Determine mode
  const automationMode: 'SIMULATE' | 'EXECUTE' =
    riskLevel === 'critical' ? 'SIMULATE' :
    riskLevel === 'high' && !manifest.triggeredByHuman ? 'SIMULATE' : 'EXECUTE';

  if (riskLevel === 'critical') {
    requiredApprovals.push('Security review required before EXECUTE mode');
    recommendations.push('Run this workflow in AMC SIMULATE mode first. Review all actions before approving.');
  }

  if (!manifest.agentId) {
    recommendations.push('Register this workflow as an AMC agent: amc agent add --name "' + manifest.workflowName + '"');
  }

  if (manifest.processesPII) {
    recommendations.push('Enable AMC Vault DLP to scan all PII before it reaches LLM nodes.');
  }

  if (manifest.hasCodeExecution) {
    recommendations.push('Wrap code execution nodes with AMC ExecGuard (E2) to block dangerous commands.');
  }

  recommendations.push(
    `Generate AMC governance config: amc archetype apply --agent ${manifest.agentId || 'my-workflow'} rpa-workflow-automation`
  );

  // Emit evidence
  emitGuardEvent({
    agentId: manifest.agentId || manifest.workflowId,
    moduleCode: 'BRIDGE',
    decision: automationMode === 'EXECUTE' ? 'allow' : 'stepup',
    reason: `Automation bridge: ${manifest.platform} workflow risk=${riskLevel}`,
    severity: riskLevel === 'critical' ? 'critical' : riskLevel === 'high' ? 'high' : 'medium',
    meta: { workflowId: manifest.workflowId, platform: manifest.platform, riskScore },
  });

  return {
    allowed: automationMode === 'EXECUTE',
    riskScore,
    riskLevel,
    requiredApprovals,
    automationMode,
    warnings,
    recommendations,
    amcPolicyRef: policyRef,
  };
}

/**
 * Generate an AMC governance config for a workflow.
 * Returns the YAML/JSON config to apply to the workflow's AMC agent.
 */
export function generateWorkflowGovernanceConfig(manifest: AutomationWorkflowManifest): string {
  const riskLevel = manifest.hasCodeExecution || manifest.processesPII ? 'high' : manifest.hasAINode ? 'medium' : 'low';

  return JSON.stringify({
    agentId: manifest.agentId,
    archetype: 'rpa-workflow-automation',
    platform: manifest.platform,
    workflowId: manifest.workflowId,
    governorMode: riskLevel === 'high' ? 'SIMULATE' : 'EXECUTE',
    policyPack: 'rpa-workflow-automation.' + riskLevel,
    requiredModules: [
      manifest.hasExternalHTTPCalls && 'egressProxy',
      manifest.hasCodeExecution && 'execGuard',
      manifest.processesPII && 'dlp',
      manifest.hasWebhookTrigger && 'ingress',
      manifest.hasAINode && 'analyzer',
    ].filter(Boolean),
    evidenceEmission: true,
    auditLog: true,
  }, null, 2);
}
