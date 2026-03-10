# Score History & Regression Testing

AMC's score history system provides enterprise-grade regression testing by storing historical score snapshots per agent, detecting score degradation over time, alerting on regressions, and generating trend reports.

## Features

- **Score Snapshots**: Cryptographically signed, tamper-evident score history
- **Regression Detection**: Automatic detection of score degradation with configurable thresholds
- **Alert Management**: Track, acknowledge, and resolve regression alerts
- **Trend Analysis**: Time-series analysis of score evolution with volatility metrics
- **Integrity Verification**: Verify cryptographic integrity of score history

## Architecture

### Storage

Score history is stored in `.amc/score_history.sqlite` with two main tables:

- `score_history`: Immutable, append-only score snapshots
- `regression_alerts`: Regression alerts with status tracking

All snapshots are cryptographically signed using AMC's monitor key.

### Data Model

```typescript
interface ScoreSnapshot {
  snapshotId: string;
  agentId: string;
  snapshotTs: number;
  dimensionScores: Record<string, number>;
  overallScore: number;
  level: number;
  metadata: Record<string, unknown>;
  snapshotHash: string;
  signature: string;
}

interface RegressionAlert {
  alertId: string;
  agentId: string;
  detectedTs: number;
  dimension: string;
  scoreBefore: number;
  scoreAfter: number;
  delta: number;
  percentChange: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'acknowledged' | 'resolved' | 'false_positive';
}
```

## Usage

### Recording Score Snapshots

```typescript
import { createScoreHistoryStore } from './src/score/scoreHistory.js';

const store = createScoreHistoryStore(workspace);

const snapshot = store.recordSnapshot({
  agentId: 'my-agent',
  dimensionScores: {
    governance: 0.8,
    reliability: 0.7,
    security: 0.9
  },
  overallScore: 0.8,
  level: 3,
  metadata: {
    runId: 'run-123',
    model: { provider: 'openai', model: 'gpt-4o' }
  }
});
```

### Detecting Regressions

```typescript
const alerts = store.detectRegressions({
  agentId: 'my-agent',
  currentSnapshot,
  thresholds: {
    minDelta: 0.05,        // Minimum absolute score drop
    minPercentChange: 10   // Minimum percentage drop
  }
});

for (const alert of alerts) {
  console.log(`Regression in ${alert.dimension}: ${alert.scoreBefore} → ${alert.scoreAfter}`);
  console.log(`Severity: ${alert.severity}`);
}
```

### Generating Trend Reports

```typescript
const report = store.generateTrendReport('my-agent', {
  windowStartTs: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days
  windowEndTs: Date.now()
});

console.log(`Overall trend: ${report.overallTrend}`);
for (const dim of report.dimensions) {
  console.log(`${dim.dimension}: ${dim.trend} (${dim.delta > 0 ? '+' : ''}${dim.delta.toFixed(2)})`);
}
```

## CLI Commands

### View Score History

```bash
amc score-history show --agent-id my-agent --limit 10
amc score-history show --agent-id my-agent --days 30
```

### Check for Regressions

```bash
amc score-history check --agent-id my-agent
amc score-history check --agent-id my-agent --min-delta 0.1 --min-percent-change 15
```

### View Open Alerts

```bash
amc score-history alerts --agent-id my-agent
```

### Resolve Alerts

```bash
amc score-history resolve --alert-id abc123 --status resolved --notes "Fixed by code update"
amc score-history resolve --alert-id abc123 --status false_positive
```

### Generate Trend Report

```bash
amc score-history trends --agent-id my-agent --days 30
amc score-history trends --agent-id my-agent --days 90
```

### Verify Integrity

```bash
amc score-history verify
amc score-history verify --agent-id my-agent
```

## Regression Severity Levels

| Severity | Criteria |
|----------|----------|
| **Critical** | Δ ≥ 0.3 OR % change ≥ 50% |
| **High** | Δ ≥ 0.15 OR % change ≥ 25% |
| **Medium** | Δ ≥ 0.08 OR % change ≥ 15% |
| **Low** | Δ ≥ 0.05 OR % change ≥ 10% |

## Trend Classification

- **Improving**: End score > start score + 0.05
- **Degrading**: End score < start score - 0.05
- **Volatile**: Standard deviation > 0.15
- **Stable**: Otherwise

## Integration with AMC Runs

Score snapshots can be automatically recorded after each AMC run:

```typescript
import { runAMC } from './src/api/run.js';
import { createScoreHistoryStore } from './src/score/scoreHistory.js';

const result = await runAMC({ workspace, agentId: 'my-agent' });

const store = createScoreHistoryStore(workspace);
const snapshot = store.recordSnapshot({
  agentId: 'my-agent',
  dimensionScores: result.dimensionScores,
  overallScore: result.overallScore,
  level: result.level,
  metadata: {
    runId: result.runId,
    evidenceCount: result.evidenceCount
  }
});

// Check for regressions
const alerts = store.detectRegressions({
  agentId: 'my-agent',
  currentSnapshot: snapshot
});

if (alerts.length > 0) {
  console.warn(`⚠️  ${alerts.length} regression(s) detected`);
  // Trigger incident, send notification, etc.
}
```

## Best Practices

1. **Record snapshots after every significant run** (daily, weekly, or per deployment)
2. **Set appropriate thresholds** based on your agent's stability requirements
3. **Review alerts regularly** and mark false positives to improve signal-to-noise
4. **Use trend reports** for quarterly reviews and maturity planning
5. **Verify integrity** as part of your audit process

## Security

- All snapshots are cryptographically signed using AMC's monitor key
- Score history is append-only and immutable
- Integrity can be verified at any time using `verifyIntegrity()`
- Tampering with score history will be detected during verification

## Performance

- SQLite with WAL mode for concurrent reads
- Indexed by agent_id and timestamp for fast queries
- Efficient time-window queries for trend analysis
- Connection pooling for high-throughput scenarios

## Future Enhancements

- [ ] Automated regression alerts via webhooks/email
- [ ] Integration with AMC Watch for continuous monitoring
- [ ] Comparative analysis across multiple agents
- [ ] Predictive regression detection using ML
- [ ] Export to time-series databases (InfluxDB, Prometheus)
