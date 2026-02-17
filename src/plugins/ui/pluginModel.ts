export interface PluginUiRow {
  id: string;
  version: string;
  publisherFingerprint: string;
  registryFingerprint: string;
  riskCategory: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  installedTs: number;
  integrity: {
    ok: boolean;
    reasons: string[];
  };
}

export interface PluginRegistryUiRow {
  id: string;
  base: string;
  pinnedFingerprint: string;
  allowPublishers: string[];
  allowRiskCategories: Array<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">;
  autoUpdate: boolean;
}
