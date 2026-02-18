# SECURITY CHECKLIST — Client Data During AMC Sprints
**Owner:** REV_SECURITY_OFFICER  
**Version:** v1.0 | **Date:** 2026-02-18  
**Lever:** C — Delivery-Readiness (reduces buyer risk; accelerates close)  
**Status:** Draft — peer review requested from REV_COMPLIANCE_OFFICER + REV_LEGAL_CONTRACTS

---

## Purpose
Protect client data collected during AMC Compass Sprints from unauthorized access, inadvertent disclosure, or improper retention. This checklist is mandatory for every sprint engagement. Each item is labeled **REQUIRED** (non-negotiable, must be complete before sprint starts or as noted) or **RECOMMENDED** (strongly advised; document if skipped with business justification).

---

## Section 1 — Data Classification

### 1.1 Define Data Classes at Kickoff
**Label:** REQUIRED  
**When:** Day 0 / Pre-Sprint Gate  
**Action:** At kickoff, classify all client data into one of three tiers:

| Tier | Definition | Examples |
|------|-----------|---------|
| **C1 — Public** | Information the client already publishes externally | Tech stack mentions in job posts, published blog posts, public GitHub repos |
| **C2 — Confidential** | Internal business information not for public release | Architecture diagrams, internal policies, agent failure logs, financial data |
| **C3 — Restricted** | Highly sensitive; breach would cause material harm | API keys, credentials, PII/PHI, production system access, MNPI |

**Acceptance criteria:**  
- [ ] Data tier assigned to each evidence artifact in the Evidence Intake tracker
- [ ] C3 data identified explicitly at kickoff and handled under elevated controls (see Section 2.3)
- [ ] Client briefed on data classification model at kickoff call (0:00–0:10 intro block)

---

### 1.2 Minimum Data Principle
**Label:** REQUIRED  
**When:** Ongoing — every sprint day  
**Action:** Collect only the data explicitly required to score the relevant maturity control. Do not request or retain data beyond sprint scope.  
**Acceptance criteria:**  
- [ ] Evidence intake form lists only dimensions-relevant artifacts
- [ ] IS reviews evidence list against sprint scope before requesting from client
- [ ] Excess data received (unsolicited) is flagged, not processed, and returned/deleted within 48 hours

---

## Section 2 — Access Controls

### 2.1 Sprint Team Access List
**Label:** REQUIRED  
**When:** Day 0 — before any client data is shared  
**Action:** Maintain a named access list for every sprint. Only named individuals may access client data for that sprint.

| Role | Typical Access Scope |
|------|---------------------|
| Implementation Specialist | All evidence artifacts + scoring workspace |
| QA Lead (reviewer) | Scoring worksheet + confidence flags |
| CSM | Summary outputs (not raw evidence) |
| REV_COO_ORCH | Aggregated metrics only (no client-identifiable raw data) |

**Acceptance criteria:**  
- [ ] Access list created in sprint folder (`AMC_OS/CUSTOMER_SUCCESS/[CLIENT]/ACCESS_LOG.md`) before Day 1
- [ ] Any person added to the list during a sprint is logged with date + reason
- [ ] Access revoked within 24 hours of sprint completion for all non-archival roles

---

### 2.2 Shared Folder / Workspace Permissions
**Label:** REQUIRED  
**When:** Day 0 — before folder is shared with client  
**Action:** Client-shared folders must be configured with explicit permission grants. No "anyone with the link" sharing for C2 or C3 data.

**Acceptance criteria:**  
- [ ] Client evidence intake folder: shared only with named client contacts + named sprint team
- [ ] Sharing link mode: "restricted" (Google Drive) or equivalent — never "anyone with link" for C2/C3
- [ ] AMC internal workspace: client-scoped; no cross-client data visible to client users
- [ ] Admin access (ability to change permissions) held only by REV_SECURITY_OFFICER or REV_COO_ORCH

---

### 2.3 Elevated Controls for C3 — Restricted Data
**Label:** REQUIRED  
**When:** Whenever C3 data is involved  
**Action:** If a client shares C3 data (credentials, PII, production access), apply the following:

- [ ] **Do not store C3 data in shared folders** — use a password manager vault (e.g., 1Password) or a dedicated secrets store
- [ ] **Credentials received via email:** acknowledge receipt, instruct client to rotate immediately after use, delete from email within 24 hours
- [ ] **PII/PHI encountered in evidence:** flag to REV_LEGAL_CONTRACTS immediately; do not process without written authorization and DPA in place
- [ ] **Production system access:** use read-only credentials only; access session recorded or supervised; revoked same-day
- [ ] Document all C3 data events in `AMC_OS/CUSTOMER_SUCCESS/[CLIENT]/C3_DATA_LOG.md`

---

### 2.4 Multi-Factor Authentication
**Label:** REQUIRED  
**When:** Before any AMC workspace is provisioned  
**Action:** All sprint team members must have MFA enabled on:
- Email accounts used for client communication
- Cloud storage accounts (Google Drive, Notion, etc.)
- Any tool that stores client data

**Acceptance criteria:**  
- [ ] MFA enforcement confirmed for all sprint team accounts before sprint start
- [ ] Accounts without MFA: sprint team member is blocked from accessing client data until resolved

---

## Section 3 — Storage Standards

### 3.1 Approved Storage Locations
**Label:** REQUIRED  
**When:** Day 0  
**Action:** Client data may only be stored in approved, company-managed locations:

| Location | Permitted Data Tiers | Notes |
|----------|---------------------|-------|
| AMC workspace (Notion / Google Drive — company account) | C1, C2 | Primary evidence vault |
| Local machine (sprint team only) | C1, C2 — temporary during active sprint | Must be encrypted at rest |
| Personal cloud accounts (personal Gmail, Dropbox, iCloud) | ❌ PROHIBITED for all tiers | |
| Shared team Slack/comms | C1 only | No C2/C3 in Slack messages |
| Password manager vault | C3 credentials only | 1Password or equivalent |

**Acceptance criteria:**  
- [ ] No client data stored in unapproved locations
- [ ] Spot-check at Day 3: confirm IS has no C2+ data in personal accounts
- [ ] File downloads to local machine logged in ACCESS_LOG.md

---

### 3.2 Encryption at Rest
**Label:** REQUIRED  
**When:** Ongoing  
**Action:**  
- [ ] All devices that access or download client data must have full-disk encryption enabled (FileVault on Mac, BitLocker on Windows)
- [ ] Cloud storage must use provider-managed encryption at rest (Google Drive, Notion: both compliant by default)
- [ ] IS confirms disk encryption status before sprint begins

---

### 3.3 Backup and Redundancy
**Label:** RECOMMENDED  
**When:** Ongoing  
**Action:**  
- [ ] Primary evidence artifacts backed up in a secondary approved location (e.g., Google Drive + Notion cross-reference)
- [ ] Backup access is limited to the same access list as primary
- [ ] Backup verified accessible before Day 5 readout (single point of failure risk)

---

## Section 4 — Transmission Security

### 4.1 Secure Evidence Transfer
**Label:** REQUIRED  
**When:** Day 0 / Day 1  
**Action:** Client evidence must be received via a secure, authenticated channel:

| Preferred Method | Acceptable | Notes |
|-----------------|-----------|-------|
| Shared Google Drive folder (company-managed, restricted) | ✅ Yes | Primary method |
| Notion page with named-user share | ✅ Yes | Secondary method |
| Encrypted email attachment (S/MIME or PGP) | ✅ Yes | If client requests |
| Unencrypted email attachment (C2/C3) | ❌ No | Instruct client to use Drive instead |
| File transfer via WeTransfer / Dropbox link (anonymous) | ❌ No | |
| USB / physical media | ⚠️ Only with explicit approval + chain of custody doc | |

**Acceptance criteria:**  
- [ ] Evidence intake folder link sent to client before Day 1 using approved method
- [ ] Client instructed NOT to send C2/C3 data via plain email in kickoff call

---

### 4.2 Secure Communication Channels
**Label:** REQUIRED  
**When:** Throughout sprint  
**Action:**  
- [ ] All sprint communication with client via dedicated company email (not personal accounts)
- [ ] Video calls: use company Zoom/Google Meet accounts with waiting room enabled
- [ ] Do not discuss client-specific scores or findings on personal devices / personal messaging apps

---

### 4.3 Screen Sharing Controls
**Label:** RECOMMENDED  
**When:** Any video call where client data is visible  
**Action:**  
- [ ] Before screen sharing, close all other client folders and tabs not relevant to the current session
- [ ] Do not screen share C3 data (credentials, production systems) without explicit client consent
- [ ] Readout call: close all internal notes before starting screen share; only share the readout deck

---

## Section 5 — Retention Policy

### 5.1 Sprint Data Retention Schedule
**Label:** REQUIRED  
**When:** Established at contract signing; enforced post-sprint  
**Action:**

| Data Type | Retention Period | Action at Expiry |
|-----------|-----------------|-----------------|
| Raw evidence artifacts (C2) | 90 days post-sprint completion | Secure delete from all locations |
| Interview notes/transcripts | 90 days post-sprint completion | Secure delete |
| Scoring worksheets | 12 months (needed for re-assessment baseline comparison) | Anonymize or delete per client instruction |
| Final readout deck + roadmap | 24 months (for reference in retainer/re-assessment) | Archive per client's written instruction |
| C3 data (credentials, PII) | 0 days — delete immediately after sprint use | Confirm deletion in C3_DATA_LOG.md |
| NDA and contract documents | 7 years (standard legal retention) | Transfer to legal records system |

**Acceptance criteria:**  
- [ ] Retention schedule communicated to client in SOW (see SALES/SOW_TEMPLATE.md — add retention clause)
- [ ] Deletion confirmed in writing to client at 90-day mark
- [ ] C3 data deletion confirmed same-day in C3_DATA_LOG.md

---

### 5.2 End-of-Engagement Data Handoff
**Label:** REQUIRED  
**When:** Within 5 business days of sprint completion  
**Action:**  
- [ ] All sprint artifacts zipped and securely transferred to client (or confirmed accessible in shared folder)
- [ ] AMC internal copies retained only per retention schedule above
- [ ] Client countersigns data receipt (or confirms in email)
- [ ] Sprint team members' local copies deleted within 5 business days of sprint end

---

## Section 6 — Breach Protocol

### 6.1 Incident Detection and Classification
**Label:** REQUIRED  
**When:** Immediately upon any suspected breach  
**Action:** Any sprint team member who suspects a data incident must:
1. Stop processing and secure the affected system immediately
2. Notify REV_SECURITY_OFFICER via direct message within 1 hour of detection
3. Do not notify client until REV_SECURITY_OFFICER + REV_LEGAL_CONTRACTS have assessed

**Incident categories:**
| Severity | Definition | Response SLA |
|----------|-----------|-------------|
| P1 — Critical | C3 data exposed externally or to unauthorized parties | 1 hour escalation; 24-hour client notification |
| P2 — High | C2 data accessed by unauthorized internal party | 4 hour escalation; 48-hour client notification |
| P3 — Medium | C1 data shared incorrectly; no PII/sensitive data at risk | 24-hour escalation; internal root cause only |

---

### 6.2 Breach Response Steps
**Label:** REQUIRED  
**When:** P1 or P2 incident declared  
**Action:**
- [ ] REV_SECURITY_OFFICER: assess scope and contain within 2 hours
- [ ] REV_LEGAL_CONTRACTS: assess notification obligations (GDPR 72-hour rule, CCPA, etc.) within 4 hours
- [ ] REV_COO_ORCH: briefed within 2 hours; approves client notification content
- [ ] Client notified via phone + email; written notification sent within deadline
- [ ] Incident report filed in `AMC_OS/OPS/INCIDENT_LOG.md` within 24 hours
- [ ] Post-incident review within 5 business days; root cause + corrective action documented

---

### 6.3 Breach Notification Template
**Label:** RECOMMENDED  
**When:** Available in `AMC_OS/OPS/BREACH_NOTIFICATION_TEMPLATE.md`  
**Action:** Maintain a pre-drafted breach notification template approved by REV_LEGAL_CONTRACTS. Update annually.

---

## Section 7 — NDA Enforcement

### 7.1 NDA Required Before Data Access
**Label:** REQUIRED  
**When:** Before any client data is shared or accessed  
**Action:**  
- [ ] Mutual NDA (or confidentiality clause in SOW) signed before kickoff
- [ ] NDA stored in `AMC_OS/FINANCE_LEGAL/NDAS/[CLIENT]_NDA.pdf`
- [ ] All sprint team members briefed on NDA scope at onboarding (not just the signatory)
- [ ] Third-party subcontractors (if any) must sign their own NDA before accessing client data

**Acceptance criteria:**  
- [ ] Signed NDA present in legal folder before Day 0 gate passes
- [ ] Pre-sprint gate checklist (SPRINT_DELIVERY_SOP.md) includes NDA verification step

---

### 7.2 Scope of Confidentiality
**Label:** REQUIRED  
**When:** NDA drafting / review  
**Action:** NDA must explicitly cover:
- [ ] Client evidence artifacts (all tiers)
- [ ] Maturity scores and assessment findings
- [ ] Business strategy or roadmap revealed during interviews
- [ ] Competitive / pricing information mentioned by client
- [ ] Names and roles of client personnel involved in sprint

---

### 7.3 Post-Engagement Confidentiality
**Label:** REQUIRED  
**When:** Throughout and after engagement  
**Action:**  
- [ ] Sprint findings must not be referenced in any public marketing, case studies, or social posts without explicit written client consent
- [ ] Aggregated / anonymized benchmark data (if used) must not allow re-identification
- [ ] Team members leaving the company must be reminded of ongoing NDA obligations at offboarding

---

### 7.4 Reference and Testimonial Policy
**Label:** RECOMMENDED  
**When:** Post-sprint, if client expresses satisfaction  
**Action:**  
- [ ] Request written consent before using client name, logo, or quote in any external communication
- [ ] Reference calls / case studies require separate written authorization
- [ ] Template authorization form: `AMC_OS/FINANCE_LEGAL/REFERENCE_AUTHORIZATION_TEMPLATE.md`

---

## Quick-Reference Summary

| # | Item | Label |
|---|------|-------|
| 1.1 | Classify all evidence by C1/C2/C3 at kickoff | REQUIRED |
| 1.2 | Minimum data principle — collect only what's needed | REQUIRED |
| 2.1 | Named access list created before Day 1 | REQUIRED |
| 2.2 | No "anyone with link" sharing for C2/C3 | REQUIRED |
| 2.3 | Elevated controls for C3 data (vault, rotate, log) | REQUIRED |
| 2.4 | MFA on all accounts before sprint access | REQUIRED |
| 3.1 | Store data only in approved locations | REQUIRED |
| 3.2 | Full-disk encryption on all devices | REQUIRED |
| 3.3 | Backup evidence to secondary location | RECOMMENDED |
| 4.1 | Receive evidence via secure authenticated channel only | REQUIRED |
| 4.2 | Company email + company video accounts for all sprint comms | REQUIRED |
| 4.3 | Screen-sharing hygiene controls | RECOMMENDED |
| 5.1 | Follow retention schedule; C3 data deleted same day | REQUIRED |
| 5.2 | Data handoff to client within 5 days of sprint end | REQUIRED |
| 6.1 | Notify Security Officer within 1 hour of suspected breach | REQUIRED |
| 6.2 | Execute breach response steps (contain, assess, notify) | REQUIRED |
| 6.3 | Pre-drafted breach notification template maintained | RECOMMENDED |
| 7.1 | Signed NDA before any data access | REQUIRED |
| 7.2 | NDA covers scores, evidence, personnel, strategy | REQUIRED |
| 7.3 | No public references without written consent | REQUIRED |
| 7.4 | Reference/testimonial authorization form obtained | RECOMMENDED |

---

## Acceptance Checks
- [ ] Every REQUIRED item can be completed before or during Day 0 gate
- [ ] Quick-reference table covers all 7 sections
- [ ] No item requires legal interpretation on the spot — escalation paths defined
- [ ] Checklist usable by IS or CSM without security expertise

## Files Created/Updated
- `AMC_OS/OPS/SECURITY_CHECKLIST.md` (this file)

## Next Actions
1. Add NDA verification to `SPRINT_DELIVERY_SOP.md` Pre-Sprint Gate criteria (REV_IMPLEMENTATION_SPECIALIST)
2. Create `AMC_OS/FINANCE_LEGAL/NDAS/` folder and add NDA template (REV_LEGAL_CONTRACTS)
3. Create `AMC_OS/OPS/INCIDENT_LOG.md` as blank template (REV_SECURITY_OFFICER)
4. Create `AMC_OS/OPS/BREACH_NOTIFICATION_TEMPLATE.md` (REV_LEGAL_CONTRACTS)
5. REV_COMPLIANCE_OFFICER to review this checklist against applicable data protection regulations before first client sprint

## Risks/Unknowns
- GDPR/CCPA applicability depends on client location and whether PII is collected — confirm with REV_LEGAL_CONTRACTS before first EU/California engagement
- "Secure delete" definition varies by storage provider — document provider-specific deletion procedures
- First sprint will stress-test this checklist — expect at least 2–3 items to need revision post-Sprint 1
