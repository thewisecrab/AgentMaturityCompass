// Dedicated module exports
export { SecretsBroker, mintSecretToken } from './secretsBroker.js';
export type { SecretStoreResult, SecretRetrieveResult, SecretListItem } from './secretsBroker.js';
export { MemoryTtlStore, storeWithTtl } from './memoryTtl.js';
export { checkResidency, checkDataResidency } from './dataResidency.js';
export type { DataRecord, ResidencyPolicy, ResidencyResult } from './dataResidency.js';
export { redactScreenshotMetadata, hasExifData, redactScreenshot } from './screenshotRedact.js';
export type { RedactResult } from './screenshotRedact.js';
export { UndoLayer, snapshotBeforeChange, undoChange } from './undoLayer.js';
export type { ActionRecord, UndoResult, RedoResult } from './undoLayer.js';

// Legacy types
export type { MemoryRecord, ResidencyCheck, UndoSnapshot, SecretToken } from './stubs.js';
