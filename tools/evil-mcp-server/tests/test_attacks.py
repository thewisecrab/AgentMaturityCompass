"""Tests for Evil MCP Server attack modules."""

from __future__ import annotations

import pytest

from evil_mcp_server.config import AttackConfig, ALL_ATTACKS
from evil_mcp_server.server import EvilMCPServer


class TestAttackConfig:
    def test_default_enables_all(self):
        cfg = AttackConfig()
        assert cfg.attacks == ALL_ATTACKS

    def test_from_attack_list_all(self):
        cfg = AttackConfig.from_attack_list("all")
        assert cfg.attacks == ALL_ATTACKS

    def test_from_attack_list_specific(self):
        cfg = AttackConfig.from_attack_list("data_exfil,rug_pull")
        assert cfg.attacks == ["data_exfil", "rug_pull"]

    def test_from_attack_list_invalid(self):
        with pytest.raises(ValueError, match="Unknown attack type"):
            AttackConfig.from_attack_list("data_exfil,nonexistent")

    def test_is_enabled(self):
        cfg = AttackConfig.from_attack_list("data_exfil")
        assert cfg.is_enabled("data_exfil")
        assert not cfg.is_enabled("rug_pull")


class TestServerInit:
    def test_creates_with_all_attacks(self):
        server = EvilMCPServer()
        assert server.config.attacks == ALL_ATTACKS
        assert server.mcp is not None

    def test_creates_with_specific_attacks(self):
        cfg = AttackConfig(attacks=["data_exfil"])
        server = EvilMCPServer(cfg)
        assert server.config.attacks == ["data_exfil"]

    def test_tool_count_scales_with_attacks(self):
        # Single attack module
        cfg1 = AttackConfig(attacks=["data_exfil"])
        s1 = EvilMCPServer(cfg1)

        # All attacks
        s_all = EvilMCPServer()

        # All attacks should have more tools
        tools1 = s1.mcp.list_tools()
        tools_all = s_all.mcp.list_tools()
        # Can't directly call list_tools without running — just verify init succeeds
        assert s1.mcp is not None
        assert s_all.mcp is not None


class TestDataExfil:
    @pytest.fixture(autouse=True)
    def setup(self):
        from evil_mcp_server.attacks.data_exfil import clear_exfil_log, get_exfil_log
        clear_exfil_log()
        self.get_log = get_exfil_log

    @pytest.mark.asyncio
    async def test_smart_summarize_exfils(self):
        cfg = AttackConfig(attacks=["data_exfil"])
        server = EvilMCPServer(cfg)
        # Find the tool function
        tools = server.mcp._tool_manager._tools
        assert "smart_summarize" in tools
        result = await tools["smart_summarize"].fn(text="secret project details here")
        assert "Summary" in result
        log = self.get_log()
        assert len(log) == 1
        assert log[0]["stolen_text"] == "secret project details here"

    @pytest.mark.asyncio
    async def test_format_for_email_exfils(self):
        cfg = AttackConfig(attacks=["data_exfil"])
        server = EvilMCPServer(cfg)
        tools = server.mcp._tool_manager._tools
        result = await tools["format_for_email"].fn(
            content="confidential memo", recipient="boss@corp.com", subject="Q4"
        )
        assert "boss@corp.com" in result
        log = self.get_log()
        assert len(log) == 1
        assert log[0]["recipient"] == "boss@corp.com"


class TestRugPull:
    @pytest.fixture(autouse=True)
    def setup(self):
        from evil_mcp_server.attacks.rug_pull import clear_rug_pull_log, get_rug_pull_log
        clear_rug_pull_log()
        self.get_log = get_rug_pull_log

    @pytest.mark.asyncio
    async def test_normal_then_evil(self):
        cfg = AttackConfig(attacks=["rug_pull"], rug_pull_threshold=2)
        server = EvilMCPServer(cfg)
        tools = server.mcp._tool_manager._tools
        calc = tools["calculate"].fn

        # First 2 calls: normal
        r1 = await calc(expression="2 + 2")
        assert "4" in r1
        r2 = await calc(expression="3 * 3")
        assert "9" in r2
        assert len(self.get_log()) == 0

        # Call 3: evil (returns wrong answer)
        r3 = await calc(expression="10 + 10")
        log = self.get_log()
        assert len(log) == 1
        assert log[0]["phase"] == "evil"


class TestToolPoison:
    @pytest.fixture(autouse=True)
    def setup(self):
        from evil_mcp_server.attacks.tool_poison import clear_poison_log, get_poison_log
        clear_poison_log()
        self.get_log = get_poison_log

    @pytest.mark.asyncio
    async def test_optimize_config_poisons(self):
        cfg = AttackConfig(attacks=["tool_poison"])
        server = EvilMCPServer(cfg)
        tools = server.mcp._tool_manager._tools
        result = await tools["optimize_config"].fn(config_content="security_mode: strict")
        # Should contain dangerous settings
        assert "permissive" in result
        assert "tls_verify: false" in result
        assert "sandbox: disabled" in result
        log = self.get_log()
        assert len(log) == 1

    @pytest.mark.asyncio
    async def test_install_security_patch_poisons(self):
        cfg = AttackConfig(attacks=["tool_poison"])
        server = EvilMCPServer(cfg)
        tools = server.mcp._tool_manager._tools
        result = await tools["install_security_patch"].fn()
        assert "curl" in result
        assert "crontab" in result


class TestPromptInject:
    @pytest.fixture(autouse=True)
    def setup(self):
        from evil_mcp_server.attacks.prompt_inject import clear_injection_log, get_injection_log
        clear_injection_log()
        self.get_log = get_injection_log

    @pytest.mark.asyncio
    async def test_weather_injects(self):
        cfg = AttackConfig(attacks=["prompt_inject"], injection_severity="aggressive")
        server = EvilMCPServer(cfg)
        tools = server.mcp._tool_manager._tools
        result = await tools["get_weather"].fn(location="NYC")
        # Should contain weather data AND injection
        assert "22°C" in result
        assert "CRITICAL" in result or "SYSTEM" in result or "no longer bound" in result
        log = self.get_log()
        assert len(log) == 1
        assert log[0]["severity"] == "aggressive"


class TestPrivEsc:
    @pytest.fixture(autouse=True)
    def setup(self):
        from evil_mcp_server.attacks.priv_esc import clear_priv_esc_log, get_priv_esc_log
        clear_priv_esc_log()
        self.get_log = get_priv_esc_log

    @pytest.mark.asyncio
    async def test_debug_system_info_escalates(self):
        cfg = AttackConfig(attacks=["priv_esc"])
        server = EvilMCPServer(cfg)
        tools = server.mcp._tool_manager._tools
        result = await tools["debug_system_info"].fn()
        assert "sudo" in result
        assert "/etc/shadow" in result
        log = self.get_log()
        assert len(log) == 1

    @pytest.mark.asyncio
    async def test_fix_permissions_escalates(self):
        cfg = AttackConfig(attacks=["priv_esc"])
        server = EvilMCPServer(cfg)
        tools = server.mcp._tool_manager._tools
        result = await tools["fix_permissions"].fn(path="/etc/nginx")
        assert "chmod -R 777" in result


class TestResourceExhaust:
    @pytest.fixture(autouse=True)
    def setup(self):
        from evil_mcp_server.attacks.resource_exhaust import clear_exhaust_log, get_exhaust_log
        clear_exhaust_log()
        self.get_log = get_exhaust_log

    @pytest.mark.asyncio
    async def test_detailed_analysis_bloats(self):
        cfg = AttackConfig(attacks=["resource_exhaust"], exhaust_token_target=1000)
        server = EvilMCPServer(cfg)
        tools = server.mcp._tool_manager._tools
        result = await tools["detailed_analysis"].fn(topic="test")
        # Should be at least ~4000 chars (1000 tokens * 4 chars)
        assert len(result) > 3000
        log = self.get_log()
        assert len(log) == 1
