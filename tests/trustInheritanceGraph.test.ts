import { describe, expect, test } from "vitest";
import {
  computeInheritedTrust,
  computeTrustInheritanceGraph,
  renderTrustInheritanceGraphMarkdown,
  type TrustInheritancePolicy
} from "../src/fleet/trustInheritance.js";

describe("computeTrustInheritanceGraph", () => {
  test("bounds child trust by parent effective trust", () => {
    const result = computeTrustInheritanceGraph(
      [
        { agentId: "orchestrator", ownTrust: 0.8 },
        { agentId: "worker", ownTrust: 0.95 }
      ],
      [{ parentAgentId: "orchestrator", childAgentId: "worker" }]
    );

    const worker = result.nodes.find((node) => node.agentId === "worker");
    expect(worker?.effectiveTrust).toBe(0.8);
    expect(worker?.boundedBy).toEqual(["orchestrator"]);
  });

  test("applies minimum bound across multiple parents", () => {
    const result = computeTrustInheritanceGraph(
      [
        { agentId: "parent-a", ownTrust: 0.9 },
        { agentId: "parent-b", ownTrust: 0.6 },
        { agentId: "child", ownTrust: 0.95 }
      ],
      [
        { parentAgentId: "parent-a", childAgentId: "child" },
        { parentAgentId: "parent-b", childAgentId: "child" }
      ]
    );

    const child = result.nodes.find((node) => node.agentId === "child");
    expect(child?.effectiveTrust).toBe(0.6);
    expect(child?.boundedBy).toEqual(["parent-b"]);
  });

  test("supports edge attenuation weights", () => {
    const result = computeTrustInheritanceGraph(
      [
        { agentId: "parent", ownTrust: 0.8 },
        { agentId: "child", ownTrust: 0.9 }
      ],
      [{ parentAgentId: "parent", childAgentId: "child", weight: 0.5 }]
    );

    const child = result.nodes.find((node) => node.agentId === "child");
    expect(child?.inheritedUpperBound).toBe(0.4);
    expect(child?.effectiveTrust).toBe(0.4);
  });

  test("throws on cyclic inheritance graph", () => {
    expect(() =>
      computeTrustInheritanceGraph(
        [
          { agentId: "a", ownTrust: 0.9 },
          { agentId: "b", ownTrust: 0.8 }
        ],
        [
          { parentAgentId: "a", childAgentId: "b" },
          { parentAgentId: "b", childAgentId: "a" }
        ]
      )
    ).toThrow("cycle");
  });

  test("enforces configurable minimum floor", () => {
    const result = computeTrustInheritanceGraph(
      [
        { agentId: "parent", ownTrust: 0.2 },
        { agentId: "child", ownTrust: 0.1 }
      ],
      [{ parentAgentId: "parent", childAgentId: "child" }],
      { minimumFloor: 0.15 }
    );

    const child = result.nodes.find((node) => node.agentId === "child");
    expect(child?.effectiveTrust).toBe(0.15);
    const markdown = renderTrustInheritanceGraphMarkdown(result);
    expect(markdown).toContain("Trust Inheritance Graph");
    expect(markdown).toContain("child");
  });
});

describe("computeInheritedTrust (compatibility)", () => {
  test("retains existing strict mode behavior", () => {
    const policy: TrustInheritancePolicy = {
      mode: "STRICT",
      weightDecayFactor: 0.9,
      minimumFloor: 0.1
    };

    const result = computeInheritedTrust(
      { agentId: "orchestrator", integrityIndex: 0.9, confidence: 0.8, evidenceQuality: 1 },
      [{ agentId: "worker", integrityIndex: 0.3, confidence: 0.8, evidenceQuality: 1 }],
      policy
    );

    expect(result.mode).toBe("STRICT");
    expect(result.compositeTrust).toBe(0.9);
  });
});

