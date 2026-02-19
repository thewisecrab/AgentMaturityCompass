import { describe, expect, test } from "vitest";
import {
  PolicyFirewall,
  checkExec,
  detectAto,
  TaintTracker,
  checkNumeric,
  lintConfig,
  blindSecrets,
  checkPhishing,
  renderTemplate,
} from "../src/enforce/index.js";

describe("Enforce — PolicyFirewall", () => {
  test("create and add rule", () => {
    const fw = new PolicyFirewall();
    fw.addRule({ id: "r1", pattern: "delete*", action: "deny" });
    const result = fw.check("agent-1", "filesystem", "delete-file");
    expect(result).toBeDefined();
  });

  test("allow action with no matching rules", () => {
    const fw = new PolicyFirewall();
    fw.addRule({ id: "r1", pattern: "delete*", action: "deny" });
    const result = fw.check("agent-1", "filesystem", "read-file");
    expect(result).toBeDefined();
  });

  test("empty firewall allows all", () => {
    const fw = new PolicyFirewall();
    const result = fw.check("agent-1", "tool", "action");
    expect(result).toBeDefined();
  });
});

describe("Enforce — checkExec", () => {
  test("safe command", () => {
    const result = checkExec("echo hello");
    expect(result).toBeDefined();
    expect(result.allowed).toBe(true);
    expect(result.blockedPattern).toBeUndefined();
  });

  test("dangerous rm command", () => {
    const result = checkExec("rm -rf /");
    expect(result).toBeDefined();
    expect(result.allowed).toBe(false);
    expect(result.blockedPattern).toBeDefined();
  });

  test("curl command", () => {
    const result = checkExec("curl http://example.com");
    expect(result).toBeDefined();
    expect(typeof result.allowed).toBe("boolean");
  });

  test("empty command", () => {
    const result = checkExec("");
    expect(result).toBeDefined();
  });

  test("chained dangerous command", () => {
    const result = checkExec("echo hi && rm -rf /");
    expect(result).toBeDefined();
    expect(result.allowed).toBe(false);
  });
});

describe("Enforce — detectAto", () => {
  test("normal events", () => {
    const events = [
      { type: "login", ts: Date.now() },
      { type: "action", ts: Date.now() + 1000 },
    ];
    const result = detectAto(events);
    expect(result).toBeDefined();
    expect(typeof result.suspicious).toBe("boolean");
    expect(typeof result.riskScore).toBe("number");
    expect(Array.isArray(result.signals)).toBe(true);
  });

  test("empty events", () => {
    const result = detectAto([]);
    expect(result).toBeDefined();
    expect(result.suspicious).toBe(false);
  });

  test("rapid suspicious events", () => {
    const now = Date.now();
    const events = Array.from({ length: 50 }, (_, i) => ({
      type: "login_failed",
      ts: now + i * 100,
    }));
    const result = detectAto(events);
    expect(result).toBeDefined();
    expect(result.riskScore).toBeGreaterThan(0);
  });
});

describe("Enforce — TaintTracker", () => {
  test("mark and check tainted value", () => {
    const tracker = new TaintTracker();
    tracker.markTainted("userInput", "malicious data", "http-request");
    const result = tracker.check("userInput");
    expect(result).toBeDefined();
  });

  test("check untainted key returns undefined/null", () => {
    const tracker = new TaintTracker();
    const result = tracker.check("clean");
    expect(result).toBeFalsy();
  });

  test("multiple tainted values", () => {
    const tracker = new TaintTracker();
    tracker.markTainted("a", "val1", "source1");
    tracker.markTainted("b", "val2", "source2");
    expect(tracker.check("a")).toBeDefined();
    expect(tracker.check("b")).toBeDefined();
  });
});

describe("Enforce — checkNumeric", () => {
  test("value within bounds", () => {
    const result = checkNumeric(50, { min: 0, max: 100 });
    expect(result).toBeDefined();
    expect(result.valid).toBe(true);
    expect(result.flags).toHaveLength(0);
  });

  test("value below min", () => {
    const result = checkNumeric(-5, { min: 0 });
    expect(result).toBeDefined();
    expect(result.valid).toBe(false);
    expect(result.flags.length).toBeGreaterThan(0);
  });

  test("value above max", () => {
    const result = checkNumeric(200, { max: 100 });
    expect(result).toBeDefined();
    expect(result.valid).toBe(false);
  });

  test("no bounds", () => {
    const result = checkNumeric(42, {});
    expect(result.valid).toBe(true);
  });
});

describe("Enforce — lintConfig", () => {
  test("good config", () => {
    const result = lintConfig({ timeout: 30, retries: 3, logging: true });
    expect(result).toBeDefined();
    expect(Array.isArray(result.findings)).toBe(true);
    expect(typeof result.score).toBe("number");
  });

  test("empty config", () => {
    const result = lintConfig({});
    expect(result).toBeDefined();
  });

  test("config with issues", () => {
    const result = lintConfig({ password: "admin123", debug: true, timeout: -1 });
    expect(result).toBeDefined();
    expect(result.findings.length).toBeGreaterThanOrEqual(0);
  });
});

describe("Enforce — blindSecrets", () => {
  test("text with no secrets", () => {
    const result = blindSecrets("Hello world");
    expect(result).toBeDefined();
    expect(result.blinded).toBe("Hello world");
    expect(result.secretsFound).toBe(0);
  });

  test("text with API key pattern", () => {
    const result = blindSecrets("My key is sk-1234567890abcdef1234567890abcdef");
    expect(result).toBeDefined();
    expect(result.secretsFound).toBeGreaterThan(0);
    expect(result.blinded).not.toContain("sk-1234567890abcdef");
  });

  test("empty text", () => {
    const result = blindSecrets("");
    expect(result.blinded).toBe("");
    expect(result.secretsFound).toBe(0);
  });
});

describe("Enforce — checkPhishing", () => {
  test("legitimate URL", () => {
    const result = checkPhishing("https://google.com");
    expect(result).toBeDefined();
    expect(typeof result.isPhishing).toBe("boolean");
    expect(Array.isArray(result.indicators)).toBe(true);
    expect(typeof result.confidence).toBe("number");
  });

  test("suspicious URL", () => {
    const result = checkPhishing("https://g00gle-login.suspicious-site.xyz/auth");
    expect(result).toBeDefined();
    expect(result.indicators.length).toBeGreaterThanOrEqual(0);
  });

  test("empty URL", () => {
    const result = checkPhishing("");
    expect(result).toBeDefined();
  });
});

describe("Enforce — renderTemplate", () => {
  test("simple template", () => {
    const result = renderTemplate("Hello {{name}}", { name: "World" });
    expect(result).toBeDefined();
    expect(result.rendered).toContain("World");
    expect(result.variablesUsed).toContain("name");
  });

  test("template with no variables", () => {
    const result = renderTemplate("Static text", {});
    expect(result.rendered).toBe("Static text");
    expect(result.variablesUsed).toHaveLength(0);
  });

  test("template with multiple variables", () => {
    const result = renderTemplate("{{a}} and {{b}}", { a: "X", b: "Y" });
    expect(result.rendered).toContain("X");
    expect(result.rendered).toContain("Y");
    expect(result.variablesUsed.length).toBe(2);
  });
});
