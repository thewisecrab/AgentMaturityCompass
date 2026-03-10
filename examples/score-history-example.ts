/**
 * Score History & Regression Testing Example
 * 
 * Demonstrates how to use AMC's score history system for regression testing
 */

import { createScoreHistoryStore } from '../src/score/scoreHistory.js';

const workspace = process.cwd();
const agentId = 'example-agent';

// Create store
const store = createScoreHistoryStore(workspace);

console.log('📊 AMC Score History & Regression Testing Example\n');

// 1. Record initial baseline snapshot
console.log('1️⃣  Recording baseline snapshot...');
const baseline = store.recordSnapshot({
  agentId,
  dimensionScores: {
    governance: 0.85,
    reliability: 0.78,
    security: 0.92,
    observability: 0.71,
    evaluation: 0.68
  },
  overallScore: 0.79,
  level: 3,
  metadata: {
    runId: 'baseline-run',
    model: { provider: 'openai', model: 'gpt-4o' }
  }
});
console.log(`   ✅ Snapshot ${baseline.snapshotId.slice(0, 8)} recorded\n`);

// 2. Simulate some time passing and record another snapshot (improved)
console.log('2️⃣  Recording improved snapshot (after optimization)...');
setTimeout(() => {
  const improved = store.recordSnapshot({
    agentId,
    dimensionScores: {
      governance: 0.88,
      reliability: 0.82,
      security: 0.93,
      observability: 0.75,
      evaluation: 0.72
    },
    overallScore: 0.82,
    level: 3,
    metadata: {
      runId: 'improved-run',
      model: { provider: 'openai', model: 'gpt-4o' }
    }
  });
  console.log(`   ✅ Snapshot ${improved.snapshotId.slice(0, 8)} recorded\n`);

  // 3. Record a regressed snapshot
  console.log('3️⃣  Recording regressed snapshot (after breaking change)...');
  const regressed = store.recordSnapshot({
    agentId,
    dimensionScores: {
      governance: 0.65, // Major drop
      reliability: 0.80,
      security: 0.88,
      observability: 0.73,
      evaluation: 0.70
    },
    overallScore: 0.75,
    level: 3,
    metadata: {
      runId: 'regressed-run',
      model: { provider: 'openai', model: 'gpt-4o' }
    }
  });
  console.log(`   ✅ Snapshot ${regressed.snapshotId.slice(0, 8)} recorded\n`);

  // 4. Detect regressions
  console.log('4️⃣  Detecting regressions...');
  const alerts = store.detectRegressions({
    agentId,
    currentSnapshot: regressed,
    thresholds: {
      minDelta: 0.05,
      minPercentChange: 10
    }
  });

  if (alerts.length > 0) {
    console.log(`   ⚠️  ${alerts.length} regression(s) detected:\n`);
    for (const alert of alerts) {
      const icon = alert.severity === 'critical' ? '🔴' : alert.severity === 'high' ? '🟠' : '🟡';
      console.log(`   ${icon} ${alert.dimension.toUpperCase()} [${alert.severity}]`);
      console.log(`      Before: ${alert.scoreBefore.toFixed(2)}`);
      console.log(`      After:  ${alert.scoreAfter.toFixed(2)}`);
      console.log(`      Delta:  ${alert.delta.toFixed(2)} (${alert.percentChange.toFixed(1)}%)`);
      console.log();
    }
  } else {
    console.log('   ✅ No regressions detected\n');
  }

  // 5. View score history
  console.log('5️⃣  Score history:');
  const history = store.getHistory(agentId);
  console.log(`   ${history.length} snapshots recorded\n`);
  for (const snapshot of history) {
    console.log(`   Snapshot ${snapshot.snapshotId.slice(0, 8)}`);
    console.log(`   Overall: ${snapshot.overallScore.toFixed(2)} (L${snapshot.level})`);
    console.log(`   Governance: ${snapshot.dimensionScores.governance?.toFixed(2) ?? 'N/A'}`);
    console.log();
  }

  // 6. Generate trend report
  console.log('6️⃣  Trend report:');
  const report = store.generateTrendReport(agentId);
  console.log(`   Overall trend: ${report.overallTrend.toUpperCase()}`);
  console.log(`   Snapshots analyzed: ${report.snapshotCount}\n`);

  for (const dim of report.dimensions) {
    const icon = dim.trend === 'improving' ? '📈' : dim.trend === 'degrading' ? '📉' : '➡️';
    console.log(`   ${icon} ${dim.dimension}: ${dim.trend}`);
    console.log(`      ${dim.startScore.toFixed(2)} → ${dim.endScore.toFixed(2)} (${dim.delta >= 0 ? '+' : ''}${dim.delta.toFixed(2)})`);
  }
  console.log();

  // 7. Verify integrity
  console.log('7️⃣  Verifying integrity...');
  const integrity = store.verifyIntegrity(agentId);
  if (integrity.ok) {
    console.log('   ✅ Score history integrity verified\n');
  } else {
    console.log('   ❌ Integrity check failed:');
    for (const error of integrity.errors) {
      console.log(`      - ${error}`);
    }
  }

  console.log('✨ Example complete!\n');
}, 100);
