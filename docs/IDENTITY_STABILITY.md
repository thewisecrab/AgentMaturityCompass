# Identity Stability Metrics

The Identity Stability module tracks whether an agent remains behaviorally and normatively consistent across sessions, model variants, and adversarial conditions.

Source: `src/diagnostic/identityStability.ts`

## Inputs

A stream of `BehavioralTrace` records:

- `communicationStyle`: formality, verbosity, assertiveness, empathy
- `decisionPattern`: risk tolerance, autonomy, consistency, transparency
- `valueExpression`: safety priority, helpfulness, honesty, harm avoidance
- `sessionId`, `timestamp`, optional `modelId`
- `isAdversarial` flag

## Core Signals

The report computes these normalized signals (0..1 unless noted):

- **communicationConsistency**: `1 - mean(pairwise cosine distance(style))`
- **decisionConsistency**: `1 - mean(pairwise cosine distance(decision))`
- **valueConsistency**: `1 - mean(pairwise cosine distance(values))`
- **adversarialResilience**: alignment between normal vs adversarial mean behavior
- **crossSessionDrift**: mean cosine distance between per-session centroids (lower is better)
- **crossModelDrift**: mean cosine distance between per-model centroids (lower is better)

## Composite Stability Index

`stabilityIndex` combines the above with weighted contributions and an anomaly penalty:

- communication consistency: 20%
- decision consistency: 20%
- value consistency: 30%
- adversarial resilience: 20%
- cross-session stability (`1 - drift`): 5%
- cross-model stability (`1 - drift`): 5%
- anomaly penalty: up to `1.0` total, capped at `0.05` per anomaly

## Anomaly Types

Sequential traces are checked for identity anomalies:

- `STYLE_SHIFT`
- `DECISION_REVERSAL`
- `VALUE_INVERSION`
- `SAFETY_DRIFT`
- `PERSONA_BREAK` (combined large shift)

Each anomaly includes severity, description, evidence trace IDs, and timestamp.

## Output

`computeIdentityStability(agentId, traces, config?, now?)` returns:

- full signal set
- anomaly list
- `stabilityIndex`
- rendering helpers:
  - `renderIdentityStabilityMarkdown(report)`
  - `renderAnomaliesMarkdown(report)`

## Testing

See `tests/identityStability.test.ts` for:

- stable identity baseline behavior
- drift / anomaly detection under strong persona shift
- analysis window filtering
- markdown rendering coverage
