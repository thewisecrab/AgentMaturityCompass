# Self-Calibration (Prediction vs Outcome)

AMC now includes deterministic utilities to score confidence quality against realized outcomes.

## API

```ts
import {
  computeConfidenceQuality,
  renderConfidenceQualityMarkdown,
  type PredictionOutcome,
} from "agent-maturity-compass";

const rows: PredictionOutcome[] = [
  { confidence: 0.82, outcome: true },
  { confidence: 0.61, outcome: false },
  { confidence: 0.22, outcome: false },
];

const report = computeConfidenceQuality(rows, { binCount: 10 });
console.log(report.qualityLabel);
console.log(renderConfidenceQualityMarkdown(report));
```

## What is measured

- **Accuracy**: thresholded at 0.5
- **Calibration bias** (`mean(confidence - outcome)`)
- **ECE / MCE**: expected / maximum calibration error from reliability bins
- **Brier score**: mean squared probabilistic error
- **Log loss**: clipped cross-entropy
- **Sharpness**: standard deviation of confidence outputs

## Quality labels

Labels are deterministic and data-aware:

- `INSUFFICIENT_DATA` for sample sizes below 20
- otherwise one of `EXCELLENT`, `GOOD`, `FAIR`, `POOR`

The scoring blends calibration quality (ECE) with probabilistic fit quality (Brier + log loss).

## Notes

- `confidence` is clamped to `[0, 1]`
- `weight` defaults to `1` and must be positive to be used
- bin count defaults to `10` and is clamped to `[2, 100]`
