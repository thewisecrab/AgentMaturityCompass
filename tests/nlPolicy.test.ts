/**
 * nlPolicy.test.ts — Unit tests for natural language policy authoring
 */
import { describe, it, expect } from 'vitest';
import {
  parseNLPolicy,
  validateParsedPolicy,
  POLICY_TEMPLATES,
} from '../src/governor/nlPolicy.js';

describe('parseNLPolicy', () => {
  it('returns a parsed policy with rules array', () => {
    const result = parseNLPolicy({ description: "don't share PII with external vendors" });
    expect(result).toBeDefined();
    expect(Array.isArray(result.rules)).toBe(true);
    expect(result.rules.length).toBeGreaterThan(0);
  });

  it('returns confidence between 0 and 1', () => {
    const result = parseNLPolicy({ description: 'log all actions' });
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('includes policyId in result', () => {
    const result = parseNLPolicy({ description: 'block external network access' });
    expect(result.policyId).toBeTruthy();
  });

  it('includes description in result', () => {
    const result = parseNLPolicy({ description: 'log all actions for audit trail' });
    expect(result.description).toBe('log all actions for audit trail');
  });

  it('parses PII protection policy — action is DENY', () => {
    const result = parseNLPolicy({ description: "don't share PII with external vendors" });
    const actions = result.rules.map(r => r.action);
    expect(actions.some(a => a === 'DENY')).toBe(true);
  });

  it('parses financial approval policy — action is STEP_UP', () => {
    const result = parseNLPolicy({ description: 'require approval for financial transactions over $5,000' });
    const actions = result.rules.map(r => r.action);
    expect(actions.some(a => a === 'STEP_UP')).toBe(true);
  });

  it('parses audit logging policy — action is LOG', () => {
    const result = parseNLPolicy({ description: 'log all actions for audit trail' });
    const actions = result.rules.map(r => r.action);
    expect(actions.some(a => a === 'LOG')).toBe(true);
  });

  it('parses network restriction policy — action is DENY', () => {
    const result = parseNLPolicy({ description: 'block all external network access' });
    const actions = result.rules.map(r => r.action);
    expect(actions.some(a => a === 'DENY')).toBe(true);
  });

  it('parses read-only policy — action is DENY', () => {
    const result = parseNLPolicy({ description: 'only allow read operations, no writes' });
    const actions = result.rules.map(r => r.action);
    expect(actions.some(a => a === 'DENY')).toBe(true);
  });

  it('parses secret redaction policy — action is REDACT', () => {
    const result = parseNLPolicy({ description: 'redact secrets from output' });
    const actions = result.rules.map(r => r.action);
    expect(actions.some(a => a === 'REDACT')).toBe(true);
  });

  it('parses deploy approval policy — action is STEP_UP', () => {
    const result = parseNLPolicy({ description: 'require approval before deployment' });
    const actions = result.rules.map(r => r.action);
    expect(actions.some(a => a === 'STEP_UP')).toBe(true);
  });

  it('handles unknown/ambiguous description gracefully with fallback rule', () => {
    const result = parseNLPolicy({ description: 'do something interesting with widgets' });
    expect(result).toBeDefined();
    expect(Array.isArray(result.rules)).toBe(true);
    // Falls back to default LOG rule
    expect(result.rules.length).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThan(0.8);
  });

  it('each rule has required fields: id, condition, action, reason', () => {
    const result = parseNLPolicy({ description: 'log all actions' });
    for (const rule of result.rules) {
      expect(rule.id).toBeTruthy();
      expect(rule.condition).toBeTruthy();
      expect(rule.action).toBeTruthy();
      expect(rule.reason).toBeTruthy();
    }
  });

  it('result includes policyId, name, yaml, shields, warnings, matchedPatterns', () => {
    const result = parseNLPolicy({ description: 'log all actions' });
    expect(result.policyId).toBeTruthy();
    expect(result.name).toBeTruthy();
    expect(result.yaml).toBeTruthy();
    expect(Array.isArray(result.shields)).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);
    expect(Array.isArray(result.matchedPatterns)).toBe(true);
  });

  it('yaml contains agent field', () => {
    const result = parseNLPolicy({ description: 'log all actions', agentId: 'my-agent' });
    expect(result.yaml).toContain('my-agent');
  });

  it('PII policy activates pii shield', () => {
    const result = parseNLPolicy({ description: "don't share PII with external vendors" });
    expect(result.shields).toContain('pii');
  });

  it('matched patterns are populated for known intents', () => {
    const result = parseNLPolicy({ description: 'log all actions for audit trail' });
    expect(result.matchedPatterns.length).toBeGreaterThan(0);
  });
});

describe('validateParsedPolicy', () => {
  it('returns valid=true for well-formed policy', () => {
    const parsed = parseNLPolicy({ description: 'log all actions' });
    const validation = validateParsedPolicy(parsed);
    expect(validation.valid).toBe(true);
    expect(validation.errors.length).toBe(0);
  });

  it('returns valid=false when rules array is empty', () => {
    const parsed = parseNLPolicy({ description: 'log all actions' });
    const broken = { ...parsed, rules: [] };
    const validation = validateParsedPolicy(broken);
    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });

  it('includes warnings for very low confidence policies', () => {
    const parsed = parseNLPolicy({ description: 'log all actions' });
    const broken = { ...parsed, confidence: 0.3 };
    const validation = validateParsedPolicy(broken);
    expect(validation.warnings.length).toBeGreaterThan(0);
  });

  it('includes warnings for low confidence policies', () => {
    const parsed = parseNLPolicy({ description: 'do something with widgets' });
    const validation = validateParsedPolicy(parsed);
    if (parsed.confidence < 0.5) {
      expect(validation.warnings.length).toBeGreaterThan(0);
    }
  });

  it('ruleCount matches rules array length', () => {
    const parsed = parseNLPolicy({ description: 'log all actions' });
    const validation = validateParsedPolicy(parsed);
    expect(validation.ruleCount).toBe(parsed.rules.length);
  });

  it('returns errors array even when valid', () => {
    const parsed = parseNLPolicy({ description: 'log all actions' });
    const validation = validateParsedPolicy(parsed);
    expect(Array.isArray(validation.errors)).toBe(true);
    expect(Array.isArray(validation.warnings)).toBe(true);
  });
});

describe('POLICY_TEMPLATES', () => {
  it('exports at least 5 templates', () => {
    expect(Object.keys(POLICY_TEMPLATES).length).toBeGreaterThanOrEqual(5);
  });

  it('each template is a non-empty string', () => {
    for (const [_key, template] of Object.entries(POLICY_TEMPLATES)) {
      expect(typeof template).toBe('string');
      expect(template.length).toBeGreaterThan(0);
    }
  });

  it('templates contain YAML-like content', () => {
    for (const template of Object.values(POLICY_TEMPLATES)) {
      // Each template should have at least a condition or action keyword
      expect(template).toMatch(/then:|action:|condition:|when:/i);
    }
  });
});
