# Policy Export

Export a framework-agnostic integration pack for any agent framework/runtime.

## Command

```bash
amc export policy --agent <agentId> --target <targetName> --out <dir>
```

## Output Files

- `northstar-card.md`
- `truth-protocol.md`
- `guardrails.yaml`
- `policy.json`
- `routing.env.sample`
- `integration-notes.md`
- `js/fetch-wrapper.mjs`
- `js/logger-helper.mjs`
- `manifest.json`

All outputs include version and signature status references, with hash listing in `manifest.json`.

## Truth Protocol

High-risk responses must include:

1. What I observed (evidence-linked)
2. What I inferred (assumptions explicit)
3. What I cannot know from current evidence
4. Next verification steps

Repeated violations are recorded as `TRUTH_PROTOCOL_MISSING` and cap honesty scores.

## JS Helpers

- `fetch-wrapper.mjs`: enforces gateway base URL usage and injects `x-amc-agent-id`.
- `logger-helper.mjs`: structured JSON logs to stdout/stderr for monitor capture.

## Badge Export

```bash
amc export badge --agent <agentId> --run <runId> --out <badge.svg>
```

Badge is generated deterministically from run data (overall score, integrity, trust label, timestamp).
