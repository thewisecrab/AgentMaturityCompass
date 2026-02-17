# Upgrade Autopilot

Upgrade Autopilot is the deterministic workflow that turns signed targets and measured evidence into an executable, approval-gated upgrade plan.

## Flow

1. Instrumentation:
- Ensure bridge/wrapper evidence coverage is sufficient for honest scoring.
- Close unknowns that block objective measurement.

2. Governance:
- Apply policy/tool/budget/approval controls needed for safe autonomy.
- Route SECURITY/GOVERNANCE actions through dual-control approvals.

3. Capabilities:
- Run assurance packs and transformation actions tied to gap-closing interventions.
- Track required checkpoint evidence after each step.

4. Checkpoint:
- Refresh forecast and create benchmark artifacts.
- Re-run diagnostics to confirm measured improvements.

## CLI workflow

Create deterministic plan:

```bash
amc mechanic plan create --scope workspace --from measured --to targets
```

Review plan:

```bash
amc mechanic plan show <planId>
amc mechanic plan diff <planId> --against current
```

Request approvals:

```bash
amc mechanic plan request-approval <planId> --reason "Execute approved upgrade cycle"
```

Execute after quorum:

```bash
amc mechanic plan execute <planId>
```

Run what-if:

```bash
amc mechanic simulate <planId>
```

## Safety guarantees

- No LLM planning or hidden heuristics.
- No maturity inflation from simulation.
- No automatic publish/export side effects.
- No execution without approval quorum on protected actions.

## Continuous recurrence

Autopilot is designed for repeat cycles (for example weekly/biweekly operations review):

- update targets
- generate plan
- simulate alternatives
- approve and execute
- collect evidence
- refresh forecast/benchmark
- re-measure

This keeps unified clarity across Concept, Culture, Capabilities, and Configuration while keeping risk assurance and value outcomes visible over time.
