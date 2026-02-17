import { verifyFederationPackage } from "./federationSync.js";

export function federationVerifyBundle(bundleFile: string): ReturnType<typeof verifyFederationPackage> {
  return verifyFederationPackage(bundleFile);
}
