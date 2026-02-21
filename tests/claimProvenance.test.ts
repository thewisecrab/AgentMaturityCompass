/**
 * claimProvenance.test.ts — Unit tests for ClaimProvenanceRegistry
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  ClaimProvenanceRegistry,
  CLAIM_TIER_WEIGHTS,
} from '../src/score/claimProvenance.js';

describe('ClaimProvenanceRegistry', () => {
  let registry: ClaimProvenanceRegistry;

  beforeEach(() => {
    registry = new ClaimProvenanceRegistry();
  });

  it('adds a claim with correct defaults', () => {
    const claim = registry.addClaim({
      text: 'Agent handles edge cases well',
      tier: 'HYPOTHESIS',
      agentId: 'agent-001',
      sessionIds: ['sess-1'],
      evidenceRefs: [],
      tags: [],
    });
    expect(claim.id).toBeTruthy();
    expect(claim.tier).toBe('HYPOTHESIS');
    expect(claim.sessionIds).toContain('sess-1');
    expect(claim.createdAt).toBeInstanceOf(Date);
  });

  it('retrieves a claim by id', () => {
    const claim = registry.addClaim({
      text: 'Test claim',
      tier: 'HYPOTHESIS',
      agentId: 'agent-001',
      sessionIds: ['sess-1'],
      evidenceRefs: [],
      tags: [],
    });
    const retrieved = registry.getClaim(claim.id);
    expect(retrieved).toBeDefined();
    expect(retrieved!.id).toBe(claim.id);
  });

  it('returns undefined for unknown claim id', () => {
    expect(registry.getClaim('nonexistent-id')).toBeUndefined();
  });

  it('blocks promotion from HYPOTHESIS with only 1 session (quarantine gate)', () => {
    const claim = registry.addClaim({
      text: 'Single session claim',
      tier: 'HYPOTHESIS',
      agentId: 'agent-001',
      sessionIds: ['sess-1'],
      evidenceRefs: [],
      tags: [],
    });
    const result = registry.promote(claim.id, 'DERIVED');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
    expect(registry.getClaim(claim.id)!.tier).toBe('HYPOTHESIS');
  });

  it('allows promotion from HYPOTHESIS to DERIVED with 2+ sessions', () => {
    const claim = registry.addClaim({
      text: 'Multi-session claim',
      tier: 'HYPOTHESIS',
      agentId: 'agent-001',
      sessionIds: ['sess-1'],
      evidenceRefs: [],
      tags: [],
    });
    registry.addSessionObservation(claim.id, 'sess-2');
    const result = registry.promote(claim.id, 'DERIVED');
    expect(result.success).toBe(true);
    expect(registry.getClaim(claim.id)!.tier).toBe('DERIVED');
  });

  it('addSessionObservation deduplicates session ids', () => {
    const claim = registry.addClaim({
      text: 'Dedup test',
      tier: 'HYPOTHESIS',
      agentId: 'agent-001',
      sessionIds: ['sess-1'],
      evidenceRefs: [],
      tags: [],
    });
    registry.addSessionObservation(claim.id, 'sess-1'); // duplicate
    registry.addSessionObservation(claim.id, 'sess-2');
    const updated = registry.getClaim(claim.id)!;
    expect(updated.sessionIds.length).toBe(2);
  });

  it('USER_VERIFIED tier requires evidence refs when promoting from HYPOTHESIS', () => {
    const claim = registry.addClaim({
      text: 'Needs evidence',
      tier: 'HYPOTHESIS',
      agentId: 'agent-001',
      sessionIds: ['sess-1'],
      evidenceRefs: [],
      tags: [],
    });
    // Try USER_VERIFIED without evidence refs — should fail
    const result = registry.promote(claim.id, 'USER_VERIFIED');
    expect(result.success).toBe(false);
  });

  it('USER_VERIFIED promotion from DERIVED succeeds', () => {
    const claim = registry.addClaim({
      text: 'Has evidence',
      tier: 'HYPOTHESIS',
      agentId: 'agent-001',
      sessionIds: ['sess-1'],
      evidenceRefs: ['ev-001'],
      tags: [],
    });
    registry.addSessionObservation(claim.id, 'sess-2');
    registry.promote(claim.id, 'DERIVED');
    const result = registry.promote(claim.id, 'USER_VERIFIED');
    expect(result.success).toBe(true);
    expect(registry.getClaim(claim.id)!.tier).toBe('USER_VERIFIED');
  });

  it('getProvenanceSummary returns correct tier counts', () => {
    const agentId = 'agent-summary';
    registry.addClaim({ text: 'H1', tier: 'HYPOTHESIS', agentId, sessionIds: ['s1'], evidenceRefs: [], tags: [] });
    registry.addClaim({ text: 'H2', tier: 'HYPOTHESIS', agentId, sessionIds: ['s1'], evidenceRefs: [], tags: [] });
    const c3 = registry.addClaim({ text: 'D1', tier: 'HYPOTHESIS', agentId, sessionIds: ['s1'], evidenceRefs: [], tags: [] });
    registry.addSessionObservation(c3.id, 's2');
    registry.promote(c3.id, 'DERIVED');

    const summary = registry.getProvenanceSummary(agentId);
    expect(summary.byTier['HYPOTHESIS']).toBe(2);
    expect(summary.byTier['DERIVED']).toBe(1);
    expect(summary.total).toBe(3);
  });

  it('trustWeightedScore is higher when more claims are USER_VERIFIED', () => {
    const agentId = 'agent-trust';
    // All hypothesis
    const r1 = new ClaimProvenanceRegistry();
    r1.addClaim({ text: 'H', tier: 'HYPOTHESIS', agentId, sessionIds: ['s1'], evidenceRefs: [], tags: [] });
    const s1 = r1.getProvenanceSummary(agentId);

    // USER_VERIFIED
    const r2 = new ClaimProvenanceRegistry();
    const c = r2.addClaim({ text: 'UV', tier: 'HYPOTHESIS', agentId, sessionIds: ['s1'], evidenceRefs: ['ev1'], tags: [] });
    r2.addSessionObservation(c.id, 's2');
    r2.promote(c.id, 'DERIVED');
    r2.promote(c.id, 'USER_VERIFIED');
    const s2 = r2.getProvenanceSummary(agentId);

    expect(s2.trustWeightedScore).toBeGreaterThan(s1.trustWeightedScore);
  });

  it('SESSION_LOCAL claims cannot be promoted to USER_VERIFIED directly', () => {
    const claim = registry.addClaim({
      text: 'Session local',
      tier: 'SESSION_LOCAL',
      agentId: 'agent-001',
      sessionIds: ['sess-1'],
      evidenceRefs: [],
      tags: [],
    });
    const result = registry.promote(claim.id, 'USER_VERIFIED');
    expect(result.success).toBe(false);
  });

  it('CLAIM_TIER_WEIGHTS exports all expected tier names', () => {
    expect(CLAIM_TIER_WEIGHTS).toHaveProperty('HYPOTHESIS');
    expect(CLAIM_TIER_WEIGHTS).toHaveProperty('DERIVED');
    expect(CLAIM_TIER_WEIGHTS).toHaveProperty('USER_VERIFIED');
    expect(CLAIM_TIER_WEIGHTS).toHaveProperty('SESSION_LOCAL');
    expect(CLAIM_TIER_WEIGHTS).toHaveProperty('REFERENCE_ONLY');
  });

  it('CLAIM_TIER_WEIGHTS values are between 0 and 1', () => {
    for (const val of Object.values(CLAIM_TIER_WEIGHTS)) {
      expect(val).toBeGreaterThan(0);
      expect(val).toBeLessThanOrEqual(1);
    }
  });

  it('getByAgent filters by agentId', () => {
    registry.addClaim({ text: 'A1', tier: 'HYPOTHESIS', agentId: 'agent-A', sessionIds: ['s1'], evidenceRefs: [], tags: [] });
    registry.addClaim({ text: 'A2', tier: 'HYPOTHESIS', agentId: 'agent-A', sessionIds: ['s1'], evidenceRefs: [], tags: [] });
    registry.addClaim({ text: 'B1', tier: 'HYPOTHESIS', agentId: 'agent-B', sessionIds: ['s1'], evidenceRefs: [], tags: [] });

    const aClaims = registry.getByAgent('agent-A');
    expect(aClaims.length).toBe(2);
    expect(aClaims.every(c => c.agentId === 'agent-A')).toBe(true);
  });

  it('quarantine prevents promotion', () => {
    const claim = registry.addClaim({
      text: 'Quarantine test',
      tier: 'HYPOTHESIS',
      agentId: 'agent-001',
      sessionIds: ['s1', 's2'],
      evidenceRefs: [],
      tags: [],
    });
    registry.quarantine(claim.id, 'suspected injection');
    const result = registry.promote(claim.id, 'DERIVED');
    expect(result.success).toBe(false);
  });

  it('purgeSessonLocal removes SESSION_LOCAL claims', () => {
    registry.addClaim({ text: 'SL1', tier: 'SESSION_LOCAL', agentId: 'agent-001', sessionIds: ['s1'], evidenceRefs: [], tags: [] });
    registry.addClaim({ text: 'SL2', tier: 'SESSION_LOCAL', agentId: 'agent-001', sessionIds: ['s1'], evidenceRefs: [], tags: [] });
    registry.addClaim({ text: 'H1', tier: 'HYPOTHESIS', agentId: 'agent-001', sessionIds: ['s1'], evidenceRefs: [], tags: [] });
    const purged = registry.purgeSessonLocal();
    expect(purged).toBe(2);
    expect(registry.getByAgent('agent-001').length).toBe(1);
  });
});
