/**
 * Tests for amcconfig.yaml — declarative configuration system
 *
 * Covers:
 *   - Schema validation (valid/invalid configs)
 *   - Config discovery (filename variants)
 *   - Loader (parse, validate, warnings)
 *   - Threshold checking
 *   - Assurance pack resolution
 *   - Environment variable merging
 *   - CLI init (starter template generation)
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, existsSync, readFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import YAML from "yaml";

import {
  amcDeclarativeConfigSchema,
  defaultDeclarativeConfig,
  type AMCDeclarativeConfig,
} from "../src/config/amcConfigSchema.js";

import {
  discoverConfigFile,
  loadDeclarativeConfig,
  resolveAgentEnv,
  resolveAssurancePackIds,
  checkThresholds,
  summarizeConfig,
} from "../src/config/amcConfigLoader.js";

import { configInit } from "../src/config/amcConfigCli.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), "amc-config-test-"));
}

function writeYaml(dir: string, filename: string, data: unknown): string {
  const path = join(dir, filename);
  writeFileSync(path, YAML.stringify(data), "utf8");
  return path;
}

function minimalValidConfig(): Record<string, unknown> {
  return {
    version: "1.0",
    agents: [{ id: "test-agent", runtime: "mock", riskTier: "low" }],
  };
}

// ---------------------------------------------------------------------------
// Schema Validation
// ---------------------------------------------------------------------------

describe("amcDeclarativeConfigSchema", () => {
  it("accepts minimal valid config", () => {
    const result = amcDeclarativeConfigSchema.parse(minimalValidConfig());
    expect(result.version).toBe("1.0");
    expect(result.agents).toHaveLength(1);
    expect(result.agents[0].id).toBe("test-agent");
  });

  it("applies defaults for optional fields", () => {
    const result = amcDeclarativeConfigSchema.parse(minimalValidConfig());
    expect(result.agents[0].riskTier).toBe("low");
    expect(result.agents[0].runtime).toBe("mock");
  });

  it("rejects config without agents", () => {
    expect(() =>
      amcDeclarativeConfigSchema.parse({ version: "1.0", agents: [] })
    ).toThrow();
  });

  it("rejects invalid version", () => {
    expect(() =>
      amcDeclarativeConfigSchema.parse({
        version: "2.0",
        agents: [{ id: "x" }],
      })
    ).toThrow();
  });

  it("accepts full config with all sections", () => {
    const full = {
      version: "1.0",
      description: "Full test config",
      agents: [
        {
          id: "agent-1",
          name: "Agent One",
          runtime: "claude",
          role: "assistant",
          domain: "engineering",
          riskTier: "high",
          primaryTasks: ["code review", "testing"],
          stakeholders: ["engineering", "security"],
          provider: "openai",
          command: "node agent.js",
          args: ["--eval"],
          env: { AGENT_MODE: "test" },
        },
      ],
      providers: [
        {
          id: "openai",
          baseUrl: "https://api.openai.com",
          apiKeyEnv: "OPENAI_API_KEY",
          model: "gpt-4o",
        },
      ],
      thresholds: {
        minIntegrityIndex: 0.7,
        minOverallLevel: 3,
        requireObservedForLevel5: true,
        denyIfLowTrust: true,
        layers: {
          "Resilience": 3,
          "Skills": 2,
        },
      },
      assurance: {
        runAll: false,
        mode: "sandbox",
        window: "14d",
        packs: [
          "injection",
          { id: "exfiltration", minSeverity: "high", skip: ["scenario-1"] },
        ],
        industries: ["healthcare", "financial"],
      },
      diagnostic: {
        window: "7d",
        claimMode: "harness",
        questions: ["1.1", "2.3"],
        skipQuestions: ["5.2"],
        layers: ["Resilience"],
      },
      output: {
        formats: ["json", "html"],
        outputDir: "./reports",
        badge: true,
        badgePath: "./badge.svg",
        share: false,
      },
      ci: {
        failOnThresholdViolation: true,
        failOnAssuranceFailure: true,
        githubComment: true,
        uploadArtifact: true,
        artifactName: "my-results",
      },
      frameworks: {
        euAiAct: true,
        nistAiRmf: true,
        owaspLlmTop10: true,
        iso42001: false,
        owaspGenAi: true,
      },
      security: {
        trustBoundaryMode: "isolated",
      },
      env: {
        GLOBAL_VAR: "value",
      },
    };

    const result = amcDeclarativeConfigSchema.parse(full);
    expect(result.agents[0].id).toBe("agent-1");
    expect(result.providers).toHaveLength(1);
    expect(result.thresholds?.minIntegrityIndex).toBe(0.7);
    expect(result.assurance?.packs).toHaveLength(2);
    expect(result.ci?.githubComment).toBe(true);
    expect(result.frameworks?.euAiAct).toBe(true);
    expect(result.security?.trustBoundaryMode).toBe("isolated");
  });

  it("rejects invalid riskTier", () => {
    expect(() =>
      amcDeclarativeConfigSchema.parse({
        version: "1.0",
        agents: [{ id: "x", riskTier: "extreme" }],
      })
    ).toThrow();
  });

  it("rejects invalid runtime", () => {
    expect(() =>
      amcDeclarativeConfigSchema.parse({
        version: "1.0",
        agents: [{ id: "x", runtime: "chatgpt" }],
      })
    ).toThrow();
  });

  it("rejects thresholds out of range", () => {
    expect(() =>
      amcDeclarativeConfigSchema.parse({
        version: "1.0",
        agents: [{ id: "x" }],
        thresholds: { minIntegrityIndex: 1.5 },
      })
    ).toThrow();
  });

  it("accepts string and object assurance pack refs", () => {
    const config = {
      version: "1.0",
      agents: [{ id: "x" }],
      assurance: {
        packs: [
          "simple-pack",
          { id: "complex-pack", scenarios: ["s1"], skip: ["s2"], minSeverity: "high" },
        ],
      },
    };
    const result = amcDeclarativeConfigSchema.parse(config);
    expect(result.assurance?.packs).toHaveLength(2);
  });

  it("accepts multiple agents", () => {
    const config = {
      version: "1.0",
      agents: [
        { id: "agent-1", runtime: "claude" },
        { id: "agent-2", runtime: "gemini" },
        { id: "agent-3", runtime: "mock" },
      ],
    };
    const result = amcDeclarativeConfigSchema.parse(config);
    expect(result.agents).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// Config Discovery
// ---------------------------------------------------------------------------

describe("discoverConfigFile", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("finds amcconfig.yaml in root", () => {
    writeYaml(tmpDir, "amcconfig.yaml", minimalValidConfig());
    const found = discoverConfigFile(tmpDir);
    expect(found).toBe(join(tmpDir, "amcconfig.yaml"));
  });

  it("finds amcconfig.yml in root", () => {
    writeYaml(tmpDir, "amcconfig.yml", minimalValidConfig());
    const found = discoverConfigFile(tmpDir);
    expect(found).toBe(join(tmpDir, "amcconfig.yml"));
  });

  it("finds .amcconfig.yaml in root", () => {
    writeYaml(tmpDir, ".amcconfig.yaml", minimalValidConfig());
    const found = discoverConfigFile(tmpDir);
    expect(found).toBe(join(tmpDir, ".amcconfig.yaml"));
  });

  it("finds amcconfig.yaml in .amc/ subdirectory", () => {
    const amcDir = join(tmpDir, ".amc");
    mkdirSync(amcDir, { recursive: true });
    writeYaml(amcDir, "amcconfig.yaml", minimalValidConfig());
    const found = discoverConfigFile(tmpDir);
    expect(found).toBe(join(amcDir, "amcconfig.yaml"));
  });

  it("prefers root over .amc/ subdirectory", () => {
    writeYaml(tmpDir, "amcconfig.yaml", minimalValidConfig());
    const amcDir = join(tmpDir, ".amc");
    mkdirSync(amcDir, { recursive: true });
    writeYaml(amcDir, "amcconfig.yaml", minimalValidConfig());
    const found = discoverConfigFile(tmpDir);
    expect(found).toBe(join(tmpDir, "amcconfig.yaml"));
  });

  it("prefers amcconfig.yaml over amcconfig.yml", () => {
    writeYaml(tmpDir, "amcconfig.yaml", minimalValidConfig());
    writeYaml(tmpDir, "amcconfig.yml", minimalValidConfig());
    const found = discoverConfigFile(tmpDir);
    expect(found).toBe(join(tmpDir, "amcconfig.yaml"));
  });

  it("returns null when no config file exists", () => {
    const found = discoverConfigFile(tmpDir);
    expect(found).toBeNull();
  });

  it("finds amc.config.yaml variant", () => {
    writeYaml(tmpDir, "amc.config.yaml", minimalValidConfig());
    const found = discoverConfigFile(tmpDir);
    expect(found).toBe(join(tmpDir, "amc.config.yaml"));
  });
});

// ---------------------------------------------------------------------------
// Config Loading
// ---------------------------------------------------------------------------

describe("loadDeclarativeConfig", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("loads and validates a config file", () => {
    writeYaml(tmpDir, "amcconfig.yaml", minimalValidConfig());
    const result = loadDeclarativeConfig(undefined, tmpDir);
    expect(result.config.agents).toHaveLength(1);
    expect(result.configPath).toContain("amcconfig.yaml");
    expect(result.warnings).toHaveLength(0);
  });

  it("loads from explicit path", () => {
    const path = writeYaml(tmpDir, "custom.yaml", minimalValidConfig());
    const result = loadDeclarativeConfig("custom.yaml", tmpDir);
    expect(result.configPath).toBe(path);
  });

  it("throws on missing explicit path", () => {
    expect(() =>
      loadDeclarativeConfig("nonexistent.yaml", tmpDir)
    ).toThrow("not found");
  });

  it("throws when no config discovered", () => {
    expect(() =>
      loadDeclarativeConfig(undefined, tmpDir)
    ).toThrow("No amcconfig.yaml found");
  });

  it("throws on invalid YAML syntax", () => {
    writeFileSync(join(tmpDir, "amcconfig.yaml"), "{ invalid yaml: [", "utf8");
    expect(() =>
      loadDeclarativeConfig(undefined, tmpDir)
    ).toThrow();
  });

  it("throws on empty config file", () => {
    writeFileSync(join(tmpDir, "amcconfig.yaml"), "", "utf8");
    expect(() =>
      loadDeclarativeConfig(undefined, tmpDir)
    ).toThrow("empty");
  });

  it("throws on schema validation errors with details", () => {
    writeYaml(tmpDir, "amcconfig.yaml", { version: "1.0", agents: [] });
    expect(() =>
      loadDeclarativeConfig(undefined, tmpDir)
    ).toThrow("Invalid amcconfig.yaml");
  });

  it("warns about undefined provider references", () => {
    const config = {
      version: "1.0",
      agents: [{ id: "x", provider: "nonexistent" }],
    };
    writeYaml(tmpDir, "amcconfig.yaml", config);
    const result = loadDeclarativeConfig(undefined, tmpDir);
    expect(result.warnings.some((w) => w.includes("nonexistent"))).toBe(true);
  });

  it("warns about suspicious pack IDs", () => {
    const config = {
      version: "1.0",
      agents: [{ id: "x" }],
      assurance: {
        packs: ["this is a very suspicious pack id with spaces in it"],
      },
    };
    writeYaml(tmpDir, "amcconfig.yaml", config);
    const result = loadDeclarativeConfig(undefined, tmpDir);
    expect(result.warnings.some((w) => w.includes("Suspicious"))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Environment Resolution
// ---------------------------------------------------------------------------

describe("resolveAgentEnv", () => {
  it("merges global and agent env", () => {
    const config: AMCDeclarativeConfig = {
      ...defaultDeclarativeConfig(),
      agents: [{ id: "x", runtime: "any", riskTier: "med", env: { AGENT_VAR: "agent" } }],
      env: { GLOBAL_VAR: "global" },
    };
    const env = resolveAgentEnv(config, config.agents[0]);
    expect(env).toEqual({ GLOBAL_VAR: "global", AGENT_VAR: "agent" });
  });

  it("agent env overrides global env", () => {
    const config: AMCDeclarativeConfig = {
      ...defaultDeclarativeConfig(),
      agents: [{ id: "x", runtime: "any", riskTier: "med", env: { KEY: "agent" } }],
      env: { KEY: "global" },
    };
    const env = resolveAgentEnv(config, config.agents[0]);
    expect(env.KEY).toBe("agent");
  });

  it("returns empty object when no env", () => {
    const config = defaultDeclarativeConfig();
    config.agents = [{ id: "x", runtime: "any", riskTier: "med" }];
    const env = resolveAgentEnv(config, config.agents[0]);
    expect(env).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// Assurance Pack Resolution
// ---------------------------------------------------------------------------

describe("resolveAssurancePackIds", () => {
  it("returns __ALL__ sentinel for runAll", () => {
    const config: AMCDeclarativeConfig = {
      ...defaultDeclarativeConfig(),
      agents: [{ id: "x", runtime: "any", riskTier: "med" }],
      assurance: { runAll: true, mode: "supervise", window: "30d" },
    };
    const ids = resolveAssurancePackIds(config);
    expect(ids).toEqual(["__ALL__"]);
  });

  it("extracts pack IDs from string refs", () => {
    const config: AMCDeclarativeConfig = {
      ...defaultDeclarativeConfig(),
      agents: [{ id: "x", runtime: "any", riskTier: "med" }],
      assurance: {
        runAll: false,
        mode: "supervise",
        window: "30d",
        packs: ["injection", "exfiltration"],
      },
    };
    const ids = resolveAssurancePackIds(config);
    expect(ids).toEqual(["injection", "exfiltration"]);
  });

  it("extracts pack IDs from object refs", () => {
    const config: AMCDeclarativeConfig = {
      ...defaultDeclarativeConfig(),
      agents: [{ id: "x", runtime: "any", riskTier: "med" }],
      assurance: {
        runAll: false,
        mode: "supervise",
        window: "30d",
        packs: [{ id: "injection", minSeverity: "high" }],
      },
    };
    const ids = resolveAssurancePackIds(config);
    expect(ids).toEqual(["injection"]);
  });

  it("returns empty for no assurance config", () => {
    const config = defaultDeclarativeConfig();
    config.agents = [{ id: "x", runtime: "any", riskTier: "med" }];
    const ids = resolveAssurancePackIds(config);
    expect(ids).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Threshold Checking
// ---------------------------------------------------------------------------

describe("checkThresholds", () => {
  const baseConfig: AMCDeclarativeConfig = {
    ...defaultDeclarativeConfig(),
    agents: [{ id: "x", runtime: "any", riskTier: "med" }],
    thresholds: {
      minIntegrityIndex: 0.5,
      minOverallLevel: 2,
      requireObservedForLevel5: true,
      denyIfLowTrust: false,
    },
  };

  it("passes when all thresholds met", () => {
    const result = checkThresholds(baseConfig, {
      integrityIndex: 0.8,
      layerScores: [{ layerName: "Skills", avgFinalLevel: 3.0 }],
      trustLabel: "HIGH TRUST",
    });
    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it("fails on low integrity index", () => {
    const result = checkThresholds(baseConfig, {
      integrityIndex: 0.3,
      layerScores: [],
      trustLabel: "HIGH TRUST",
    });
    expect(result.passed).toBe(false);
    expect(result.failures[0]).toContain("IntegrityIndex");
  });

  it("fails on low trust when denyIfLowTrust enabled", () => {
    const config = {
      ...baseConfig,
      thresholds: { ...baseConfig.thresholds!, denyIfLowTrust: true },
    };
    const result = checkThresholds(config, {
      integrityIndex: 0.8,
      layerScores: [],
      trustLabel: "LOW TRUST",
    });
    expect(result.passed).toBe(false);
    expect(result.failures[0]).toContain("LOW");
  });

  it("fails on per-layer threshold", () => {
    const config: AMCDeclarativeConfig = {
      ...baseConfig,
      thresholds: {
        ...baseConfig.thresholds!,
        layers: { "Resilience": 4 } as Record<string, number>,
      },
    };
    const result = checkThresholds(config, {
      integrityIndex: 0.8,
      layerScores: [{ layerName: "Resilience", avgFinalLevel: 2.5 }],
      trustLabel: "HIGH TRUST",
    });
    expect(result.passed).toBe(false);
    expect(result.failures[0]).toContain("Resilience");
  });

  it("passes when no thresholds configured", () => {
    const config = { ...baseConfig, thresholds: undefined };
    const result = checkThresholds(config, {
      integrityIndex: 0.1,
      layerScores: [],
      trustLabel: "LOW TRUST",
    });
    expect(result.passed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Config Summary
// ---------------------------------------------------------------------------

describe("summarizeConfig", () => {
  it("produces a readable summary", () => {
    const tmpDir = makeTempDir();
    writeYaml(tmpDir, "amcconfig.yaml", {
      ...minimalValidConfig(),
      description: "Test suite",
    });
    const result = loadDeclarativeConfig(undefined, tmpDir);
    const summary = summarizeConfig(result);

    expect(summary).toContain("test-agent");
    expect(summary).toContain("1.0");
    expect(summary).toContain("Test suite");
    rmSync(tmpDir, { recursive: true, force: true });
  });
});

// ---------------------------------------------------------------------------
// CLI Init
// ---------------------------------------------------------------------------

describe("configInit", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("creates a starter config file", () => {
    configInit({ workspace: tmpDir, force: false });
    const path = join(tmpDir, "amcconfig.yaml");
    expect(existsSync(path)).toBe(true);

    const content = readFileSync(path, "utf8");
    expect(content).toContain("version:");
    expect(content).toContain("agents:");
    expect(content).toContain("thresholds:");
    expect(content).toContain("assurance:");
  });

  it("creates at custom output path", () => {
    configInit({ workspace: tmpDir, force: false, output: "custom.yaml" });
    expect(existsSync(join(tmpDir, "custom.yaml"))).toBe(true);
  });

  it("refuses to overwrite without --force", () => {
    writeFileSync(join(tmpDir, "amcconfig.yaml"), "existing", "utf8");

    // configInit calls process.exit(1) on conflict, so we test differently
    const originalExit = process.exit;
    let exitCode: number | undefined;
    process.exit = ((code?: number) => {
      exitCode = code;
    }) as never;

    configInit({ workspace: tmpDir, force: false });
    expect(exitCode).toBe(1);

    process.exit = originalExit;
  });

  it("overwrites with --force", () => {
    writeFileSync(join(tmpDir, "amcconfig.yaml"), "old content", "utf8");
    configInit({ workspace: tmpDir, force: true });
    const content = readFileSync(join(tmpDir, "amcconfig.yaml"), "utf8");
    expect(content).toContain("version:");
    expect(content).not.toContain("old content");
  });
});

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

describe("defaultDeclarativeConfig", () => {
  it("returns a valid structure", () => {
    const defaults = defaultDeclarativeConfig();
    expect(defaults.version).toBe("1.0");
    expect(defaults.thresholds?.minIntegrityIndex).toBe(0.5);
    expect(defaults.assurance?.mode).toBe("supervise");
    expect(defaults.diagnostic?.window).toBe("30d");
    expect(defaults.ci?.failOnThresholdViolation).toBe(true);
  });
});
