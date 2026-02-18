"""Tests for AMC Wave-2 product modules.

Covers: autonomy_dial, goal_tracker, loop_detector, confidence, conversation_state.
All tests use in-memory SQLite paths via tmp_path.
"""
from __future__ import annotations

import pytest
from pathlib import Path


# ═══════════════════════════════════════════════════════════════
# Autonomy Dial
# ═══════════════════════════════════════════════════════════════

class TestAutonomyDial:
    def _dial(self, tmp_path: Path):
        from amc.product.autonomy_dial import AutonomyDial, reset_dial
        return reset_dial(db_path=tmp_path / "autonomy.db")

    def test_default_decision_ask_for_payment(self, tmp_path):
        dial = self._dial(tmp_path)
        dec = dial.decide(tenant_id="t1", task_type="payment", confidence=1.0)
        assert dec.should_ask is True
        assert dec.mode_resolved.value == "ask"

    def test_default_decision_act_for_retrieval(self, tmp_path):
        dial = self._dial(tmp_path)
        dec = dial.decide(tenant_id="t1", task_type="information_retrieval", confidence=1.0)
        assert dec.should_ask is False

    def test_conditional_high_confidence_acts(self, tmp_path):
        from amc.product.autonomy_dial import AutonomyMode, PolicyInput
        dial = self._dial(tmp_path)
        dial.set_policy(PolicyInput(
            tenant_id="t1", task_type="custom_task",
            mode=AutonomyMode.CONDITIONAL, confidence_threshold=0.8,
        ))
        dec = dial.decide(tenant_id="t1", task_type="custom_task", confidence=0.9)
        assert dec.should_ask is False

    def test_conditional_low_confidence_asks(self, tmp_path):
        from amc.product.autonomy_dial import AutonomyMode, PolicyInput
        dial = self._dial(tmp_path)
        dial.set_policy(PolicyInput(
            tenant_id="t1", task_type="draft", mode=AutonomyMode.CONDITIONAL,
            confidence_threshold=0.85,
        ))
        dec = dial.decide(tenant_id="t1", task_type="draft", confidence=0.50)
        assert dec.should_ask is True

    def test_policy_crud(self, tmp_path):
        from amc.product.autonomy_dial import AutonomyMode, PolicyInput
        dial = self._dial(tmp_path)
        p = dial.set_policy(PolicyInput(
            tenant_id="t2", task_type="api_write", mode=AutonomyMode.ASK,
        ))
        assert p.policy_id
        policies = dial.list_policies("t2")
        assert len(policies) == 1
        ok = dial.delete_policy(p.policy_id)
        assert ok
        assert dial.list_policies("t2") == []

    def test_decision_history(self, tmp_path):
        dial = self._dial(tmp_path)
        dial.decide("t1", "generic", 0.9)
        dial.decide("t1", "generic", 0.3)
        decisions = dial.list_decisions("t1")
        assert len(decisions) == 2

    def test_default_modes_dict(self, tmp_path):
        dial = self._dial(tmp_path)
        modes = dial.default_modes()
        assert "payment" in modes
        assert modes["payment"] == "ask"

    def test_decision_dict_keys(self, tmp_path):
        dial = self._dial(tmp_path)
        dec = dial.decide("t1", "generic")
        d = dec.dict
        assert {"decision_id", "should_ask", "mode_resolved", "rationale"} <= d.keys()

    def test_overwrite_policy(self, tmp_path):
        from amc.product.autonomy_dial import AutonomyMode, PolicyInput
        dial = self._dial(tmp_path)
        dial.set_policy(PolicyInput("t1", "code_execution", AutonomyMode.ASK))
        updated = dial.set_policy(PolicyInput("t1", "code_execution", AutonomyMode.ACT))
        assert updated.mode.value == "act"
        assert len(dial.list_policies("t1")) == 1


# ═══════════════════════════════════════════════════════════════
# Goal Tracker
# ═══════════════════════════════════════════════════════════════

class TestGoalTracker:
    def _tracker(self, tmp_path: Path):
        from amc.product.goal_tracker import GoalTracker, reset_tracker
        return reset_tracker(db_path=tmp_path / "goals.db")

    def test_create_goal(self, tmp_path):
        from amc.product.goal_tracker import GoalInput
        t = self._tracker(tmp_path)
        g = t.create_goal(GoalInput(tenant_id="t1", title="Ship v2"))
        assert g.goal_id
        assert g.title == "Ship v2"
        assert g.status.value == "active"

    def test_decompose_and_milestones(self, tmp_path):
        from amc.product.goal_tracker import GoalInput
        t = self._tracker(tmp_path)
        g = t.create_goal(GoalInput(tenant_id="t1", title="Big goal"))
        milestones = t.decompose(g.goal_id, [
            {"title": "Step 1", "seq": 0, "acceptance": "Done when tests pass"},
            {"title": "Step 2", "seq": 1},
        ])
        assert len(milestones) == 2
        assert milestones[0].seq == 0
        assert milestones[1].seq == 1

    def test_milestone_status_update_completes_goal(self, tmp_path):
        from amc.product.goal_tracker import GoalInput, MilestoneStatus
        t = self._tracker(tmp_path)
        g = t.create_goal(GoalInput(tenant_id="t1", title="Single milestone"))
        ms = t.decompose(g.goal_id, [{"title": "Only step"}])
        t.update_milestone_status(ms[0].milestone_id, MilestoneStatus.DONE)
        updated = t.get_goal(g.goal_id)
        assert updated.status.value == "completed"

    def test_drift_detection_aligned(self, tmp_path):
        from amc.product.goal_tracker import GoalInput
        t = self._tracker(tmp_path)
        g = t.create_goal(GoalInput(
            tenant_id="t1", title="Improve search",
            keywords=["search", "improve", "relevance"],
        ))
        event = t.check_drift(g.goal_id, "improving search relevance algorithm")
        assert event.aligned is True
        assert event.drift_score < 0.35

    def test_drift_detection_misaligned(self, tmp_path):
        from amc.product.goal_tracker import GoalInput
        t = self._tracker(tmp_path)
        g = t.create_goal(GoalInput(
            tenant_id="t1", title="Fix billing",
            keywords=["billing", "invoice", "payment", "stripe"],
        ))
        event = t.check_drift(g.goal_id, "refactoring the authentication header middleware")
        assert event.aligned is False
        assert event.drift_score >= 0.35

    def test_list_goals(self, tmp_path):
        from amc.product.goal_tracker import GoalInput
        t = self._tracker(tmp_path)
        t.create_goal(GoalInput("tenant_x", "Goal A"))
        t.create_goal(GoalInput("tenant_x", "Goal B"))
        goals = t.list_goals("tenant_x")
        assert len(goals) == 2

    def test_goal_status_update(self, tmp_path):
        from amc.product.goal_tracker import GoalInput, GoalStatus
        t = self._tracker(tmp_path)
        g = t.create_goal(GoalInput("t1", "Temp goal"))
        t.update_goal_status(g.goal_id, GoalStatus.ABANDONED)
        updated = t.get_goal(g.goal_id)
        assert updated.status.value == "abandoned"

    def test_goal_dict_has_milestones(self, tmp_path):
        from amc.product.goal_tracker import GoalInput
        t = self._tracker(tmp_path)
        g = t.create_goal(GoalInput("t1", "Goal with milestones"))
        t.decompose(g.goal_id, [{"title": "M1"}])
        d = t.get_goal(g.goal_id).dict
        assert len(d["milestones"]) == 1

    def test_drift_event_list(self, tmp_path):
        from amc.product.goal_tracker import GoalInput
        t = self._tracker(tmp_path)
        g = t.create_goal(GoalInput("t1", "Goal", keywords=["x"]))
        t.check_drift(g.goal_id, "action x")
        t.check_drift(g.goal_id, "completely different action about nothing")
        events = t.list_drift_events(g.goal_id)
        assert len(events) == 2


# ═══════════════════════════════════════════════════════════════
# Loop Detector
# ═══════════════════════════════════════════════════════════════

class TestLoopDetector:
    def _detector(self, tmp_path: Path):
        from amc.product.loop_detector import LoopDetector, reset_detector
        return reset_detector(db_path=tmp_path / "loops.db")

    def test_no_loop_few_actions(self, tmp_path):
        d = self._detector(tmp_path)
        d.record_action("s1", "t1", "fetch", "fetching doc A")
        result = d.check("s1", "t1")
        assert result.detected is False

    def test_exact_loop_detected(self, tmp_path):
        d = self._detector(tmp_path)
        for _ in range(4):
            d.record_action("s2", "t1", "search", "searching for invoice 123")
        result = d.check("s2", "t1")
        assert result.detected is True
        assert result.detection.pattern_type.value == "loop"
        assert result.detection.strategy.value == "change_tool"

    def test_near_duplicate_loop_detected(self, tmp_path):
        d = self._detector(tmp_path)
        # Near-identical summaries
        for i in range(4):
            d.record_action("s3", "t1", "search", f"searching for invoice 12{i}")
        result = d.check("s3", "t1")
        assert result.detected is True

    def test_thrash_detected(self, tmp_path):
        d = self._detector(tmp_path)
        # Use clearly distinct summaries so near-dup loop check doesn't fire first
        steps = [
            ("search_tool", "performing full-text search across invoice database for matching entries"),
            ("cache_lookup", "checking redis cache for precomputed result set from last request"),
        ] * 5
        for atype, summary in steps:
            d.record_action("s4", "t1", atype, summary)
        result = d.check("s4", "t1")
        assert result.detected is True
        assert result.detection.pattern_type.value == "thrash"

    def test_record_and_check_convenience(self, tmp_path):
        d = self._detector(tmp_path)
        for _ in range(3):
            result = d.record_action_and_check("s5", "t1", "api_call", "get /v1/invoices")
        # After 3 identical actions the 4th would trigger, 3 is boundary
        assert result.action_count >= 3

    def test_resolve_detection(self, tmp_path):
        d = self._detector(tmp_path)
        for _ in range(4):
            d.record_action("s6", "t1", "same_action", "same summary")
        result = d.check("s6", "t1")
        assert result.detected
        ok = d.resolve_detection(result.detection.detection_id)
        assert ok
        detections = d.list_detections(session_id="s6", resolved=True)
        assert len(detections) == 1

    def test_list_detections_filters(self, tmp_path):
        d = self._detector(tmp_path)
        for _ in range(4):
            d.record_action("sx", "t1", "op", "repeated operation xyz")
        d.check("sx", "t1")
        detections = d.list_detections(tenant_id="t1", resolved=False)
        assert len(detections) >= 1

    def test_session_history(self, tmp_path):
        d = self._detector(tmp_path)
        d.record_action("sh1", "t1", "act1", "summary1")
        d.record_action("sh1", "t1", "act2", "summary2")
        history = d.session_history("sh1")
        assert len(history) == 2
        assert history[0].action_type == "act1"

    def test_detection_dict_keys(self, tmp_path):
        d = self._detector(tmp_path)
        for _ in range(4):
            d.record_action("sd", "t1", "op", "do the same thing")
        result = d.check("sd", "t1")
        assert result.detected
        det_dict = result.detection.dict
        assert {"detection_id", "pattern_type", "strategy", "explanation"} <= det_dict.keys()


# ═══════════════════════════════════════════════════════════════
# Confidence Estimator
# ═══════════════════════════════════════════════════════════════

class TestConfidenceEstimator:
    def _estimator(self, tmp_path: Path):
        from amc.product.confidence import ConfidenceEstimator, reset_estimator
        return reset_estimator(db_path=tmp_path / "confidence.db")

    def test_no_evidence_low_score(self, tmp_path):
        from amc.product.confidence import ConfidenceInput
        est = self._estimator(tmp_path)
        result = est.estimate(ConfidenceInput(
            decision_type="generic",
            description="Should I proceed?",
            tenant_id="t1",
        ))
        assert result.adjusted_score < 0.55
        assert result.band.value in ("low", "very_low", "medium")

    def test_high_credibility_evidence_raises_score(self, tmp_path):
        from amc.product.confidence import ConfidenceInput, EvidenceItem
        est = self._estimator(tmp_path)
        result = est.estimate(ConfidenceInput(
            decision_type="route_payment",
            description="Clear documented evidence",
            evidence=[
                EvidenceItem("Invoice #123 matches vendor record", "db", 0.99),
                EvidenceItem("Payment already approved", "crm", 0.95),
                EvidenceItem("No fraud signals", "fraud_engine", 0.90),
            ],
            tenant_id="t1",
        ))
        assert result.adjusted_score >= 0.55
        assert result.raw_score > result.adjusted_score or result.adjusted_score >= 0.5

    def test_hedging_language_lowers_score(self, tmp_path):
        from amc.product.confidence import ConfidenceInput, EvidenceItem
        est = self._estimator(tmp_path)
        result_clean = est.estimate(ConfidenceInput(
            decision_type="test",
            description="The document is verified and complete",
            evidence=[EvidenceItem("solid fact", "db", 0.9)],
            tenant_id="t1",
        ))
        result_hedge = est.estimate(ConfidenceInput(
            decision_type="test",
            description="Maybe possibly this might be unclear perhaps",
            evidence=[EvidenceItem("uncertain maybe perhaps", "db", 0.9)],
            tenant_id="t1",
        ))
        assert result_clean.adjusted_score > result_hedge.adjusted_score

    def test_missing_fields_lowers_score(self, tmp_path):
        from amc.product.confidence import ConfidenceInput, EvidenceItem
        est = self._estimator(tmp_path)
        complete = est.estimate(ConfidenceInput(
            decision_type="t", description="d",
            evidence=[EvidenceItem("e", "s", 0.9)],
            required_fields=["name", "email"],
            available_fields=["name", "email"],
            tenant_id="t1",
        ))
        incomplete = est.estimate(ConfidenceInput(
            decision_type="t", description="d",
            evidence=[EvidenceItem("e", "s", 0.9)],
            required_fields=["name", "email", "phone", "address"],
            available_fields=["name"],
            tenant_id="t1",
        ))
        assert complete.adjusted_score > incomplete.adjusted_score

    def test_prior_accuracy_blending(self, tmp_path):
        from amc.product.confidence import ConfidenceInput
        est = self._estimator(tmp_path)
        result = est.estimate(ConfidenceInput(
            decision_type="billing", description="decision",
            prior_accuracy=0.95,
            tenant_id="t1",
        ))
        # Even with no evidence, blending with 0.95 prior should raise score
        assert result.adjusted_score > 0.3

    def test_record_outcome(self, tmp_path):
        from amc.product.confidence import ConfidenceInput
        est = self._estimator(tmp_path)
        result = est.estimate(ConfidenceInput("generic", "d", tenant_id="t1"))
        ok = est.record_outcome(result.estimate_id, "success", correct=True)
        assert ok
        loaded = est.get_estimate(result.estimate_id)
        assert loaded.outcome_correct is True

    def test_band_very_high(self, tmp_path):
        from amc.product.confidence import ConfidenceInput, EvidenceItem
        est = self._estimator(tmp_path)
        result = est.estimate(ConfidenceInput(
            decision_type="simple",
            description="Confirmed fact",
            evidence=[
                EvidenceItem("verified", "db", 1.0),
                EvidenceItem("confirmed", "crm", 1.0),
                EvidenceItem("audited", "audit", 1.0),
                EvidenceItem("checked", "system", 1.0),
                EvidenceItem("validated", "validator", 1.0),
            ],
            required_fields=["x"],
            available_fields=["x"],
            tenant_id="t1",
        ))
        assert result.band.value in ("very_high", "high")

    def test_list_estimates(self, tmp_path):
        from amc.product.confidence import ConfidenceInput
        est = self._estimator(tmp_path)
        est.estimate(ConfidenceInput("a", "desc1", tenant_id="t1"))
        est.estimate(ConfidenceInput("b", "desc2", tenant_id="t1"))
        items = est.list_estimates(tenant_id="t1")
        assert len(items) == 2

    def test_accuracy_summary(self, tmp_path):
        from amc.product.confidence import ConfidenceInput
        est = self._estimator(tmp_path)
        r = est.estimate(ConfidenceInput("generic", "d", tenant_id="t1"))
        est.record_outcome(r.estimate_id, "ok", correct=True)
        summary = est.accuracy_summary("t1")
        assert any("total" in v for v in summary.values())


# ═══════════════════════════════════════════════════════════════
# Conversation State Snapshotter
# ═══════════════════════════════════════════════════════════════

class TestConversationStateManager:
    def _mgr(self, tmp_path: Path):
        from amc.product.conversation_state import ConversationStateManager, reset_state_manager
        return reset_state_manager(db_path=tmp_path / "state.db")

    def test_create_snapshot(self, tmp_path):
        from amc.product.conversation_state import SnapshotInput
        mgr = self._mgr(tmp_path)
        snap = mgr.snapshot(SnapshotInput(
            conversation_id="conv1",
            tenant_id="t1",
            intent="book_meeting",
            summary="User wants to book a meeting",
        ))
        assert snap.snapshot_id
        assert snap.version == 1
        assert snap.is_latest

    def test_version_increments(self, tmp_path):
        from amc.product.conversation_state import SnapshotInput
        mgr = self._mgr(tmp_path)
        inp = SnapshotInput(conversation_id="conv2", tenant_id="t1", intent="search")
        s1 = mgr.snapshot(inp)
        s2 = mgr.snapshot(inp)
        assert s2.version == 2
        s1_loaded = mgr.get_snapshot(s1.snapshot_id)
        assert s1_loaded.is_latest is False

    def test_get_latest(self, tmp_path):
        from amc.product.conversation_state import SnapshotInput
        mgr = self._mgr(tmp_path)
        inp = SnapshotInput(conversation_id="conv3", tenant_id="t1", intent="query")
        mgr.snapshot(inp)
        mgr.snapshot(inp)
        latest = mgr.get_latest("conv3")
        assert latest.version == 2

    def test_restore(self, tmp_path):
        from amc.product.conversation_state import SnapshotInput, DecisionRecord, DecisionOutcome
        mgr = self._mgr(tmp_path)
        inp = SnapshotInput(
            conversation_id="conv4", tenant_id="t1", intent="order",
            decisions=[DecisionRecord(key="approved", value=True, outcome=DecisionOutcome.CONFIRMED)],
        )
        s1 = mgr.snapshot(inp)
        mgr.snapshot(SnapshotInput(conversation_id="conv4", tenant_id="t1", intent="changed"))
        restoration = mgr.restore("conv4", target_version=1, reason="rollback test")
        assert restoration.snapshot.version == 3
        assert "RESTORED" in restoration.snapshot.summary

    def test_update_entities(self, tmp_path):
        from amc.product.conversation_state import SnapshotInput
        mgr = self._mgr(tmp_path)
        mgr.snapshot(SnapshotInput("conv5", "t1", "search", entities={"query": "invoices"}))
        updated = mgr.update_latest_entities("conv5", {"filters": ["2024"]})
        assert "filters" in updated.entities

    def test_delete_snapshots(self, tmp_path):
        from amc.product.conversation_state import SnapshotInput
        mgr = self._mgr(tmp_path)
        inp = SnapshotInput("conv6", "t1", "intent")
        mgr.snapshot(inp)
        mgr.snapshot(inp)
        deleted = mgr.delete_snapshots("conv6")
        assert deleted == 2
        assert mgr.get_latest("conv6") is None

    def test_snapshot_with_pending_actions(self, tmp_path):
        from amc.product.conversation_state import SnapshotInput, PendingAction, PendingActionStatus
        mgr = self._mgr(tmp_path)
        snap = mgr.snapshot(SnapshotInput(
            conversation_id="conv7", tenant_id="t1", intent="book",
            pending_actions=[
                PendingAction("a1", "send_email", "Send confirmation", PendingActionStatus.QUEUED),
            ],
        ))
        assert len(snap.pending_actions) == 1
        assert snap.pending_actions[0]["action_type"] == "send_email"

    def test_list_for_tenant(self, tmp_path):
        from amc.product.conversation_state import SnapshotInput
        mgr = self._mgr(tmp_path)
        mgr.snapshot(SnapshotInput("convA", "tenant_z", "i1"))
        mgr.snapshot(SnapshotInput("convB", "tenant_z", "i2"))
        snaps = mgr.list_for_tenant("tenant_z")
        assert len(snaps) == 2

    def test_snapshot_dict_keys(self, tmp_path):
        from amc.product.conversation_state import SnapshotInput
        mgr = self._mgr(tmp_path)
        snap = mgr.snapshot(SnapshotInput("convX", "t1", "test_intent"))
        d = snap.dict
        required = {"snapshot_id", "conversation_id", "version", "intent", "is_latest"}
        assert required <= d.keys()


# ═══════════════════════════════════════════════════════════════
# Features Wave-2 catalog
# ═══════════════════════════════════════════════════════════════

class TestFeaturesWave2:
    def test_count(self):
        from amc.product.features_wave2 import count_features
        assert count_features() == 50

    def test_high_count(self):
        from amc.product.features_wave2 import get_features, Relevance
        highs = get_features(relevance=Relevance.HIGH)
        assert len(highs) == 19  # 19 HIGH features listed

    def test_medium_count(self):
        from amc.product.features_wave2 import get_features, Relevance
        meds = get_features(relevance=Relevance.MEDIUM)
        assert len(meds) == 24

    def test_low_count(self):
        from amc.product.features_wave2 import get_features, Relevance
        lows = get_features(relevance=Relevance.LOW)
        assert len(lows) == 7

    def test_amc_fit_filter(self):
        from amc.product.features_wave2 import get_features
        fit = get_features(amc_fit_only=True)
        assert all(f.amc_fit for f in fit)

    def test_low_not_amc_fit(self):
        from amc.product.features_wave2 import get_features, Relevance
        lows = get_features(relevance=Relevance.LOW)
        assert all(not f.amc_fit for f in lows)

    def test_as_dicts(self):
        from amc.product.features_wave2 import get_features, as_dicts
        feats = get_features()[:3]
        dicts = as_dicts(feats)
        assert len(dicts) == 3
        assert "wave" in dicts[0]

    def test_select_high_impact(self):
        from amc.product.features_wave2 import select_high_impact
        items = select_high_impact(limit=5)
        assert len(items) == 5
        assert all(i.amc_fit for i in items)

    def test_wave_2_label(self):
        from amc.product.features_wave2 import get_features
        feats = get_features()
        assert all(f.wave == 2 for f in feats)
