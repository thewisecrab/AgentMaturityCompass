# LOOP

Loop commands support recurring self-serve maturity checks with snapshots.

## Commands

```bash
amc loop init
amc loop plan --agent <agentId> --cadence weekly
amc loop run --agent <agentId> --days 14
amc loop schedule --agent <agentId> --os cron --cadence weekly
amc snapshot --agent <agentId> --out .amc/agents/<agentId>/reports/snapshots/latest.md
```

`loop run` executes:
1. diagnostic run
2. assurance run (if loop config enables it)
3. dashboard build
4. unified clarity snapshot write

## Scheduling

`amc loop schedule` only prints scheduler snippets (`cron`, `launchd`, `systemd`).
It does not install background jobs automatically.

## Snapshot Output

Snapshot includes:
- scores + trust
- top gaps and cap reasons
- next evidence checklist
- failure-risk indices
- assurance summary
- references to dashboard/bundle/cert paths
