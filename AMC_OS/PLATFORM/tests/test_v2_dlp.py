from amc.vault.v2_dlp import DLPRedactor, SecretType


def test_api_key_detected_and_redacted():
    text = "rotate this key: sk-proj-abcdefghijklmnopqrstuvwxyz1234567890 now"
    dlp = DLPRedactor()
    clean, receipts = dlp.redact(text)

    assert clean != text
    assert "[REDACTED:api_key]" in clean
    assert any(r.secret_type == SecretType.API_KEY for r in receipts)


def test_jwt_redacted():
    sample = "Use token eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.signaturepayload"
    dlp = DLPRedactor()
    clean, receipts = dlp.redact(sample)

    assert "[REDACTED:jwt_token]" in clean
    assert any(r.secret_type == SecretType.JWT_TOKEN for r in receipts)


def test_email_redacted():
    sample = "Contact me at security@example.com for handoff."
    dlp = DLPRedactor(redact_emails=True)
    clean, receipts = dlp.redact(sample)

    assert "[REDACTED:email]" in clean
    assert any(r.secret_type == SecretType.EMAIL for r in receipts)


def test_clean_text_unchanged():
    sample = "No secrets or PII are present in this sentence."
    dlp = DLPRedactor()
    clean, receipts = dlp.redact(sample)

    assert clean == sample
    assert receipts == []
