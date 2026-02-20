/**
 * whiteLabel.ts — Multi-tenant configuration, template rendering
 * ({{brand}} substitution), and feature gates.
 */

import { randomUUID } from 'node:crypto';

export interface BrandingConfig {
  brand: string;
  logo?: string;
  colors?: Record<string, string>;
  fonts?: string[];
  customCss?: string;
}

export interface Branding {
  id: string;
  config: BrandingConfig;
  createdAt: number;
}

export interface WhiteLabelConfig {
  configId: string;
  brand: string;
  theme: Record<string, string>;
}

export interface TenantConfig {
  tenantId: string;
  brandingId: string;
  featureGates: Record<string, boolean>;
  metadata: Record<string, unknown>;
  createdAt: number;
}

/* ── Template rendering ──────────────────────────────────────────── */

export function renderTemplate(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}

/* ── WhiteLabelManager ───────────────────────────────────────────── */

export class WhiteLabelManager {
  private brandings = new Map<string, Branding>();
  private assignments = new Map<string, string>(); // agentId -> brandingId
  private tenants = new Map<string, TenantConfig>();
  private featureDefaults = new Map<string, boolean>();

  /* ── Branding ──────────────────────────────────────────────────── */

  createBranding(config: BrandingConfig): Branding {
    const b: Branding = { id: randomUUID(), config, createdAt: Date.now() };
    this.brandings.set(b.id, b);
    return b;
  }

  updateBranding(brandingId: string, updates: Partial<BrandingConfig>): Branding | undefined {
    const b = this.brandings.get(brandingId);
    if (!b) return undefined;
    Object.assign(b.config, updates);
    return b;
  }

  applyBranding(agentId: string, brandingId: string): boolean {
    if (!this.brandings.has(brandingId)) return false;
    this.assignments.set(agentId, brandingId);
    return true;
  }

  getBranding(agentId: string): Branding | undefined {
    const brandingId = this.assignments.get(agentId);
    return brandingId ? this.brandings.get(brandingId) : undefined;
  }

  listBrandings(): Branding[] { return [...this.brandings.values()]; }

  /* ── Multi-tenant ──────────────────────────────────────────────── */

  createTenant(tenantId: string, brandingId: string, features?: Record<string, boolean>): TenantConfig {
    const config: TenantConfig = {
      tenantId,
      brandingId,
      featureGates: features ?? {},
      metadata: {},
      createdAt: Date.now(),
    };
    this.tenants.set(tenantId, config);
    return config;
  }

  getTenant(tenantId: string): TenantConfig | undefined {
    return this.tenants.get(tenantId);
  }

  listTenants(): TenantConfig[] { return [...this.tenants.values()]; }

  /* ── Feature gates ─────────────────────────────────────────────── */

  setFeatureDefault(feature: string, enabled: boolean): void {
    this.featureDefaults.set(feature, enabled);
  }

  setTenantFeature(tenantId: string, feature: string, enabled: boolean): boolean {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return false;
    tenant.featureGates[feature] = enabled;
    return true;
  }

  isFeatureEnabled(tenantId: string, feature: string): boolean {
    const tenant = this.tenants.get(tenantId);
    if (tenant && feature in tenant.featureGates) {
      return tenant.featureGates[feature]!;
    }
    return this.featureDefaults.get(feature) ?? false;
  }

  /* ── Template rendering per tenant ─────────────────────────────── */

  renderForTenant(tenantId: string, template: string): string {
    const tenant = this.tenants.get(tenantId);
    const branding = tenant ? this.brandings.get(tenant.brandingId) : undefined;
    const vars: Record<string, string> = {
      brand: branding?.config.brand ?? 'AMC',
      logo: branding?.config.logo ?? '',
      tenantId: tenantId,
    };
    if (branding?.config.colors) {
      for (const [k, v] of Object.entries(branding.config.colors)) {
        vars[`color_${k}`] = v;
      }
    }
    return renderTemplate(template, vars);
  }
}

/* ── Legacy compat ───────────────────────────────────────────────── */

export function createWhiteLabel(brand: string, theme: Record<string, string>): WhiteLabelConfig {
  return { configId: randomUUID(), brand, theme };
}
