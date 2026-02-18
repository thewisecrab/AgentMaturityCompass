# Compass Sprint in a Box — Prototype Spec (MVP)

## 1) What it does (3 sentences)
Compass Sprint in a Box is a lightweight web app that lets an AI/Ops lead run a first maturity assessment across 7 domains, attach evidence, and generate an auditable baseline score. It converts rubric responses plus evidence confidence (coverage, freshness, verification) into a domain-level and overall maturity score with clear gaps. It then auto-produces a ranked action scorecard (owner + due date + impact/confidence/effort) so a CTO/CISO/COO can make immediate resourcing decisions.

## 2) User flow (5 steps max)
1. **Create sprint**: User starts a new assessment cycle (workspace, scope, target date).
2. **Answer rubric**: User completes guided questions/control checks across the 7 maturity domains.
3. **Attach evidence**: User uploads/link-tags artifacts per control and sets verification state (draft/submitted/verified).
4. **Review & score**: System computes domain + overall score, plus confidence decomposition (coverage/freshness/verification).
5. **Generate action plan**: User gets top prioritized remediation actions with owner, due date, and exportable scorecard.

## 3) Tech stack (weekend-buildable)
- **Frontend/App**: Next.js (App Router) + TypeScript + Tailwind
- **Auth & DB**: Supabase Auth + Postgres (row-level security)
- **Storage**: Supabase Storage for evidence files
- **Backend logic**: Next.js server actions / API routes for scoring + roadmap generation
- **Hosting**: Vercel (web) + Supabase (managed backend)
- **Optional speed-ups**: shadcn/ui for fast UI components, Zustand for simple client state

## 4) Data model (3–5 tables)

### A. `assessments`
- `id` (uuid, pk)
- `workspace_id` (uuid)
- `name` (text)
- `status` (enum: draft/submitted/reviewed/final)
- `started_at` (timestamp)
- `published_at` (timestamp, nullable)
- `overall_score` (numeric, nullable)
- `overall_confidence` (numeric, nullable)

### B. `controls`
- `id` (uuid, pk)
- `domain` (enum: governance/security/reliability/evaluation/observability/cost/operating_model)
- `control_code` (text)
- `prompt` (text)
- `weight` (numeric)
- `version` (text)

### C. `responses`
- `id` (uuid, pk)
- `assessment_id` (uuid, fk -> assessments)
- `control_id` (uuid, fk -> controls)
- `maturity_rating` (int, e.g., 0–5)
- `notes` (text)
- `confidence_override` (numeric, nullable)
- `updated_by` (uuid)
- `updated_at` (timestamp)

### D. `evidence_artifacts`
- `id` (uuid, pk)
- `assessment_id` (uuid, fk -> assessments)
- `control_id` (uuid, fk -> controls)
- `file_path` (text) / `url` (text)
- `artifact_type` (text)
- `verification_status` (enum: draft/submitted/verified/rejected)
- `captured_at` (timestamp)
- `expires_at` (timestamp, nullable)

### E. `action_items`
- `id` (uuid, pk)
- `assessment_id` (uuid, fk -> assessments)
- `domain` (enum)
- `title` (text)
- `impact` (int 1–5)
- `effort` (int 1–5)
- `confidence` (int 1–5)
- `priority_score` (numeric)
- `owner` (text)
- `due_date` (date)
- `status` (enum: open/in_progress/done)

## 5) How it generates the scorecard (the money moment)
**Computation approach (transparent and auditable):**
1. For each control, compute `control_score = maturity_rating (0–5) * control_weight`.
2. Compute evidence confidence per control as weighted blend:
   - `coverage` (has evidence linked?)
   - `freshness` (artifact age within threshold?)
   - `verification` (verified > submitted > draft)
3. Apply confidence adjustment to avoid inflated claims:  
   `adjusted_control = control_score * confidence_factor` (e.g., 0.5–1.0 range).
4. Aggregate adjusted controls into domain scores, then weighted overall index.
5. Create remediation actions from lowest adjusted controls; rank by:  
   `priority_score = (impact * confidence) / effort` (plus urgency boost for stale/missing evidence).

**Why it closes deals:** in one screen, leadership sees “current maturity, trust in the data, and exactly what to fund next.”

## 6) What a buyer sees in a 2-minute demo
- **00:00–00:30**: New assessment created; 7-domain progress view appears.
- **00:30–01:00**: Two controls answered; evidence uploaded and marked submitted/verified.
- **01:00–01:25**: Click “Generate Scorecard” and instantly show domain bars + overall index + confidence split.
- **01:25–01:50**: Show top 10 prioritized actions with owner/due date and rationale from evidence gaps.
- **01:50–02:00**: Export/share-ready summary (score + confidence + action plan) for exec review.

## 7) What to skip in v1
- Full custom policy/regulatory framework builder
- Deep third-party integrations for automated evidence ingestion
- Advanced benchmarking/cohort analytics
- Complex role matrix and enterprise SSO/SCIM
- Heavy workflow automation (notifications/escalation rules beyond basics)
- AI-generated legal/compliance guarantees

---

### Files created/updated
- `AMC_OS/ENGINEERING/PROTOTYPE_SPEC.md`

### Acceptance checks
- Spec includes all 7 requested sections in order.
- MVP aligns to PRODUCT_DEFINITION principles: evidence-backed scoring, confidence, actionability, speed to baseline.
- Data model stays within 5 core tables and supports end-to-end assessment → scorecard flow.

### Next actions
1. Convert this spec into a clickable wireframe (3–5 screens).
2. Create SQL migrations for the 5-table schema in Supabase.
3. Implement scoring function and test with seed data.
4. Prepare a scripted 2-minute demo dataset.

### Risks/unknowns
- Exact control rubric content/weights may need calibration by domain experts.
- Confidence weighting thresholds (freshness windows, status multipliers) need initial defaults.
- Owner assignment may require integration with existing org directory later.
