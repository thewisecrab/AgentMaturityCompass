# Context Graph (CGX)

CGX builds a deterministic, signed graph of the current AMC operating context per workspace and per agent.

Files:
- `.amc/cgx/policy.yaml` + `.sig`
- `.amc/cgx/graphs/workspace/latest.json` + `.sig`
- `.amc/cgx/graphs/agents/<agentId>/latest.json` + `.sig`
- `.amc/cgx/packs/agents/<agentId>/latest.pack.json` + `.sig`

Commands:

```bash
amc cgx init
amc cgx build --scope workspace
amc cgx build --scope agent --id default
amc cgx verify
amc cgx show --scope agent --id default --format pack
```

What CGX contains:
- typed nodes/edges for governance, tools/models, approvals, plans, forecasts, benchmarks, plugins, trust mode
- deterministic IDs and hashes
- evidence references (run IDs and event hashes)

What CGX excludes:
- secrets
- raw prompts
- free-text payload dumps
- PII/file-path leaks

Context pack:
- CGX pack is a minimized runtime context for agent operation.
- It includes allowlists, top transform tasks, equalizer targets, and truth constraints.
- Pack is signed and transparency-logged.

Fail-closed behavior:
- invalid CGX policy signature fails workspace readiness (`/readyz` 503).
- invalid graph/pack signatures fail `amc verify all`.
