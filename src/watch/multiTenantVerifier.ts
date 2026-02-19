export interface ResourceDescriptor {
  resourceId: string;
  tenantId: string;
  namespace: string;
  type: string;
}

export interface TenantResult {
  isolated: boolean;
  violations: string[];
  tenantId: string;
  resource: string;
}

export class MultiTenantVerifier {
  private readonly resources = new Map<string, ResourceDescriptor[]>();

  registerResource(resource: ResourceDescriptor): void {
    const list = this.resources.get(resource.tenantId) ?? [];
    list.push(resource);
    this.resources.set(resource.tenantId, list);
  }

  verifyTenantIsolation(tenantId: string, resource: ResourceDescriptor): TenantResult {
    const violations: string[] = [];

    if (resource.tenantId !== tenantId) {
      violations.push(`Resource '${resource.resourceId}' belongs to tenant '${resource.tenantId}', not '${tenantId}'`);
    }

    const expectedPrefix = `${tenantId}/`;
    if (!resource.namespace.startsWith(expectedPrefix) && resource.namespace !== tenantId) {
      violations.push(`Namespace '${resource.namespace}' does not match tenant prefix '${expectedPrefix}'`);
    }

    return { isolated: violations.length === 0, violations, tenantId, resource: resource.resourceId };
  }

  checkCrossTenantAccess(requestingTenant: string, resourceTenant: string): boolean {
    return requestingTenant === resourceTenant;
  }
}

/** Backward-compatible wrapper */
export function verifyTenantBoundary(tenantId: string, resourceOwnerId: string) {
  const valid = tenantId === resourceOwnerId;
  return { valid, tenantId, violations: valid ? [] : [`Resource belongs to ${resourceOwnerId}, not ${tenantId}`] };
}
