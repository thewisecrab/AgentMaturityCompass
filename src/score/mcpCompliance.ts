/**
 * MCP Compliance Scoring — Model Context Protocol
 *
 * MCP was donated to the Linux Foundation's Agentic AI Foundation.
 * It is becoming the industry standard for agent interoperability.
 * AMC scores agents against MCP compliance to position AMC as
 * the quality layer on top of the open agent ecosystem.
 */

export interface MCPComplianceCheck {
  id: string;
  name: string;
  description: string;
  weight: number;
  required: boolean;
}

export interface MCPComplianceResult {
  score: number;            // 0–100
  level: 'full' | 'partial' | 'minimal' | 'non-compliant';
  passed: string[];
  failed: string[];
  warnings: string[];
  recommendations: string[];
  badge: 'MCP-Certified' | 'MCP-Compatible' | 'MCP-Aware' | 'Not-MCP';
}

export interface MCPCapabilityDeclaration {
  // Protocol basics
  supportsMcpProtocol: boolean;
  mcpVersion?: string;                    // e.g. "2024-11-05"

  // Tools
  declaresToolManifest: boolean;          // exposes tools/list endpoint
  toolsHaveInputSchemas: boolean;         // each tool has JSON Schema input
  toolsHaveDescriptions: boolean;         // tools have human-readable descriptions

  // Resources
  declaresResources: boolean;             // exposes resources/list
  resourcesHaveUris: boolean;             // resources have URI templates

  // Prompts
  declaresPrompts: boolean;               // exposes prompts/list

  // Sampling
  supportsSampling: boolean;              // implements sampling/createMessage

  // Transport
  supportsStdio: boolean;                 // stdio transport
  supportsHttp: boolean;                  // HTTP + SSE transport

  // Security
  validatesInputs: boolean;              // validates tool call inputs against schema
  limitsCapabilities: boolean;           // follows least-privilege for tool exposure
  supportsOauth: boolean;                // OAuth 2.0 authorization

  // AMC-native additions
  emitsReceiptsOnToolCall: boolean;      // AMC: signs every tool call with receipt
  supportsPolicyGates: boolean;          // AMC: Governor can block tool calls
  hasAuditLog: boolean;                  // AMC: tool calls are audit-logged
}

const COMPLIANCE_CHECKS: MCPComplianceCheck[] = [
  // Core protocol (required for any compliance level)
  { id: 'mcp-protocol', name: 'MCP Protocol Support', description: 'Agent declares MCP protocol support', weight: 20, required: true },
  { id: 'tool-manifest', name: 'Tool Manifest', description: 'Exposes tools/list with all available tools', weight: 15, required: true },
  { id: 'tool-schemas', name: 'Tool Input Schemas', description: 'All tools have JSON Schema input definitions', weight: 15, required: true },
  { id: 'tool-descriptions', name: 'Tool Descriptions', description: 'All tools have human-readable descriptions', weight: 10, required: true },

  // Resources & prompts (required for partial+)
  { id: 'resources', name: 'Resource Declaration', description: 'Exposes resources/list endpoint', weight: 8, required: false },
  { id: 'prompts', name: 'Prompt Declaration', description: 'Exposes prompts/list endpoint', weight: 5, required: false },

  // Transport (required for partial+)
  { id: 'stdio-transport', name: 'Stdio Transport', description: 'Supports stdio transport protocol', weight: 8, required: false },
  { id: 'http-transport', name: 'HTTP Transport', description: 'Supports HTTP+SSE transport', weight: 7, required: false },

  // Security (required for full)
  { id: 'input-validation', name: 'Input Validation', description: 'Validates tool inputs against declared schema', weight: 10, required: false },
  { id: 'least-privilege', name: 'Least Privilege', description: 'Limits exposed capabilities to minimum required', weight: 8, required: false },
  { id: 'oauth', name: 'OAuth 2.0', description: 'Supports OAuth 2.0 authorization flow', weight: 5, required: false },

  // AMC-native compliance bonuses
  { id: 'amc-receipts', name: 'AMC Receipts', description: 'Signs every tool call with evidence receipt', weight: 5, required: false },
  { id: 'amc-policy-gates', name: 'AMC Policy Gates', description: 'Governor can intercept/block tool calls', weight: 5, required: false },
  { id: 'amc-audit-log', name: 'AMC Audit Log', description: 'All tool calls written to tamper-evident audit log', weight: 5, required: false },
];

export function scoreMcpCompliance(capabilities: MCPCapabilityDeclaration): MCPComplianceResult {
  const capMap: Record<string, boolean> = {
    'mcp-protocol': capabilities.supportsMcpProtocol,
    'tool-manifest': capabilities.declaresToolManifest,
    'tool-schemas': capabilities.toolsHaveInputSchemas,
    'tool-descriptions': capabilities.toolsHaveDescriptions,
    'resources': capabilities.declaresResources,
    'prompts': capabilities.declaresPrompts,
    'stdio-transport': capabilities.supportsStdio,
    'http-transport': capabilities.supportsHttp,
    'input-validation': capabilities.validatesInputs,
    'least-privilege': capabilities.limitsCapabilities,
    'oauth': capabilities.supportsOauth,
    'amc-receipts': capabilities.emitsReceiptsOnToolCall,
    'amc-policy-gates': capabilities.supportsPolicyGates,
    'amc-audit-log': capabilities.hasAuditLog,
  };

  const passed: string[] = [];
  const failed: string[] = [];
  const warnings: string[] = [];
  let totalWeight = 0;
  let earnedWeight = 0;

  for (const check of COMPLIANCE_CHECKS) {
    totalWeight += check.weight;
    if (capMap[check.id]) {
      passed.push(check.id);
      earnedWeight += check.weight;
    } else {
      failed.push(check.id);
      if (check.required) {
        warnings.push(`REQUIRED: ${check.name} — ${check.description}`);
      }
    }
  }

  const score = Math.round((earnedWeight / totalWeight) * 100);

  const requiredPassed = COMPLIANCE_CHECKS.filter(c => c.required).every(c => capMap[c.id]);
  const corePassed = passed.includes('mcp-protocol') && passed.includes('tool-manifest') && passed.includes('tool-schemas');

  const level: MCPComplianceResult['level'] =
    score >= 90 && requiredPassed ? 'full' :
    score >= 60 && requiredPassed ? 'partial' :
    corePassed ? 'minimal' :
    'non-compliant';

  const badge: MCPComplianceResult['badge'] =
    level === 'full' ? 'MCP-Certified' :
    level === 'partial' ? 'MCP-Compatible' :
    level === 'minimal' ? 'MCP-Aware' :
    'Not-MCP';

  const recommendations = failed
    .map(id => COMPLIANCE_CHECKS.find(c => c.id === id))
    .filter(Boolean)
    .slice(0, 5)
    .map(c => `Add ${c!.name}: ${c!.description}`);

  return { score, level, passed, failed, warnings, recommendations, badge };
}

export function getMcpComplianceGuide(): string {
  return `
# MCP Compliance Implementation Guide

## What is MCP?
The Model Context Protocol (MCP) is an open standard for AI agent interoperability,
donated to the Linux Foundation's Agentic AI Foundation. It defines how agents
expose tools, resources, and prompts to LLM clients.

## Why Score MCP Compliance?
Agents that are MCP-compliant can be:
- Connected to any MCP-compatible client (Claude Desktop, Cursor, etc.)
- Discovered and audited programmatically
- Governed by AMC policy gates at the tool-call level

## Compliance Levels
- **MCP-Certified**: Full compliance (90%+). Required checks passed. Production-ready.
- **MCP-Compatible**: Partial compliance (60–89%). Core protocol + most features.
- **MCP-Aware**: Minimal compliance. Basic tool manifest only.
- **Not-MCP**: No MCP support detected.

## Quick Start
1. Implement tools/list endpoint returning tool schemas
2. Add stdio transport (minimum) or HTTP+SSE
3. Validate all tool inputs against declared schemas
4. Register with AMC: amc compliance mcp --agent <id>
`.trim();
}
