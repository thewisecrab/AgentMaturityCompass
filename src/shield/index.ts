export { analyzeSkill } from './analyzer.js';
export type { AnalyzerFinding, AnalyzerResult } from './analyzer.js';
export { sandboxCheck } from './behavioralSandbox.js';
export type { SandboxResult } from './behavioralSandbox.js';
export { generateSbom } from './sbom.js';
export type { SbomComponent, SbomResult } from './sbom.js';
export { checkReputation } from './reputation.js';
export type { ReputationResult } from './reputation.js';
export { detonateAttachment } from './attachmentDetonation.js';
export type { DetonationResult } from './attachmentDetonation.js';
export { quarantineCheck } from './downloadQuarantine.js';
export type { QuarantineResult } from './downloadQuarantine.js';
export { checkIntegrity } from './conversationIntegrity.js';
export type { IntegrityResult } from './conversationIntegrity.js';
export { checkThreatIntel, getStats as getThreatIntelStats } from './threatIntel.js';
export type { ThreatMatch, ThreatIntelResult } from './threatIntel.js';
export { fingerprint } from './uiFingerprint.js';
export type { FingerprintResult } from './uiFingerprint.js';
export { validateManifest, checkRegistry, checkIngress, sanitize, detect, checkOAuthScopes } from './stubs.js';
export type { ManifestResult, RegistryCheckResult, IngressResult, SanitizeResult, DetectorResult, OAuthScopeResult } from './stubs.js';

// ── Validator library (2026-02-21) ────────────────────────────────────
export {
  validatePII, validateSecretLeakage, validatePromptInjection,
  validateMedicalAdvice, validateFinancialAdvice, validateToxicity,
  validateCompetitorMention, validateCustomBlocklist,
  runAllValidators, aggregateValidationResults,
} from "./validators/index.js";
export type { ValidationResult as ShieldValidationResult, ValidationViolation, ValidatorConfig } from "./validators/index.js";
