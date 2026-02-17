# Continuous Recurrence

AMC treats forecasting as a recurring renewal loop, not a one-time report.

## Renewal Cadence

Cadence is controlled by signed forecast policy:

- periodic refresh (`defaultRefreshHours`)
- refresh-after-run
- refresh-after-key-events

Scheduler state is signed per workspace and tracked at:

- `.amc/forecast/scheduler.json`

## Safety Rules

Scheduler runs only when workspace trust/readiness checks pass.

If policy/trust requirements fail:

- scheduler records the skip reason
- no unsigned forecast output is emitted
- normal fail-closed readiness behavior remains in effect

## Commands

```bash
amc forecast scheduler status
amc forecast scheduler run-now
amc forecast scheduler enable
amc forecast scheduler disable
```

## Operator Loop

Recommended loop:

1. Run diagnostics/assurance on cadence.
2. Refresh forecasts and review advisories.
3. Regenerate transformation plans as evidence changes.
4. Re-run to verify risk/value movement.

This is the “continuous recurrence” implementation: repeated evidence checkpoints with realtime updates, not a static roadmap.

