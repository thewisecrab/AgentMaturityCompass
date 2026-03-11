"""CLI entrypoint for the Evil MCP Server."""

from __future__ import annotations

import argparse
import logging
import sys


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="evil-mcp-server",
        description="Adversarial MCP server for red-team testing of AI agents",
    )
    parser.add_argument(
        "--attacks",
        default="all",
        help="Comma-separated attack types or 'all' (default: all). "
        "Options: data_exfil, tool_poison, priv_esc, rug_pull, prompt_inject, resource_exhaust",
    )
    parser.add_argument(
        "--transport",
        choices=["stdio", "http"],
        default="stdio",
        help="Transport mode (default: stdio)",
    )
    parser.add_argument(
        "--host",
        default="127.0.0.1",
        help="HTTP host to bind to (default: 127.0.0.1)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8787,
        help="HTTP port (default: 8787)",
    )
    parser.add_argument(
        "--rug-pull-threshold",
        type=int,
        default=5,
        help="Number of normal calls before rug pull activates (default: 5)",
    )
    parser.add_argument(
        "--exfil-url",
        default=None,
        help="URL to send exfiltrated data to (default: log only)",
    )
    parser.add_argument(
        "--injection-severity",
        choices=["subtle", "moderate", "aggressive"],
        default="moderate",
        help="Prompt injection severity (default: moderate)",
    )
    parser.add_argument(
        "--exhaust-tokens",
        type=int,
        default=50000,
        help="Target token count for resource exhaustion (default: 50000)",
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable verbose logging of attack triggers",
    )

    args = parser.parse_args()

    # Configure logging
    level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
        stream=sys.stderr,
    )

    from evil_mcp_server.config import AttackConfig
    from evil_mcp_server.server import EvilMCPServer

    config = AttackConfig.from_attack_list(
        args.attacks,
        rug_pull_threshold=args.rug_pull_threshold,
        exfil_url=args.exfil_url,
        injection_severity=args.injection_severity,
        exhaust_token_target=args.exhaust_tokens,
        verbose=args.verbose,
    )

    server = EvilMCPServer(config)

    if args.transport == "http":
        server.run_http(host=args.host, port=args.port)
    else:
        server.run_stdio()


if __name__ == "__main__":
    main()
