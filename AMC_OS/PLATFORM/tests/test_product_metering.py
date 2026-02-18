from __future__ import annotations

from datetime import datetime, timedelta, timezone

from amc.product.metering import (
    UsageMeteringLedger,
    UsageEventInput,
    get_metering_ledger,
    make_deterministic_event_id,
)


def test_record_event_is_idempotent_via_idempotency_key(tmp_path):
    ledger = UsageMeteringLedger(db_path=tmp_path / "usage.db")

    payload = UsageEventInput(
        tenant_id="tenant-alpha",
        workflow_id="wf-1",
        run_id="run-1",
        actor_id="agent-a",
        started_at=datetime(2026, 1, 1, tzinfo=timezone.utc),
        duration_ms=1200,
        tool_calls=3,
        model_calls=2,
        input_tokens=120,
        output_tokens=280,
        browser_minutes=0.5,
        metadata={"channel": "cli"},
        idempotency_key="rk-001",
    )

    first = ledger.record_event(payload)
    second = ledger.record_event(payload)

    assert first.event_id == second.event_id

    # Unique index prevents duplicate row insertions
    events = ledger.query_events(tenant_id="tenant-alpha")
    assert len(events) == 1
    assert events[0].event_id == first.event_id
    assert events[0].tenant_id == "tenant-alpha"
    assert events[0].workflow_id == "wf-1"
    assert events[0].cost_usd > 0


def test_query_filters_and_invoice_generation(tmp_path):
    ledger = UsageMeteringLedger(db_path=tmp_path / "usage.db")

    t0 = datetime(2026, 1, 1, tzinfo=timezone.utc)
    ledger.record_event(
        UsageEventInput(
            tenant_id="tenant-a",
            workflow_id="wf-a",
            run_id="run-a1",
            actor_id="agent-a",
            started_at=t0,
            duration_ms=100,
            tool_calls=1,
            model_calls=0,
            input_tokens=10,
            output_tokens=20,
            browser_minutes=0.2,
        )
    )
    ledger.record_event(
        UsageEventInput(
            tenant_id="tenant-a",
            workflow_id="wf-b",
            run_id="run-b1",
            actor_id="agent-b",
            started_at=t0 + timedelta(hours=1),
            duration_ms=200,
            tool_calls=2,
            model_calls=2,
            input_tokens=0,
            output_tokens=10,
            browser_minutes=0.0,
        )
    )

    found = ledger.query_events(tenant_id="tenant-a", workflow_id="wf-a", limit=10)
    assert len(found) == 1

    invoice = ledger.generate_invoice(
        tenant_id="tenant-a",
        since=t0,
        until=t0 + timedelta(hours=2),
    )
    assert invoice.tenant_id == "tenant-a"
    assert invoice.total_events == 2
    assert invoice.total_cost_usd > 0
    assert {line.workflow_id for line in invoice.lines} == {"wf-a", "wf-b"}


def test_deterministic_event_id_stable():
    base = UsageEventInput(
        tenant_id="tenant-b",
        workflow_id="wf-c",
        run_id="run-c1",
        actor_id="agent-c",
        started_at=datetime(2026, 2, 1, tzinfo=timezone.utc),
        duration_ms=0,
        tool_calls=0,
        model_calls=0,
        input_tokens=0,
        output_tokens=0,
        browser_minutes=0.0,
    )
    assert make_deterministic_event_id(base) == make_deterministic_event_id(base)


def test_metering_ledger_default_path_helper_is_reusable():
    # Smoke coverage for singleton helper contract.
    ledger_one = get_metering_ledger(db_path=":memory:")
    ledger_two = get_metering_ledger(db_path=":memory:")
    assert ledger_one is ledger_two
