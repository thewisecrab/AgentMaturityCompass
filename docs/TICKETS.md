# TICKETS

Execution Tickets are short-lived signed tokens that authorize high-impact `EXECUTE` actions.

They are required when action policy or tools config marks an action/tool as ticket-gated.

## Format

Ticket string:

`<base64url(payload)>.<base64url(signature)>`

Payload binds:

- `agentId`
- `workOrderId`
- `workOrderSha256`
- `actionClass`
- optional `toolName`
- `issuedTs`
- `expiresTs`
- `nonce`

Signature is Ed25519 using auditor key material from vault-backed signing path.

## Commands

```bash
amc ticket issue --agent <id> --workorder <workOrderId> --action DEPLOY --ttl 15m --tool git.push
amc ticket verify <ticketString>
```

## Verification Rules

Ticket verification checks:

- signature validity against auditor public key history
- expiration
- expected agent/work-order/action/tool scopes
- current signed work-order digest equals `workOrderSha256`

If any check fails, ToolHub denies execute and writes audit evidence (`EXEC_TICKET_INVALID` or `EXEC_TICKET_MISSING`).

## Duality Enforcement

- `SIMULATE` remains available for planning/safety analysis.
- `EXECUTE` for gated actions requires a valid ticket.
- Execute attempts without ticket generate `EXECUTE_WITHOUT_TICKET_ATTEMPTED` evidence and can cap maturity in affected questions.
