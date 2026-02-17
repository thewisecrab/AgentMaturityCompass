# WORK ORDERS

A Work Order is a signed, immutable job envelope created by the owner.

It binds business intent, risk tier, allowed action classes, and mode (`SIMULATE`/`EXECUTE`) to a specific agent task.

## Storage

Per agent:

- `.amc/agents/<agentId>/workorders/<workOrderId>.json`
- `.amc/agents/<agentId>/workorders/<workOrderId>.json.sig`
- optional revocation: `.revocation.json` + signature

## Why It Matters

Work orders prevent vague or drifting autonomy. ToolHub and Governor can enforce that execution attempts match a signed owner-approved job context.

## Commands

```bash
amc workorder create --agent <id> --title "Release 1.2.3" --risk high --mode execute --allow DEPLOY --allow WRITE_LOW
amc workorder list --agent <id>
amc workorder show --agent <id> <workOrderId>
amc workorder verify --agent <id> <workOrderId>
amc workorder expire --agent <id> <workOrderId>
```

## Signature Enforcement

- If a work order signature is invalid, it is treated as missing.
- Expired or revoked work orders are rejected.

## Gateway Attribution

When clients send:

- `x-amc-workorder-id: <workOrderId>`

Gateway stores `workOrderId` in request/response evidence metadata, enabling run-to-work-order traceability.

## Connect Integration

`amc connect --agent <id>` prints `AMC_WORKORDER_ID` export guidance and header guidance so agents can propagate work-order context through gateway/toolhub evidence.
