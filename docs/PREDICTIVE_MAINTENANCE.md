# Predictive Maintenance

Predictive maintenance in AMC means detecting early reliability and value degradation signals before they become incidents.

## Inputs

AMC computes leading indicators from observed platform evidence, including:

- Integrity/correlation trend
- Assurance pack trend
- Approval backlog age
- Freeze activity
- ToolHub denial rate
- Policy/plugin integrity failures
- Budget exceed events
- Notary attestation freshness (when enabled)

## Risk Lens + Value Lens

Advisories are tied to both:

- Strategy-failure indices:
  - `EcosystemFocusRisk`
  - `ClarityPathRisk`
  - `EconomicSignificanceRisk`
  - `RiskAssuranceRisk`
  - `DigitalDualityRisk`
- Value dimensions:
  - Emotional
  - Functional
  - Economic
  - Brand
  - Lifetime

## Advisory Behavior

AMC advisories are evidence-bound and deterministic:

- `INFO` / `WARN` / `CRITICAL`
- categories such as `DRIFT`, `ANOMALY`, `VALUE_REGRESSION`, `INTEGRITY`, `GOVERNANCE`, `NOTARY`
- explicit “why now” evidence refs (event hashes, run IDs)
- exact next steps mapped to real AMC commands and Transformation OS tasks

Advisories do not auto-apply changes and do not mark tasks done.

## Typical Flow

```bash
amc forecast refresh --scope agent --id <agentId>
amc advisory list --scope agent --id <agentId>
amc advisory show <advisoryId>
amc transform plan --agent <agentId> --to targets
```

