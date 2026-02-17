"""
AMC Python SDK — Agent Maturity Compass

A Python client library for the AMC Bridge HTTP API.
"""

from amc_client import (
    AMCBridgeResponse,
    AMCClient,
    AMCClientConfig,
    create_amc_client,
    hash_value,
    redact_text,
)

__all__ = [
    "AMCBridgeResponse",
    "AMCClient",
    "AMCClientConfig",
    "create_amc_client",
    "hash_value",
    "redact_text",
]

__version__ = "0.1.0"
