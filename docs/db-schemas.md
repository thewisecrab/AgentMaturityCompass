# AMC SQLite Database Schemas

All AMC databases use `better-sqlite3` with WAL mode. Tables are created inline via `CREATE TABLE IF NOT EXISTS` — no separate migration files needed.

## Ledger Database (`.amc/ledger.sqlite`)

**Source:** `src/ledger/ledger.ts`

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `evidence_events` | Append-only event log | id, ts, session_id, runtime, event_type, payload_path, payload_inline, payload_sha256, meta_json, prev_event_hash, event_hash, writer_sig |
| `sessions` | Agent execution sessions | id, started_at, sealed_at, runtime, binary_path, binary_sha256 |
| `runs` | Diagnostic scan runs | id, ts, target_name, window, report_json, report_sha256, sig |
| `schema_meta` | Schema version tracking | key, value |
| `assurance_runs` | Red-team test runs | id, ts, pack_name, agent_id, report_json, report_sha256, sig |
| `outcome_events` | Outcome tracking events | id, ts, contract_id, event_type, payload_json, sha256, sig |
| `outcome_contracts` | Outcome contract definitions | id, ts, name, spec_json, sha256, sig |
| `claims` | Agent claims with lifecycle | id, ts, agent_id, text, confidence, domain, status, evidence_refs_json, sha256, sig |
| `claim_transitions` | Claim state transitions | id, claim_id, ts, from_status, to_status, reason, actor, sig |
| `schema_migrations` | Migration tracking | version, applied_at |

## Corrections Database (`.amc/corrections.sqlite`)

**Source:** `src/corrections/correctionStore.ts`

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `corrections` | Correction events | id, ts, agent_id, question_ids_json, before_json, after_json, trigger, status, effectiveness_score, verified_at |

## Correction Lessons (`.amc/correction_lessons.sqlite`)

**Source:** `src/learning/correctionMemory.ts`

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `correction_lessons` | Verified lessons from corrections | lesson_id, correction_id, agent_id, question_ids_json, lesson_text, advisory_severity, injection_count, last_injected_ts, post_injection_run_ids_json, avg_improvement, drift_detected |

## Host Database (`.amc/host.sqlite`)

**Source:** `src/workspaces/hostDb.ts`

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | User accounts | id, email, name, role, provider, provider_id, mfa_enrolled, created_at, last_login |
| `workspaces` | Workspace registry | id, name, path, owner_id, created_at |
| `memberships` | User-workspace memberships | id, user_id, workspace_id, role, created_at |
| `host_audit` | Admin audit log | id, ts, actor_id, action, detail_json |
| `host_sessions` | Active sessions | id, user_id, workspace_id, token_hash, ip, user_agent, created_at, expires_at, revoked |
| `membership_sources` | SSO/SCIM sources | id, membership_id, source_type, source_id, synced_at |
| `scim_groups` | SCIM group definitions | id, display_name, external_id, created_at |
| `scim_group_members` | SCIM group membership | id, group_id, user_id, added_at |

## Scratchpad (`.amc/scratchpad.sqlite`)

**Source:** `src/product/scratchpad.ts`

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `scratchpad_entries` | Working memory entries | id, agent_id, key, value, created_at, updated_at |

## Prompt Modules (`.amc/prompt_modules.sqlite`)

**Source:** `src/product/promptModules.ts`

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `pm_modules` | Reusable prompt components | id, name, module_type, content, created_at |
| `pm_versions` | Composed prompt versions | id, composed_text, label, created_at |

## Claims Governance (`.amc/claim_governance.sqlite`)

**Source:** `src/claims/governanceLineage.ts`

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `claim_transparency_links` | Claim-to-transparency-log links | id, claim_id, transparency_hash, linked_at, link_type |
| `policy_change_intents` | Policy change proposals | id, ts, policy_type, current_hash, proposed_hash, reason, author, status, approved_at, approver, applied_at, applied_hash |
| `claim_policy_links` | Claim-to-policy links | id, claim_id, policy_intent_id, linked_at |

## Guard Events (`.amc/guard_events.sqlite`)

**Source:** `src/enforce/evidenceEmitter.ts`

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `amc_guard_events` | Policy enforcement events | id, ts, rule_id, action, tool, decision, confidence, context_json, session_id |

## Incidents (`.amc/incidents.sqlite`)

**Source:** `src/incidents/incidentStore.ts`

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `incidents` | Incident records | id, ts, severity, title, description, status, assignee, resolved_at |
| `incident_transitions` | Status transitions | id, incident_id, ts, from_status, to_status, actor, reason |
| `causal_edges` | Causal relationships between incidents | id, from_incident_id, to_incident_id, relationship, confidence |

## Product Queues (`.amc/amc_product_queues.db`)

**Source:** `src/product/batchProcessor.ts`, `src/product/portal.ts`, `src/product/personalizedOutput.ts`

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `batches` | Batch job definitions | batch_id, name, status, concurrency_limit, priority, metadata, created_at, started_at, completed_at |
| `batch_items` | Individual items in batches | item_id, batch_id, seq, payload, status, worker_id, result, error, claimed_at, completed_at |
| `portal_jobs` | Portal job submissions | job_id, tenant_id, submitter_id, job_type, title, payload, status, priority, progress_pct, progress_message, created_at, started_at, completed_at |
| `portal_progress_events` | Job progress history | event_id, job_id, progress_pct, message, details, timestamp |
| `portal_result_files` | Job result files | file_id, job_id, filename, content_type, storage_ref, size_bytes, created_at |
| `output_style_profiles` | Personalized output style profiles | profile_id, tenant_id, recipient_id, tone, length, format, avoid_words, prefer_words, salutation, sign_off, created_at |
| `output_style_applications` | Style application history | application_id, profile_id, input_length, output_length, transformations, created_at |

## Bundle Database (portable `.amcbundle` files)

**Source:** `src/bundles/bundle.ts`

Contains portable copies of: `evidence_events`, `sessions`, `runs`, `schema_meta`, `assurance_runs`, `outcome_events`, `outcome_contracts`, `schema_migrations`.
