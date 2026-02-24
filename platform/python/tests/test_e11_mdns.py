from __future__ import annotations

import socket
import struct
from pathlib import Path

from amc.enforce.e11_mdns_controller import MDNSConfig, MDNSController, MDNSScanResult


class _FakeSocket:
    def __init__(self, packets: list[tuple[bytes, tuple[str, int]]]):
        self._packets = packets.copy()

    def settimeout(self, timeout: float) -> None:
        self._timeout = timeout

    def setsockopt(self, *_args, **_kwargs) -> None:
        return None

    def setblocking(self, _flag: bool) -> None:
        pass

    def bind(self, _addr: tuple[str, int]) -> None:
        return None

    def recvfrom(self, _size: int) -> tuple[bytes, tuple[str, int]]:
        if self._packets:
            return self._packets.pop(0)
        raise socket.timeout()

    def close(self) -> None:
        return None


def _mk_dns_name(name: str) -> bytes:
    out = bytearray()
    for label in name.split("."):
        out.append(len(label))
        out.extend(label.encode("utf-8"))
    out.append(0)
    return bytes(out)


def _mdns_packet_with_txt() -> bytes:
    # Build a response with a single service + TXT record.
    qdcount = 0
    ancount = 2
    # header
    header = struct.pack("!6H", 0x0000, 0x8400, qdcount, ancount, 0, 0)
    service_name = "_test._tcp.local"
    service_instance = "device._test._tcp.local"

    # PTR RR: _test._tcp.local -> device._test._tcp.local
    ptr_name = _mk_dns_name(service_name)
    ptr_target = _mk_dns_name(service_instance)
    ptr = (
        ptr_name
        + struct.pack("!HH", 12, 1)
        + struct.pack("!HH", 0, 120)
        + struct.pack("!H", len(ptr_target))
        + ptr_target
    )

    txt_payload = bytearray()
    txt_payload.extend(bytes([8]))
    txt_payload.extend(b"token=abc")
    txt_payload.extend(bytes([9]))
    txt_payload.extend(b"version=1")

    # TXT RR
    txt = (
        _mk_dns_name(service_instance)
        + struct.pack("!HH", 16, 1)
        + struct.pack("!HH", 0, 120)
        + struct.pack("!H", len(txt_payload))
        + bytes(txt_payload)
    )

    return header + ptr + txt


def test_scan_returns_result(monkeypatch, tmp_path: Path):
    controller = MDNSController(MDNSConfig(discovery_mode="full"), db_path=str(tmp_path / "mdns.db"))
    packet = _mdns_packet_with_txt()
    fake = _FakeSocket([(packet, ("127.0.0.1", 5353))])
    monkeypatch.setattr(socket, "socket", lambda *_args, **_kwargs: fake)

    result = controller.scan_local(duration_seconds=0.01)

    assert result is not None
    assert isinstance(result, type(MDNSScanResult()))
    assert len(result.services_found) == 1
    assert result.raw_packet_count == 1


def test_sensitive_field_flagged(monkeypatch, tmp_path: Path):
    controller = MDNSController(MDNSConfig(discovery_mode="full"), db_path=str(tmp_path / "mdns.db"))
    packet = _mdns_packet_with_txt()
    fake = _FakeSocket([(packet, ("127.0.0.1", 5353))])
    monkeypatch.setattr(socket, "socket", lambda *_args, **_kwargs: fake)

    result = controller.scan_local(duration_seconds=0.01)

    assert "token" in result.sensitive_fields_leaked
    assert result.risk_level.name == "HIGH"


def test_detect_drift():
    baseline = MDNSScanResult(
        services_found=[],
        sensitive_fields_leaked=["token"],
        recommendations=[],
    )
    current = MDNSScanResult(
        services_found=[],
        sensitive_fields_leaked=[],
        recommendations=[],
    )
    controller = MDNSController(MDNSConfig(), db_path=":memory:")
    drift = controller.detect_drift(baseline, current)

    assert "sensitive_fields_changed" in drift
