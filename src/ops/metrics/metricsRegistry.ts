import { createHash } from "node:crypto";

type LabelMap = Record<string, string>;

interface CounterMetric {
  type: "counter";
  name: string;
  help: string;
  values: Map<string, { labels: LabelMap; value: number }>;
}

interface GaugeMetric {
  type: "gauge";
  name: string;
  help: string;
  values: Map<string, { labels: LabelMap; value: number }>;
}

interface HistogramMetric {
  type: "histogram";
  name: string;
  help: string;
  buckets: number[];
  values: Map<
    string,
    {
      labels: LabelMap;
      bucketCounts: number[];
      sum: number;
      count: number;
    }
  >;
}

type AnyMetric = CounterMetric | GaugeMetric | HistogramMetric;

const registry = new Map<string, AnyMetric>();

function stableLabelKey(labels: LabelMap): string {
  return Object.keys(labels)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => `${key}=${labels[key]}`)
    .join("|");
}

function metricLabelsToText(labels: LabelMap): string {
  const keys = Object.keys(labels).sort((a, b) => a.localeCompare(b));
  if (keys.length === 0) {
    return "";
  }
  const body = keys
    .map((key) => `${key}="${labels[key]!.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`)
    .join(",");
  return `{${body}}`;
}

function getOrCreateCounter(name: string, help: string): CounterMetric {
  const existing = registry.get(name);
  if (existing) {
    if (existing.type !== "counter") {
      throw new Error(`metric ${name} type mismatch`);
    }
    return existing;
  }
  const metric: CounterMetric = {
    type: "counter",
    name,
    help,
    values: new Map()
  };
  registry.set(name, metric);
  return metric;
}

function getOrCreateGauge(name: string, help: string): GaugeMetric {
  const existing = registry.get(name);
  if (existing) {
    if (existing.type !== "gauge") {
      throw new Error(`metric ${name} type mismatch`);
    }
    return existing;
  }
  const metric: GaugeMetric = {
    type: "gauge",
    name,
    help,
    values: new Map()
  };
  registry.set(name, metric);
  return metric;
}

function getOrCreateHistogram(name: string, help: string, buckets: number[]): HistogramMetric {
  const existing = registry.get(name);
  if (existing) {
    if (existing.type !== "histogram") {
      throw new Error(`metric ${name} type mismatch`);
    }
    return existing;
  }
  const metric: HistogramMetric = {
    type: "histogram",
    name,
    help,
    buckets: [...buckets].sort((a, b) => a - b),
    values: new Map()
  };
  registry.set(name, metric);
  return metric;
}

export function resetMetricsRegistry(): void {
  registry.clear();
}

export function stableAgentHash(agentId: string): string {
  return createHash("sha256").update(agentId).digest("hex").slice(0, 12);
}

export function incCounter(name: string, help: string, labels: LabelMap = {}, value = 1): void {
  const metric = getOrCreateCounter(name, help);
  const key = stableLabelKey(labels);
  const current = metric.values.get(key);
  if (current) {
    current.value += value;
    return;
  }
  metric.values.set(key, {
    labels,
    value
  });
}

export function setGauge(name: string, help: string, labels: LabelMap = {}, value: number): void {
  const metric = getOrCreateGauge(name, help);
  const key = stableLabelKey(labels);
  metric.values.set(key, {
    labels,
    value
  });
}

export function observeHistogram(name: string, help: string, labels: LabelMap = {}, value: number, buckets: number[]): void {
  const metric = getOrCreateHistogram(name, help, buckets);
  const key = stableLabelKey(labels);
  let row = metric.values.get(key);
  if (!row) {
    row = {
      labels,
      bucketCounts: metric.buckets.map(() => 0),
      sum: 0,
      count: 0
    };
    metric.values.set(key, row);
  }
  row.count += 1;
  row.sum += value;
  for (let i = 0; i < metric.buckets.length; i += 1) {
    if (value <= metric.buckets[i]!) {
      row.bucketCounts[i]! += 1;
    }
  }
}

export function renderPrometheusMetrics(): string {
  const lines: string[] = [];
  const names = [...registry.keys()].sort((a, b) => a.localeCompare(b));
  for (const name of names) {
    const metric = registry.get(name)!;
    lines.push(`# HELP ${metric.name} ${metric.help}`);
    lines.push(`# TYPE ${metric.name} ${metric.type === "histogram" ? "histogram" : metric.type}`);
    if (metric.type === "counter" || metric.type === "gauge") {
      const values = [...metric.values.values()].sort((a, b) => stableLabelKey(a.labels).localeCompare(stableLabelKey(b.labels)));
      for (const row of values) {
        lines.push(`${metric.name}${metricLabelsToText(row.labels)} ${row.value}`);
      }
      continue;
    }
    const values = [...metric.values.values()].sort((a, b) => stableLabelKey(a.labels).localeCompare(stableLabelKey(b.labels)));
    for (const row of values) {
      let cumulative = 0;
      for (let i = 0; i < metric.buckets.length; i += 1) {
        cumulative += row.bucketCounts[i]!;
        const labels = {
          ...row.labels,
          le: String(metric.buckets[i]!)
        };
        lines.push(`${metric.name}_bucket${metricLabelsToText(labels)} ${cumulative}`);
      }
      lines.push(`${metric.name}_bucket${metricLabelsToText({ ...row.labels, le: "+Inf" })} ${row.count}`);
      lines.push(`${metric.name}_sum${metricLabelsToText(row.labels)} ${row.sum}`);
      lines.push(`${metric.name}_count${metricLabelsToText(row.labels)} ${row.count}`);
    }
  }
  return `${lines.join("\n")}\n`;
}

