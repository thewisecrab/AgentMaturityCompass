# AMC Full Validation Report v3
Generated: 2026-02-18 23:21:37 UTC
Elapsed: 20.2s

## Summary
- **Total checks:** 26
- **Passed:** 26
- **Failed:** 0
- **Status:** ✅ ALL PASS

## Results
| Check | Status | Detail |
|-------|--------|--------|
| pytest_full_suite | ✅ | 1600 passed, 4 warnings in 15.21s |
| imports_amc.product | ✅ | 81 modules |
| imports_amc.shield | ✅ | 16 modules |
| imports_amc.enforce | ✅ | 35 modules |
| imports_amc.vault | ✅ | 14 modules |
| imports_amc.watch | ✅ | 10 modules |
| imports_amc.score | ✅ | 2 modules |
| shield_s1_analyzer | ✅ | clean_findings=0 |
| shield_s10_detector | ✅ | injection_blocked=DetectorAction.BLOCK, safe_action=Detector |
| shield_s4_sbom | ✅ | components=2, cve_alerts=2 |
| enforce_e6_stepup_bug001 | ✅ | RiskLevel.HIGH coercion: OK |
| enforce_e34_consensus | ✅ | round=443a7e5e, result=round_id='443a7e5e-4584-4a16-8fe0-7f8 |
| vault_v9_invoice_fraud | ✅ | score=0.00, risk=RiskLevel.SAFE |
| score_l5_full | ✅ | overall=MaturityLevel.L5, score=100, dims=7 |
| vault_v8_screenshot_redact_pil | ✅ | ScreenshotRedactor=ok, methods=['create_share_link', 'dlp',  |
| product_class_names_correct | ✅ | ApprovalWorkflowManager=ok, CollaborationManager=ok, Compens |
| watch_w7_explainability | ✅ | rows=2, packeter=ok |
| autonomy_all_3_modes | ✅ | ask->should_ask=True, act->should_ask=False, conditional->sh |
| api/health | ✅ | 200 |
| api/docs | ✅ | 200 |
| api/openapi.json | ✅ | 200 |
| api/api/v1/score/session | ✅ | 405 |
| api/api/v1/shield/status | ✅ | 200 |
| api/api/v1/enforce/status | ✅ | 200 |
| api/api/v1/vault/status | ✅ | 200 |
| invoicebot_l5_profile | ✅ | overall=MaturityLevel.L5, dims={'governance': 'L5', 'securit |
