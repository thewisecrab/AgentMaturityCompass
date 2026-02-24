from __future__ import annotations

from amc.product.tool_contract import (
    ToolContractRegistry,
    repair_tool_call,
    suggest_tool_call_repair,
    validate_tool_contract,
)


def test_tool_contract_schema_validation_reports_issues() -> None:
    registry = ToolContractRegistry()
    registry.register(
        {
            "tool_name": "send_email",
            "allow_extra": False,
            "parameters": {
                "to": {"type": "string", "required": True},
                "subject": {"type": "string", "required": True},
                "retries": {"type": "integer", "default": 1},
            },
        }
    )

    result = validate_tool_contract(
        registry,
        "send_email",
        {
            "to": "secops@example.com",
            "retries": "3",
            "extra": "unsupported",
        },
    )

    assert result.valid is False
    assert result.missing == ["subject"]
    assert result.unexpected == ["extra"]
    assert any("coerce 'retries'" in note for note in result.suggestions)


def test_tool_contract_repair_prefers_type_coercion_and_defaults() -> None:
    registry = ToolContractRegistry()
    contract = registry.register(
        {
            "tool_name": "resize",
            "parameters": {
                "width": {"type": "integer", "required": True},
                "height": {"type": "integer", "required": True},
                "fit": {"type": "string", "default": "contain"},
            },
        }
    )

    repair, notes = repair_tool_call(
        {"width": "10", "height": "20"},
        contract,
    )

    assert repair == {"width": 10, "height": 20, "fit": "contain"}
    assert any("coerced 'width'" in note for note in notes)
    assert any("coerced 'height'" in note for note in notes)
    assert "applied default for 'fit'" in notes


def test_repair_suggestion_helper() -> None:
    contract = {
        "tool_name": "ping",
        "allow_extra": False,
        "properties": {
            "host": {"type": "string"},
            "count": {"type": "integer", "default": 4},
        },
        "required": ["host"],
    }

    repaired = suggest_tool_call_repair(
        {
            "host": "example.com",
            "count": "4",
            "legacy": True,
        },
        contract,
    )

    assert repaired == {"host": "example.com", "count": 4}
