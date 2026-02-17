# Prompt Policy

Prompt policy is a signed workspace governance file:

- `.amc/prompt/policy.yaml`
- `.amc/prompt/policy.yaml.sig`

It controls how Northstar prompt packs are built and enforced.

## Key Sections

- `enforcement`
  - `mode`: `OFF | ENFORCE`
  - system prompt strip/override handling
  - fail-closed requirements for signature/lint validity
- `templates`
  - default/by-agent-type/provider template selection
- `truth`
  - Truthguard integration mode (`WARN | ENFORCE`)
  - strong-claim regexes and evidence-ref requirements
  - structured output contract controls
- `recurrence`
  - refresh cadence and event triggers for prompt pack rebuilds
- `privacy`
  - controls for target/score inclusion, model/tool name exposure, redaction behavior

## Safe Defaults

Default policy is conservative:
- enforcement enabled
- user system messages stripped
- override patterns detected
- lint fail closes Bridge requests
- Truthguard enabled in warning mode by default for gradual rollout

## Commands

```bash
amc prompt init
amc prompt verify
amc prompt policy print
amc prompt policy apply --file ./policy.yaml --reason "..."
```

## Rotation and Determinism

To update templates/policy safely:

1. Apply signed policy changes.
2. Rebuild prompt packs (`amc prompt pack build --agent <id>` or scheduler run-now).
3. Verify pack signatures/lint.
4. Diff current vs previous (`amc prompt pack diff --agent <id>`).

Prompt text remains deterministic for fixed signed inputs (policy + CGX + canon + bank + bindings).
