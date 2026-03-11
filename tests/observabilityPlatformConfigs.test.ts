import { describe, expect, test, beforeEach, afterEach } from "vitest";
import {
  getGrafanaConfig,
  getDatadogConfig,
  getNewRelicConfig,
  detectPlatform,
  autoConfigFromEnv,
} from "../src/observability/platformConfigs.js";

describe("platformConfigs", () => {
  const savedEnv: Record<string, string | undefined> = {};
  const envKeys = [
    "GRAFANA_OTLP_ENDPOINT",
    "GRAFANA_INSTANCE_ID",
    "GRAFANA_API_KEY",
    "DD_API_KEY",
    "DD_SITE",
    "DD_ENV",
    "DD_VERSION",
    "NEW_RELIC_LICENSE_KEY",
    "NEW_RELIC_REGION",
    "AMC_OTEL_EXPORTERS",
    "AMC_OTEL_SERVICE_NAME",
  ];

  beforeEach(() => {
    for (const key of envKeys) {
      savedEnv[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of envKeys) {
      if (savedEnv[key] !== undefined) {
        process.env[key] = savedEnv[key];
      } else {
        delete process.env[key];
      }
    }
  });

  describe("getGrafanaConfig", () => {
    test("returns valid OTLP config with Basic auth", () => {
      const config = getGrafanaConfig({
        endpoint: "https://otlp-gateway-prod-us-east-0.grafana.net/otlp",
        instanceId: "123456",
        apiKey: "glc_abc123",
      });
      expect(config.enabled).toBe(true);
      expect(config.targets).toHaveLength(1);
      expect(config.targets![0].kind).toBe("otlp");
      expect(config.targets![0].endpoint).toContain("grafana.net/otlp");
      expect(config.targets![0].headers?.Authorization).toMatch(/^Basic /);
    });

    test("strips trailing slashes from endpoint", () => {
      const config = getGrafanaConfig({
        endpoint: "https://example.grafana.net/otlp///",
        instanceId: "1",
        apiKey: "k",
      });
      expect(config.targets![0].endpoint).toBe("https://example.grafana.net/otlp");
    });
  });

  describe("getDatadogConfig", () => {
    test("returns OTLP config with DD-API-KEY header", () => {
      const config = getDatadogConfig({ apiKey: "dd-key-123" });
      expect(config.enabled).toBe(true);
      expect(config.targets).toHaveLength(1);
      expect(config.targets![0].headers?.["DD-API-KEY"]).toBe("dd-key-123");
    });

    test("uses custom site", () => {
      const config = getDatadogConfig({ apiKey: "k", site: "datadoghq.eu" });
      expect(config.targets![0].endpoint).toContain("datadoghq.eu");
    });

    test("sets dd.* resource attributes", () => {
      const config = getDatadogConfig({ apiKey: "k", env: "staging", version: "2.0.0" });
      expect(config.resourceAttributes?.["dd.env"]).toBe("staging");
      expect(config.resourceAttributes?.["dd.version"]).toBe("2.0.0");
    });
  });

  describe("getNewRelicConfig", () => {
    test("returns OTLP config with api-key header (US)", () => {
      const config = getNewRelicConfig({ licenseKey: "nr-key-abc" });
      expect(config.enabled).toBe(true);
      expect(config.targets).toHaveLength(1);
      expect(config.targets![0].headers?.["api-key"]).toBe("nr-key-abc");
      expect(config.targets![0].endpoint).toContain("otlp.nr-data.net");
    });

    test("uses EU endpoint for eu region", () => {
      const config = getNewRelicConfig({ licenseKey: "k", region: "eu" });
      expect(config.targets![0].endpoint).toContain("eu01.nr-data.net");
    });
  });

  describe("detectPlatform", () => {
    test("returns 'none' when no env vars set", () => {
      expect(detectPlatform()).toBe("none");
    });

    test("detects grafana", () => {
      process.env.GRAFANA_OTLP_ENDPOINT = "https://example.grafana.net/otlp";
      process.env.GRAFANA_INSTANCE_ID = "123";
      process.env.GRAFANA_API_KEY = "key";
      expect(detectPlatform()).toBe("grafana");
    });

    test("detects datadog", () => {
      process.env.DD_API_KEY = "dd-key";
      expect(detectPlatform()).toBe("datadog");
    });

    test("detects newrelic", () => {
      process.env.NEW_RELIC_LICENSE_KEY = "nr-key";
      expect(detectPlatform()).toBe("newrelic");
    });

    test("detects custom when AMC_OTEL_EXPORTERS set", () => {
      process.env.AMC_OTEL_EXPORTERS = "otlp";
      expect(detectPlatform()).toBe("custom");
    });

    test("grafana takes priority over datadog", () => {
      process.env.GRAFANA_OTLP_ENDPOINT = "https://example.grafana.net/otlp";
      process.env.GRAFANA_INSTANCE_ID = "123";
      process.env.GRAFANA_API_KEY = "key";
      process.env.DD_API_KEY = "dd-key";
      expect(detectPlatform()).toBe("grafana");
    });
  });

  describe("autoConfigFromEnv", () => {
    test("returns undefined when no platform detected", () => {
      expect(autoConfigFromEnv()).toBeUndefined();
    });

    test("returns grafana config from env", () => {
      process.env.GRAFANA_OTLP_ENDPOINT = "https://g.net/otlp";
      process.env.GRAFANA_INSTANCE_ID = "42";
      process.env.GRAFANA_API_KEY = "gkey";
      const config = autoConfigFromEnv();
      expect(config).toBeDefined();
      expect(config!.targets).toHaveLength(1);
      expect(config!.targets![0].kind).toBe("otlp");
    });

    test("returns datadog config from env", () => {
      process.env.DD_API_KEY = "ddkey";
      const config = autoConfigFromEnv();
      expect(config).toBeDefined();
      expect(config!.targets![0].headers?.["DD-API-KEY"]).toBe("ddkey");
    });

    test("returns newrelic config from env", () => {
      process.env.NEW_RELIC_LICENSE_KEY = "nrkey";
      const config = autoConfigFromEnv();
      expect(config).toBeDefined();
      expect(config!.targets![0].headers?.["api-key"]).toBe("nrkey");
    });
  });
});
