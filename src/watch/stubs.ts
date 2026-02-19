/**
 * Watch stubs — now re-exported from dedicated module files for backward compatibility.
 */
export { exportToSiem } from './siemExporter.js';
export { runHardeningChecks } from './hostHardening.js';
export { verifyTenantBoundary } from './multiTenantVerifier.js';
export { createPolicyPackCompat as createPolicyPack, validatePolicyPack } from './policyPacks.js';

// Legacy types
export type SiemEvent = { eventId: string; category: string; severity: string; timestamp: Date; };
export type SiemExportResult = { events: SiemEvent[]; format: string; exported: boolean; };
export type HardeningCheck = { checkId: string; title: string; passed: boolean; severity: string; };
export type HardeningResult = { checks: HardeningCheck[]; score: number; };
export type TenantBoundaryResult = { valid: boolean; tenantId: string; violations: string[]; };
export type PolicyPack = { packId: string; name: string; version: string; modules: string[]; };
