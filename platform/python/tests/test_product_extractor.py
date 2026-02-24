"""Tests for amc.product.extractor — Unstructured-to-Structured Extraction (Feature #30)."""
from __future__ import annotations

import pytest

from amc.product.extractor import (
    ENTITY_AMOUNT,
    ENTITY_DATE,
    ENTITY_EMAIL,
    ENTITY_INVOICE_NO,
    ENTITY_PERCENTAGE,
    ENTITY_PHONE,
    ENTITY_PO_NUMBER,
    ENTITY_SKU,
    ENTITY_URL,
    ENTITY_VENDOR,
    EntityExtractor,
    ExtractionInput,
    get_extractor,
    _normalize_date,
)


@pytest.fixture()
def extractor():
    return EntityExtractor()


def _extract(extractor, text, types=None):
    return extractor.extract(ExtractionInput(text=text, entity_types=types or []))


# ---------------------------------------------------------------------------
# Amount extraction
# ---------------------------------------------------------------------------

def test_extract_usd_amount(extractor):
    result = _extract(extractor, "The invoice total is $1,234.56.")
    amounts = result.by_type(ENTITY_AMOUNT)
    assert len(amounts) >= 1
    assert any("1234" in a.normalized for a in amounts)


def test_extract_currency_code_amount(extractor):
    result = _extract(extractor, "Payment of 500 USD due on arrival.")
    amounts = result.by_type(ENTITY_AMOUNT)
    assert len(amounts) >= 1
    assert any("USD" in a.normalized for a in amounts)


def test_extract_euro_amount(extractor):
    result = _extract(extractor, "Cost: €99.99 per unit.")
    amounts = result.by_type(ENTITY_AMOUNT)
    assert len(amounts) >= 1


# ---------------------------------------------------------------------------
# Date extraction
# ---------------------------------------------------------------------------

def test_extract_iso_date(extractor):
    result = _extract(extractor, "Due date: 2024-03-15.")
    dates = result.by_type(ENTITY_DATE)
    assert any("2024" in d.value for d in dates)
    assert any(d.normalized == "2024-03-15" for d in dates)


def test_extract_written_date(extractor):
    result = _extract(extractor, "Invoice dated March 5, 2024.")
    dates = result.by_type(ENTITY_DATE)
    assert len(dates) >= 1
    assert any("2024" in d.normalized for d in dates)


def test_extract_slash_date(extractor):
    result = _extract(extractor, "Expires on 01/15/2025.")
    dates = result.by_type(ENTITY_DATE)
    assert len(dates) >= 1


# ---------------------------------------------------------------------------
# SKU extraction
# ---------------------------------------------------------------------------

def test_extract_explicit_sku(extractor):
    result = _extract(extractor, "Order SKU-12345 and PART-ABC-001.")
    skus = result.by_type(ENTITY_SKU)
    assert len(skus) >= 1


def test_extract_standalone_sku_code(extractor):
    result = _extract(extractor, "Please ship item PROD-XYZ-99.")
    skus = result.by_type(ENTITY_SKU)
    assert len(skus) >= 1


def test_extract_sku_prefix_patterns(extractor):
    result = _extract(extractor, "We need MPN: ABC-12345 and REF: XY-9999.")
    skus = result.by_type(ENTITY_SKU)
    assert len(skus) >= 1


# ---------------------------------------------------------------------------
# Email extraction
# ---------------------------------------------------------------------------

def test_extract_email(extractor):
    result = _extract(extractor, "Contact us at support@amc.io for help.")
    emails = result.by_type(ENTITY_EMAIL)
    assert len(emails) == 1
    assert emails[0].normalized == "support@amc.io"


def test_extract_multiple_emails(extractor):
    result = _extract(extractor, "CC: alice@example.com, bob@corp.org")
    emails = result.by_type(ENTITY_EMAIL)
    assert len(emails) == 2


# ---------------------------------------------------------------------------
# URL extraction
# ---------------------------------------------------------------------------

def test_extract_url(extractor):
    result = _extract(extractor, "Visit https://www.example.com/page for docs.")
    urls = result.by_type(ENTITY_URL)
    assert len(urls) >= 1
    assert any("example.com" in u.value for u in urls)


def test_extract_www_url(extractor):
    result = _extract(extractor, "See www.acme.com for pricing.")
    urls = result.by_type(ENTITY_URL)
    assert len(urls) >= 1


# ---------------------------------------------------------------------------
# Vendor extraction
# ---------------------------------------------------------------------------

def test_extract_vendor_with_inc(extractor):
    result = _extract(extractor, "We signed a contract with Acme Solutions Inc.")
    vendors = result.by_type(ENTITY_VENDOR)
    assert len(vendors) >= 1
    assert any("Acme" in v.value for v in vendors)


def test_extract_vendor_with_llc(extractor):
    result = _extract(extractor, "Payment to Global Tech LLC approved.")
    vendors = result.by_type(ENTITY_VENDOR)
    assert len(vendors) >= 1


# ---------------------------------------------------------------------------
# Percentage extraction
# ---------------------------------------------------------------------------

def test_extract_percentage(extractor):
    result = _extract(extractor, "Discount of 15% applied.")
    pcts = result.by_type(ENTITY_PERCENTAGE)
    assert len(pcts) >= 1
    assert any("15%" in p.normalized for p in pcts)


# ---------------------------------------------------------------------------
# Invoice / PO numbers
# ---------------------------------------------------------------------------

def test_extract_invoice_number(extractor):
    result = _extract(extractor, "Please pay Invoice INV-2024-001 by month end.")
    invs = result.by_type(ENTITY_INVOICE_NO)
    assert len(invs) >= 1


def test_extract_po_number(extractor):
    result = _extract(extractor, "Approved PO #PO-5678 for Q1 spend.")
    pos = result.by_type(ENTITY_PO_NUMBER)
    assert len(pos) >= 1


# ---------------------------------------------------------------------------
# Filtered extraction
# ---------------------------------------------------------------------------

def test_filter_by_entity_type(extractor):
    text = "Email bob@test.com, pay $500, due 2024-01-01."
    result = extractor.extract(ExtractionInput(text=text, entity_types=[ENTITY_EMAIL]))
    assert all(e.entity_type == ENTITY_EMAIL for e in result.entities)
    assert result.entity_counts.get(ENTITY_EMAIL, 0) >= 1
    # Amounts and dates should not appear
    assert ENTITY_AMOUNT not in result.entity_counts
    assert ENTITY_DATE not in result.entity_counts


# ---------------------------------------------------------------------------
# Metadata and result structure
# ---------------------------------------------------------------------------

def test_result_structure(extractor):
    result = _extract(extractor, "Invoice $100.00 due 2024-01-01, contact me@test.com.")
    assert result.total_entities == len(result.entities)
    assert result.char_length == len("Invoice $100.00 due 2024-01-01, contact me@test.com.")
    assert result.extraction_ts


def test_context_window(extractor):
    text = "Reference: the invoice total is $500 and it was paid."
    result = extractor.extract(ExtractionInput(text=text, context_window=10))
    amounts = result.by_type(ENTITY_AMOUNT)
    for a in amounts:
        assert len(a.context) > 0


# ---------------------------------------------------------------------------
# Date normalizer
# ---------------------------------------------------------------------------

def test_normalize_iso_date():
    assert _normalize_date("2024-03-15") == "2024-03-15"


def test_normalize_written_date():
    assert _normalize_date("March 5, 2024") == "2024-03-05"


def test_normalize_slash_date():
    assert _normalize_date("15/03/2024") == "2024-03-15"


def test_normalize_unknown_date():
    val = _normalize_date("sometime in march")
    assert val == "sometime in march"  # graceful fallback


# ---------------------------------------------------------------------------
# Singleton
# ---------------------------------------------------------------------------

def test_singleton_factory():
    import amc.product.extractor as mod
    mod._extractor = None
    e1 = get_extractor()
    e2 = get_extractor()
    assert e1 is e2
    mod._extractor = None
