import type { PluginOverrides } from "../pluginRegistrySchema.js";

export function canOverrideAsset(params: {
  overrides: PluginOverrides;
  kind: "policy_pack" | "assurance_pack" | "compliance_map" | "adapter" | "learn_md" | "transform_overlay";
  id: string;
  publisherFingerprint: string;
}): boolean {
  const rule = params.overrides.overrides.allow.find((row) => row.kind === params.kind && row.id === params.id);
  if (!rule) {
    return false;
  }
  return rule.allowedPublisherFingerprints.includes(params.publisherFingerprint);
}
