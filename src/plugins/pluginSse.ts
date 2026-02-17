export const PLUGIN_SSE_EVENTS = [
  "PLUGIN_INSTALL_REQUESTED",
  "PLUGIN_INSTALLED",
  "PLUGIN_UPGRADED",
  "PLUGIN_REMOVED",
  "PLUGIN_INTEGRITY_BROKEN"
] as const;

export type PluginSseEventType = (typeof PLUGIN_SSE_EVENTS)[number];
