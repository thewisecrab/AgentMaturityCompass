# Ecosystem Comparative View

AMC's ecosystem comparative view provides a privacy-safe, evidence-gated benchmark comparison model across local workspaces, teams, and imported ecosystem peers.

The benchmark system is intentionally "compass over maps":
- Benchmarks are signed checkpoints, not promises.
- Comparisons are deterministic and reproducible.
- Results degrade to warnings when trust/evidence quality is weak.

## Data Sources

The comparison engine combines:
- Local signed benchmark artifacts (`.amcbench`) generated from workspace/node/agent scopes.
- Imported signed benchmark artifacts from allowlisted registries.
- Registry trust metadata (pinned registry key fingerprint + allowed signer fingerprints).

Raw evidence, prompts, transcripts, and secrets are never imported/exported for ecosystem comparisons.

## What Is Compared

AMC computes percentiles for:
- Maturity overall and five layers.
- Integrity index and trust label context.
- Strategy-failure risks:
  - `ecosystemFocusRisk`
  - `clarityPathRisk`
  - `economicSignificanceRisk`
  - `riskAssuranceRisk`
  - `digitalDualityRisk`
- Value dimensions:
  - `emotionalValue`
  - `functionalValue`
  - `economicValue`
  - `brandValue`
  - `lifetimeValue`

AMC also computes deterministic peer grouping (fixed k-medoids initialization rules) and composite comparison scores for ecosystem alignment and risk assurance.

## Interpreting Results

- Higher maturity/value percentiles are better.
- Lower risk-index percentiles are better when the metric encodes risk magnitude.
- Peer group output is descriptive, not prescriptive.
- Composite scores are weighted deterministic formulas defined by signed bench policy.

Use percentiles with trust context:
- `HIGH` trust + valid proofs: suitable for governance decisions.
- `MEDIUM` trust: suitable for directional planning with caution.
- `LOW` trust or missing proofs: informational only; do not use as release/compliance evidence.

## Warnings and Evidence Gates

The compare output includes warnings whenever:
- Local trust is low.
- Population trust is weak.
- Inclusion proofs are missing/invalid.
- Evidence coverage or correlation quality is below policy gates.

When warnings are present, AMC clearly labels results as limited-confidence and avoids "greenwash" framing.

## Typical Workflow

```bash
# 1) Initialize bench policy
amc bench init

# 2) Create local benchmark artifact
amc bench create --scope workspace --id workspace --out .amc/bench/exports/workspace/workspace/latest.amcbench

# 3) Import ecosystem benchmarks from trusted registry
amc bench import --registry-id official --bench <benchId>@latest

# 4) Compute deterministic comparison
amc bench compare --scope workspace --id workspace --against imported
```

Comparison artifact:
- `.amc/bench/comparisons/latest.json`
- Signed and transparency-logged (`BENCH_COMPARISON_CREATED`).

## Console Views

- Workspace: `/w/<workspaceId>/console/benchCompare.html`
- Workspace registry/import/export: `/w/<workspaceId>/console/benchmarks.html` and `/w/<workspaceId>/console/benchRegistry.html`
- Host portfolio: `/host/console/benchPortfolio.html`

These views are device-first, CDN-free, and update in realtime via SSE (`BENCH_COMPARISON_UPDATED`, `BENCH_IMPORTED`, `BENCH_PUBLISHED`).
