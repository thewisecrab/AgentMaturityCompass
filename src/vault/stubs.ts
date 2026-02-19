/**
 * Vault stubs — now re-exported from dedicated module files for backward compatibility.
 */
export { mintSecretToken } from './secretsBroker.js';
export type { SecretStoreResult as SecretToken } from './secretsBroker.js';
export { storeWithTtl } from './memoryTtl.js';
export { checkDataResidency } from './dataResidency.js';
export { redactScreenshot } from './screenshotRedact.js';
export type { RedactResult } from './screenshotRedact.js';
export { snapshotBeforeChange, undoChange } from './undoLayer.js';

// Legacy types for backward compat
export type MemoryRecord = { key: string; purpose: string; expiresAt: Date; stored: boolean; };
export type ResidencyCheck = { compliant: boolean; region: string; allowedRegions: string[]; };
export type UndoSnapshot = { snapshotId: string; resourceId: string; operation: string; canUndo: boolean; };
