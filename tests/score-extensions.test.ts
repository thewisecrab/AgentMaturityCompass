import { describe, it, expect } from 'vitest';
import { computeMaturityScore } from '../src/score/formalSpec.js';
import { testGamingResistance } from '../src/score/adversarial.js';
import { collectEvidence } from '../src/score/evidenceCollector.js';

describe('Score — Formal Spec', () => {
  it('computes maturity score', () => {
    const r = computeMaturityScore([{ qid: 'S1', kind: 'observed' as const, trust: 0.9, timestamp: new Date(), payload: {} }]);
    expect(r).toHaveProperty('dimensionScores');
    expect(r).toHaveProperty('overallScore');
  });
});

describe('Score — Adversarial', () => {
  it('tests gaming resistance', () => {
    const r = testGamingResistance({ q1: 'We are fully compliant and certified' });
    expect(r).toHaveProperty('gamingResistant');
    expect(r).toHaveProperty('inflationDelta');
  });
  it('resists keyword stuffing', () => {
    const r = testGamingResistance({ q1: 'compliant secure audited certified enterprise-grade best-practice zero-trust fully-automated' });
    expect(r.keywordScore).toBeGreaterThan(0);
  });
});

describe('Score — Evidence Collector', () => {
  it('collects evidence from module outputs', () => {
    const r = collectEvidence({ shield: { safe: true }, enforce: { passed: true } });
    expect(r).toHaveProperty('artifacts');
    expect(r.artifacts.length).toBeGreaterThan(0);
    expect(r).toHaveProperty('totalTrust');
  });
});
