"""Tests for amc.product.data_quality — Data Quality Monitor (Feature #35)."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from amc.product.data_quality import (
    CheckInput,
    DataQualityMonitor,
    ThresholdInput,
    _check_duplicates,
    _check_missing,
    _check_stale,
    _compute_score,
    _score_to_grade,
    get_data_quality_monitor,
)


@pytest.fixture()
def monitor(tmp_path):
    return DataQualityMonitor(db_path=tmp_path / "dq.db")


def _old_ts(days: int = 10) -> str:
    return (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()


def _fresh_ts() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Missing field checks
# ---------------------------------------------------------------------------

def test_missing_required_field():
    record = {"name": "Acme", "email": ""}
    issues = _check_missing(record, required_fields=["name", "email", "phone"])
    fields_flagged = {i.field_name for i in issues}
    assert "email" in fields_flagged  # empty string is missing
    assert "phone" in fields_flagged  # not in record
    assert "name" not in fields_flagged


def test_no_missing_when_all_present():
    record = {"name": "Acme", "email": "a@b.com"}
    issues = _check_missing(record, required_fields=["name", "email"])
    assert len(issues) == 0


def test_missing_none_value():
    issues = _check_missing({"x": None}, required_fields=["x"])
    assert len(issues) == 1


def test_missing_empty_list():
    issues = _check_missing({"tags": []}, required_fields=["tags"])
    assert len(issues) == 1


# ---------------------------------------------------------------------------
# Stale field checks
# ---------------------------------------------------------------------------

def test_stale_field_detected():
    record = {"updated_at": _old_ts(days=20)}
    issues = _check_stale(record, stale_fields={"updated_at": 7})
    assert len(issues) == 1
    assert issues[0].issue_type == "stale"
    assert issues[0].field_name == "updated_at"


def test_fresh_field_not_flagged():
    record = {"updated_at": _fresh_ts()}
    issues = _check_stale(record, stale_fields={"updated_at": 7})
    assert len(issues) == 0


def test_stale_missing_field_skipped():
    issues = _check_stale({}, stale_fields={"updated_at": 7})
    assert len(issues) == 0


def test_stale_invalid_timestamp_flagged():
    record = {"updated_at": "not-a-date"}
    issues = _check_stale(record, stale_fields={"updated_at": 7})
    assert any(i.issue_type == "format" for i in issues)


# ---------------------------------------------------------------------------
# Duplicate field checks
# ---------------------------------------------------------------------------

def test_duplicate_detected():
    record = {"email": "bob@test.com", "name": "Bob"}
    corpus = [{"email": "bob@test.com", "name": "Robert"}, {"email": "alice@test.com"}]
    issues = _check_duplicates(record, corpus, unique_fields=["email"])
    assert len(issues) == 1
    assert issues[0].issue_type == "duplicate"


def test_no_duplicate_when_unique():
    record = {"email": "unique@test.com"}
    corpus = [{"email": "other@test.com"}]
    issues = _check_duplicates(record, corpus, unique_fields=["email"])
    assert len(issues) == 0


def test_duplicate_skips_none_values():
    record = {"email": None}
    corpus = [{"email": None}]
    issues = _check_duplicates(record, corpus, unique_fields=["email"])
    assert len(issues) == 0


# ---------------------------------------------------------------------------
# Scoring and grading
# ---------------------------------------------------------------------------

def test_score_no_issues():
    assert _compute_score([]) == 100.0


def test_score_with_warning():
    from amc.product.data_quality import DataQualityIssue
    issues = [DataQualityIssue("missing", "x", "warning", "desc")]
    assert _compute_score(issues) == 92.0


def test_score_with_error():
    from amc.product.data_quality import DataQualityIssue
    issues = [DataQualityIssue("missing", "x", "error", "desc")]
    assert _compute_score(issues) == 85.0


def test_score_floors_at_zero():
    from amc.product.data_quality import DataQualityIssue
    issues = [DataQualityIssue("missing", f"f{i}", "critical", "d") for i in range(10)]
    assert _compute_score(issues) == 0.0


def test_grade_a():
    assert _score_to_grade(95.0) == "A"


def test_grade_b():
    assert _score_to_grade(80.0) == "B"


def test_grade_c():
    assert _score_to_grade(65.0) == "C"


def test_grade_d():
    assert _score_to_grade(45.0) == "D"


def test_grade_f():
    assert _score_to_grade(20.0) == "F"


# ---------------------------------------------------------------------------
# Full check pipeline
# ---------------------------------------------------------------------------

def test_check_creates_report(monitor):
    inp = CheckInput(
        tenant_id="t1",
        record_type="contact",
        record_id="c-1",
        record={"name": "Alice", "email": "alice@test.com", "phone": ""},
        required_fields=["name", "email", "phone"],
    )
    report = monitor.check(inp)

    assert report.report_id
    assert report.tenant_id == "t1"
    assert report.record_type == "contact"
    assert report.score < 100.0
    assert report.grade in {"A", "B", "C", "D", "F"}
    assert any(i.field_name == "phone" for i in report.issues)


def test_check_perfect_record(monitor):
    inp = CheckInput(
        tenant_id="t1",
        record_type="lead",
        record_id="l-1",
        record={"name": "Bob", "email": "bob@b.com"},
        required_fields=["name", "email"],
    )
    report = monitor.check(inp)
    assert report.score == 100.0
    assert report.grade == "A"


def test_check_with_stale_field(monitor):
    inp = CheckInput(
        tenant_id="t1",
        record_type="invoice",
        record_id="inv-1",
        record={"amount": 500, "updated_at": _old_ts(20)},
        required_fields=[],
        stale_fields={"updated_at": 7},
    )
    report = monitor.check(inp)
    assert any(i.issue_type == "stale" for i in report.issues)


def test_check_with_duplicates(monitor):
    corpus = [{"email": "dup@test.com", "name": "Other"}]
    inp = CheckInput(
        tenant_id="t1",
        record_type="contact",
        record_id="c-dup",
        record={"name": "Duppy", "email": "dup@test.com"},
        unique_fields=["email"],
        corpus=corpus,
    )
    report = monitor.check(inp)
    assert any(i.issue_type == "duplicate" for i in report.issues)


# ---------------------------------------------------------------------------
# Report retrieval
# ---------------------------------------------------------------------------

def test_get_report(monitor):
    inp = CheckInput(tenant_id="t1", record_type="x", record_id="r1", record={"f": "v"})
    report = monitor.check(inp)
    fetched = monitor.get_report(report.report_id)
    assert fetched is not None
    assert fetched.report_id == report.report_id


def test_get_nonexistent_report(monitor):
    assert monitor.get_report("bad-id") is None


def test_list_reports_filters(monitor):
    for i in range(3):
        monitor.check(CheckInput(tenant_id="t1", record_type="contact", record_id=f"c-{i}",
                                  record={"name": f"User{i}"}))
    monitor.check(CheckInput(tenant_id="t1", record_type="invoice", record_id="inv-1",
                              record={"amount": 100}))

    contacts = monitor.list_reports("t1", record_type="contact")
    assert len(contacts) == 3

    invoices = monitor.list_reports("t1", record_type="invoice")
    assert len(invoices) == 1


def test_list_reports_score_filter(monitor):
    monitor.check(CheckInput(tenant_id="t1", record_type="lead", record_id="a",
                              record={"name": "A"}, required_fields=["name", "email"]))  # will have issues
    monitor.check(CheckInput(tenant_id="t1", record_type="lead", record_id="b",
                              record={"name": "B", "email": "b@b.com"}, required_fields=["name", "email"]))

    perfect = monitor.list_reports("t1", record_type="lead", min_score=99.9)
    assert all(r.score >= 99.9 for r in perfect)


# ---------------------------------------------------------------------------
# Batch summary
# ---------------------------------------------------------------------------

def test_batch_summary(monitor):
    for i in range(5):
        monitor.check(CheckInput(
            tenant_id="t1", record_type="deal", record_id=f"d-{i}",
            record={"name": f"Deal{i}", "amount": i * 100},
            required_fields=["name", "amount", "stage"],  # missing 'stage'
        ))
    summary = monitor.batch_summary("t1", "deal")
    assert summary.total_records == 5
    assert summary.avg_score < 100.0
    assert len(summary.top_issues) > 0


def test_batch_summary_empty(monitor):
    summary = monitor.batch_summary("t9", "norecords")
    assert summary.total_records == 0
    assert summary.avg_score == 0.0


# ---------------------------------------------------------------------------
# Thresholds
# ---------------------------------------------------------------------------

def test_set_and_get_threshold(monitor):
    inp = ThresholdInput(
        tenant_id="t1",
        record_type="invoice",
        check_type="missing",
        threshold_value=0.0,
        field_name="amount",
        severity="error",
    )
    rec = monitor.set_threshold(inp)
    assert rec.threshold_id
    assert rec.check_type == "missing"
    assert rec.severity == "error"
    assert rec.field_name == "amount"


def test_threshold_upsert(monitor):
    inp = ThresholdInput(tenant_id="t1", record_type="x", check_type="range",
                          field_name="score", threshold_value=80.0, severity="warning")
    t1 = monitor.set_threshold(inp)

    inp2 = ThresholdInput(tenant_id="t1", record_type="x", check_type="range",
                           field_name="score", threshold_value=90.0, severity="error")
    t2 = monitor.set_threshold(inp2)

    assert t1.threshold_id == t2.threshold_id
    assert t2.threshold_value == 90.0
    assert t2.severity == "error"


def test_list_thresholds(monitor):
    monitor.set_threshold(ThresholdInput(tenant_id="t1", record_type="a", check_type="missing",
                                          field_name="f1", threshold_value=0))
    monitor.set_threshold(ThresholdInput(tenant_id="t1", record_type="a", check_type="range",
                                          field_name="f2", threshold_value=100))
    monitor.set_threshold(ThresholdInput(tenant_id="t2", record_type="a", check_type="missing",
                                          field_name="f1", threshold_value=0))

    t1_thresholds = monitor.list_thresholds("t1", record_type="a")
    assert len(t1_thresholds) == 2


def test_delete_threshold(monitor):
    rec = monitor.set_threshold(ThresholdInput(
        tenant_id="t1", record_type="y", check_type="missing",
        field_name="f", threshold_value=0
    ))
    assert monitor.delete_threshold(rec.threshold_id) is True
    active = monitor.list_thresholds("t1", active_only=True)
    assert not any(t.threshold_id == rec.threshold_id for t in active)


def test_invalid_check_type(monitor):
    with pytest.raises(ValueError, match="Invalid check_type"):
        monitor.set_threshold(ThresholdInput(
            tenant_id="t1", record_type="x", check_type="invalid",
            field_name="f", threshold_value=0
        ))


def test_invalid_severity(monitor):
    with pytest.raises(ValueError, match="Invalid severity"):
        monitor.set_threshold(ThresholdInput(
            tenant_id="t1", record_type="x", check_type="missing",
            field_name="f", threshold_value=0, severity="superb"
        ))


def test_threshold_applied_during_check(monitor):
    monitor.set_threshold(ThresholdInput(
        tenant_id="t1", record_type="inv", check_type="missing",
        field_name="due_date", threshold_value=0.0, severity="error"
    ))
    inp = CheckInput(
        tenant_id="t1",
        record_type="inv",
        record_id="i1",
        record={"amount": 500},  # due_date missing
    )
    report = monitor.check(inp)
    assert any(i.field_name == "due_date" for i in report.issues)


# ---------------------------------------------------------------------------
# Singleton
# ---------------------------------------------------------------------------

def test_singleton_factory(tmp_path):
    import amc.product.data_quality as mod
    mod._monitor = None
    m1 = get_data_quality_monitor(db_path=tmp_path / "dq.db")
    m2 = get_data_quality_monitor()
    assert m1 is m2
    mod._monitor = None
