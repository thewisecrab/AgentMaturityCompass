# CONNECT

`amc connect` prints copy/paste setup for routing agents through AMC gateway/proxy.

## Command

```bash
amc connect --agent <agentId>
amc connect --agent <agentId> --mode supervise
amc connect --agent <agentId> --mode sandbox
amc connect --agent <agentId> --adapter claude-cli
amc connect --agent <agentId> --print-env
amc connect --agent <agentId> --print-cmd
```

## Output

The wizard prints:
- environment exports (`OPENAI_BASE_URL`, `AMC_LLM_BASE_URL`, proxy vars)
- recommended supervise/sandbox command
- adapter-aware one-liner when `--adapter` is provided:
  - `amc adapters run --agent <agentId> --adapter <adapterId> -- <cmd...>`
- Node snippet using `wrapFetch`
- Python snippet capturing receipt headers and trace line

## Supervise Example

```bash
amc supervise --agent <agentId> --route http://127.0.0.1:3210/openai -- <cmd...>
```

## Sandbox Example

```bash
amc sandbox run --agent <agentId> -- <cmd...>
```

If an agent bypasses gateway/proxy, observed evidence drops and high maturity levels are capped by gates.
