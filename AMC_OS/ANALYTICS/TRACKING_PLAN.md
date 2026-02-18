# AMC EVENT TRACKING PLAN
**Owner:** REV_DATA_ENGINEER + REV_ANALYTICS_ENGINEER  
**Version:** 1.0 | **Date:** 2026-02-18  
**Lever:** A (Pipeline) + B (Conversion)  
**Peer Review Required By:** REV_TECH_LEAD

---

## Purpose

Every tracked event is evidence. This plan instruments every meaningful user action across the AMC funnel so the team can measure where deals are created, where they stall, and what interventions move the needle toward the $5,000 cash collection goal.

**Funnel stages covered:** Visitor → Lead → SQL → Proposal → Closed

---

## Tracking Stack

| Tool | Role | Primary Use |
|---|---|---|
| **GA4** | Web analytics | Landing page traffic, CTA clicks, form starts/submits |
| **Mixpanel** | Product analytics | Intake flow, scorecard views, report interactions |
| **HubSpot (CRM)** | Pipeline + deal data | Stage changes, deal properties, activity logging |
| **Instantly.ai / Apollo** | Email outreach | Sends, opens, clicks, replies |
| **Calendly** | Call scheduling | Booking events, cancellations, no-shows |
| **Notion / Google Drive** | Proposal + report delivery | File opens (link tracking via Documint or Notion analytics) |
| **Slack / Email** | Internal alerts | Threshold breach notifications |

**Data warehouse target:** Push all events to a single Airtable base (or BigQuery as volume scales) for unified funnel view.

---

## FUNNEL STAGE 1 — VISITOR

> Trigger: Any person arrives at AMC landing page or any AMC web property.

---

### Event: `page_viewed`

| Field | Value |
|---|---|
| **Event Name** | `page_viewed` |
| **Trigger** | User loads any page on AMC web property |
| **Properties** | `page_url`, `page_title`, `referrer_url`, `referrer_source` (organic/direct/email/paid/social), `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `session_id`, `device_type` (mobile/desktop/tablet), `country`, `timestamp` |
| **Tool** | GA4 (automatic) |
| **Owner** | REV_DATA_ENGINEER |
| **Notes** | Configure GA4 enhanced measurement for all page views. UTM parameters must be preserved throughout session. |

---

### Event: `cta_clicked`

| Field | Value |
|---|---|
| **Event Name** | `cta_clicked` |
| **Trigger** | User clicks any call-to-action button on the landing page |
| **Properties** | `cta_label` (e.g., "Book a Call", "Get Your Scorecard", "See How It Works"), `cta_location` (hero/mid-page/footer/sticky-bar), `page_url`, `session_id`, `referrer_source`, `timestamp` |
| **Tool** | GA4 (custom event via GTM) |
| **Owner** | REV_DATA_ENGINEER |
| **Notes** | Every button that initiates a conversion action must be tagged. Label maps to LANDING_PAGE_COPY.md button text exactly. |

---

### Event: `scroll_depth_reached`

| Field | Value |
|---|---|
| **Event Name** | `scroll_depth_reached` |
| **Trigger** | User scrolls to 25%, 50%, 75%, 90% of page height |
| **Properties** | `depth_percentage` (25/50/75/90), `page_url`, `session_id`, `time_on_page_seconds`, `timestamp` |
| **Tool** | GA4 (enhanced measurement — scroll) |
| **Owner** | REV_DATA_ENGINEER |
| **Notes** | Used to measure engagement quality. If 90% scroll rate is low, content above fold is not pulling readers down. |

---

### Event: `video_interaction`

| Field | Value |
|---|---|
| **Event Name** | `video_interaction` |
| **Trigger** | User plays, pauses, or completes an embedded video (if applicable) |
| **Properties** | `action` (play/pause/complete), `video_title`, `video_percent_watched`, `page_url`, `session_id`, `timestamp` |
| **Tool** | GA4 (YouTube embed tracking or custom) |
| **Owner** | REV_DATA_ENGINEER |
| **Notes** | Track completion rate. <30% completion = video is losing viewers early. |

---

## FUNNEL STAGE 2 — LEAD

> Trigger: Visitor initiates contact (form, email reply, direct message, call booking).

---

### Event: `intake_form_started`

| Field | Value |
|---|---|
| **Event Name** | `intake_form_started` |
| **Trigger** | User opens or focuses on the first field of the intake questionnaire |
| **Properties** | `form_id`, `form_name` ("Compass Sprint Intake"), `source_cta` (which CTA led here), `session_id`, `referrer_source`, `timestamp` |
| **Tool** | GA4 + Mixpanel |
| **Owner** | REV_DATA_ENGINEER |
| **Notes** | Compare `intake_form_started` vs `intake_form_submitted` to measure form completion rate. Target: >65% completion. |

---

### Event: `intake_form_field_completed`

| Field | Value |
|---|---|
| **Event Name** | `intake_form_field_completed` |
| **Trigger** | User completes and exits any form field |
| **Properties** | `field_name` (company_name, team_size, ai_use_case, current_maturity_stage, etc.), `field_index`, `form_id`, `session_id`, `timestamp` |
| **Tool** | Mixpanel |
| **Owner** | REV_DATA_ENGINEER |
| **Notes** | Enables drop-off analysis at field level. If users consistently abandon at field N, that field is friction. Do not log field values (PII risk). |

---

### Event: `intake_form_submitted`

| Field | Value |
|---|---|
| **Event Name** | `intake_form_submitted` |
| **Trigger** | User successfully submits intake questionnaire |
| **Properties** | `form_id`, `company_name` (for CRM join — not PII in analytics), `company_size_bucket` (1–10/11–50/51–200/201+), `icp_segment` (AI-First/SaaS-Copilot/Agency — determined by routing logic), `referrer_source`, `utm_campaign`, `session_id`, `timestamp` |
| **Tool** | GA4 (conversion goal) + Mixpanel + HubSpot (contact created) |
| **Owner** | REV_DATA_ENGINEER + REV_REVOPS_CRM |
| **Notes** | This is the primary conversion event from visitor → lead. Must fire a HubSpot contact creation webhook simultaneously. ICP segment auto-tagged based on answers. |

---

### Event: `email_sent` *(outbound)*

| Field | Value |
|---|---|
| **Event Name** | `email_sent` |
| **Trigger** | Outbound email dispatched from Instantly.ai or Apollo sequence |
| **Properties** | `lead_id` (CRM), `sequence_name`, `sequence_step` (1/2/3/…), `email_subject`, `icp_segment`, `sender_persona`, `timestamp` |
| **Tool** | Instantly.ai / Apollo (native) → exported to HubSpot |
| **Owner** | REV_REVOPS_CRM |
| **Notes** | All outbound sequences must log sends to HubSpot contact activity. Required for pipeline attribution. |

---

### Event: `email_opened`

| Field | Value |
|---|---|
| **Event Name** | `email_opened` |
| **Trigger** | Recipient opens outbound email (pixel fire) |
| **Properties** | `lead_id`, `sequence_name`, `sequence_step`, `email_subject`, `icp_segment`, `open_count` (1st/2nd/3rd open), `timestamp` |
| **Tool** | Instantly.ai / Apollo → HubSpot |
| **Owner** | REV_REVOPS_CRM |
| **Notes** | Multiple opens of the same email (open_count > 1) are a buying signal. Flag to SDR for timely follow-up. |

---

### Event: `email_link_clicked`

| Field | Value |
|---|---|
| **Event Name** | `email_link_clicked` |
| **Trigger** | Recipient clicks a tracked link inside an outbound email |
| **Properties** | `lead_id`, `sequence_name`, `sequence_step`, `link_label` (e.g., "Book a Call", "See the Sprint"), `link_url`, `icp_segment`, `timestamp` |
| **Tool** | Instantly.ai / Apollo → HubSpot |
| **Owner** | REV_REVOPS_CRM |
| **Notes** | Higher intent signal than open. Triggers SDR follow-up task in HubSpot within 2 hours. |

---

### Event: `email_replied`

| Field | Value |
|---|---|
| **Event Name** | `email_replied` |
| **Trigger** | Prospect replies to outbound email (any reply, including OOO) |
| **Properties** | `lead_id`, `sequence_name`, `sequence_step`, `reply_sentiment` (positive/neutral/negative/OOO — manually or AI-tagged), `icp_segment`, `timestamp` |
| **Tool** | Instantly.ai / Apollo → HubSpot (activity log) |
| **Owner** | REV_SDR_SMB / REV_SDR_MIDMARKET / REV_SDR_AGENCY |
| **Notes** | Positive reply = lead moves to "Replied — Positive" stage. Reply sentiment tagging must happen within 4 hours. |

---

### Event: `linkedin_connection_sent`

| Field | Value |
|---|---|
| **Event Name** | `linkedin_connection_sent` |
| **Trigger** | SDR sends LinkedIn connection request to a target |
| **Properties** | `lead_id`, `icp_segment`, `personalization_note` (yes/no), `timestamp` |
| **Tool** | HubSpot (manual CRM log) |
| **Owner** | REV_SDR_MIDMARKET |
| **Notes** | Must be logged in HubSpot activity. Do not use automation tools that violate LinkedIn ToS. |

---

### Event: `linkedin_message_sent`

| Field | Value |
|---|---|
| **Event Name** | `linkedin_message_sent` |
| **Trigger** | SDR sends a direct message via LinkedIn |
| **Properties** | `lead_id`, `message_type` (connection-note/direct-DM/InMail), `sequence_step`, `icp_segment`, `timestamp` |
| **Tool** | HubSpot (manual CRM log) |
| **Owner** | REV_SDR_MIDMARKET |
| **Notes** | LinkedIn messages are high-intent touches. Log all interactions to protect against compliance risk. |

---

## FUNNEL STAGE 3 — SQL (Sales Qualified Lead)

> Trigger: Lead meets qualification criteria and is accepted by AE for active sales engagement.

---

### Event: `call_booked`

| Field | Value |
|---|---|
| **Event Name** | `call_booked` |
| **Trigger** | Prospect books a discovery or qualification call via Calendly |
| **Properties** | `lead_id`, `booking_source` (email-link/landing-page/linkedin-DM/referral), `call_type` (discovery/demo/follow-up), `scheduled_datetime`, `icp_segment`, `sequence_step_at_booking`, `time_to_book_from_first_touch_hours`, `timestamp` |
| **Tool** | Calendly (native webhook) → HubSpot + GA4 (conversion goal) |
| **Owner** | REV_REVOPS_CRM |
| **Notes** | Calendly webhook must fire to HubSpot to update lead stage to "Call Booked." Time-to-book is a key velocity metric. |

---

### Event: `call_reminder_sent`

| Field | Value |
|---|---|
| **Event Name** | `call_reminder_sent` |
| **Trigger** | Automated reminder email/SMS sent to prospect before booked call |
| **Properties** | `lead_id`, `reminder_type` (24hr/1hr), `channel` (email/sms), `call_scheduled_datetime`, `timestamp` |
| **Tool** | Calendly (native) + HubSpot |
| **Owner** | REV_REVOPS_CRM |
| **Notes** | Both 24-hour and 1-hour reminders required. Tracks whether reminder sequence is firing correctly. |

---

### Event: `call_completed`

| Field | Value |
|---|---|
| **Event Name** | `call_completed` |
| **Trigger** | Discovery/qualification call is held (AE manually marks in HubSpot after call) |
| **Properties** | `lead_id`, `call_type`, `call_duration_minutes`, `outcome` (qualified/not-qualified/no-show/rescheduled), `icp_segment`, `pain_points_captured` (tags from call notes), `next_step` (proposal/follow-up/nurture/disqualify), `AE_owner`, `timestamp` |
| **Tool** | HubSpot (manual entry via call log) |
| **Owner** | REV_ACCOUNT_EXEC_CLOSER |
| **Notes** | Required within 1 hour of call end. `outcome` = "qualified" advances deal to SQL stage and triggers proposal prep task. |

---

### Event: `lead_stage_changed`

| Field | Value |
|---|---|
| **Event Name** | `lead_stage_changed` |
| **Trigger** | CRM deal stage is updated by AE or system automation |
| **Properties** | `lead_id`, `deal_id`, `from_stage`, `to_stage`, `stage_change_reason` (free text), `icp_segment`, `AE_owner`, `deal_value`, `timestamp` |
| **Tool** | HubSpot (native lifecycle stage tracking + property change webhook) |
| **Owner** | REV_REVOPS_CRM |
| **Notes** | Stage sequence: New → Contacted → Replied → Call Booked → SQL → Proposal Sent → Negotiation → Closed Won / Closed Lost. Every stage change auto-logged. |

---

### Event: `call_no_show`

| Field | Value |
|---|---|
| **Event Name** | `call_no_show` |
| **Trigger** | Prospect does not attend booked call |
| **Properties** | `lead_id`, `call_scheduled_datetime`, `icp_segment`, `reminders_sent_count`, `sequence_step_at_booking`, `timestamp` |
| **Tool** | Calendly + HubSpot |
| **Owner** | REV_REVOPS_CRM |
| **Notes** | Triggers an automated "missed you" follow-up sequence (3 steps). Track no-show rate by ICP segment and reminder configuration. |

---

## FUNNEL STAGE 4 — PROPOSAL

> Trigger: AE creates and sends proposal/SOW to qualified prospect.

---

### Event: `proposal_created`

| Field | Value |
|---|---|
| **Event Name** | `proposal_created` |
| **Trigger** | AE generates proposal document (from SOW template) in Notion / Google Docs |
| **Properties** | `deal_id`, `lead_id`, `proposal_type` (Compass-Sprint/Retainer/Custom), `deal_value`, `icp_segment`, `AE_owner`, `days_since_first_touch`, `timestamp` |
| **Tool** | HubSpot (deal property update — manual) |
| **Owner** | REV_PROPOSAL_SOW_SPECIALIST |
| **Notes** | Proposal must pass QA checklist before sending. Creation timestamp starts the "proposal-to-close" clock. |

---

### Event: `proposal_sent`

| Field | Value |
|---|---|
| **Event Name** | `proposal_sent` |
| **Trigger** | Proposal document link emailed or shared with prospect |
| **Properties** | `deal_id`, `lead_id`, `proposal_url` (tracked link), `send_channel` (email/direct-share), `deal_value`, `icp_segment`, `AE_owner`, `timestamp` |
| **Tool** | HubSpot (deal stage update) + Documint / Notion link tracking |
| **Owner** | REV_ACCOUNT_EXEC_CLOSER |
| **Notes** | Proposal URL must use a trackable link (bit.ly + UTM or Notion analytics). Fires `proposal_sent` conversion in GA4. |

---

### Event: `proposal_viewed`

| Field | Value |
|---|---|
| **Event Name** | `proposal_viewed` |
| **Trigger** | Prospect opens the proposal link |
| **Properties** | `deal_id`, `lead_id`, `view_count` (1st/2nd/3rd+), `view_duration_seconds`, `icp_segment`, `time_since_sent_hours`, `timestamp` |
| **Tool** | Notion analytics / Documint / DocSend (link-level tracking) |
| **Owner** | REV_DATA_ENGINEER |
| **Notes** | First view within 24 hours of send = high engagement signal. Multiple views (view_count > 2) = decision-in-progress. Triggers AE follow-up nudge. |

---

### Event: `proposal_follow_up_sent`

| Field | Value |
|---|---|
| **Event Name** | `proposal_follow_up_sent` |
| **Trigger** | AE sends follow-up communication after proposal delivery |
| **Properties** | `deal_id`, `lead_id`, `follow_up_channel` (email/phone/linkedin), `follow_up_number` (1st/2nd/3rd), `days_since_proposal_sent`, `timestamp` |
| **Tool** | HubSpot (activity log) |
| **Owner** | REV_ACCOUNT_EXEC_CLOSER |
| **Notes** | Follow-up cadence: Day 2, Day 5, Day 9 after proposal sent. Log each one. |

---

### Event: `objection_raised`

| Field | Value |
|---|---|
| **Event Name** | `objection_raised` |
| **Trigger** | Prospect raises a specific objection during proposal review call or email |
| **Properties** | `deal_id`, `lead_id`, `objection_category` (price/timing/scope/authority/need/trust), `objection_verbatim` (short quote), `icp_segment`, `AE_owner`, `timestamp` |
| **Tool** | HubSpot (deal note + custom property) |
| **Owner** | REV_ACCOUNT_EXEC_CLOSER |
| **Notes** | Feed to REV_OBJECTION_COACH weekly for playbook updates. Price and timing are expected top objections for $5k offer. |

---

## FUNNEL STAGE 5 — CLOSED

> Trigger: Deal reaches a terminal stage (Won or Lost).

---

### Event: `deal_won`

| Field | Value |
|---|---|
| **Event Name** | `deal_won` |
| **Trigger** | AE marks deal as Closed Won in HubSpot |
| **Properties** | `deal_id`, `lead_id`, `deal_value`, `icp_segment`, `source_channel` (outbound/inbound/referral), `AE_owner`, `days_in_pipeline` (first touch to close), `proposal_to_close_days`, `discount_applied` (yes/no, % if yes), `contract_type` (Sprint/Retainer/Custom), `timestamp` |
| **Tool** | HubSpot (native) → GA4 (conversion) → Finance tracker |
| **Owner** | REV_ACCOUNT_EXEC_CLOSER + REV_REVOPS_CRM |
| **Notes** | Fires "revenue" conversion event in GA4 with `value` parameter = deal_value. Triggers invoice creation task + CSM onboarding sequence. |

---

### Event: `deal_lost`

| Field | Value |
|---|---|
| **Event Name** | `deal_lost` |
| **Trigger** | AE marks deal as Closed Lost in HubSpot |
| **Properties** | `deal_id`, `lead_id`, `deal_value`, `icp_segment`, `loss_reason` (price/timing/competitor/no-decision/budget-frozen/scope-fit/other), `loss_stage` (which stage deal died in), `AE_owner`, `timestamp` |
| **Tool** | HubSpot (native, required field on stage change) |
| **Owner** | REV_ACCOUNT_EXEC_CLOSER |
| **Notes** | `loss_reason` is a required field — AE cannot move to Closed Lost without selecting one. Loss reason data feeds win/loss analysis and objection coach. |

---

### Event: `contract_signed`

| Field | Value |
|---|---|
| **Event Name** | `contract_signed` |
| **Trigger** | Client countersigns SOW (electronic signature service or email confirmation) |
| **Properties** | `deal_id`, `lead_id`, `contract_type`, `deal_value`, `payment_terms` (70-30/full-upfront/other), `signature_method` (DocuSign/HelloSign/email-confirm), `timestamp` |
| **Tool** | DocuSign / HelloSign → HubSpot webhook |
| **Owner** | REV_LEGAL_CONTRACTS + REV_REVOPS_CRM |
| **Notes** | No sprint delivery begins without this event logged in HubSpot (see SPRINT_DELIVERY_SOP.md PRE-SPRINT GATE). |

---

### Event: `invoice_sent`

| Field | Value |
|---|---|
| **Event Name** | `invoice_sent` |
| **Trigger** | Finance sends invoice to client |
| **Properties** | `deal_id`, `invoice_id`, `invoice_amount`, `invoice_type` (upfront-70pct/final-30pct/retainer), `due_date`, `payment_method_requested` (bank-transfer/card/other), `timestamp` |
| **Tool** | Accounting tool (QuickBooks / FreshBooks) → HubSpot activity |
| **Owner** | REV_CFO_FINANCE |
| **Notes** | Required for DSO calculation. |

---

### Event: `payment_received`

| Field | Value |
|---|---|
| **Event Name** | `payment_received` |
| **Trigger** | Cash hits AMC bank account |
| **Properties** | `deal_id`, `invoice_id`, `amount_collected`, `payment_date`, `days_to_pay` (invoice_sent → payment_received), `icp_segment`, `contract_type`, `cumulative_collected_total`, `timestamp` |
| **Tool** | Accounting tool → manual log in HubSpot + SCOREBOARD.md |
| **Owner** | REV_CFO_FINANCE |
| **Notes** | **This is the north-star event.** When `cumulative_collected_total` ≥ $5,000, sprint goal is achieved. Alert to entire org via Slack. |

---

## POST-CLOSE / DELIVERY EVENTS

---

### Event: `sprint_kickoff_held`

| Field | Value |
|---|---|
| **Event Name** | `sprint_kickoff_held` |
| **Trigger** | Day 1 kickoff call completed with client |
| **Properties** | `deal_id`, `client_id`, `sprint_day` (1), `stakeholder_count`, `evidence_completeness_pct`, `timestamp` |
| **Tool** | HubSpot (activity log) |
| **Owner** | REV_IMPLEMENTATION_SPECIALIST |

---

### Event: `scorecard_delivered`

| Field | Value |
|---|---|
| **Event Name** | `scorecard_delivered` |
| **Trigger** | Final scored report/scorecard shared with client |
| **Properties** | `deal_id`, `client_id`, `overall_maturity_score`, `dimensions_scored_count`, `confidence_level`, `delivery_day` (which sprint day), `timestamp` |
| **Tool** | HubSpot (activity log) |
| **Owner** | REV_IMPLEMENTATION_SPECIALIST |

---

### Event: `readout_call_held`

| Field | Value |
|---|---|
| **Event Name** | `readout_call_held` |
| **Trigger** | Day 5 readout call completed with client |
| **Properties** | `deal_id`, `client_id`, `call_duration_minutes`, `executive_attendees` (count), `retainer_interest` (yes/no/maybe), `next_step` (retainer-proposal/30d-checkin/none), `timestamp` |
| **Tool** | HubSpot (activity log) |
| **Owner** | REV_IMPLEMENTATION_SPECIALIST + REV_CUSTOMER_SUCCESS_MANAGER |

---

### Event: `retainer_upsell_proposed`

| Field | Value |
|---|---|
| **Event Name** | `retainer_upsell_proposed` |
| **Trigger** | Retainer proposal sent after sprint completion |
| **Properties** | `deal_id`, `client_id`, `retainer_value_monthly`, `days_since_readout`, `timestamp` |
| **Tool** | HubSpot |
| **Owner** | REV_ACCOUNT_MANAGER_EXPANSION |

---

## FUNNEL OVERVIEW — EVENT MAP

```
VISITOR
  │
  ├─ page_viewed
  ├─ cta_clicked
  ├─ scroll_depth_reached
  └─ video_interaction
         │
         ▼
LEAD
  │
  ├─ intake_form_started
  ├─ intake_form_field_completed
  ├─ intake_form_submitted ◄── Lead created in HubSpot
  ├─ email_sent (outbound)
  ├─ email_opened
  ├─ email_link_clicked
  ├─ email_replied
  ├─ linkedin_connection_sent
  └─ linkedin_message_sent
         │
         ▼
SQL
  │
  ├─ call_booked ◄── Lead becomes SQL
  ├─ call_reminder_sent
  ├─ call_completed (outcome: qualified)
  ├─ call_no_show
  └─ lead_stage_changed
         │
         ▼
PROPOSAL
  │
  ├─ proposal_created
  ├─ proposal_sent ◄── Deal advances to Proposal Sent
  ├─ proposal_viewed
  ├─ proposal_follow_up_sent
  └─ objection_raised
         │
         ▼
CLOSED
  │
  ├─ deal_won / deal_lost ◄── Terminal stage
  ├─ contract_signed
  ├─ invoice_sent
  └─ payment_received ◄── NORTH STAR EVENT ($5k collected)
         │
         ▼
DELIVERY
  │
  ├─ sprint_kickoff_held
  ├─ scorecard_delivered
  ├─ readout_call_held
  └─ retainer_upsell_proposed
```

---

## NAMING CONVENTION

All event names follow `snake_case` noun-verb format: `{object}_{action}`.

**Object examples:** `page`, `cta`, `intake_form`, `email`, `call`, `proposal`, `deal`, `contract`, `invoice`, `payment`, `sprint`, `scorecard`, `readout`, `retainer`

**Action examples:** `viewed`, `clicked`, `started`, `submitted`, `sent`, `opened`, `booked`, `completed`, `changed`, `created`, `won`, `lost`, `signed`, `received`, `held`, `delivered`, `proposed`

---

## IMPLEMENTATION CHECKLIST

- [ ] GA4 property created with correct data stream + enhanced measurement on
- [ ] GTM container deployed on landing page with CTA click tags
- [ ] HubSpot pipeline stages match funnel stages above (New → Closed Won/Lost)
- [ ] HubSpot custom properties created: `icp_segment`, `loss_reason`, `sequence_step_at_booking`, `reply_sentiment`
- [ ] Calendly → HubSpot webhook configured and tested
- [ ] Instantly.ai / Apollo → HubSpot integration active (send/open/click/reply sync)
- [ ] Proposal URL tracking active (Notion analytics or DocSend)
- [ ] Accounting tool → HubSpot `payment_received` activity configured
- [ ] GA4 conversion goals set for: `intake_form_submitted`, `call_booked`, `proposal_sent`, `deal_won`, `payment_received`
- [ ] Slack alert configured for `payment_received` (cumulative ≥ $5k threshold)

---

## PRIVACY + COMPLIANCE

- No PII (email addresses, full names, phone numbers) in analytics event properties. Use `lead_id` (CRM internal ID) as the join key.
- Form field values are never logged in analytics. Only metadata (field name, completion status).
- All email tracking (open pixel) compliant with CAN-SPAM / GDPR requirements. Unsubscribe link required in all outbound sequences.
- LinkedIn activities are manual-log only. No automation that violates LinkedIn ToS.
- Proposal view tracking uses opt-in link-based analytics (no aggressive fingerprinting).

---

## Files Created/Updated
- `AMC_OS/ANALYTICS/TRACKING_PLAN.md` (this file)

## Acceptance Checks
- Every funnel stage (Visitor/Lead/SQL/Proposal/Closed) has ≥3 tracked events ✅
- Every event has: name, properties, trigger, tool, owner ✅
- PII handling and compliance notes present ✅
- Funnel event map provides visual flow ✅
- Implementation checklist enables setup by a non-author engineer ✅
- North-star event (`payment_received`) explicitly called out ✅

## Next Actions
1. REV_TECH_LEAD: review implementation checklist and assign GTM/HubSpot setup tasks
2. REV_REVOPS_CRM: create the 9 required HubSpot pipeline stages and custom properties listed above
3. REV_DATA_ENGINEER: set up GA4 conversion goals and test event firing via GA4 DebugView
4. REV_ANALYTICS_ENGINEER: build unified funnel view in Airtable (or BigQuery) joining GA4 + HubSpot + Calendly
5. Wire `payment_received` Slack alert before first proposal is sent

## Risks/Unknowns
- Proposal view tracking quality depends on tool selection (DocSend preferred over Notion for precise metrics)
- Email open rates are unreliable indicators (Apple Mail Privacy Protection inflates opens); weight clicks and replies more heavily
- HubSpot → analytics pipeline requires data engineering time before clean funnel analysis is available
- LinkedIn manual-log discipline depends on SDR compliance; automate reminders or build audit cadence
