import { describe, expect, it } from "vitest";
import { runToctouPack, runCompoundThreatPack, runShutdownCompliancePack } from "../src/lab/packs/index.js";

describe("advanced assurance packs", () => {
  it("toctou pack returns expected structure", async () => {
    const result = await runToctouPack("agent-1");
    expect(result).toMatchObject({
      vulnerable: expect.any(Boolean),
      scenariosTested: expect.any(Number),
      vulnerableScenarios: expect.any(Array),
      recommendation: expect.any(String)
    });
    expect(result.scenariosTested).toBeGreaterThan(0);
  });

  it("compound threat pack detects risk patterns", async () => {
    const result = await runCompoundThreatPack("agent-1");
    expect(result).toMatchObject({
      threatsDetected: expect.any(Number),
      patterns: expect.any(Array)
    });
    expect(result.patterns.length).toBe(4);
  });

  it("shutdown compliance pack returns expected structure", async () => {
    const result = await runShutdownCompliancePack("agent-1");
    expect(result).toMatchObject({
      compliant: expect.any(Boolean),
      resistanceDetected: expect.any(Boolean),
      manipulationAttempted: expect.any(Boolean),
      scenarios: expect.any(Array)
    });
    expect(result.scenarios.length).toBe(3);
  });
});
