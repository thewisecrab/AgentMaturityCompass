"""Tests for S16: Trusted UI Fingerprint Guard."""
from __future__ import annotations

import pytest

from amc.shield.s16_ui_fingerprint import (
    FingerprintPolicy,
    UIFingerprintGuard,
)

DOMAIN = "auth.myapp.com"
PATH = "/login"
TITLE = "My App — Sign In"
FORM_HTML = '<form><input name="email"/><input name="password"/></form>'
CERT = "Let's Encrypt Authority X3"


@pytest.fixture()
def guard():
    return UIFingerprintGuard(
        policy=FingerprintPolicy(
            monitored_domains=[DOMAIN],
            block_on_suspicious=True,
            alert_on_new_domain=True,
            similarity_threshold=0.8,
        ),
        db_path=":memory:",
    )


# ---------------------------------------------------------------------------
# Test: identical page scores 0 drift (not suspicious)
# ---------------------------------------------------------------------------

class TestIdenticalPage:
    def test_identical_drift_zero(self, guard):
        guard.capture_baseline(DOMAIN, PATH, TITLE, FORM_HTML, CERT)
        check = guard.check_page(DOMAIN, PATH, TITLE, FORM_HTML, CERT)
        assert check.drift_score == 0.0

    def test_identical_not_suspicious(self, guard):
        guard.capture_baseline(DOMAIN, PATH, TITLE, FORM_HTML, CERT)
        check = guard.check_page(DOMAIN, PATH, TITLE, FORM_HTML, CERT)
        assert check.suspicious is False

    def test_identical_no_drift_details(self, guard):
        guard.capture_baseline(DOMAIN, PATH, TITLE, FORM_HTML, CERT)
        check = guard.check_page(DOMAIN, PATH, TITLE, FORM_HTML, CERT)
        assert check.drift_details == []

    def test_identical_baseline_id_populated(self, guard):
        baseline = guard.capture_baseline(DOMAIN, PATH, TITLE, FORM_HTML, CERT)
        check = guard.check_page(DOMAIN, PATH, TITLE, FORM_HTML, CERT)
        assert check.baseline_id == baseline.fingerprint_id

    def test_identical_without_cert(self, guard):
        guard.capture_baseline(DOMAIN, PATH, TITLE, FORM_HTML, cert_issuer=None)
        check = guard.check_page(DOMAIN, PATH, TITLE, FORM_HTML, cert_issuer=None)
        assert check.drift_score == 0.0


# ---------------------------------------------------------------------------
# Test: changed form fields detected as drift
# ---------------------------------------------------------------------------

class TestFormDrift:
    def test_changed_form_increases_drift(self, guard):
        guard.capture_baseline(DOMAIN, PATH, TITLE, FORM_HTML, CERT)
        tampered_form = '<form><input name="email"/><input name="cc_number"/></form>'
        check = guard.check_page(DOMAIN, PATH, TITLE, tampered_form, CERT)
        assert check.drift_score > 0.0

    def test_changed_form_flagged_in_details(self, guard):
        guard.capture_baseline(DOMAIN, PATH, TITLE, FORM_HTML, CERT)
        tampered_form = '<form><input name="username"/><input name="pin"/></form>'
        check = guard.check_page(DOMAIN, PATH, TITLE, tampered_form, CERT)
        assert any("form" in d.lower() for d in check.drift_details)

    def test_changed_form_suspicious(self, guard):
        """Form change alone contributes 1/3 drift; with title also changed → 2/3 > threshold 0.2."""
        guard.capture_baseline(DOMAIN, PATH, TITLE, FORM_HTML, CERT)
        # Change both form AND title → drift = 2/3 ≈ 0.667, threshold 1-0.8=0.2, so suspicious
        check = guard.check_page(
            DOMAIN, PATH, "Phishing Page", '<form><input name="stolen"/></form>', CERT
        )
        assert check.suspicious is True

    def test_only_form_changed_drift_score(self, guard):
        guard.capture_baseline(DOMAIN, PATH, TITLE, FORM_HTML, CERT)
        tampered_form = '<form><input name="credit_card"/></form>'
        check = guard.check_page(DOMAIN, PATH, TITLE, tampered_form, CERT)
        # 1 component changed out of 3 → 1/3 ≈ 0.333
        assert abs(check.drift_score - 1 / 3) < 1e-9

    def test_cert_change_detected(self, guard):
        guard.capture_baseline(DOMAIN, PATH, TITLE, FORM_HTML, CERT)
        check = guard.check_page(DOMAIN, PATH, TITLE, FORM_HTML, "Fake CA")
        assert check.drift_score > 0.0
        assert any("cert" in d.lower() or "tls" in d.lower() for d in check.drift_details)

    def test_all_three_changed_full_drift(self, guard):
        guard.capture_baseline(DOMAIN, PATH, TITLE, FORM_HTML, CERT)
        check = guard.check_page(
            DOMAIN, PATH,
            "Evil Bank Login",
            '<form><input name="steal_all"/></form>',
            "Evil Root CA",
        )
        assert check.drift_score == 1.0


# ---------------------------------------------------------------------------
# Test: new domain alerts flagged
# ---------------------------------------------------------------------------

class TestNewDomainAlert:
    def test_unknown_domain_suspicious(self, guard):
        check = guard.check_page("evil.phishing.com", PATH, TITLE, FORM_HTML, CERT)
        assert check.suspicious is True

    def test_unknown_domain_drift_is_one(self, guard):
        check = guard.check_page("unknown.domain.io", PATH, TITLE, FORM_HTML, CERT)
        assert check.drift_score == 1.0

    def test_unknown_domain_baseline_id_none(self, guard):
        check = guard.check_page("no-baseline.com", PATH, TITLE, FORM_HTML, CERT)
        assert check.baseline_id is None

    def test_unknown_domain_drift_details_populated(self, guard):
        check = guard.check_page("newsite.io", PATH, TITLE, FORM_HTML, CERT)
        assert len(check.drift_details) > 0

    def test_no_alert_when_policy_off(self):
        quiet_guard = UIFingerprintGuard(
            policy=FingerprintPolicy(
                monitored_domains=[],
                block_on_suspicious=False,
                alert_on_new_domain=False,
            ),
            db_path=":memory:",
        )
        check = quiet_guard.check_page("brand-new.com", PATH, TITLE, FORM_HTML, CERT)
        assert check.suspicious is False


# ---------------------------------------------------------------------------
# Test: mark_suspicious / is_blocked
# ---------------------------------------------------------------------------

class TestBlocklist:
    def test_mark_then_blocked(self, guard):
        guard.mark_suspicious("phishing.example.com")
        assert guard.is_blocked("phishing.example.com") is True

    def test_unmarked_not_blocked(self, guard):
        assert guard.is_blocked("clean.example.com") is False

    def test_mark_idempotent(self, guard):
        guard.mark_suspicious("repeat.io")
        guard.mark_suspicious("repeat.io")
        assert guard.is_blocked("repeat.io") is True

    def test_suspicious_page_auto_blocked(self, guard):
        guard.capture_baseline(DOMAIN, PATH, TITLE, FORM_HTML, CERT)
        guard.check_page(
            DOMAIN, PATH,
            "Phishing Clone",
            '<form><input name="credentials_stolen"/></form>',
            "Self-Signed",
        )
        # block_on_suspicious=True → domain should be blocklisted
        assert guard.is_blocked(DOMAIN)


# ---------------------------------------------------------------------------
# Test: baseline overwrite (latest baseline used)
# ---------------------------------------------------------------------------

class TestBaselineOverwrite:
    def test_new_baseline_replaces_old(self, guard):
        guard.capture_baseline(DOMAIN, PATH, TITLE, FORM_HTML, CERT)
        new_form = '<form><input name="email"/></form>'
        guard.capture_baseline(DOMAIN, PATH, TITLE, new_form, CERT)
        check = guard.check_page(DOMAIN, PATH, TITLE, new_form, CERT)
        assert check.drift_score == 0.0

    def test_fingerprint_is_trusted(self, guard):
        baseline = guard.capture_baseline(DOMAIN, PATH, TITLE, FORM_HTML, CERT)
        assert baseline.trusted is True
