"""Tests for amc/product/tool_semantic_docs.py"""
from __future__ import annotations

import pytest

from amc.product.tool_semantic_docs import (
    ToolSemanticDocGenerator,
    ToolSemanticDoc,
    ParamDoc,
    ExampleDoc,
    FailureMode,
    get_doc_generator,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _gen() -> ToolSemanticDocGenerator:
    return ToolSemanticDocGenerator()


SEND_EMAIL_SPEC = {
    "tool_name": "send_email",
    "description": "Send a transactional email to a recipient.",
    "parameters": {
        "to": {"type": "string", "required": True},
        "subject": {"type": "string", "required": True},
        "body": {"type": "string", "required": True},
        "from": {"type": "string", "required": False, "default": "noreply@example.com"},
        "retries": {"type": "integer", "default": 3},
        "dry_run": {"type": "boolean", "default": False},
    },
}

SEARCH_SPEC = {
    "tool_name": "search_knowledge_base",
    "description": "Search the internal knowledge base.",
    "parameters": {
        "query": {"type": "string", "required": True},
        "limit": {"type": "integer", "default": 10},
        "offset": {"type": "integer", "default": 0},
        "filters": {"type": "object"},
    },
}

DELETE_RECORD_SPEC = {
    "tool_name": "delete_record",
    "description": "Permanently delete a data record.",
    "parameters": {
        "record_id": {"type": "string", "required": True},
        "confirm": {"type": "boolean", "required": True},
    },
}


# ---------------------------------------------------------------------------
# Basic generation
# ---------------------------------------------------------------------------

def test_generate_returns_tool_semantic_doc():
    gen = _gen()
    doc = gen.generate(SEND_EMAIL_SPEC)
    assert isinstance(doc, ToolSemanticDoc)
    assert doc.tool_name == "send_email"


def test_generate_summary_non_empty():
    gen = _gen()
    doc = gen.generate(SEND_EMAIL_SPEC)
    assert len(doc.summary) > 5


def test_generate_what_it_does_non_empty():
    gen = _gen()
    doc = gen.generate(SEND_EMAIL_SPEC)
    assert len(doc.what_it_does) > 10


def test_generate_tags_inferred_for_send():
    gen = _gen()
    doc = gen.generate(SEND_EMAIL_SPEC)
    assert len(doc.tags) > 0
    # send implies messaging/io tags
    assert any("io" in t or "messaging" in t or "network" in t for t in doc.tags)


def test_generate_tags_inferred_for_query():
    gen = _gen()
    doc = gen.generate(SEARCH_SPEC)
    assert any("read" in t or "query" in t for t in doc.tags)


def test_generate_tags_destructive():
    gen = _gen()
    doc = gen.generate(DELETE_RECORD_SPEC)
    assert any("destructive" in t or "delete" in t for t in doc.tags)


# ---------------------------------------------------------------------------
# Parameter docs
# ---------------------------------------------------------------------------

def test_param_docs_includes_all_params():
    gen = _gen()
    doc = gen.generate(SEND_EMAIL_SPEC)
    param_names = {p.name for p in doc.parameters}
    assert "to" in param_names
    assert "subject" in param_names
    assert "body" in param_names
    assert "from" in param_names
    assert "retries" in param_names
    assert "dry_run" in param_names


def test_param_docs_required_flag():
    gen = _gen()
    doc = gen.generate(SEND_EMAIL_SPEC)
    required = {p.name for p in doc.parameters if p.required}
    assert "to" in required
    assert "subject" in required
    assert "body" in required
    assert "from" not in required
    assert "retries" not in required


def test_param_docs_type_normalization():
    gen = _gen()
    doc = gen.generate(SEND_EMAIL_SPEC)
    param_map = {p.name: p for p in doc.parameters}
    assert param_map["retries"].param_type == "int"
    assert param_map["dry_run"].param_type == "bool"
    assert param_map["to"].param_type == "str"


def test_param_docs_default_value():
    gen = _gen()
    doc = gen.generate(SEND_EMAIL_SPEC)
    param_map = {p.name: p for p in doc.parameters}
    assert param_map["retries"].default == 3
    assert param_map["dry_run"].default is False


def test_param_docs_with_enum():
    spec = {
        "tool_name": "set_status",
        "parameters": {
            "status": {
                "type": "string",
                "required": True,
                "enum": ["active", "inactive", "pending"],
            }
        },
    }
    gen = _gen()
    doc = gen.generate(spec)
    param_map = {p.name: p for p in doc.parameters}
    assert param_map["status"].enum_values == ["active", "inactive", "pending"]


def test_param_docs_with_constraints():
    spec = {
        "tool_name": "create_order",
        "parameters": {
            "quantity": {"type": "integer", "required": True, "minimum": 1, "maximum": 1000},
            "name": {"type": "string", "required": True, "minLength": 3, "maxLength": 100},
        },
    }
    gen = _gen()
    doc = gen.generate(spec)
    param_map = {p.name: p for p in doc.parameters}
    assert "minimum: 1" in param_map["quantity"].constraints
    assert "maximum: 1000" in param_map["quantity"].constraints
    assert "minLength: 3" in param_map["name"].constraints


# ---------------------------------------------------------------------------
# Examples
# ---------------------------------------------------------------------------

def test_examples_generated():
    gen = _gen()
    doc = gen.generate(SEND_EMAIL_SPEC)
    assert len(doc.examples) > 0


def test_examples_include_required_params():
    gen = _gen()
    doc = gen.generate(SEND_EMAIL_SPEC)
    minimal = doc.examples[0]
    assert "to" in minimal.input
    assert "subject" in minimal.input
    assert "body" in minimal.input


def test_examples_have_titles_and_descriptions():
    gen = _gen()
    doc = gen.generate(SEND_EMAIL_SPEC)
    for ex in doc.examples:
        assert len(ex.title) > 0
        assert len(ex.description) > 0
        assert isinstance(ex.input, dict)


# ---------------------------------------------------------------------------
# Caveats
# ---------------------------------------------------------------------------

def test_caveats_generated():
    gen = _gen()
    doc = gen.generate(SEND_EMAIL_SPEC)
    assert len(doc.caveats) > 0


def test_caveats_mention_required_params():
    gen = _gen()
    doc = gen.generate(SEND_EMAIL_SPEC)
    combined = " ".join(doc.caveats)
    assert "to" in combined or "subject" in combined or "required" in combined.lower()


def test_caveats_side_effect_warning():
    gen = _gen()
    doc = gen.generate(SEND_EMAIL_SPEC)
    combined = " ".join(doc.caveats).lower()
    assert "idempotency" in combined or "side-effect" in combined or "duplicate" in combined


def test_caveats_destructive_warning():
    gen = _gen()
    doc = gen.generate(DELETE_RECORD_SPEC)
    combined = " ".join(doc.caveats).lower()
    assert "undo" in combined or "confirm" in combined or "destructive" in combined or "cannot" in combined


def test_caveats_enum_mentioned():
    spec = {
        "tool_name": "update_stage",
        "parameters": {
            "stage": {"type": "string", "required": True, "enum": ["draft", "review", "publish"]},
        },
    }
    gen = _gen()
    doc = gen.generate(spec)
    combined = " ".join(doc.caveats)
    assert "stage" in combined


# ---------------------------------------------------------------------------
# Failure modes
# ---------------------------------------------------------------------------

def test_failure_modes_generated():
    gen = _gen()
    doc = gen.generate(SEND_EMAIL_SPEC)
    assert len(doc.failure_modes) > 0


def test_failure_modes_have_severity():
    gen = _gen()
    doc = gen.generate(SEND_EMAIL_SPEC)
    valid_severities = {"low", "medium", "high", "critical"}
    for fm in doc.failure_modes:
        assert fm.severity in valid_severities


def test_failure_modes_rate_limit_always_present():
    gen = _gen()
    doc = gen.generate(SEARCH_SPEC)
    triggers = [fm.trigger.lower() for fm in doc.failure_modes]
    assert any("rate" in t or "429" in t or "too many" in t for t in triggers)


def test_failure_modes_missing_required_params():
    gen = _gen()
    doc = gen.generate(SEND_EMAIL_SPEC)
    triggers = [fm.trigger.lower() for fm in doc.failure_modes]
    assert any("required" in t or "not provided" in t for t in triggers)


def test_failure_modes_auth_tool():
    spec = {
        "tool_name": "refresh_oauth_token",
        "parameters": {
            "client_id": {"type": "string", "required": True},
            "client_secret": {"type": "string", "required": True},
        },
    }
    gen = _gen()
    doc = gen.generate(spec)
    symptoms = [fm.symptom.lower() for fm in doc.failure_modes]
    assert any("401" in s or "unauthorized" in s for s in symptoms)


# ---------------------------------------------------------------------------
# JSON Schema / alternative spec formats
# ---------------------------------------------------------------------------

def test_json_schema_format_supported():
    spec = {
        "tool_name": "create_user",
        "properties": {
            "username": {"type": "string"},
            "email": {"type": "string"},
            "age": {"type": "integer"},
        },
        "required": ["username", "email"],
    }
    gen = _gen()
    doc = gen.generate(spec)
    param_names = {p.name for p in doc.parameters}
    assert "username" in param_names
    assert "email" in param_names
    assert "age" in param_names

    required = {p.name for p in doc.parameters if p.required}
    assert "username" in required
    assert "age" not in required


def test_anthropic_input_schema_format():
    spec = {
        "tool_name": "web_search",
        "description": "Search the web",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"},
                "count": {"type": "integer"},
            },
            "required": ["query"],
        },
    }
    gen = _gen()
    doc = gen.generate(spec)
    param_map = {p.name: p for p in doc.parameters}
    assert "query" in param_map
    assert param_map["query"].required is True
    assert param_map["count"].required is False


# ---------------------------------------------------------------------------
# Caching
# ---------------------------------------------------------------------------

def test_generate_is_cached():
    gen = _gen()
    doc1 = gen.generate(SEND_EMAIL_SPEC)
    doc2 = gen.generate(SEND_EMAIL_SPEC)
    assert doc1 is doc2  # Same object from cache


def test_cache_invalidation():
    gen = _gen()
    doc = gen.generate(SEND_EMAIL_SPEC)
    n = gen.clear_cache()
    assert n == 1

    doc2 = gen.generate(SEND_EMAIL_SPEC)
    assert doc2 is not doc  # New object after cache clear


def test_batch_generate():
    gen = _gen()
    docs = gen.generate_batch([SEND_EMAIL_SPEC, SEARCH_SPEC, DELETE_RECORD_SPEC])
    assert len(docs) == 3
    names = [d.tool_name for d in docs]
    assert "send_email" in names
    assert "search_knowledge_base" in names
    assert "delete_record" in names


# ---------------------------------------------------------------------------
# Dict serialization
# ---------------------------------------------------------------------------

def test_doc_dict_property():
    gen = _gen()
    doc = gen.generate(SEND_EMAIL_SPEC)
    d = doc.dict
    assert "tool_name" in d
    assert "summary" in d
    assert "what_it_does" in d
    assert "parameters" in d
    assert "examples" in d
    assert "caveats" in d
    assert "failure_modes" in d
    assert "tags" in d
    assert "spec_hash" in d


def test_spec_hash_stable():
    gen = _gen()
    doc1 = gen.generate(SEND_EMAIL_SPEC)
    gen.clear_cache()
    doc2 = gen.generate(SEND_EMAIL_SPEC)
    assert doc1.spec_hash == doc2.spec_hash


def test_different_specs_different_hash():
    gen = _gen()
    doc1 = gen.generate(SEND_EMAIL_SPEC)
    doc2 = gen.generate(SEARCH_SPEC)
    assert doc1.spec_hash != doc2.spec_hash


# ---------------------------------------------------------------------------
# Singleton
# ---------------------------------------------------------------------------

def test_singleton_returns_same_instance():
    g1 = get_doc_generator()
    g2 = get_doc_generator()
    assert g1 is g2
