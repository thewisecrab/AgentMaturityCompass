# Archetype Packs

Archetypes provide built-in role-specific defaults for context, targets, guardrails, and evaluation recipes.

## Commands

```bash
amc archetype list
amc archetype describe <archetypeId>
amc archetype apply --agent <agentId> <archetypeId>
```

`amc archetype apply` shows context/target diff and asks for confirmation before writing changes.

## Built-In Archetypes

- `code-agent`
- `research-agent`
- `customer-support-agent`
- `sales-bdr-agent`
- `devops-sre-agent`
- `security-analyst-agent`
- `data-analyst-agent`
- `executive-assistant-agent`
- `multi-agent-orchestrator`
- `rpa-workflow-automation-agent`

## Apply Output

Applying an archetype updates:

- `context-graph.json` (merged, preserves existing custom content where possible)
- `targets/default.target.json` (re-signed)
- `guardrails.yaml`
- `prompt-addendum.md`
- `eval-harness.yaml`

AMC also records an `ARCHETYPE_APPLIED` audit event with archetype ID and changed file hashes.

## 4C Mapping

Each archetype ships a per-question 4C map:

- Concept
- Culture
- Capabilities
- Configuration

This feeds the upgrade plan so gaps are remediated in a structured journey from Innocence to Excellence.
