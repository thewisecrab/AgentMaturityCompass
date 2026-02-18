# AMC DEMO SCRIPT v2 — Full Platform (5-minute Discovery-led)

## Goal
Show the full platform, not only assessment, in a short discovery framing that maps visible risk controls to business decisions.

## Call type
5-minute discovery demo (front-loaded diagnostic framing) + optional 10-15 minute deep dive

## Intended audience
Engineering/security leads, SRE, CISO office, product/security architects

---

## 0) Opening (30–45 seconds)

**Speaker:**
"Thanks for joining. We’ll keep this to 5 minutes today.

We’re showing the whole AMC platform, not just scoring. You’ll see one path:
**Measure → Enforce → Prove**.

At the end, I’ll map your current stack to the exact modules that can close your top gaps.

If you’re fine with that pace, can we proceed?"

**Outcome:** Confirm scope + expected outcome + timing.

---

## 1) Live demo flow (4 minutes total)

### Step A — S1 Scan a Skill (measure + shield gate) — ~60s

**Action (Narration):**
- Open a sample workflow and run **S1 (Skill Static Analyzer)** on a known risky skill.

**Say this:**
"S1 is our pre-execution static gate. We’re checking permissions claims, remote execution patterns, and suspicious command behavior before this skill can even load into the runtime."

**Expected visual:**
- Risk flags on skill manifest
- Suggested remediation and risk score shown
- Signed/unsigned decision state

**Transition:**
"We’ve identified risk at ingestion. Next is runtime behavior under stress — S2 would be the next layer, but for this short flow we’ll jump to a high-signal enforcement example."

### Step B — S10 Injection detector in action (runtime-risk detection) — ~60s

**Action (Narration):**
- Paste a crafted injection-style message into the channel ingress / content path.

**Say this:**
"Now S10 evaluates incoming content for prompt-injection and hidden instruction patterns before policy routing. Here’s a real injection example we use in demos: it tries to override trust boundaries with an embedded command and a social-engineering trick."

**Expected visual:**
- Risk score changes from *safe* to *high* / *blocked*
- Classification: suspicious pattern + rule/LLM classifier labels

**Aha moment cue:**
"Watch the next event: the action path is blocked before tool execution. This is where runtime trust is protected, not after-the-fact.
"

### Step C — E1 Tool Policy Firewall Decision (enforcement and policy)

**Action (Narration):**
- Attempt a tool action (e.g., write file or open external domain) from the same context and show E1 block/deny-with-reason.

**Say this:**
"Now E1 is checking every tool call against active policy: sender trust level, context, workspace, and allowed domains. Even when the model output asks for execution, the firewall enforces the platform rule.
"

**Expected visual:**
- Decision card: ALLOW/DENY + policy rule ID + rationale
- Action parameter redaction where applicable
- Approval queue if escalation is configured

### Step D — W1 Receipt generated (proof)

**Action (Narration):**
- Open **W1 Signed Action Receipts** view for the blocked event.

**Say this:**
"This is the prove layer: every decision has a receipt with actor, session, policy basis, timestamp, and cryptographic proof chain fields. This is what security and review teams use when they need hard evidence.
"

**Expected visual:**
- Receipt entry appears immediately after decision
- Signed receipt hash pointer visible
- Export action for incident/IR pack

---

## 2) Why this matters in 60 seconds — map back to buyer problem

**Narration:**
"The short proof of value is this: we don’t just identify risk, we prevent unsafe actions and record why they were prevented. For teams worried about runtime safety, this is the shift from assessment-only to trust operation." 

**Bridge:**
"Before we go deeper, answer this: are your biggest unknowns in ingestion, execution, or evidence?”

---

## 3) Close: module-to-stack mapping (45–60s)

**Use this matrix live during close:**

- **Agent runtime tooling weak on execution boundaries:** highlight **E1/E2/E6/E9**
- **Third-party skills/plugins are unmanaged:** highlight **S1/S2/S3/S5/S7**
- **Content channel risk (web/email/docs):** highlight **S8/S9/S10**
- **Secrets/PII concerns:** highlight **V1/V2/V4**
- **Need for review artifacts:** highlight **W1/W2**
- **Baseline/risk language mismatch across teams:** highlight **Score (S1-S10 support mapping + Dimension reports)**

**Close script:**
"Given what we just saw, a practical path is usually:
1) enable Score + Shield modules around your highest-risk workflow,
2) add Enforce for those tool decisions that currently lack machine controls,
3) add Watch for evidence and compliance readiness.

If that aligns, I can set a 20-min diagnostic follow-up with your engineering and security owners to map rollout sequence and owners."

---

## 4) Discovery-to-next-step transitions

### Primary CTA
**"Start with a free Compass Diagnostic"**

### Fallback CTA
"If that’s not ready now, send me your top 2 risky workflows and I’ll return a 1-page risk map.”

### Objection response scripts

- **"Too much overhead"** → “Most teams start with one workflow first; modular controls keep overhead bounded.”
- **"Can we start with Score only?"** → “Yes, but you should map controls on day one for your highest-risk tool path. The platform is built to scale in layers.”
- **"We already have security tooling"** → “Great — we’re intended as execution-layer complement to what you already use.”

---

## 5) Suggested follow-up note template

**Subject:** 5-minute map + next-step from our live run

Hi {{Name}},

Thanks for the demo. In our 5-minute pass we validated how AMC blocks risky actions in real time (S10 + E1) and records the decision path in W1.

Next step from our side:
1) send you a mapped module stack for your top two workflows
2) prioritize gaps by risk + effort
3) propose a pilot rollout path

If useful, we can do the 20-min diagnostic mapping call this week.

---

## Output standard
- **Files created/updated:** `AMC_OS/SALES/DEMO_SCRIPT_v2.md`
- **Acceptance checks:**
  - Includes 5-minute discovery framing
  - Demonstrates live flow with S1, S10, E1, W1 in sequence
  - Includes explicit real-time block “Aha moment” demonstration
  - Close maps stack gaps to suites/modules
  - CTA is specific and evidence-based
- **Next actions:**
  1. Add screen sequence script IDs in CRM notes for reuse
  2. Build demo environment with repeatable injection payload and canned receipts
  3. Add optional deeper 15-min branch for Watch and Enforce modules
  4. Pre-run each module with representative policy templates
  5. Validate demo content with compliance/legal for claim wording
- **Risks/unknowns:**
  - Demo quality depends on reliable sandbox/test data and stable receipts pipeline
  - Need secure redacted demo data for customer-facing sessions
  - Aha moment can fail if policies are not preconfigured in demo tenant
