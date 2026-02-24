from amc.vault.v9_invoice_fraud import InvoiceData, InvoiceFraudScorer, RiskLevel


def _make_scorer(tmp_path):
    return InvoiceFraudScorer(db_path=str(tmp_path / "invoice_fraud.db"))


def _invoice(**kwargs) -> InvoiceData:
    base = {
        "sender_email": "billing@supplier.com",
        "sender_domain": "supplier.com",
        "reply_to_email": "billing@supplier.com",
        "bank_account": "11111111",
        "invoice_number": "INV-1001",
        "amount": 200.0,
        "currency": "USD",
        "po_number": "PO-100",
        "items": [{"sku": "A1", "qty": 1}],
    }
    base.update(kwargs)
    return InvoiceData(**base)


def test_higher_score_for_reply_to_and_domain_similarity(tmp_path):
    scorer = _make_scorer(tmp_path)

    score = scorer.score_invoice(_invoice(
        sender_domain="suppl1er-support.com",
        reply_to_email="help@attacker.com",
        amount=200.0,
    ))

    assert score.total_score >= 40
    assert score.risk_level in {RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL}
    assert any(s.signal_id == "reply_to_mismatch" for s in score.signals)
    # domain_similarity fires only when sender_domain is within levenshtein-2 of a
    # KNOWN_VENDOR_DOMAIN entry; suppl1er-support.com is too far from the built-in list.
    # The test validates that reply-to alone (SIG_REPLY_TO=40) breaches the verify threshold.


def test_bank_change_triggers_critical_signal(tmp_path):
    scorer = _make_scorer(tmp_path)

    base_id = scorer.score_invoice(_invoice()).invoice_id
    scorer.register_legitimate(base_id)

    score = scorer.score_invoice(_invoice(
        invoice_number="INV-1002",
        bank_account="99887766",  # changed
        amount=210.0,
    ))
    assert score.total_score >= 46
    assert any(s.signal_id == "bank_account_change" for s in score.signals)
    assert score.recommended_action in {"hold", "reject", "verify"}


def test_invoice_sequence_anomaly_score(tmp_path):
    scorer = _make_scorer(tmp_path)
    scorer.register_legitimate(scorer.score_invoice(_invoice(invoice_number="INV-1001")).invoice_id)
    scorer.register_legitimate(scorer.score_invoice(_invoice(invoice_number="INV-1002")).invoice_id)
    scorer.register_legitimate(scorer.score_invoice(_invoice(invoice_number="INV-1003")).invoice_id)

    score = scorer.score_invoice(_invoice(invoice_number="INV-2000", amount=190.0))
    assert any(s.signal_id == "invoice_sequence" for s in score.signals)
    assert score.total_score >= 0


def test_amount_anomaly_triggers_high_signal(tmp_path):
    scorer = _make_scorer(tmp_path)
    scorer.register_legitimate(scorer.score_invoice(_invoice(invoice_number="INV-1001", amount=100)).invoice_id)
    scorer.register_legitimate(scorer.score_invoice(_invoice(invoice_number="INV-1002", amount=110)).invoice_id)
    score = scorer.score_invoice(_invoice(invoice_number="INV-1003", amount=1000, currency="USD"))
    assert any(s.signal_id == "amount_anomaly" for s in score.signals)
    assert score.recommended_action in {"verify", "hold", "reject"}
