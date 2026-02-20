/**
 * scoreEnhanced.test.ts — Tests for all 6 enhanced score modules.
 */

import { describe, expect, test } from 'vitest';

// HumanOversightQuality
import {
  assessOversightQuality,
  simulateScenarios,
  compareProfiles as compareOversightProfiles,
} from '../src/score/humanOversightQuality.js';

// LeanAMC
import {
  getLeanAMCProfile,
  listDomains,
  compareProfiles as compareLeanProfiles,
} from '../src/score/leanAMC.js';

// Adversarial
import { testGamingResistance } from '../src/score/adversarial.js';

// CommunityGovernance
import {
  assessCommunityGovernance,
  ReputationRegistry,
} from '../src/score/communityGovernance.js';

// EvidenceCoverageGap
import {
  getEvidenceCoverageReport,
  estimateTotalEffort,
} from '../src/score/evidenceCoverageGap.js';

// LessonLearnedDatabase
import {
  addLesson,
  queryLessons,
  findSimilarLessons,
  detectRecurrence,
  learningVelocityTrend,
  getLearningMaturityScore,
} from '../src/score/lessonLearnedDatabase.js';

/* ── HumanOversightQuality ───────────────────────────────────────── */

describe('HumanOversightQuality', () => {
  test('zero scores yield minimum profile', () => {
    const profile = assessOversightQuality({ 'AMC-HOQ-1': 0, 'AMC-HOQ-2': 0 });
    expect(profile.overallScore).toBe(0);
    expect(profile.oversightExistence).toBe(false);
    expect(profile.gaps.length).toBeGreaterThan(0);
  });

  test('max scores yield maximum profile', () => {
    const profile = assessOversightQuality({ 'AMC-HOQ-1': 5, 'AMC-HOQ-2': 5 });
    expect(profile.overallScore).toBe(100);
    expect(profile.oversightExistence).toBe(true);
    expect(profile.graduatedAutonomy).toBe(true);
    expect(profile.socialEngineeringResistance).toBe(1);
  });

  test('confidence is computed', () => {
    const profile = assessOversightQuality({ 'AMC-HOQ-1': 3, 'AMC-HOQ-2': 2 });
    expect(profile.confidence).toBeGreaterThanOrEqual(0);
    expect(profile.confidence).toBeLessThanOrEqual(1);
  });

  test('simulateScenarios returns 5 scenarios', () => {
    const scenarios = simulateScenarios();
    expect(scenarios.length).toBe(5);
    expect(scenarios[0]!.name).toBe('No oversight');
    expect(scenarios[4]!.expectedScore).toBe(100);
  });

  test('compareProfiles computes delta', () => {
    const a = assessOversightQuality({ 'AMC-HOQ-1': 1, 'AMC-HOQ-2': 1 });
    const b = assessOversightQuality({ 'AMC-HOQ-1': 4, 'AMC-HOQ-2': 4 });
    const cmp = compareOversightProfiles(a, b);
    expect(cmp.scoreDelta).toBeGreaterThan(0);
    expect(cmp.resolvedGaps.length).toBeGreaterThan(0);
  });
});

/* ── LeanAMC ─────────────────────────────────────────────────────── */

describe('LeanAMC', () => {
  test('solo team profile has max level 2', () => {
    const profile = getLeanAMCProfile('solo');
    expect(profile.maximumAchievableLevel).toBe(2);
    expect(profile.teamSize).toBe('solo');
    expect(profile.tradeoffs.length).toBeGreaterThan(0);
  });

  test('large team profile has max level 5', () => {
    const profile = getLeanAMCProfile('large');
    expect(profile.maximumAchievableLevel).toBe(5);
    expect(profile.skippableModules.length).toBe(0);
  });

  test('domain-specific modules added for finance', () => {
    const profile = getLeanAMCProfile('medium', 'finance');
    expect(profile.domain).toBe('finance');
    expect(profile.requiredModules.some(m => m.includes('compliance'))).toBe(true);
  });

  test('timeToLevel is populated', () => {
    const profile = getLeanAMCProfile('small');
    expect(Object.keys(profile.timeToLevel).length).toBeGreaterThan(0);
    expect(profile.timeToLevel[1]).toBeDefined();
  });

  test('listDomains returns available domains', () => {
    const domains = listDomains();
    expect(domains).toContain('finance');
    expect(domains).toContain('healthcare');
    expect(domains).toContain('saas');
  });

  test('compareProfiles shows differences', () => {
    const small = getLeanAMCProfile('small');
    const large = getLeanAMCProfile('large');
    const cmp = compareLeanProfiles(small, large);
    expect(cmp.levelDelta).toBeGreaterThan(0);
    expect(cmp.additionalModules.length).toBeGreaterThan(0);
  });
});

/* ── Adversarial ─────────────────────────────────────────────────── */

describe('Adversarial', () => {
  test('honest answers are gaming-resistant', () => {
    const result = testGamingResistance({
      'Q1': 'On 2024-01-15, we deployed version 2.1 with HMAC-SHA256 signing. Response time dropped to 45ms.',
      'Q2': 'Audit logs at https://audit.example.com show 99.9% uptime over 30 days.',
      'Q3': 'Our TLS 1.3 implementation passed penetration testing on 2024-02-01.',
    });
    expect(result.evidenceScore).toBeGreaterThan(0);
    expect(result.overallGamingRisk).toBe('low');
  });

  test('keyword-stuffed answers detected', () => {
    const result = testGamingResistance({
      'Q1': 'We are fully compliant and enterprise-grade with best-practice security.',
      'Q2': 'Our certified platform is industry-leading and fully-automated.',
      'Q3': 'We have secure, audited, compliant systems everywhere.',
    });
    expect(result.keywordScore).toBeGreaterThan(0.5);
    expect(result.gamingIndicators.some(i => i.type === 'keyword-stuffing')).toBe(true);
  });

  test('copy-paste detection catches similar answers', () => {
    const same = 'We implement comprehensive security measures with enterprise-grade tools and best-practice guidelines for all operations.';
    const result = testGamingResistance({
      'Q1': same,
      'Q2': same,
      'Q3': same,
      'Q4': same,
    });
    // copy-paste detection should trigger
    expect(result.gamingIndicators.some(i => i.type === 'copy-paste')).toBe(true);
  });

  test('empty answers return low risk', () => {
    const result = testGamingResistance({});
    expect(result.overallGamingRisk).toBe('low');
    expect(result.gamingResistant).toBe(true);
  });

  test('inflation delta computed', () => {
    const result = testGamingResistance({
      'Q1': 'We are compliant and certified.',
      'Q2': 'Enterprise-grade security everywhere.',
    });
    expect(result.inflationDelta).toBeDefined();
    expect(typeof result.inflationDelta).toBe('number');
  });
});

/* ── CommunityGovernance ─────────────────────────────────────────── */

describe('CommunityGovernance', () => {
  test('minimal governance yields L1', () => {
    const profile = assessCommunityGovernance({ target: 'agent' });
    expect(profile.level).toBe('L1');
    expect(profile.overallScore).toBe(0);
    expect(profile.recommendations.length).toBeGreaterThan(0);
  });

  test('full governance yields L5', () => {
    const profile = assessCommunityGovernance({
      evidenceGatedReputation: true,
      trustTierSystem: true,
      crossAgentVerification: true,
      platformTransparency: 1,
      votingManipulationResistance: 1,
    });
    expect(profile.level).toBe('L5');
    expect(profile.overallScore).toBe(100);
  });

  test('ReputationRegistry endorse increases score', () => {
    const reg = new ReputationRegistry();
    reg.endorse('agent-1');
    const entry = reg.getReputation('agent-1');
    expect(entry).toBeDefined();
    expect(entry!.score).toBeGreaterThan(50);
    expect(entry!.endorsements).toBe(1);
  });

  test('ReputationRegistry violation decreases score', () => {
    const reg = new ReputationRegistry();
    reg.endorse('agent-2'); // score = 55
    reg.recordViolation('agent-2', 2); // score = 55 - 20 = 35
    const entry = reg.getReputation('agent-2');
    expect(entry!.score).toBeLessThan(55);
    expect(entry!.violations).toBe(1);
  });

  test('leaderboard returns sorted', () => {
    const reg = new ReputationRegistry();
    reg.endorse('a1', 5);
    reg.endorse('a2', 2);
    reg.endorse('a3', 8);
    const board = reg.leaderboard(3);
    expect(board[0]!.agentId).toBe('a3');
    expect(board[2]!.agentId).toBe('a2');
  });

  test('applyDecay reduces scores', () => {
    const reg = new ReputationRegistry();
    reg.endorse('agent-d', 10);
    const before = reg.getReputation('agent-d')!.score;
    reg.applyDecay(0.9);
    const after = reg.getReputation('agent-d')!.score;
    expect(after).toBeLessThan(before);
  });
});

/* ── EvidenceCoverageGap ─────────────────────────────────────────── */

describe('EvidenceCoverageGap', () => {
  test('getEvidenceCoverageReport returns valid report', () => {
    const report = getEvidenceCoverageReport('agent-test');
    expect(report.totalQIDs).toBeGreaterThan(0);
    expect(report.automatedCoverage + report.manualRequired).toBe(report.totalQIDs);
    expect(report.coveragePercent).toBeGreaterThanOrEqual(0);
    expect(report.coveragePercent).toBeLessThanOrEqual(100);
  });

  test('roadmap has priority-sorted items', () => {
    const report = getEvidenceCoverageReport('agent-test');
    expect(report.roadmap.length).toBeGreaterThan(0);
    const priorities = report.roadmap.map(r => r.priority);
    const order = ['critical', 'high', 'medium', 'low'];
    for (let i = 1; i < priorities.length; i++) {
      expect(order.indexOf(priorities[i]!)).toBeGreaterThanOrEqual(order.indexOf(priorities[i - 1]!));
    }
  });

  test('estimateTotalEffort aggregates by category', () => {
    const report = getEvidenceCoverageReport('agent-test');
    const effort = estimateTotalEffort(report);
    expect(effort.totalHours).toBeGreaterThan(0);
    expect(Object.keys(effort.byCategory).length).toBeGreaterThan(0);
  });

  test('improvementPlan is generated', () => {
    const report = getEvidenceCoverageReport('agent-test');
    expect(report.improvementPlan.length).toBeGreaterThan(0);
    expect(report.improvementPlan.some(p => p.includes('effort'))).toBe(true);
  });
});

/* ── LessonLearnedDatabase ───────────────────────────────────────── */

describe('LessonLearnedDatabase', () => {
  const makeDb = () => {
    const lessons = [
      addLesson({ category: 'failure', description: 'Database connection timeout under high load causing query failure', rootCause: 'Connection pool exhausted', resolution: 'Increased pool size', agentId: 'a1', taskType: 'db-ops' }),
      addLesson({ category: 'success', description: 'Reduced latency by adding caching layer', agentId: 'a1', taskType: 'performance', appliedInFutureRun: true }),
      addLesson({ category: 'failure', description: 'Database connection timeout under high load causing request failure', rootCause: 'Too many concurrent queries', resolution: 'Added rate limiting', agentId: 'a2', taskType: 'db-ops' }),
      addLesson({ category: 'near-miss', description: 'Almost exceeded API rate limit', agentId: 'a1', taskType: 'api', appliedInFutureRun: true }),
      addLesson({ category: 'insight', description: 'Batch processing more efficient with chunking', agentId: 'a2', taskType: 'performance' }),
    ];
    return {
      lessons,
      applicationRate: 2 / 5,
      recurrenceRate: 0,
      learningVelocity: 5 / 50,
      maturityScore: 0,
    };
  };

  test('addLesson generates id and timestamp', () => {
    const lesson = addLesson({ category: 'failure', description: 'Test', agentId: 'a1' });
    expect(lesson.id).toBeDefined();
    expect(lesson.timestamp).toBeDefined();
  });

  test('queryLessons filters by taskType', () => {
    const db = makeDb();
    const results = queryLessons(db, 'db-ops');
    expect(results.length).toBe(2);
    results.forEach(l => expect(l.taskType).toBe('db-ops'));
  });

  test('queryLessons filters by category', () => {
    const db = makeDb();
    const results = queryLessons(db, 'db-ops', 'failure');
    expect(results.length).toBe(2);
  });

  test('findSimilarLessons returns matches', () => {
    const db = makeDb();
    const similar = findSimilarLessons(db, 'database connection timeout');
    expect(similar.length).toBeGreaterThan(0);
    expect(similar[0]!.similarity).toBeGreaterThan(0);
  });

  test('detectRecurrence finds similar failures', () => {
    const db = makeDb();
    const report = detectRecurrence(db);
    expect(report.recurring.length).toBeGreaterThan(0); // Two database-related failures
    expect(report.recurrenceRate).toBeGreaterThan(0);
  });

  test('learningVelocityTrend returns trends', () => {
    const db = makeDb();
    const trends = learningVelocityTrend(db, 30);
    expect(trends.length).toBeGreaterThan(0);
    trends.forEach(t => {
      expect(t.lessonsAdded).toBeGreaterThanOrEqual(0);
      expect(t.applicationRate).toBeGreaterThanOrEqual(0);
    });
  });

  test('getLearningMaturityScore computes score', () => {
    const db = makeDb();
    const score = getLearningMaturityScore(db);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('empty database returns 0 maturity', () => {
    const emptyDb = { lessons: [], applicationRate: 0, recurrenceRate: 0, learningVelocity: 0, maturityScore: 0 };
    expect(getLearningMaturityScore(emptyDb)).toBe(0);
  });
});
