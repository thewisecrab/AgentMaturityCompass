"""Tests for amc.shield.s5_reputation — reputation graph, trust scoring, Sybil detection."""
from __future__ import annotations

import sqlite3
import time
from datetime import datetime, timezone

import pytest

from amc.shield.s5_reputation import (
    ReportType,
    ReputationGraph,
    SybilDetector,
    TrustScore,
    TrustTier,
    UserReport,
    _tier_from_score,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def graph() -> ReputationGraph:
    """In-memory reputation graph with one publisher and one skill."""
    g = ReputationGraph()
    g.register_publisher("pub-1", "Acme Corp", verified=True)
    g.register_skill("sk-1", "pub-1", avg_risk_score=0.0)
    return g


@pytest.fixture()
def unverified_graph() -> ReputationGraph:
    g = ReputationGraph()
    g.register_publisher("pub-2", "Unknown Dev", verified=False)
    g.register_skill("sk-2", "pub-2", avg_risk_score=50.0)
    return g


# ---------------------------------------------------------------------------
# Tier mapping
# ---------------------------------------------------------------------------

class TestTierFromScore:
    def test_untrusted(self):
        assert _tier_from_score(0) == TrustTier.UNTRUSTED
        assert _tier_from_score(30) == TrustTier.UNTRUSTED

    def test_low(self):
        assert _tier_from_score(31) == TrustTier.LOW
        assert _tier_from_score(50) == TrustTier.LOW

    def test_medium(self):
        assert _tier_from_score(51) == TrustTier.MEDIUM
        assert _tier_from_score(70) == TrustTier.MEDIUM

    def test_high(self):
        assert _tier_from_score(71) == TrustTier.HIGH
        assert _tier_from_score(85) == TrustTier.HIGH

    def test_verified(self):
        assert _tier_from_score(86) == TrustTier.VERIFIED
        assert _tier_from_score(100) == TrustTier.VERIFIED


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------

class TestRegistration:
    def test_register_publisher_and_skill(self, graph: ReputationGraph):
        profile = graph.get_publisher_profile("pub-1")
        assert profile.name == "Acme Corp"
        assert profile.verified is True

    def test_register_skill_profile(self, graph: ReputationGraph):
        sp = graph.get_skill_profile("sk-1")
        assert sp.skill_id == "sk-1"
        assert sp.publisher_id == "pub-1"

    def test_unknown_publisher_raises(self, graph: ReputationGraph):
        with pytest.raises(ValueError, match="Unknown publisher"):
            graph.get_publisher_profile("nonexistent")

    def test_unknown_skill_raises(self, graph: ReputationGraph):
        with pytest.raises(ValueError, match="Unknown skill"):
            graph.get_skill_profile("nonexistent")


# ---------------------------------------------------------------------------
# Install / Uninstall
# ---------------------------------------------------------------------------

class TestInstallUninstall:
    def test_install_increments(self, graph: ReputationGraph):
        graph.record_install("sk-1", "pub-1")
        graph.record_install("sk-1", "pub-1")
        sp = graph.get_skill_profile("sk-1")
        assert sp.installs == 2

    def test_uninstall_increments(self, graph: ReputationGraph):
        graph.record_install("sk-1", "pub-1")
        graph.record_uninstall("sk-1", reason="not needed")
        sp = graph.get_skill_profile("sk-1")
        assert sp.uninstalls == 1

    def test_publisher_profile_counts(self, graph: ReputationGraph):
        graph.record_install("sk-1", "pub-1")
        pp = graph.get_publisher_profile("pub-1")
        assert pp.install_count == 1
        assert pp.last_active is not None


# ---------------------------------------------------------------------------
# Trust computation
# ---------------------------------------------------------------------------

class TestTrustComputation:
    def test_perfect_score_verified(self, graph: ReputationGraph):
        """Verified + 0 risk + no uninstalls + no reports → max score."""
        graph.record_install("sk-1", "pub-1")
        ts = graph.compute_trust("sk-1")
        # 30 (verified) + 20 (low uninstall) + 20 (no sec reports) + 40 (risk) = 110 → clamped 100
        assert ts.score == 100
        assert ts.tier == TrustTier.VERIFIED

    def test_unverified_lower(self, unverified_graph: ReputationGraph):
        g = unverified_graph
        g.record_install("sk-2", "pub-2")
        ts = g.compute_trust("sk-2")
        # 0 (not verified) + 20 (low uninstall) + 20 (no sec) + (100-50)*0.4=20 = 60
        assert ts.score == 60
        assert ts.tier == TrustTier.MEDIUM

    def test_high_uninstall_ratio_penalised(self, graph: ReputationGraph):
        for _ in range(10):
            graph.record_install("sk-1", "pub-1")
        for _ in range(5):
            graph.record_uninstall("sk-1")
        ts = graph.compute_trust("sk-1")
        # uninstall ratio = 5/10 = 50% → no low-uninstall bonus
        assert ts.breakdown["low_uninstall_ratio"] == 0.0

    def test_security_report_removes_bonus(self, graph: ReputationGraph):
        graph.record_install("sk-1", "pub-1")
        report = UserReport(
            reporter_id="u-1",
            report_type=ReportType.MALICIOUS,
            description="bad",
        )
        ts = graph.file_report("sk-1", report)
        assert ts.breakdown["zero_security_reports"] == 0.0

    def test_unknown_skill_raises(self, graph: ReputationGraph):
        with pytest.raises(ValueError):
            graph.compute_trust("nonexistent")

    def test_crash_penalty(self, graph: ReputationGraph):
        graph.record_install("sk-1", "pub-1")
        for _ in range(5):
            graph.file_report(
                "sk-1",
                UserReport(reporter_id="u-1", report_type=ReportType.CRASH, description="crash"),
            )
        ts = graph.compute_trust("sk-1")
        # crash_rate = 5/1 = 5.0 → penalty capped at -10
        assert ts.breakdown["crash_rate_penalty"] == -10.0


# ---------------------------------------------------------------------------
# Sybil detection
# ---------------------------------------------------------------------------

class TestSybilDetector:
    def test_not_suspicious_below_threshold(self):
        conn = sqlite3.connect(":memory:")
        conn.executescript(
            "CREATE TABLE installs (skill_id TEXT, publisher_id TEXT, ts REAL);"
        )
        now = time.time()
        for _ in range(50):
            conn.execute(
                "INSERT INTO installs VALUES (?, ?, ?)", ("sk-1", "pub-1", now)
            )
        conn.commit()
        assert SybilDetector().flag_suspicious_install_pattern("sk-1", conn) is False

    def test_suspicious_above_threshold(self):
        conn = sqlite3.connect(":memory:")
        conn.executescript(
            "CREATE TABLE installs (skill_id TEXT, publisher_id TEXT, ts REAL);"
        )
        now = time.time()
        for _ in range(51):
            conn.execute(
                "INSERT INTO installs VALUES (?, ?, ?)", ("sk-1", "pub-1", now)
            )
        conn.commit()
        assert SybilDetector().flag_suspicious_install_pattern("sk-1", conn) is True

    def test_old_installs_not_flagged(self):
        conn = sqlite3.connect(":memory:")
        conn.executescript(
            "CREATE TABLE installs (skill_id TEXT, publisher_id TEXT, ts REAL);"
        )
        old = time.time() - 7200  # 2 hours ago
        for _ in range(100):
            conn.execute(
                "INSERT INTO installs VALUES (?, ?, ?)", ("sk-1", "pub-1", old)
            )
        conn.commit()
        assert SybilDetector().flag_suspicious_install_pattern("sk-1", conn) is False


# ---------------------------------------------------------------------------
# Report filing
# ---------------------------------------------------------------------------

class TestReportFiling:
    def test_file_report_returns_trust_score(self, graph: ReputationGraph):
        graph.record_install("sk-1", "pub-1")
        report = UserReport(
            reporter_id="u-1",
            report_type=ReportType.SUSPICIOUS,
            description="looks phishy",
        )
        ts = graph.file_report("sk-1", report)
        assert isinstance(ts, TrustScore)
        assert 0 <= ts.score <= 100

    def test_report_appears_in_skill_profile(self, graph: ReputationGraph):
        graph.record_install("sk-1", "pub-1")
        graph.file_report(
            "sk-1",
            UserReport(reporter_id="u-2", report_type=ReportType.CRASH, description="boom"),
        )
        sp = graph.get_skill_profile("sk-1")
        assert len(sp.reports) == 1
        assert sp.reports[0].reporter_id == "u-2"


# ---------------------------------------------------------------------------
# Threshold enforcement
# ---------------------------------------------------------------------------

class TestEnforceThreshold:
    def test_passes_when_above(self, graph: ReputationGraph):
        graph.record_install("sk-1", "pub-1")
        ts = graph.enforce_threshold("sk-1", min_score=50)
        assert ts.score >= 50

    def test_raises_when_below(self, unverified_graph: ReputationGraph):
        g = unverified_graph
        # Add a security report to lower score
        g.record_install("sk-2", "pub-2")
        g.file_report(
            "sk-2",
            UserReport(reporter_id="u-1", report_type=ReportType.MALICIOUS, description="bad"),
        )
        with pytest.raises(ValueError, match="below minimum"):
            g.enforce_threshold("sk-2", min_score=99)
