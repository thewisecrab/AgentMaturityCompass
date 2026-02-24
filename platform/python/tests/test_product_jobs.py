from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from amc.product.jobs import SubmitParams, get_queue, reset_queue


@pytest.fixture(autouse=True)
def clear_job_queue() -> None:
    reset_queue()


def test_submit_claim_by_priority() -> None:
    queue = get_queue()

    queue.submit(
        SubmitParams(
            payload={"task": "low"},
            priority=1,
            job_id="j-low",
        )
    )
    queue.submit(
        SubmitParams(
            payload={"task": "high"},
            priority=9,
            job_id="j-high",
        )
    )

    job = queue.claim("worker-a")
    assert job is not None
    assert job.id == "j-high"


def test_ack_failure_requeues_until_retry_delay() -> None:
    queue = get_queue()
    queue.submit(SubmitParams(payload={"task": "retry"}, priority=3, max_retries=2, job_id="j-retry"))

    first_claim = queue.claim("worker-a")
    assert first_claim is not None
    assert first_claim.attempts == 1

    retry_job = queue.ack("j-retry", worker_id="worker-a", success=False, error="temporary")
    assert retry_job.status == "queued"
    assert retry_job.next_retry_at is not None
    assert retry_job.attempts == 1

    # immediate re-claim blocked by backoff
    assert queue.claim("worker-b") is None

    # fast-forward time so retry is eligible
    retry_job.next_retry_at = datetime.now(timezone.utc) - timedelta(seconds=1)

    second_claim = queue.claim("worker-b")
    assert second_claim is not None
    assert second_claim.id == "j-retry"
    assert second_claim.attempts == 2

    completed = queue.ack("j-retry", worker_id="worker-b", success=True)
    assert completed.status == "done"


def test_claim_after_sla_expired() -> None:
    queue = get_queue()
    job = queue.submit(SubmitParams(payload={"task": "deadline"}, sla_seconds=60, job_id="j-sla"))
    job.deadline_at = datetime.now(timezone.utc) - timedelta(seconds=1)

    assert queue.claim("worker-z") is None
    assert queue.get("j-sla") is not None
    assert queue.get("j-sla").status == "expired"


def test_retry_stats_are_consistent() -> None:
    queue = get_queue()
    queue.submit(SubmitParams(payload={"task": "done"}, job_id="j-done"))
    queue.submit(SubmitParams(payload={"task": "fail"}, job_id="j-fail", max_retries=1))

    claimed = queue.claim("worker-x")
    assert claimed is not None
    queue.ack(claimed.id, worker_id="worker-x", success=True)

    claimed_fail = queue.claim("worker-x")
    assert claimed_fail is not None
    queue.ack(claimed_fail.id, worker_id="worker-x", success=False, error="temporary")

    # make retry immediately eligible and try again
    queue.get("j-fail").next_retry_at = datetime.now(timezone.utc) - timedelta(seconds=1)

    claimed_fail_retry = queue.claim("worker-x")
    assert claimed_fail_retry is not None
    queue.ack(claimed_fail_retry.id, worker_id="worker-x", success=False, error="fatal")

    stats = queue.retry_stats()
    assert stats.total_jobs == 2
    assert stats.done == 1
    assert stats.failed == 1
    assert stats.total_retries >= 1
    assert stats.avg_attempts >= 1
