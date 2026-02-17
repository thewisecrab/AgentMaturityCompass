# Value Gates

Use AMC gates to enforce release quality on both:
- maturity/integrity/assurance
- measurable value outcomes

## Gate Policy Fields

In `gatePolicy.json`:

- `minValueScore`
- `minEconomicSignificanceIndex`
- `denyIfValueRegression`
- `maxCostIncreaseRatio`
- `requireExperimentPass`:
  - `enabled`
  - `experimentId`
  - `minUpliftSuccessRate`
  - `minUpliftValuePoints`

## CI Flow

`amc ci init` generates workflow steps that include:
1. bundle verify
2. outcomes report generation
3. optional experiment gate step
4. final `amc gate` evaluation

## Example Policy

```json
{
  "minIntegrityIndex": 0.8,
  "minOverall": 3.5,
  "minLayer": {
    "Strategic Agent Operations": 3,
    "Leadership & Autonomy": 3,
    "Culture & Alignment": 3,
    "Resilience": 3,
    "Skills": 3
  },
  "requireObservedForLevel5": true,
  "denyIfLowTrust": true,
  "minValueScore": 70,
  "minEconomicSignificanceIndex": 60,
  "denyIfValueRegression": true,
  "maxCostIncreaseRatio": 1.1,
  "requireExperimentPass": {
    "enabled": true,
    "experimentId": "exp_...",
    "minUpliftSuccessRate": 0.05,
    "minUpliftValuePoints": 5
  }
}
```

## Preventing Cheap Wins

Recommended guardrails:
- keep integrity and safety thresholds enabled
- reject regressions even when cost drops
- require experiment uplift and bounded cost increase
- require observed evidence for high-tier claims
