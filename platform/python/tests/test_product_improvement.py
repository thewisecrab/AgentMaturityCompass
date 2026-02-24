from __future__ import annotations

from datetime import datetime, timedelta, timezone

import sqlite3

from amc.product.improvement import FeedbackInput, FeedbackLoop, FeedbackSentiment


def test_feedback_records_and_score_series(tmp_path):
    db = tmp_path / "feedback.db"
    loop = FeedbackLoop(db_path=db)

    now = datetime.now(timezone.utc)
    loop.record(
        FeedbackInput(
            tenant_id="tenant-one",
            workflow_id="wf-sales",
            run_id="run-1",
            sentiment=FeedbackSentiment.POSITIVE,
            rating=9,
            correction_note=None,
        )
    )
    loop.record(
        FeedbackInput(
            tenant_id="tenant-one",
            workflow_id="wf-sales",
            run_id="run-2",
            sentiment=FeedbackSentiment.CORRECTED,
            rating=5,
            correction_note="fix grammar",
        )
    )
    loop.record(
        FeedbackInput(
            tenant_id="tenant-one",
            workflow_id="wf-sales",
            run_id="run-3",
            sentiment=FeedbackSentiment.POSITIVE,
            rating=10,
            correction_note=None,
        )
    )

    # Re-time the rows to create deterministic 7-day windows.
    with sqlite3.connect(db) as conn:
        conn.execute(
            "UPDATE feedback_events SET created_at = ? WHERE run_id = 'run-1'",
            ((now - timedelta(days=12)).isoformat(),),
        )
        conn.execute(
            "UPDATE feedback_events SET created_at = ? WHERE run_id = 'run-2'",
            ((now - timedelta(days=6)).isoformat(),),
        )
        conn.execute(
            "UPDATE feedback_events SET created_at = ? WHERE run_id = 'run-3'",
            (now.isoformat(),),
        )
        conn.commit()

    series = loop.compute_improvement(
        tenant_id="tenant-one",
        workflow_id="wf-sales",
        window_days=7,
        start_at=now - timedelta(days=14),
        end_at=now,
    )

    assert series.total_feedback == 3
    assert series.window_days == 7
    assert len(series.buckets) >= 2
    assert all(0.0 <= b.score <= 100.0 for b in series.buckets)
    assert series.current_score > 0.0
    assert series.trend_vs_previous != 0.0  # sample has uneven buckets


def test_query_feedback_returns_deterministic_order(tmp_path):
    loop = FeedbackLoop(db_path=tmp_path / "feedback.db")
    loop.record(
        FeedbackInput(
            tenant_id="tenant-two",
            workflow_id="wf-a",
            sentiment=FeedbackSentiment.NEGATIVE,
            rating=1,
            correction_note="wrong command",
        )
    )
    loop.record(
        FeedbackInput(
            tenant_id="tenant-two",
            workflow_id="wf-a",
            sentiment=FeedbackSentiment.POSITIVE,
            rating=10,
            correction_note=None,
        )
    )

    rows = loop.query(tenant_id="tenant-two", workflow_id="wf-a", limit=10)
    assert len(rows) == 2
    assert rows[0].created_at >= rows[1].created_at
