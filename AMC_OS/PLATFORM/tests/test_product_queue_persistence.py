from __future__ import annotations

from datetime import datetime, timedelta, timezone

from amc.product.jobs import JobQueue, SubmitParams
from amc.product.escalation import EscalationQueue
from amc.product.persistence import PRODUCT_DB_PATH_ENV, PRODUCT_QUEUE_RETENTION_DAYS, product_db_path


def test_job_queue_persists_state_to_sqlite(tmp_path):
    db = tmp_path / "jobs.sqlite"

    submitter = JobQueue(db_path=db)
    submitter.submit(
        SubmitParams(
            payload={"task": "collect"},
            priority=1,
            max_retries=1,
            job_id="j-collect",
        )
    )
    submitter.submit(
        SubmitParams(
            payload={"task": "urgent"},
            priority=5,
            max_retries=1,
            job_id="j-urgent",
        )
    )

    claimed = submitter.claim("worker-a")
    assert claimed is not None
    assert claimed.id == "j-urgent"
    submitter.ack(claimed.id, worker_id="worker-a", success=False, error="retry")

    reloader = JobQueue(db_path=db)
    recovered = reloader.get("j-urgent")
    assert recovered is not None
    assert recovered.status == "queued"
    assert recovered.attempts == 1

    recovered.next_retry_at = datetime.now(timezone.utc) - timedelta(seconds=1)
    claimed_again = reloader.claim("worker-b")
    assert claimed_again is not None
    assert claimed_again.id == "j-urgent"
    assert claimed_again.attempts == 2

    reloader.ack("j-urgent", worker_id="worker-b", success=True)
    done = reloader.get("j-urgent")
    assert done is not None
    assert done.status == "done"


def test_escalation_queue_persists_state_to_sqlite(tmp_path):
    db = tmp_path / "escalations.sqlite"

    submitter = EscalationQueue(db_path=db)
    t1 = submitter.submit(source="chat", summary="fraud", category="billing", severity="medium")
    t2 = submitter.submit(source="mail", summary="attack", category="security", severity="critical")

    submitter.claim(t1.id, agent="agent-a")
    submitter.handoff(t1.id, to_team="customer-support", reason="needs-human")
    submitter.resolve(t2.id)

    reloader = EscalationQueue(db_path=db)
    assert reloader.get(t1.id) is not None
    assert reloader.get(t1.id).state == "handoff"
    assert reloader.get(t1.id).route_team == "customer-support"
    assert reloader.get(t2.id).state == "resolved"

    # Re-claim from handoff should remain blocked for completed states only
    handoff_ticket = reloader.get(t1.id)
    assert handoff_ticket is not None
    reloader.claim(handoff_ticket.id, agent="agent-b")
    assert handoff_ticket.state == "in_progress"


def test_product_db_path_helper_supports_env_override(monkeypatch, tmp_path):
    override = tmp_path / "override.sqlite"
    monkeypatch.setenv(PRODUCT_DB_PATH_ENV, str(override))

    resolved = product_db_path()
    assert resolved == override
    assert PRODUCT_QUEUE_RETENTION_DAYS > 0
