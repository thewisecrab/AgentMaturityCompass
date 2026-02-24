"""
Tests for W5 Inter-Agent Bus.

Covers:
- Agent registration and keypair generation
- Send + receive with signature verification
- Capability escalation rejected
- Replay protection (duplicate nonce rejected)
- Capability token minting and delegation
"""
from __future__ import annotations

import pytest

from amc.watch.w5_agent_bus import (
    AgentBus,
    AgentBusError,
    CapabilityEscalationError,
    ReplayDetectedError,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def bus() -> AgentBus:
    return AgentBus(db_path=":memory:")


@pytest.fixture()
def alice_and_bob(bus: AgentBus):
    """Register alice (read+write) and bob (read)."""
    alice, alice_sk = bus.register_agent("alice", ["read", "write"])
    bob, bob_sk = bus.register_agent("bob", ["read"])
    return alice, alice_sk, bob, bob_sk


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------

class TestRegistration:
    """Agent registration and identity."""

    def test_register_agent(self, bus: AgentBus) -> None:
        identity, sk = bus.register_agent("scanner", ["scan", "report"])
        assert identity.agent_id == "scanner"
        assert identity.capabilities == ["scan", "report"]
        assert len(sk) == 32  # Ed25519 raw private key

    def test_duplicate_registration_rejected(self, bus: AgentBus) -> None:
        bus.register_agent("dup", ["read"])
        with pytest.raises(AgentBusError, match="already registered"):
            bus.register_agent("dup", ["write"])


# ---------------------------------------------------------------------------
# Send + Receive
# ---------------------------------------------------------------------------

class TestSendReceive:
    """Message sending and verified receiving."""

    def test_send_and_receive(self, bus: AgentBus, alice_and_bob) -> None:
        alice, alice_sk, bob, bob_sk = alice_and_bob
        payload = {"action": "hello", "data": 42}

        msg = bus.send("alice", alice_sk, "bob", payload)
        assert msg.from_agent_id == "alice"
        assert msg.to_agent_id == "bob"
        assert msg.payload_hash.startswith("sha256:")

        verified = bus.receive("bob")
        assert len(verified) == 1
        assert verified[0].payload == payload
        assert verified[0].sender_identity.agent_id == "alice"

    def test_receive_marks_delivered(self, bus: AgentBus, alice_and_bob) -> None:
        _, alice_sk, _, _ = alice_and_bob
        bus.send("alice", alice_sk, "bob", {"msg": "first"})

        v1 = bus.receive("bob")
        assert len(v1) == 1

        # Second receive returns empty (already delivered)
        v2 = bus.receive("bob")
        assert len(v2) == 0

    def test_multiple_messages(self, bus: AgentBus, alice_and_bob) -> None:
        _, alice_sk, _, bob_sk = alice_and_bob
        bus.send("alice", alice_sk, "bob", {"n": 1})
        bus.send("alice", alice_sk, "bob", {"n": 2})
        bus.send("bob", bob_sk, "alice", {"n": 3})

        bob_msgs = bus.receive("bob")
        assert len(bob_msgs) == 2

        alice_msgs = bus.receive("alice")
        assert len(alice_msgs) == 1
        assert alice_msgs[0].payload == {"n": 3}


# ---------------------------------------------------------------------------
# Capability Escalation
# ---------------------------------------------------------------------------

class TestCapabilityEscalation:
    """Agents cannot delegate capabilities they don't possess."""

    def test_escalation_rejected(self, bus: AgentBus, alice_and_bob) -> None:
        _, _, bob, bob_sk = alice_and_bob
        # Bob has ["read"], tries to mint token with ["read", "write"]
        with pytest.raises(CapabilityEscalationError):
            bus.mint_capability_token("bob", bob_sk, "alice", ["read", "write"])

    def test_valid_delegation_accepted(self, bus: AgentBus, alice_and_bob) -> None:
        alice, alice_sk, bob, bob_sk = alice_and_bob
        # Alice has ["read", "write"], delegates ["read"] to bob
        token = bus.mint_capability_token("alice", alice_sk, "bob", ["read"])
        assert token.issuer_agent_id == "alice"
        assert token.grantee_agent_id == "bob"
        assert token.capabilities == ["read"]

    def test_subset_delegation_accepted(self, bus: AgentBus, alice_and_bob) -> None:
        alice, alice_sk, _, _ = alice_and_bob
        # Alice delegates just "write" (subset of her capabilities)
        token = bus.mint_capability_token("alice", alice_sk, "bob", ["write"])
        assert token.capabilities == ["write"]

    def test_empty_escalation_set(self, bus: AgentBus, alice_and_bob) -> None:
        """Escalation error message should identify which caps are missing."""
        _, _, bob, bob_sk = alice_and_bob
        with pytest.raises(CapabilityEscalationError, match="write"):
            bus.mint_capability_token("bob", bob_sk, "alice", ["read", "write"])


# ---------------------------------------------------------------------------
# Replay Protection
# ---------------------------------------------------------------------------

class TestReplayProtection:
    """Duplicate nonces must be rejected."""

    def test_replay_rejected_on_receive(self, bus: AgentBus, alice_and_bob) -> None:
        _, alice_sk, _, _ = alice_and_bob
        msg = bus.send("alice", alice_sk, "bob", {"x": 1})

        # First receive succeeds
        v1 = bus.receive("bob")
        assert len(v1) == 1

        # Manually re-insert the same message with same nonce to simulate replay
        bus._db.execute(
            "INSERT INTO messages (message_id, from_agent_id, to_agent_id, payload_hash, payload_json, signature, capability_token_id, timestamp, nonce, delivered) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)",
            (
                "msg-replay",
                msg.from_agent_id,
                msg.to_agent_id,
                msg.payload_hash,
                '{"x":1}',
                msg.signature,
                None,
                msg.timestamp.isoformat(),
                msg.nonce,  # same nonce!
            ),
        )
        bus._db.commit()

        # Second receive with same nonce should be filtered out
        v2 = bus.receive("bob")
        assert len(v2) == 0  # replay detected, message skipped


# ---------------------------------------------------------------------------
# Audit Trail
# ---------------------------------------------------------------------------

class TestAuditTrail:
    """Audit trail retrieval."""

    def test_audit_trail(self, bus: AgentBus, alice_and_bob) -> None:
        _, alice_sk, _, bob_sk = alice_and_bob
        bus.send("alice", alice_sk, "bob", {"a": 1})
        bus.send("bob", bob_sk, "alice", {"b": 2})

        trail = bus.get_audit_trail()
        assert len(trail) == 2

        alice_trail = bus.get_audit_trail("alice")
        assert len(alice_trail) == 2  # alice is sender or recipient of both

    def test_audit_trail_empty(self, bus: AgentBus) -> None:
        trail = bus.get_audit_trail()
        assert trail == []
