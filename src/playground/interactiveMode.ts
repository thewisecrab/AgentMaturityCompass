import type { Scenario, ScenarioResult } from "./scenarioRunner.js";
import { DEMO_SCENARIOS, runScenarioOffline } from "./scenarioRunner.js";

export interface PlaygroundSession {
  scenarios: Scenario[];
  results: ScenarioResult[];
}

export function createPlaygroundSession(customScenarios?: Scenario[]): PlaygroundSession {
  return {
    scenarios: customScenarios ?? DEMO_SCENARIOS,
    results: [],
  };
}

export function runAllScenarios(session: PlaygroundSession): ScenarioResult[] {
  session.results = session.scenarios.map(s => runScenarioOffline(s));
  return session.results;
}

export function formatPlaygroundReport(session: PlaygroundSession): string {
  const lines: string[] = [
    "",
    "🎮  AMC Playground — Scenario Results",
    "═══════════════════════════════════════",
    "",
  ];
  for (const result of session.results) {
    const icon = result.passed ? "✅" : "❌";
    const scenario = session.scenarios.find(s => s.id === result.scenarioId);
    lines.push(`${icon}  ${scenario?.name ?? result.scenarioId}`);
    lines.push(`   ${scenario?.description ?? ""}`);
    for (const step of result.steps) {
      lines.push(`   ${step.passed ? "✓" : "✗"} Step ${step.stepId}: ${step.explanation}`);
    }
    lines.push("");
  }
  const passed = session.results.filter(r => r.passed).length;
  lines.push(`Summary: ${passed}/${session.results.length} scenarios passed`);
  lines.push("");
  return lines.join("\n");
}
