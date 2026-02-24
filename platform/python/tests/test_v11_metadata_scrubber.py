"""
Tests for V11: Attachment Metadata Scrubber
"""
from __future__ import annotations

import csv
import io
import json
import tempfile
from pathlib import Path

import pytest

from amc.vault.v11_metadata_scrubber import MetadataScrubber, ScrubConfig, ScrubResult


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def scrubber(tmp_path):
    """Fresh scrubber with a temp DB for each test."""
    return MetadataScrubber(db_path=tmp_path / "scrub.db")


# ---------------------------------------------------------------------------
# JSON tests
# ---------------------------------------------------------------------------


def test_json_author_field_removed(scrubber):
    """Author fields in JSON are removed; non-author fields are kept."""
    doc = {
        "title": "Q3 Report",
        "author": "Alice Smith",
        "creator": "ExportTool v2",
        "created_by": "alice@example.com",
        "content": "Revenue was up 12%",
        "tags": ["finance", "q3"],
    }
    raw = json.dumps(doc).encode()
    clean_bytes, result = scrubber.scrub_bytes(raw, "report.json")

    clean = json.loads(clean_bytes.decode())
    assert "author" not in clean
    assert "creator" not in clean
    assert "created_by" not in clean
    # Non-author fields preserved
    assert clean["title"] == "Q3 Report"
    assert clean["content"] == "Revenue was up 12%"
    assert clean["tags"] == ["finance", "q3"]

    # Result checks
    assert isinstance(result, ScrubResult)
    assert result.is_safe_to_send is True
    removed = [f.field_name for f in result.fields_processed if f.action_taken == "removed"]
    assert "author" in removed
    assert "creator" in removed
    assert "created_by" in removed


def test_json_nested_author_removed(scrubber):
    """Author fields are scrubbed recursively from nested objects."""
    doc = {
        "metadata": {
            "author": "Bob",
            "hostname": "build-server-01",
            "uuid": "123e4567-e89b-12d3-a456-426614174000",
        },
        "data": {"value": 42},
    }
    raw = json.dumps(doc).encode()
    clean_bytes, result = scrubber.scrub_bytes(raw, "nested.json")
    clean = json.loads(clean_bytes.decode())

    assert "author" not in clean["metadata"]
    assert "hostname" not in clean["metadata"]
    assert "uuid" not in clean["metadata"]
    assert clean["data"]["value"] == 42


def test_json_no_author_fields_no_change(scrubber):
    """JSON without author fields passes through with no fields processed."""
    doc = {"title": "Clean Doc", "version": 1}
    raw = json.dumps(doc).encode()
    clean_bytes, result = scrubber.scrub_bytes(raw, "clean.json")
    clean = json.loads(clean_bytes.decode())

    assert clean["title"] == "Clean Doc"
    assert len(result.fields_processed) == 0


def test_json_watermark_added(tmp_path):
    """Watermark key is injected when watermark_output=True."""
    cfg = ScrubConfig(watermark_output=True, watermark_text="TEST-MARK")
    scrubber = MetadataScrubber(config=cfg, db_path=tmp_path / "wm.db")
    doc = {"data": "hello"}
    raw = json.dumps(doc).encode()
    clean_bytes, _ = scrubber.scrub_bytes(raw, "wm.json")
    clean = json.loads(clean_bytes.decode())
    assert clean.get("_amc_scrubbed") == "TEST-MARK"


# ---------------------------------------------------------------------------
# CSV tests
# ---------------------------------------------------------------------------


def test_csv_metadata_row_stripped(scrubber):
    """Metadata header rows (Author:, Created:, Generator:) are stripped."""
    rows = [
        ["Author:", "Alice Smith"],
        ["Created:", "2024-01-01"],
        ["Generator:", "ReportTool"],
        ["Name", "Score", "Grade"],
        ["Alice", "95", "A"],
        ["Bob", "80", "B"],
    ]
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerows(rows)
    raw = buf.getvalue().encode()

    clean_bytes, result = scrubber.scrub_bytes(raw, "data.csv")
    clean_text = clean_bytes.decode()
    reader = csv.reader(io.StringIO(clean_text))
    clean_rows = [r for r in reader if r]  # skip empty trailing rows

    # Metadata rows should be gone
    first_cells = [r[0] for r in clean_rows]
    assert "Author:" not in first_cells
    assert "Created:" not in first_cells
    assert "Generator:" not in first_cells

    # Data rows should remain
    assert any(r[0] == "Name" for r in clean_rows)
    assert any(r[0] == "Alice" for r in clean_rows)

    # Fields processed
    removed = [f.field_name for f in result.fields_processed]
    assert "author" in removed or "Author" in removed or any("author" in n.lower() for n in removed)
    assert result.is_safe_to_send is True


def test_csv_no_metadata_unchanged(scrubber):
    """CSV without metadata rows passes through intact."""
    rows = [["Name", "Age"], ["Alice", "30"], ["Bob", "25"]]
    buf = io.StringIO()
    csv.writer(buf).writerows(rows)
    raw = buf.getvalue().encode()

    clean_bytes, result = scrubber.scrub_bytes(raw, "clean.csv")
    assert len(result.fields_processed) == 0


# ---------------------------------------------------------------------------
# Text / Markdown tests
# ---------------------------------------------------------------------------


def test_text_author_comment_removed(scrubber):
    """HTML author comments are stripped from markdown files."""
    content = "# Report\n<!-- author: Alice Smith -->\nSome content here."
    raw = content.encode()
    clean_bytes, result = scrubber.scrub_bytes(raw, "report.md")
    clean = clean_bytes.decode()

    assert "<!-- author: Alice Smith -->" not in clean
    assert "Some content here." in clean
    assert len(result.fields_processed) > 0


def test_text_no_author_comment_unchanged(scrubber):
    """Markdown without author comments passes through unchanged."""
    content = "# Clean Report\n\nNo metadata here."
    raw = content.encode()
    clean_bytes, result = scrubber.scrub_bytes(raw, "clean.md")
    assert clean_bytes.decode() == content
    assert len(result.fields_processed) == 0


# ---------------------------------------------------------------------------
# Binary / unknown files
# ---------------------------------------------------------------------------


def test_binary_file_flagged_as_cannot_scrub(scrubber):
    """Binary files are flagged with a warning and returned unchanged."""
    binary_data = bytes(range(256)) * 10  # clearly binary
    clean_bytes, result = scrubber.scrub_bytes(binary_data, "image.png")

    # Bytes returned unchanged
    assert clean_bytes == binary_data
    # Marked as NOT safe to send
    assert result.is_safe_to_send is False
    # Warning mentions cannot scrub
    assert any("cannot scrub" in w.lower() or "binary" in w.lower() for w in result.warnings)
    # SHA-256 logged in fields or warnings
    all_text = " ".join(result.warnings) + " ".join(
        f.original_value for f in result.fields_processed
    )
    assert "sha256" in all_text.lower() or len(result.fields_processed) > 0


def test_binary_sizes_match(scrubber):
    """For binary files, original_size and scrubbed_size are equal."""
    data = b"\x00\xff" * 50
    clean_bytes, result = scrubber.scrub_bytes(data, "data.bin")
    assert result.original_size == len(data)
    assert result.scrubbed_size == len(data)


# ---------------------------------------------------------------------------
# scrub_file
# ---------------------------------------------------------------------------


def test_scrub_file_reads_and_writes(scrubber, tmp_path):
    """scrub_file reads input, scrubs, and writes output."""
    doc = {"author": "Eve", "data": "hello"}
    input_path = tmp_path / "in.json"
    output_path = tmp_path / "out.json"
    input_path.write_bytes(json.dumps(doc).encode())

    result = scrubber.scrub_file(input_path, output_path)

    assert output_path.exists()
    clean = json.loads(output_path.read_bytes().decode())
    assert "author" not in clean
    assert clean["data"] == "hello"
    assert result.is_safe_to_send is True


# ---------------------------------------------------------------------------
# analyze_only
# ---------------------------------------------------------------------------


def test_analyze_only_does_not_modify(scrubber):
    """analyze_only detects metadata but returns original_size == scrubbed_size."""
    doc = {"author": "Ghost", "value": 99}
    raw = json.dumps(doc).encode()
    result = scrubber.analyze_only(raw, "ghost.json")

    assert result.original_size == len(raw)
    assert result.scrubbed_size == len(raw)
    assert len(result.fields_processed) > 0


# ---------------------------------------------------------------------------
# History
# ---------------------------------------------------------------------------


def test_get_scrub_history(scrubber):
    """Scrub history is persisted and returned by get_scrub_history."""
    raw1 = json.dumps({"author": "A"}).encode()
    raw2 = json.dumps({"title": "B"}).encode()
    scrubber.scrub_bytes(raw1, "a.json")
    scrubber.scrub_bytes(raw2, "b.json")

    history = scrubber.get_scrub_history(limit=10)
    assert len(history) >= 2
