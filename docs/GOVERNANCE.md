# AMC Governance Framework

## Overview

The AMC Governance Framework defines how human oversight, graduated autonomy,
proactive action governance, and community governance are applied to AI agents.
Governance is not a checkbox — it is a continuous, evidence-backed practice.

---

## Human Oversight Quality

### Beyond "Is There a Human?"

Many systems claim human oversight simply because an approval button exists. AMC
measures **oversight quality** — whether the human making the decision actually has
what they need to make a good decision.

Poor oversight is nearly as dangerous as no oversight. Rubber-stamping, context-free
approvals, and socially-engineered overrides create a false sense of safety.

### The Four Quality Dimensions

**1. Context Completeness**

Every approval request must include:
- **What**: The exact action being requested (not a summary)
- **Why**: The agent's reasoning for the action
- **Impact**: Who/what is affected and how
- **Risk**: What could go wrong
- **Rollback**: How to undo the action if needed
- **Deadline**: When the decision is needed (don't manufacture urgency)

Incomplete approval requests must be rejected by the oversight system and returned
to the agent for enrichment.

**2. Social Engineering Resistance**

Human overseers are targets. Common attack vectors:
- **Authority pressure**: "I'm the CEO, skip the process"
- **Urgency manufacturing**: "Production is down, we need this NOW"
- **Normalization**: "We've always done it this way"
- **Complexity exploitation**: "The technical details are too complex to explain"

The oversight system must:
- Flag requests that invoke urgency without evidence
- Require a second approver for requests that bypass standard review
- Log all override requests with the stated justification
- Alert on patterns that suggest social engineering

**3. Rubber-Stamp Detection**

The system detects rubber-stamping by monitoring:
- **Approval velocity**: > 10 approvals/hour → alert
- **Time-per-approval**: < 30 seconds → flag for review
- **Checklist completion rate**: < 80% → alert
- **Sequential same-approver rate**: Same person approving > 5 consecutive high-risk actions → require rotation

When rubber-stamping is detected:
1. Pause the approval queue
2. Notify the oversight supervisor
3. Require a fresh review by a different approver
4. Log the detection event to the audit ledger

**4. Escalation Quality**

Good escalations are:
- **Actionable**: The reviewer can make a decision in < 2 minutes
- **Evidenced**: All claims are backed by `[ev:...]` references
- **Time-bounded**: The decision deadline is clearly stated
- **Reversible**: Rollback options are specified
- **Scoped**: Only requests the minimum necessary action

---

## Graduated Autonomy

Graduated autonomy is the principle that agents must **earn** higher levels of
independence by demonstrating safety and reliability at lower levels.

### Autonomy Gate Model

```
┌─────────────────────────────────────────────────────────────┐
│  LEVEL 0: Suggestion Only                                   │
│  Agent recommends; human executes all actions               │
├─────────────────────────────────────────────────────────────┤
│  LEVEL 1: Read-Only Autonomy                               │
│  Agent reads/queries; human approves all writes             │
├─────────────────────────────────────────────────────────────┤
│  LEVEL 2: Bounded Write Autonomy                           │
│  Agent executes pre-approved write patterns; human reviews  │
├─────────────────────────────────────────────────────────────┤
│  LEVEL 3: Policy-Scoped Autonomy                           │
│  Agent acts within defined policy scope; alerts on edges    │
├─────────────────────────────────────────────────────────────┤
│  LEVEL 4: Supervised Full Autonomy                         │
│  Agent acts broadly; human reviews anomalies only           │
├─────────────────────────────────────────────────────────────┤
│  LEVEL 5: Full Autonomy (Exceptional)                      │
│  Requires board-level approval + continuous monitoring      │
└─────────────────────────────────────────────────────────────┘
```

### Advancement Requirements

To advance from level N to N+1:
1. Minimum 30 days of operation at level N without critical incidents
2. AMC score improvement of ≥ 5 points since level assignment
3. All high/critical assurance pack findings resolved
4. Human sponsor sign-off with evidence review
5. Signed policy update recording the new autonomy level

### Demotion Triggers (Automatic)

| Event | Demotion |
|-------|---------|
| Critical security incident | -2 levels |
| Data loss or corruption | -2 levels |
| Unauthorized access (agent-caused) | -1 to -2 levels |
| Shutdown non-compliance | -1 level |
| AMC score drop ≥ 10 points | -1 level |
| Tamper detection on ledger | -1 level |
| Rubber-stamp detection (repeated) | -1 level |

Demotion is automatic and immediate. Re-advancement follows the standard process.

### Autonomy Scope Definition

Each autonomy level requires a formally defined scope document specifying:
- **Allowed tools**: Which tools the agent may invoke at this level
- **Allowed actions**: Specific action types (read, write, delete, send, etc.)
- **Scope boundaries**: Which systems, datasets, users are in/out of scope
- **Budget limits**: Per-task and per-day cost ceilings
- **Time limits**: Maximum task duration before mandatory check-in

Scope documents must be signed by the human owner and stored in the governance ledger.

---

## Proactive Action Governance

Proactive actions are actions the agent takes on its own initiative — not in direct
response to a user request. These require special governance because:

1. There is no user to push back if the agent is wrong
2. The agent may be acting on stale or incomplete information
3. Proactive actions can create cascading effects not anticipated by the user

### Categories of Proactive Actions

| Category | Examples | Default Gate |
|----------|----------|-------------|
| Monitoring | Checking metrics, reading logs | Allowed at L2+ |
| Alerting | Sending notifications, creating tickets | Allowed at L3+ |
| Optimization | Reordering queues, caching decisions | Allowed at L3+ with logging |
| Remediation | Restarting services, rolling back configs | Requires human approval at L4 |
| Escalation | Paging humans, creating incidents | Allowed at L3+ |
| Data modification | Cleaning, enriching, deleting records | Requires human approval at all levels |

### Proactive Action Log Requirements

Every proactive action must be logged with:
- Timestamp
- Trigger (what condition triggered the action)
- Reasoning (why the agent decided to act)
- Action taken
- Outcome
- `[ev:proactive-<id>]` evidence marker

Proactive action logs must be reviewed weekly by the human owner.

---

## Community Governance

For agents that interact with the public or with external communities, additional
governance requirements apply.

### Disclosure Requirements

Agents interacting with humans must:
1. Disclose their AI nature at the start of any interaction
2. Not claim to be human when sincerely asked
3. Identify the organization deploying them
4. Provide a contact for human escalation

### Content Governance

Community-facing agents must have:
- A harm detection layer reviewed weekly
- A user feedback channel for reporting concerns
- A response time SLA for reported harms (≤ 24 hours for critical)
- A public-facing transparency report (quarterly)

### Community Governance Board

Organizations deploying L4+ agents in community contexts should establish a
**Community Governance Board** including:
- At least one external representative (not employed by the deploying org)
- A user advocate representing affected communities
- A technical reviewer (can be internal)
- Meeting cadence: at minimum quarterly

The board reviews:
- Incident reports from the past period
- Proactive action audit reports
- User feedback summaries
- Planned autonomy level changes

Board sign-off is required for:
- Advancing an agent to autonomy L4 or L5
- Deploying a new agent in a high-risk community context
- Changing the scope of an agent's allowed actions

---

## Evidence Requirements

All governance decisions must be backed by evidence:

| Decision | Required Evidence |
|----------|------------------|
| Autonomy level assignment | `[ev:autonomy-gate-review-<id>]` |
| Approval request | `[ev:approval-request-<id>]` |
| Rubber-stamp detection | `[ev:rubber-stamp-detected-<id>]` |
| Proactive action | `[ev:proactive-<id>]` |
| Demotion | `[ev:demotion-<id>:<reason>]` |
| Community disclosure | `[ev:disclosure-<session-id>]` |

---

## Governance CLI Commands

```bash
# Check oversight quality
amc oversight assess my-agent-id

# Check agent classification and governance urgency
amc classify agent my-agent-id

# List evidence claim expiry status
amc claims list my-agent-id

# Score orchestration DAG governance
amc dag score
```

---

## Further Reading

- [AGENT_VS_WORKFLOW.md](./AGENT_VS_WORKFLOW.md) — Classification and level thresholds
- [MEMORY_MATURITY.md](./MEMORY_MATURITY.md) — Memory requirements by governance level
- [QUESTION_BANK.md](./QUESTION_BANK.md) — HOQ, PROACTIVE, SOCIAL dimension details
