from __future__ import annotations

from amc.vault.v6_dsar_autopilot import DSARAutopilot, StubConnector, DataPackage, DeletionRecord


def test_request_submitted_and_verified(tmp_path):
    pilot = DSARAutopilot(db_path=str(tmp_path / "dsar.db"))
    req = pilot.submit_request(
        requester_email="alice@example.com",
        request_type="access",
        verification_token="verify-token",
    )

    assert req.request_id
    assert req.request_type == "access"
    assert pilot.verify_requester(req.request_id, "verify-token") is True


def test_data_compiled(tmp_path):
    pilot = DSARAutopilot(db_path=str(tmp_path / "dsar.db"))
    req = pilot.submit_request(
        requester_email="alice@example.com",
        request_type="access",
        verification_token="verify-token",
    )

    pilot.verify_requester(req.request_id, "verify-token")
    package = pilot.compile_data_package(
        req.request_id,
        connectors=[StubConnector("crm", {"alice@example.com": ["crm-record-1", "crm-record-2"]})],
    )

    assert isinstance(package, DataPackage)
    assert package.request_id == req.request_id
    assert package.file_path
    assert "crm" in package.data_found


def test_deletion_recorded(tmp_path):
    pilot = DSARAutopilot(db_path=str(tmp_path / "dsar.db"))
    req = pilot.submit_request(
        requester_email="alice@example.com",
        request_type="delete",
        verification_token="verify-token",
    )

    pilot.verify_requester(req.request_id, "verify-token")
    record = pilot.execute_deletion(
        req.request_id,
        connectors=[StubConnector("crm", {"alice@example.com": ["crm-record-1"]})],
    )

    assert isinstance(record, DeletionRecord)
    assert record.request_id == req.request_id
    assert record.deleted_items
    assert record.deleted_items[0].endswith("crm-record-1")
    assert len(record.evidence_hash) == 64
