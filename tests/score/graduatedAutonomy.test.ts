import { describe, it, expect } from "vitest";
import { assessAutonomy, getDeescalationTriggers, getDomainRiskCap } from "../../src/score/graduatedAutonomy.js";

describe("graduated autonomy governance", () => {
  it("keeps SUPERVISED when maturity is too low", () => {
    const result = assessAutonomy("SUPERVISED", "L1", 30, 0.95, 100);
    expect(result.currentMode).toBe("SUPERVISED");
    expect(result.recommendedMode).toBe("SUPERVISED");
    expect(result.canEscalate).toBe(false);
    expect(result.escalationBlockers.length).toBeGreaterThan(0);
  });

  it("recommends GUIDED when all thresholds met from SUPERVISED", () => {
    const result = assessAutonomy("SUPERVISED", "L2", 10, 0.92, 60);
    expect(result.recommendedMode).toBe("GUIDED");
    expect(result.canEscalate).toBe(true);
    expect(result.escalationBlockers).toHaveLength(0);
  });

  it("recommends AUTONOMOUS from GUIDED with L3 maturity", () => {
    const result = assessAutonomy("GUIDED", "L3", 20, 0.96, 250);
    expect(result.recommendedMode).toBe("AUTONOMOUS");
    expect(result.canEscalate).toBe(true);
  });

  it("recommends FULL_AUTO from AUTONOMOUS with L4 maturity", () => {
    const result = assessAutonomy("AUTONOMOUS", "L4", 35, 0.99, 600);
    expect(result.recommendedMode).toBe("FULL_AUTO");
    expect(result.canEscalate).toBe(true);
  });

  it("blocks escalation when success rate is too low", () => {
    const result = assessAutonomy("SUPERVISED", "L2", 10, 0.80, 60);
    expect(result.canEscalate).toBe(false);
    expect(result.escalationBlockers.some(b => b.includes("Success rate"))).toBe(true);
  });

  it("blocks escalation when not enough days at level", () => {
    const result = assessAutonomy("SUPERVISED", "L2", 3, 0.95, 60);
    expect(result.canEscalate).toBe(false);
    expect(result.escalationBlockers.some(b => b.includes("at level"))).toBe(true);
  });

  it("triggers de-escalation on low success rate", () => {
    const result = assessAutonomy("AUTONOMOUS", "L3", 20, 0.80, 300);
    expect(result.canDeescalate).toBe(true);
    expect(result.deescalationTriggers.length).toBeGreaterThan(0);
  });

  it("caps mode by domain risk for healthcare", () => {
    const result = assessAutonomy("AUTONOMOUS", "L4", 35, 0.99, 600, "healthcare");
    expect(result.riskAdjustedMode).toBe("GUIDED");
  });

  it("allows FULL_AUTO for code-generation domain", () => {
    const result = assessAutonomy("AUTONOMOUS", "L4", 35, 0.99, 600, "code-generation");
    expect(result.riskAdjustedMode).toBe("FULL_AUTO");
  });

  it("returns deescalation triggers list", () => {
    const triggers = getDeescalationTriggers();
    expect(triggers.length).toBeGreaterThan(0);
  });

  it("returns domain risk cap", () => {
    expect(getDomainRiskCap("healthcare")).toBe("GUIDED");
    expect(getDomainRiskCap("unknown-domain")).toBeUndefined();
  });

  it("stays at FULL_AUTO when already there", () => {
    const result = assessAutonomy("FULL_AUTO", "L5", 60, 0.99, 1000);
    expect(result.recommendedMode).toBe("FULL_AUTO");
  });
});
