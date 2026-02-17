import { z } from "zod";

const boolish = z.union([z.boolean(), z.string()]).transform((value) => {
  if (typeof value === "boolean") {
    return value;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
});

const intish = z.union([z.number(), z.string()]).transform((value) => {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`invalid number: ${String(value)}`);
  }
  return Math.trunc(parsed);
});

export const studioEnvSchema = z.object({
  AMC_HOST_DIR: z.string().optional(),
  AMC_DEFAULT_WORKSPACE_ID: z.string().min(1).default("default"),
  AMC_HOST_BIND: z.string().min(1).default("127.0.0.1"),
  AMC_HOST_PORT: intish.default(3212),
  AMC_HOST_PUBLIC_BASEURL: z.string().optional(),
  AMC_WORKSPACE_DIR: z.string().min(1).default("/data/amc"),
  AMC_BIND: z.string().min(1).default("127.0.0.1"),
  AMC_STUDIO_PORT: intish.default(3212),
  AMC_GATEWAY_PORT: intish.default(3210),
  AMC_PROXY_PORT: intish.default(3211),
  AMC_TOOLHUB_PORT: intish.default(3213),
  AMC_LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  AMC_LAN_MODE: boolish.default(false),
  AMC_ALLOWED_CIDRS: z.string().default("127.0.0.1/32,::1/128"),
  AMC_QUERY_LEASE_CARRIER_ENABLED: boolish.default(false),
  AMC_TRUSTED_PROXY_HOPS: intish.default(0),
  AMC_DATA_RETENTION_DAYS: intish.default(30),
  AMC_MIN_FREE_DISK_MB: intish.default(1024),
  AMC_MAX_REQUEST_BYTES: intish.default(1_048_576),
  AMC_CORS_ALLOWED_ORIGINS: z.string().default(""),
  AMC_ALLOW_PUBLIC_BIND: boolish.default(false),
  AMC_METRICS_BIND: z.string().default("127.0.0.1"),
  AMC_METRICS_PORT: intish.default(9464),
  AMC_BOOTSTRAP: boolish.default(false),
  AMC_VAULT_PASSPHRASE: z.string().optional(),
  AMC_VAULT_PASSPHRASE_FILE: z.string().optional(),
  AMC_BOOTSTRAP_OWNER_USERNAME: z.string().optional(),
  AMC_BOOTSTRAP_OWNER_USERNAME_FILE: z.string().optional(),
  AMC_BOOTSTRAP_OWNER_PASSWORD: z.string().optional(),
  AMC_BOOTSTRAP_OWNER_PASSWORD_FILE: z.string().optional(),
  AMC_BOOTSTRAP_HOST_ADMIN_USERNAME: z.string().optional(),
  AMC_BOOTSTRAP_HOST_ADMIN_USERNAME_FILE: z.string().optional(),
  AMC_BOOTSTRAP_HOST_ADMIN_PASSWORD: z.string().optional(),
  AMC_BOOTSTRAP_HOST_ADMIN_PASSWORD_FILE: z.string().optional(),
  AMC_BOOTSTRAP_DEFAULT_WORKSPACE_ID: z.string().optional(),
  AMC_BOOTSTRAP_DEFAULT_WORKSPACE_NAME: z.string().optional(),
  AMC_SESSION_SIGNING_KEY: z.string().optional(),
  AMC_SESSION_SIGNING_KEY_FILE: z.string().optional(),
  AMC_ENABLE_NOTARY: boolish.default(false),
  AMC_NOTARY_BASE_URL: z.string().min(1).default("http://127.0.0.1:4343"),
  AMC_NOTARY_REQUIRED_ATTESTATION: z.enum(["SOFTWARE", "HARDWARE"]).default("SOFTWARE"),
  AMC_NOTARY_AUTH_SECRET: z.string().optional(),
  AMC_NOTARY_AUTH_SECRET_FILE: z.string().optional()
});

export type StudioEnv = z.infer<typeof studioEnvSchema>;
