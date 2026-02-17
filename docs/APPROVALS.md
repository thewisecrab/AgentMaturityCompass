# APPROVALS

Approvals provide signed, human-in-the-loop authorization for high-impact execute actions.

Storage (per agent):

- `.amc/agents/<agentId>/approvals/<approvalId>.json`
- `.amc/agents/<agentId>/approvals/<approvalId>.json.sig`
- `.amc/agents/<agentId>/approvals/<approvalId>.consumed.json` (single-shot consume record)

## Flow

1. Agent requests ToolHub intent (`/toolhub/intent`).
2. If execute requires owner approval, ToolHub returns `approvalRequired=true` and `approvalId`.
3. Owner approves or denies from CLI or Console.
4. Agent polls approval status (`/agent/approvals/:id/status`) using a lease token.
5. Agent executes with `approvalId`.
6. Approval is consumed after successful execute; replay attempts are denied.

## CLI

```bash
amc approvals list --agent <agentId> --status pending
amc approvals show --agent <agentId> <approvalId>
amc approvals approve --agent <agentId> <approvalId> --mode execute --reason "approved by owner"
amc approvals deny --agent <agentId> <approvalId> --reason "not approved"
```

## Security Guarantees

- Approvals are signed by auditor key material in the vault boundary.
- ToolHub verifies signature, expiry, intent binding, action class, and tool binding.
- Approval reuse is blocked (single-shot by default).
- Agent cannot self-approve.

## Audit Events

- `APPROVAL_REQUESTED`
- `APPROVAL_DECIDED`
- `APPROVAL_CONSUMED`
- `APPROVAL_REPLAY_ATTEMPTED`

These events are observable in the ledger and included in report hygiene summaries.
