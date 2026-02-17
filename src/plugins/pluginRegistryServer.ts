import { servePluginRegistry } from "./pluginRegistry.js";

export async function startPluginRegistryServer(params: {
  dir: string;
  port: number;
  host?: string;
}) {
  return servePluginRegistry(params);
}
