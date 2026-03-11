/**
 * platformConfigs.ts — Pre-built OTel exporter configurations for popular
 * observability platforms: Grafana Cloud, Datadog, New Relic.
 *
 * Usage:
 *   import { getGrafanaConfig, getDatadogConfig, getNewRelicConfig } from './platformConfigs.js';
 *   const exporter = new ObservabilityOTELExporter(getGrafanaConfig({ instanceId, apiKey }));
 */

import type {
  ObservabilityOTELConfig,
  ObservabilityExporterTarget,
} from "./otelExporter.js";

/* ── Grafana Cloud (OTLP) ──────────────────────────────────── */

export interface GrafanaCloudOptions {
  /** Grafana Cloud OTLP endpoint, e.g. https://otlp-gateway-prod-us-east-0.grafana.net/otlp */
  endpoint: string;
  /** Grafana Cloud instance ID (numeric) */
  instanceId: string;
  /** Grafana Cloud API token */
  apiKey: string;
  /** Override service name (default: amc-agent) */
  serviceName?: string;
  /** Additional resource attributes */
  resourceAttributes?: Record<string, string>;
}

export function getGrafanaConfig(opts: GrafanaCloudOptions): Partial<ObservabilityOTELConfig> {
  const basicAuth = Buffer.from(`${opts.instanceId}:${opts.apiKey}`).toString("base64");
  const target: ObservabilityExporterTarget = {
    kind: "otlp",
    endpoint: opts.endpoint.replace(/\/+$/, ""),
    headers: {
      Authorization: `Basic ${basicAuth}`,
    },
  };

  return {
    enabled: true,
    serviceName: opts.serviceName ?? "amc-agent",
    serviceVersion: "1.0.0",
    resourceAttributes: {
      "deployment.environment": "production",
      ...(opts.resourceAttributes ?? {}),
    },
    targets: [target],
    maxBufferSize: 1024,
  };
}

/* ── Datadog (OTLP) ───────────────────────────────────────── */

export interface DatadogOptions {
  /** Datadog site, e.g. datadoghq.com, us3.datadoghq.com, datadoghq.eu */
  site?: string;
  /** Datadog API key */
  apiKey: string;
  /** Override service name (default: amc-agent) */
  serviceName?: string;
  /** Datadog environment tag */
  env?: string;
  /** Datadog version tag */
  version?: string;
  /** Additional resource attributes */
  resourceAttributes?: Record<string, string>;
}

export function getDatadogConfig(opts: DatadogOptions): Partial<ObservabilityOTELConfig> {
  const site = opts.site ?? "datadoghq.com";
  // Datadog OTLP ingest endpoint (HTTP)
  const endpoint = `https://http-intake.logs.${site}`;

  const target: ObservabilityExporterTarget = {
    kind: "otlp",
    endpoint,
    headers: {
      "DD-API-KEY": opts.apiKey,
    },
  };

  return {
    enabled: true,
    serviceName: opts.serviceName ?? "amc-agent",
    serviceVersion: opts.version ?? "1.0.0",
    resourceAttributes: {
      "deployment.environment": opts.env ?? "production",
      "dd.service": opts.serviceName ?? "amc-agent",
      "dd.env": opts.env ?? "production",
      "dd.version": opts.version ?? "1.0.0",
      ...(opts.resourceAttributes ?? {}),
    },
    targets: [target],
    maxBufferSize: 1024,
  };
}

/* ── New Relic (OTLP) ──────────────────────────────────────── */

export interface NewRelicOptions {
  /** New Relic License Key (Ingest) */
  licenseKey: string;
  /** OTLP endpoint region: 'us' or 'eu' (default: us) */
  region?: "us" | "eu";
  /** Override service name (default: amc-agent) */
  serviceName?: string;
  /** Additional resource attributes */
  resourceAttributes?: Record<string, string>;
}

export function getNewRelicConfig(opts: NewRelicOptions): Partial<ObservabilityOTELConfig> {
  const region = opts.region ?? "us";
  const endpoint =
    region === "eu"
      ? "https://otlp.eu01.nr-data.net"
      : "https://otlp.nr-data.net";

  const target: ObservabilityExporterTarget = {
    kind: "otlp",
    endpoint,
    headers: {
      "api-key": opts.licenseKey,
    },
  };

  return {
    enabled: true,
    serviceName: opts.serviceName ?? "amc-agent",
    serviceVersion: "1.0.0",
    resourceAttributes: {
      "deployment.environment": "production",
      ...(opts.resourceAttributes ?? {}),
    },
    targets: [target],
    maxBufferSize: 1024,
  };
}

/* ── Environment-based auto-detection ──────────────────────── */

export type PlatformName = "grafana" | "datadog" | "newrelic" | "custom" | "none";

/**
 * Detect platform from environment variables.
 *
 * Checks:
 *   GRAFANA_OTLP_ENDPOINT + GRAFANA_INSTANCE_ID + GRAFANA_API_KEY
 *   DD_API_KEY (+ DD_SITE)
 *   NEW_RELIC_LICENSE_KEY (+ NEW_RELIC_REGION)
 *   AMC_OTEL_EXPORTERS (custom fallback)
 */
export function detectPlatform(): PlatformName {
  if (
    process.env.GRAFANA_OTLP_ENDPOINT &&
    process.env.GRAFANA_INSTANCE_ID &&
    process.env.GRAFANA_API_KEY
  ) {
    return "grafana";
  }
  if (process.env.DD_API_KEY) {
    return "datadog";
  }
  if (process.env.NEW_RELIC_LICENSE_KEY) {
    return "newrelic";
  }
  if (process.env.AMC_OTEL_EXPORTERS) {
    return "custom";
  }
  return "none";
}

/**
 * Auto-configure an OTEL exporter config from environment variables.
 * Returns undefined if no platform is detected.
 */
export function autoConfigFromEnv(): Partial<ObservabilityOTELConfig> | undefined {
  const platform = detectPlatform();

  switch (platform) {
    case "grafana":
      return getGrafanaConfig({
        endpoint: process.env.GRAFANA_OTLP_ENDPOINT!,
        instanceId: process.env.GRAFANA_INSTANCE_ID!,
        apiKey: process.env.GRAFANA_API_KEY!,
        serviceName: process.env.AMC_OTEL_SERVICE_NAME,
      });

    case "datadog":
      return getDatadogConfig({
        apiKey: process.env.DD_API_KEY!,
        site: process.env.DD_SITE,
        env: process.env.DD_ENV,
        version: process.env.DD_VERSION,
        serviceName: process.env.AMC_OTEL_SERVICE_NAME,
      });

    case "newrelic":
      return getNewRelicConfig({
        licenseKey: process.env.NEW_RELIC_LICENSE_KEY!,
        region: (process.env.NEW_RELIC_REGION as "us" | "eu") ?? "us",
        serviceName: process.env.AMC_OTEL_SERVICE_NAME,
      });

    default:
      return undefined;
  }
}
