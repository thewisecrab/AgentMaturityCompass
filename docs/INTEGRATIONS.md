# Integration Hub

AMC Integration Hub dispatches deterministic ops events to configured webhooks and writes signed evidence for every dispatch.

## Config
- `.amc/integrations.yaml` (+ `.sig`)
- Channel secrets are stored in vault and referenced by `secretRef` only.

## Dispatch Behavior
- Canonical JSON payload (`AMC_OPS_EVENT`)
- Webhook POST with secret header
- Audit evidence event written (`auditType: INTEGRATION_DISPATCHED`)
- Ops receipt minted (monitor-signed) and stored in event metadata

## Commands
- `amc integrations init`
- `amc integrations verify`
- `amc integrations status`
- `amc integrations test [--channel <id>]`
- `amc integrations dispatch --event DRIFT_REGRESSION_DETECTED --agent default`

## Studio API
- `GET /integrations/status`
- `POST /integrations/test`
- `POST /integrations/dispatch`
- `POST /integrations/verify-receipt`

## Console
Use `/console/integrations` to inspect channels/routing and run test dispatches.
