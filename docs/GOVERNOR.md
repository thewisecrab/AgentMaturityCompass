# GOVERNOR

The Autonomy Governor is the policy-as-code layer that decides whether an agent can run an action in `SIMULATE` or `EXECUTE` mode right now.

## Core Rule

`EffectiveLevel(question) = min(CurrentFinalLevel(question), TargetEqualizerLevel(question))`

Even if an agent is capable of a higher level, owner target settings can tune autonomy down.

## Signed Policy

Action policy file:

- `.amc/action-policy.yaml`
- `.amc/action-policy.yaml.sig`

If signature verification fails, Governor denies `EXECUTE` and returns `SIMULATE` with `UNTRUSTED CONFIG` reasons.

## Action Classes

- `READ_ONLY`
- `WRITE_LOW`
- `WRITE_HIGH`
- `DEPLOY`
- `SECURITY`
- `FINANCIAL`
- `NETWORK_EXTERNAL`
- `DATA_EXPORT`
- `IDENTITY`

Each class can require:

- minimum effective question levels
- minimum trust tier (`OBSERVED` / `OBSERVED_HARDENED`)
- assurance pack thresholds
- sandbox evidence for execute
- owner execution ticket

## Commands

```bash
amc policy action init
amc policy action verify

amc governor check --agent <id> --action <ActionClass> --risk <low|med|high|critical> --mode <simulate|execute>
amc governor explain --agent <id> --action <ActionClass>
amc governor report --agent <id> --window 14d --out .amc/agents/<id>/reports/governor.md
```

## SIMULATE vs EXECUTE

- `SIMULATE` is allowed whenever policy allows planning and safety analysis.
- `EXECUTE` is allowed only if every policy precondition is satisfied.
- If execute is requested but requirements fail, Governor downgrades to `SIMULATE` and returns deterministic reasons + required evidence.

## Decision Inputs

Governor evaluates:

- latest valid diagnostic run
- signed target profile
- trust summary (including sandbox/correlation state)
- assurance summaries in the selected window
- optional signed work order context
- optional execution ticket presence

## Security Notes

- Unsigned or invalid action policy caps maturity and blocks execute.
- Governor decisions are audited and written as observed evidence.
- Agents cannot raise execute rights by self-claiming maturity.
