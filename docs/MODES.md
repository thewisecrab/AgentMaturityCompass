# MODES

AMC supports two CLI roles:
- `owner` (default)
- `agent`

Mode file:
- `.amc/mode.json`

## Switch Mode

```bash
amc mode owner
amc mode agent
amc mode
```

## Owner Mode

Can modify signed posture and governance:
- set targets
- rotate vault keys
- apply archetypes/tuning/upgrades
- sign artifacts (bundles/certs/configs)

## Agent Mode

Read-only/self-check focused. Owner-only commands are blocked (for example `target set`, `vault rotate-keys`, `bundle export`, `certify`, `fix-signatures`).

Agent mode can still run evidence collection + diagnostics:
- `amc run`
- `amc report`
- `amc history`
- `amc compare`
- `amc learn`
