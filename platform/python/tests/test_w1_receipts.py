import sqlite3

import pytest

from amc.core.models import ActionReceipt, PolicyDecision, SessionTrust, ToolCategory
from amc.watch.w1_receipts import get_ledger


@pytest.mark.asyncio
async def test_append(tmp_path):
    db_path = tmp_path / "receipts.db"
    ledger = await get_ledger(str(db_path))

    receipt = ActionReceipt(
        session_id="s1",
        sender_id="user1",
        trust_level=SessionTrust.OWNER,
        tool_name="exec",
        tool_category=ToolCategory.EXEC,
        parameters_redacted={"command": "ls"},
        outcome_summary="listed",
        policy_decision=PolicyDecision.ALLOW,
    )

    sealed = await ledger.append(receipt)
    assert sealed.receipt_id == receipt.receipt_id
    assert sealed.receipt_hash
    rows = await ledger.query(limit=10)
    assert len(rows) == 1


@pytest.mark.asyncio
async def test_chain_integrity(tmp_path):
    db_path = tmp_path / "receipts.db"
    ledger = await get_ledger(str(db_path))

    for i in range(2):
        await ledger.append(ActionReceipt(
            session_id="s1",
            sender_id="user1",
            trust_level=SessionTrust.OWNER,
            tool_name="exec",
            tool_category=ToolCategory.EXEC,
            parameters_redacted={"command": f"ls {i}"},
            outcome_summary="ok",
            policy_decision=PolicyDecision.ALLOW,
        ))

    ok, msg = await ledger.verify_chain()
    assert ok is True
    assert "Chain OK" in msg


@pytest.mark.asyncio
async def test_tamper_detection(tmp_path):
    db_path = tmp_path / "receipts.db"
    ledger = await get_ledger(str(db_path))

    receipt = ActionReceipt(
        session_id="s1",
        sender_id="user1",
        trust_level=SessionTrust.OWNER,
        tool_name="exec",
        tool_category=ToolCategory.EXEC,
        parameters_redacted={"command": "ls"},
        outcome_summary="listed",
        policy_decision=PolicyDecision.ALLOW,
    )
    await ledger.append(receipt)

    # Tamper with stored payload directly
    with sqlite3.connect(db_path) as conn:
        cur = conn.cursor()
        cur.execute("SELECT payload_json FROM receipts LIMIT 1")
        row = cur.fetchone()
        assert row
        payload = row[0].replace("listed", "forged", 1)
        cur.execute("UPDATE receipts SET payload_json = ? WHERE id = 1", (payload,))
        conn.commit()

    ok, msg = await ledger.verify_chain()
    assert ok is False
    assert "tampered" in msg.lower() or "mismatch" in msg.lower()
