import type { PluginRegistryConfig } from "../pluginRegistrySchema.js";
import type { PluginRiskCategory } from "../pluginTypes.js";

export function isPublisherAllowed(
  registries: PluginRegistryConfig,
  registryId: string,
  publisherFingerprint: string
): boolean {
  const registry = registries.pluginRegistries.registries.find((row) => row.id === registryId);
  if (!registry) {
    return false;
  }
  if (registry.allowPluginPublishers.length === 0) {
    return true;
  }
  return registry.allowPluginPublishers.includes(publisherFingerprint);
}

export function isRiskCategoryAllowed(
  registries: PluginRegistryConfig,
  registryId: string,
  riskCategory: PluginRiskCategory
): boolean {
  const registry = registries.pluginRegistries.registries.find((row) => row.id === registryId);
  if (!registry) {
    return false;
  }
  return registry.allowRiskCategories.includes(riskCategory);
}
