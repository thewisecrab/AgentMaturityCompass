# AUTOMATION OPPORTUNITIES — AMC Sales + Delivery
**Owner:** REV_OPS_AUTOMATION_ENGINEER  
**Version:** v1.0 | **Date:** 2026-02-18  
**Lever:** C — Delivery-Readiness (primary) | A — Pipeline (secondary)  
**Status:** Draft — peer review requested from REV_TECH_LEAD

---

## Purpose
Identify and prioritize the top 10 automation opportunities across the AMC sales and delivery process. Each opportunity includes: process description, manual effort eliminated, recommended tool, implementation effort, and priority score.

**Priority Score formula:** `(Hours Saved/Week × 2) + (1 / Impl Hours × 10) + Strategic Value (1–5)`  
Higher = more urgent to automate.

---

## Automation Opportunity Matrix

### #1 — Outreach Follow-Up Sequence Automation
| Field | Detail |
|-------|--------|
| **Process** | SDR sends 6-touch outreach sequences (Email + LinkedIn) across SMB, Mid-Market, and Agency segments. Currently done manually per lead. |
| **Manual effort eliminated** | ~6 hrs/week (typing, scheduling, tracking 30+ active leads through 6-touch flow) |
| **Recommended tool** | **Instantly.ai** or **Lemlist** (email sequences) + **Phantombuster** (LinkedIn automation within ToS) |
| **Implementation effort** | 4 hours (template import, sequence config, domain warm-up check) |
| **Priority score** | 9.5/10 |
| **Trigger** | New lead added to CRM with ICP segment + email verified |
| **Output** | Sequence enrolled automatically; reply detected → sequence paused → SDR notified |
| **Compliance note** | Sequences must include unsubscribe footer; no guaranteed-result language per FINANCE_LEGAL/CLAIMS_POLICY.md |

---

### #2 — CRM Stage Update on Reply/Booking
| Field | Detail |
|-------|--------|
| **Process** | SDR manually updates CRM stage from "Attempting Contact" → "Connected" after a reply, and again to "Discovery Scheduled" when a meeting is booked. |
| **Manual effort eliminated** | ~3 hrs/week (copy-paste updates, logging, missed updates cause stale data) |
| **Recommended tool** | **Zapier** or **Make** (free/starter tier): trigger on Calendly booking event → update CRM record + notify SDR Slack channel |
| **Implementation effort** | 3 hours (webhook config, field mapping, test run) |
| **Priority score** | 9.0/10 |
| **Trigger** | Calendly booking created OR email reply detected in outreach tool |
| **Output** | CRM stage advances automatically; next_step and next_step_due_date fields populated; SDR pinged in Slack |
| **Dependency** | CRM must support webhook or Zapier connector (HubSpot Free, Airtable, or Notion CRM all qualify) |

---

### #3 — Sprint Kickoff Packet Auto-Generation
| Field | Detail |
|-------|--------|
| **Process** | After SOW is signed, Implementation Specialist manually creates: client folder, evidence intake folder, onboarding checklist, kickoff agenda email, and AMC workspace instance. Takes ~2 hrs per sprint. |
| **Manual effort eliminated** | ~4 hrs/week (at 2 sprints/week target) |
| **Recommended tool** | **Make** (scenario) + **Google Drive API** or **Notion API**: trigger on signed contract event → clone template folder → populate client name + dates → send kickoff email draft to IS |
| **Implementation effort** | 8 hours (template folder setup, Make scenario build, API auth, test with dummy client) |
| **Priority score** | 8.5/10 |
| **Trigger** | Deal moves to "Closed Won" in CRM (or DocuSign/PandaDoc signed event) |
| **Output** | `AMC_OS/CUSTOMER_SUCCESS/[CLIENT]/` folder created with all sub-folders and Day0 templates pre-populated; IS receives Slack notification with folder link |

---

### #4 — Evidence Gap Follow-Up Email (Day 1 → Day 2)
| Field | Detail |
|-------|--------|
| **Process** | After Day 1 kickoff, IS manually writes and sends evidence gap follow-up email listing missing items, owners, and deadlines. Repeated every sprint. |
| **Manual effort eliminated** | ~1.5 hrs/week |
| **Recommended tool** | **Custom Python script** (simple template filler) or **Make** scenario: read evidence gap checklist → generate personalized email → send via Gmail/SendGrid |
| **Implementation effort** | 3 hours (template design, script/scenario build, test) |
| **Priority score** | 7.5/10 |
| **Trigger** | Evidence gap list submitted by IS (via form or doc update) |
| **Output** | Formatted follow-up email sent to client contacts; IS gets a copy in Sent |
| **Note** | Template must support dynamic "missing items" list (Markdown table → HTML email) |

---

### #5 — Weekly CRM Hygiene Report
| Field | Detail |
|-------|--------|
| **Process** | REV_REVOPS_CRM manually pulls CRM data weekly to check: stale deals (>14 days no activity), missing required fields, duplicate detection. Reports to HEAD_OF_SALES. |
| **Manual effort eliminated** | ~2.5 hrs/week |
| **Recommended tool** | **n8n** (self-hosted, free) or **Make**: query CRM API → flag records meeting stale/missing-field criteria → post formatted Slack digest + email to REV_HEAD_OF_SALES |
| **Implementation effort** | 6 hours (n8n workflow build, CRM API connection, Slack formatter, test) |
| **Priority score** | 8.0/10 |
| **Trigger** | Scheduled: every Monday 8:00 AM |
| **Output** | Slack message: "🔴 5 stale deals | 🟡 3 records missing next_step | 🟢 No duplicates detected" with drill-down links |
| **Acceptance criteria** | Zero manual CRM data pulls required for weekly hygiene review |

---

### #6 — Post-Readout Follow-Up Email (Day 5)
| Field | Detail |
|-------|--------|
| **Process** | IS manually writes post-readout follow-up email within 2 hours of call end — includes deck link, top 3 next steps, and retainer CTA. High-value touch, high error risk when done tired post-call. |
| **Manual effort eliminated** | ~1 hr/week |
| **Recommended tool** | **Make** + **Gmail**: IS fills a quick form (client name, top 3 next steps, deck link) → renders branded template → sends from IS's Gmail → logs in CRM |
| **Implementation effort** | 4 hours (template HTML, form design, Make scenario, Gmail OAuth) |
| **Priority score** | 8.0/10 |
| **Trigger** | IS submits "Sprint Readout Complete" form |
| **Output** | Professional follow-up email sent within 5 minutes; CRM activity logged automatically; retainer CTA included per SALES/PRICING |

---

### #7 — Maturity Score Report PDF Generation
| Field | Detail |
|-------|--------|
| **Process** | IS manually assembles final readout deck by copying scores from scoring worksheet into slides, then exports PDF. Error-prone; takes ~2 hours per sprint. |
| **Manual effort eliminated** | ~3 hrs/week (at 1.5 sprints average) |
| **Recommended tool** | **Custom Python script** (python-pptx or reportlab) or **Carbone.io** (template-based PDF generation): scoring worksheet (JSON/CSV input) → populate slide template → export PDF |
| **Implementation effort** | 12 hours (template design, script build, test with edge-case data) |
| **Priority score** | 7.5/10 |
| **Trigger** | Scoring worksheet marked "QA Approved" |
| **Output** | `READOUT_DECK_FINAL.pdf` auto-generated in client folder; IS receives Slack notification with file link |
| **Note** | High implementation cost but scales perfectly — ROI breakeven at ~5 sprints |

---

### #8 — New Lead Enrichment on Capture
| Field | Detail |
|-------|--------|
| **Process** | When SDR adds a new lead, they manually research: company size, tech stack signals, LinkedIn headline, and ICP segment classification. Takes 15–20 min per lead. |
| **Manual effort eliminated** | ~3 hrs/week (at 10 new leads/week) |
| **Recommended tool** | **Clay** (freemium) or **Apollo.io enrichment API** + **Make**: on lead capture → auto-enrich with company size, tech stack, LinkedIn URL, industry → write back to CRM |
| **Implementation effort** | 5 hours (API keys, Make scenario, field mapping, dedup logic) |
| **Priority score** | 8.5/10 |
| **Trigger** | New record created in CRM (or added to LEADS_MASTER.csv) |
| **Output** | Lead record enriched with company_size, tech_stack_signals, linkedin_url, icp_segment, trigger_tag within 2 minutes |
| **Compliance note** | Only use publicly available data sources; do not scrape behind logins |

---

### #9 — Proposal + SOW Auto-Draft on Opportunity Qualification
| Field | Detail |
|-------|--------|
| **Process** | After discovery call, AE/Proposal Specialist manually drafts proposal and SOW using templates — inserting client name, pain points, scope, and pricing. Takes ~2 hrs per proposal. |
| **Manual effort eliminated** | ~2 hrs/week |
| **Recommended tool** | **PandaDoc** (free tier supports basic templates) or **Carbone.io**: AE fills post-discovery form → system merges into branded proposal template → sends for e-sign |
| **Implementation effort** | 6 hours (template build in PandaDoc, form design, field mapping, test e-sign flow) |
| **Priority score** | 7.5/10 |
| **Trigger** | Deal moves to "Qualified Opportunity" stage in CRM |
| **Output** | Draft proposal generated and sent to AE for review within 5 min; AE reviews → sends to client → e-sign tracked in CRM |

---

### #10 — Sprint Day-by-Day Status Notification to Client
| Field | Detail |
|-------|--------|
| **Process** | CSM manually sends status update emails on Day 3 and Day 4 to keep client informed and maintain engagement. Content is largely templated but requires manual send each sprint. |
| **Manual effort eliminated** | ~1 hr/week |
| **Recommended tool** | **Make** + **Gmail/SendGrid**: sprint started event → schedule Day 3 and Day 4 emails with client name + sprint dates → send automatically from CSM's account |
| **Implementation effort** | 3 hours (two email templates, Make scheduled delay scenario, test) |
| **Priority score** | 6.5/10 |
| **Trigger** | Sprint kickoff logged in CRM (Day 1 confirmed) |
| **Output** | Day 3 status email and Day 4 readout logistics email sent automatically; CSM can override/cancel if needed |

---

## Implementation Roadmap

### Phase 1 — Quick Wins (Week 1–2) — Total: ~15 hours
| Priority | Automation | Impl Hours |
|----------|-----------|-----------|
| #1 | Outreach sequence automation | 4 hrs |
| #2 | CRM stage update on reply/booking | 3 hrs |
| #10 | Sprint day status notifications | 3 hrs |
| #4 | Evidence gap follow-up email | 3 hrs |
| #6 | Post-readout follow-up email | 4 hrs |

### Phase 2 — Core Infrastructure (Week 3–4) — Total: ~22 hours
| Priority | Automation | Impl Hours |
|----------|-----------|-----------|
| #3 | Sprint kickoff packet generation | 8 hrs |
| #5 | Weekly CRM hygiene report | 6 hrs |
| #8 | New lead enrichment | 5 hrs |
| #9 | Proposal + SOW auto-draft | 6 hrs |

### Phase 3 — Scale (Week 5–6) — Total: ~12 hours
| Priority | Automation | Impl Hours |
|----------|-----------|-----------|
| #7 | Maturity score report PDF generation | 12 hrs |

**Total estimated implementation: ~49 hours**  
**Total estimated savings: ~27.5 hours/week at 2 sprints/week run rate**

---

## Acceptance Checks
- [ ] Each opportunity maps to a named process in SPRINT_DELIVERY_SOP.md or CRM_PIPELINE_OPS.md
- [ ] Every tool recommendation has a free/low-cost tier available (bootstrap-friendly)
- [ ] Priority scores calculated consistently using stated formula
- [ ] Compliance notes included where applicable (outreach, enrichment)
- [ ] Phased roadmap fits within a 6-week implementation window

## Files Created/Updated
- `AMC_OS/OPS/AUTOMATION_OPPORTUNITIES.md` (this file)

## Next Actions
1. Pick Phase 1 automations; assign implementation owner (REV_TECH_LEAD or REV_DEVOPS_ENGINEER)
2. Acquire Instantly.ai or Lemlist free trial → test outreach sequence integration this week
3. Set up Make (free tier) account; build CRM stage-update scenario as first test
4. Add automation KPIs to SCOREBOARD: "hours saved/week automated" as tracked metric
5. After Phase 1 live: measure actual hours saved vs. estimates; recalibrate Phase 2 scope

## Risks/Unknowns
- CRM tool not yet finalized — Zapier/Make integrations depend on CRM choice (see TOOL_STACK_RECOMMENDATION.md)
- Email deliverability (domain warm-up) must be confirmed before sequence automation goes live
- PDF generation (Automation #7) requires REV_UX_UI_DESIGNER to finalize slide template first
- Clay/Apollo enrichment costs can escalate at scale — confirm lead volume before committing to paid tier
