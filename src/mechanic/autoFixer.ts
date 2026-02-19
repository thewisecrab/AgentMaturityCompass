/**
 * AutoFixer — Reasoning-based fix generator for AMC gaps
 *
 * Ported from Python FixGenerator (platform/python/amc/agents/fix_generator.py).
 * Given a gap from diagnostic/gapAnalysis, generates a typed FixPlan with:
 * - Module to integrate
 * - Integration code snippet
 * - Test code to verify
 * - Rollback code
 * - Confidence score + reasoning trace
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GapDefinition {
  qid: string;           // e.g. "gov_3"
  dimension: string;     // e.g. "governance"
  gapText: string;       // e.g. "No audit trail for agent actions"
  pointsAvailable: number;
}

export interface FixPlan {
  qid: string;
  modulePath: string;    // e.g. "amc.watch.w1_receipts"
  className: string;     // e.g. "ReceiptsLedger"
  importLine: string;    // Exact import to add
  integrationCode: string;
  testCode: string;
  rollbackCode: string;
  confidence: number;    // 0.0-1.0
  reasoning: string;
}

// ---------------------------------------------------------------------------
// QID → Module mapping (mirrors Python fix_generator.py)
// ---------------------------------------------------------------------------

interface ModuleMapping {
  module: string;
  className: string;
  role: string;
}

const QID_TO_MODULE: Record<string, ModuleMapping[]> = {
  // Governance
  gov_1: [{ module: "amc.enforce.e1_policy", className: "ToolPolicyFirewall", role: "policy engine" }],
  gov_2: [{ module: "amc.core.models", className: "SessionTrust", role: "ownership/trust levels" }],
  gov_3: [{ module: "amc.watch.w1_receipts", className: "ReceiptsLedger", role: "audit trail" }],
  gov_4: [{ module: "amc.enforce.e6_stepup", className: "StepUpManager", role: "human-in-the-loop escalation" }],
  gov_5: [{ module: "amc.core.models", className: "RiskLevel", role: "risk assessment" }],
  // Security
  sec_1: [{ module: "amc.enforce.e1_policy", className: "ToolPolicyFirewall", role: "policy firewall" }],
  sec_2: [{ module: "amc.shield.s10_detector", className: "InjectionDetector", role: "injection detection" }],
  sec_3: [{ module: "amc.vault.v2_dlp", className: "DLPRedactor", role: "DLP/secret redaction" }],
  sec_4: [{ module: "amc.shield.s1_analyzer", className: "SkillAnalyzer", role: "skill scanning" }],
  // Reliability
  rel_1: [{ module: "amc.enforce.e5_circuit_breaker", className: "CircuitBreaker", role: "circuit breaker" }],
  rel_2: [],
  rel_3: [],
  rel_4: [],
  // Evaluation
  eval_1: [],
  eval_2: [],
  eval_3: [],
  eval_4: [{ module: "amc.watch.w4_safety_testkit", className: "SafetyTestKit", role: "red-team testing" }],
  // Observability
  obs_1: [],
  obs_2: [],
  obs_3: [],
  obs_4: [{ module: "amc.watch.w1_receipts", className: "ReceiptsLedger", role: "tamper-evident receipts" }],
};

// ---------------------------------------------------------------------------
// Fix generation
// ---------------------------------------------------------------------------

function generateIntegrationCode(mapping: ModuleMapping): string {
  return [
    `# Integration: ${mapping.role}`,
    `from ${mapping.module} import ${mapping.className}`,
    ``,
    `class MyAgent:`,
    `    def __init__(self):`,
    `        self.${toSnakeCase(mapping.className)} = ${mapping.className}()`,
    ``,
    `    def process(self, input):`,
    `        # Use ${mapping.className} for ${mapping.role}`,
    `        result = self.${toSnakeCase(mapping.className)}.check(input)`,
    `        if not result.ok:`,
    `            raise RuntimeError(f"${mapping.role} check failed: {result.reason}")`,
    `        return self._original_process(input)`,
  ].join("\n");
}

function generateTestCode(mapping: ModuleMapping, qid: string): string {
  return [
    `def test_${qid}_${toSnakeCase(mapping.className)}():`,
    `    from ${mapping.module} import ${mapping.className}`,
    `    instance = ${mapping.className}()`,
    `    assert instance is not None`,
    `    # Verify ${mapping.role} is operational`,
    `    result = instance.check({"test": True})`,
    `    assert result.ok or result.reason  # Must respond`,
  ].join("\n");
}

function generateRollbackCode(mapping: ModuleMapping): string {
  return [
    `# Rollback: remove ${mapping.className} integration`,
    `# 1. Remove import: from ${mapping.module} import ${mapping.className}`,
    `# 2. Remove self.${toSnakeCase(mapping.className)} from __init__`,
    `# 3. Remove check() call from process()`,
  ].join("\n");
}

function toSnakeCase(s: string): string {
  return s.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
}

/**
 * Generate a fix plan for a single gap.
 */
export function generateFix(gap: GapDefinition): FixPlan | null {
  const mappings = QID_TO_MODULE[gap.qid];
  if (!mappings || mappings.length === 0) {
    // Pattern-based gap — no specific module, return generic advice
    return {
      qid: gap.qid,
      modulePath: "pattern-based",
      className: "CustomImplementation",
      importLine: `# No specific AMC module — implement ${gap.dimension} pattern`,
      integrationCode: `# Implement: ${gap.gapText}\n# Dimension: ${gap.dimension}\n# Points: ${gap.pointsAvailable}`,
      testCode: `# Write tests for: ${gap.gapText}`,
      rollbackCode: `# Revert custom ${gap.dimension} implementation`,
      confidence: 0.3,
      reasoning: `No dedicated AMC module for ${gap.qid}. Requires custom implementation pattern.`,
    };
  }

  const mapping = mappings[0]!;
  const confidence = mappings.length > 0 ? 0.85 : 0.5;

  return {
    qid: gap.qid,
    modulePath: mapping.module,
    className: mapping.className,
    importLine: `from ${mapping.module} import ${mapping.className}`,
    integrationCode: generateIntegrationCode(mapping),
    testCode: generateTestCode(mapping, gap.qid),
    rollbackCode: generateRollbackCode(mapping),
    confidence,
    reasoning: `Gap "${gap.gapText}" maps to ${mapping.className} (${mapping.role}). ` +
      `Module ${mapping.module} provides ${mapping.role} capability. ` +
      `Integration adds ${mapping.className} check to agent processing pipeline.`,
  };
}

/**
 * Generate fixes for multiple gaps, sorted by confidence.
 */
export function generateFixes(gaps: GapDefinition[]): FixPlan[] {
  return gaps
    .map((g) => generateFix(g))
    .filter((f): f is FixPlan => f !== null)
    .sort((a, b) => b.confidence - a.confidence);
}

/**
 * Render a fix plan as markdown.
 */
export function renderFixPlanMarkdown(plan: FixPlan): string {
  return [
    `## Fix: ${plan.qid} → ${plan.className}`,
    "",
    `**Module:** \`${plan.modulePath}\``,
    `**Confidence:** ${(plan.confidence * 100).toFixed(0)}%`,
    `**Reasoning:** ${plan.reasoning}`,
    "",
    "### Integration Code",
    "```python",
    plan.integrationCode,
    "```",
    "",
    "### Test Code",
    "```python",
    plan.testCode,
    "```",
    "",
    "### Rollback",
    "```python",
    plan.rollbackCode,
    "```",
  ].join("\n");
}
