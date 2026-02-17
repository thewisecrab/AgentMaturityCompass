# BENCHMARKING

AMC benchmarking enables cross-agent and cross-fleet comparison without sharing raw evidence.

Artifact: `.amcbench` (signed tar.gz)

Contents:

- `bench.json`
- `bench.sig`
- public verification key material required for signature checks

No transcripts, raw tool outputs, secrets, or evidence DB are included.

## CLI

```bash
amc benchmark export --agent <agentId> --run <runId> --out ./benchmarks/<name>.amcbench
amc benchmark verify ./benchmarks/<name>.amcbench
amc benchmark ingest ./benchmarks
amc benchmark list
amc benchmark stats --group-by riskTier
amc benchmark report --out ./benchmarks/summary.md
```

## Privacy Rules

- default public agent identity is deterministic hash-based
- no raw prompts/responses
- no lease/admin/provider tokens
- no source IP metadata

## Comparative Views

- per-layer deltas
- IntegrityIndex vs Overall scatter
- percentile grouping by `archetype`, `riskTier`, or `trustLabel`
- ecosystem median gap heatmaps by question

## Verification

`amc benchmark verify` validates schema + signature + digest consistency. Any tamper causes verify failure.
