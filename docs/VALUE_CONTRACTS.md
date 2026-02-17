# Value Contracts

Value contracts define what "value" means for a scope and how AMC scores it deterministically.

Location:

- Workspace contract: `.amc/value/contracts/workspace.yaml`
- Agent contracts: `.amc/value/contracts/agents/<agentId>.yaml`

Each contract is signed and verified.

## Contract Structure

A contract defines:

- Agent profile (`agentType`, domain, deployment)
- KPI list with deterministic normalization ranges
- Per-KPI impacts on value dimensions
- Trusted evidence sources and trust tiers
- Baseline window and attribution method
- Constraints (for example, forbidding self-reported data from affecting economic value)

## Built-In Templates

Starter templates are included for:

- `code-agent`
- `support-agent`
- `ops-agent`
- `research-agent`
- `sales-agent`
- `other`

## CLI

```bash
# initialize policy + default contract assets
amc value init

# create an agent contract from built-in template
amc value contract init --scope agent --id agent-1 --type code-agent

# inspect and verify
amc value contract print --scope agent --id agent-1
amc value contract verify --scope agent --id agent-1

# apply a custom contract file
amc value contract apply --file ./contract.yaml --scope agent --id agent-1
```

## Safety Rules

- Only OWNER/OPERATOR can apply contracts.
- Contracts are signed and fail closed when signature checks fail (when policy enforcement is enabled).
- Agent lease-auth cannot mutate value contracts.
