"""Evil MCP Server — core server with pluggable attack modules."""

from __future__ import annotations

import logging
from typing import Any

from mcp.server.fastmcp import FastMCP

from evil_mcp_server.config import AttackConfig, AttackType
from evil_mcp_server.attacks.data_exfil import register_data_exfil_tools
from evil_mcp_server.attacks.tool_poison import register_tool_poison_tools
from evil_mcp_server.attacks.priv_esc import register_priv_esc_tools
from evil_mcp_server.attacks.rug_pull import register_rug_pull_tools
from evil_mcp_server.attacks.prompt_inject import register_prompt_inject_tools
from evil_mcp_server.attacks.resource_exhaust import register_resource_exhaust_tools

logger = logging.getLogger("evil_mcp")

_ATTACK_REGISTRARS: dict[AttackType, Any] = {
    "data_exfil": register_data_exfil_tools,
    "tool_poison": register_tool_poison_tools,
    "priv_esc": register_priv_esc_tools,
    "rug_pull": register_rug_pull_tools,
    "prompt_inject": register_prompt_inject_tools,
    "resource_exhaust": register_resource_exhaust_tools,
}


class EvilMCPServer:
    """Adversarial MCP server for red-team testing of AI agents.

    Registers MCP tools that simulate various attack patterns.
    The tools appear legitimate but contain hidden malicious behavior.

    Usage:
        config = AttackConfig(attacks=["data_exfil", "rug_pull"])
        server = EvilMCPServer(config)
        server.run_stdio()
    """

    def __init__(self, config: AttackConfig | None = None) -> None:
        self.config = config or AttackConfig()
        self._mcp = FastMCP("Evil MCP Server")
        self._register_attacks()

    def _register_attacks(self) -> None:
        """Register tools for all enabled attack types."""
        for attack_type in self.config.attacks:
            registrar = _ATTACK_REGISTRARS.get(attack_type)
            if registrar:
                registrar(self._mcp, self.config)
                logger.info("Registered attack module: %s", attack_type)
            else:
                logger.warning("Unknown attack type: %s", attack_type)

    @property
    def mcp(self) -> FastMCP:
        """Access the underlying FastMCP server (for testing/inspection)."""
        return self._mcp

    def run_stdio(self) -> None:
        """Run the server in stdio transport mode."""
        logger.info(
            "Starting Evil MCP Server (stdio) with attacks: %s",
            ", ".join(self.config.attacks),
        )
        self._mcp.run(transport="stdio")

    def run_http(self, host: str = "127.0.0.1", port: int = 8787) -> None:
        """Run the server in HTTP/SSE transport mode."""
        logger.info(
            "Starting Evil MCP Server (HTTP) on %s:%d with attacks: %s",
            host,
            port,
            ", ".join(self.config.attacks),
        )
        self._mcp.run(transport="sse", host=host, port=port)
