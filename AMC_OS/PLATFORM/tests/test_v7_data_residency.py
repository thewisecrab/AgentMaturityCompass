from __future__ import annotations

from amc.vault.v7_data_residency import DataClass, DataResidencyGate, RegionPolicy, ModelEndpoint


def test_eu_data_blocked_from_us_endpoint(tmp_path):
    gate = DataResidencyGate(db_path=str(tmp_path / "residency.db"))
    us = gate.endpoints["openai-us"]

    decision = gate.check_routing(DataClass.PII, us, data_subject_region="EU")

    assert decision.allowed is False
    assert decision.requires_anonymization or "blocked" in decision.reason.lower() or "cross_border" in decision.reason.lower()


def test_anonymization_path_taken(tmp_path):
    gate = DataResidencyGate(db_path=str(tmp_path / "residency.db"))
    us = gate.endpoints["openai-us"]

    decision = gate.check_routing(DataClass.HEALTH, us, data_subject_region="EU")

    assert decision.requires_anonymization is True
    assert decision.alternative_endpoint is not None


def test_allowed_routing_for_general_data(tmp_path):
    gate = DataResidencyGate(db_path=str(tmp_path / "residency.db"))
    us = gate.endpoints["openai-us"]

    decision = gate.check_routing(DataClass.PUBLIC, us, data_subject_region="EU")

    assert decision.allowed is True
    assert decision.requires_anonymization is False
    assert decision.reason == "routing_allowed"
