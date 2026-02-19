import { randomUUID } from 'node:crypto';

export interface BrandingConfig { brand: string; logo?: string; colors?: Record<string, string>; fonts?: string[]; }
export interface Branding { id: string; config: BrandingConfig; createdAt: number; }
export interface WhiteLabelConfig { configId: string; brand: string; theme: Record<string, string>; }

export class WhiteLabelManager {
  private brandings = new Map<string, Branding>();
  private assignments = new Map<string, string>(); // agentId -> brandingId

  createBranding(config: BrandingConfig): Branding {
    const b: Branding = { id: randomUUID(), config, createdAt: Date.now() };
    this.brandings.set(b.id, b);
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
}

export function createWhiteLabel(brand: string, theme: Record<string, string>): WhiteLabelConfig {
  return { configId: randomUUID(), brand, theme };
}
