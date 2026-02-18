from __future__ import annotations

from amc.product.escalation import get_queue, reset_queue, escalation_summary, route_ticket


def setup_function() -> None:
    reset_queue()


def test_routing_rules_are_applied() -> None:
    queue = get_queue()

    ticket = queue.submit(
        source="chat",
        summary="Need manual review",
        category="security",
        severity="medium",
    )

    assert ticket.route_team == "security"
    assert route_ticket("security", "medium") == "security"
    assert route_ticket("anything", "critical") == "incident-response"


def test_claim_and_handoff_state() -> None:
    queue = get_queue()

    ticket = queue.submit(
        source="mail",
        summary="Fraud alert",
        category="billing",
        severity="high",
    )
    assert ticket.state == "open"

    claimed = queue.claim(ticket.id, agent="agent-1")
    assert claimed.state == "in_progress"
    assert claimed.assigned_to == "agent-1"

    handed = queue.handoff(ticket.id, to_team="finance", reason="Need specialist")
    assert handed.state == "handoff"
    assert handed.handoff_count == 1
    assert handed.route_team == "finance"


def test_summary_counts_state_and_handoff() -> None:
    queue = get_queue()
    first = queue.submit(
        source="chat",
        summary="A",
        category="general",
        severity="low",
    )
    second = queue.submit(
        source="chat",
        summary="B",
        category="general",
        severity="low",
    )

    queue.claim(first.id, agent="agent-1")
    queue.handoff(
        first.id,
        to_team="customer-support",
        reason="Complex case",
    )
    queue.resolve(second.id)

    stats = escalation_summary()
    assert stats.total == 2
    assert stats.handoff == 1
    assert stats.resolved == 1
    assert stats.handoff_total == 1
    assert stats.open == 0
