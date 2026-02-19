/**
 * Fix generator — reasons from gaps to module-based fixes.
 */

export interface Gap {
  qid: string;
  description: string;
  dimension: string;
}

export interface Fix {
  qid: string;
  moduleName: string;
  code: string;
  description: string;
  confidence: number;
}

const MODULE_MAP: Record<string, { module: string; template: string }> = {
  'shield': { module: 'shield/analyzer', template: 'import { analyzeSkill } from "./shield/analyzer.js";\nconst result = analyzeSkill(code);' },
  'enforce': { module: 'enforce/policyFirewall', template: 'import { PolicyFirewall } from "./enforce/policyFirewall.js";\nconst fw = new PolicyFirewall();\nfw.addRule({ id: "r1", pattern: ".*", action: "allow" });' },
  'vault': { module: 'vault/dlp', template: 'import { scanForPII } from "./vault/dlp.js";\nconst result = scanForPII(text);' },
  'watch': { module: 'watch/outputAttestation', template: 'import { attestOutput } from "./watch/outputAttestation.js";\nconst att = attestOutput(output);' },
  'score': { module: 'score/formalSpec', template: 'import { computeMaturityScore } from "./score/formalSpec.js";\nconst score = computeMaturityScore(evidence);' },
};

export function generateFix(gap: Gap, availableModules: string[]): Fix | null {
  const dim = gap.dimension.toLowerCase();
  const mapping = MODULE_MAP[dim];

  if (mapping && availableModules.includes(mapping.module)) {
    return {
      qid: gap.qid,
      moduleName: mapping.module,
      code: mapping.template,
      description: `Fix for ${gap.description}: integrate ${mapping.module}`,
      confidence: 0.75,
    };
  }

  // Try to find any matching module
  const match = availableModules.find(m => m.toLowerCase().includes(dim));
  if (match) {
    return {
      qid: gap.qid,
      moduleName: match,
      code: `// TODO: integrate ${match} to address ${gap.description}`,
      description: `Suggested fix: integrate ${match}`,
      confidence: 0.5,
    };
  }

  return null;
}
