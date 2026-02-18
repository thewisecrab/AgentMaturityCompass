from __future__ import annotations

from amc.core.models import RiskLevel
from amc.enforce.e12_reverse_proxy_guard import ProxyConfig, ReverseProxyGuard


def test_trusted_proxy_validates(tmp_path):
    cfg = ProxyConfig(
        trusted_proxy_ips=["203.0.113.10"],
        direct_port=8080,
        proxy_port=8443,
        blocked_headers=[],
    )
    guard = ReverseProxyGuard(cfg, db_path=str(tmp_path / "proxy_guard.db"))

    result = guard.validate_request(
        headers={
            "X-Forwarded-For": "198.51.100.20, 203.0.113.10",
            "X-Real-IP": "203.0.113.10",
        },
        source_ip="203.0.113.10",
        target_port=8443,
    )

    assert result.valid is True
    assert result.issues == []


def test_spoofing_detected_for_xff(monkeypatch, tmp_path):
    cfg = ProxyConfig(
        trusted_proxy_ips=["203.0.113.10"],
        direct_port=8080,
        proxy_port=8443,
        blocked_headers=[],
    )
    guard = ReverseProxyGuard(cfg, db_path=str(tmp_path / "proxy_guard.db"))

    result = guard.validate_request(
        headers={"X-Forwarded-For": "198.51.100.20"},
        source_ip="198.51.100.20",
        target_port=8443,
    )

    assert result.spoofing_detected is True
    assert any("x-forwarded-for_set_by_untrusted_ip" in i for i in result.issues)


def test_direct_access_flagged(monkeypatch, tmp_path):
    cfg = ProxyConfig(
        trusted_proxy_ips=["203.0.113.10"],
        direct_port=8080,
        proxy_port=8443,
        blocked_headers=[],
    )
    guard = ReverseProxyGuard(cfg, db_path=str(tmp_path / "proxy_guard.db"))

    monkeypatch.setattr(guard, "probe_direct_access", lambda host, port, timeout=2: True)

    result = guard.validate_request(
        headers={},
        source_ip="198.51.100.20",
        target_port=8080,
    )

    assert result.risk_level == RiskLevel.HIGH
    assert "direct_gateway_port_accessible" in result.issues
