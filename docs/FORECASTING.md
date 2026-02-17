# Forecasting

AMC forecasting is a deterministic, evidence-gated planning system for workspace, org node, and agent scopes.

## What It Is

- A signed forecast artifact generated from AMC evidence only.
- A short/mid/long horizon projection for maturity, integrity, risk indices, value dimensions, and operating indicators.
- An advisory trigger system tied to evidence refs and existing AMC actions.

## What It Is Not

- Not legal, financial, or operational certainty.
- Not an LLM judgement layer.
- Not a guarantee of future outcomes.

## Evidence Gating

Forecasts fail closed to `INSUFFICIENT_EVIDENCE` when policy thresholds are not met (for example low integrity index, low correlation ratio, too few observed runs, or high self-reported share).

When evidence is insufficient:

- AMC stores a signed artifact with explicit reasons.
- Numeric projection bands are withheld.
- Console shows an honesty banner instead of confidence-like output.

## Deterministic Models

AMC uses fixed, interpretable methods:

- Theil-Sen robust trend estimator.
- MAD-based robust dispersion for prediction bands.
- EWMA for nowcast stabilization.
- CUSUM-based change-point detection.
- Windowed drift and anomaly rules.

No stochastic ML/LLM calls are used in forecast generation.

## Outputs

Each forecast artifact includes:

- Scope (`WORKSPACE`, `NODE`, `AGENT`)
- Policy hash and model version
- Status (`OK` or `INSUFFICIENT_EVIDENCE`)
- Time series + trend + prediction intervals
- Drift and anomaly findings
- Leading indicators with evidence refs
- ETA-to-target band (or `UNKNOWN` with reasons)
- Advisory summaries

Artifacts are signed and transparency logged.

## Commands

```bash
amc forecast init
amc forecast verify
amc forecast refresh --scope workspace
amc forecast latest --scope workspace
amc advisory list --scope workspace
amc advisory show <advisoryId>
amc advisory ack <advisoryId> --note "reviewed"
```

