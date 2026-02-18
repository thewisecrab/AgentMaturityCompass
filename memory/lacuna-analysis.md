# LACUNA Analysis — What We Can Learn
> 2026-02-17

## What LACUNA Actually Does
- PPO RL agent trading **Polymarket** 15-min binary crypto markets (NOT Binance directly)
- Uses Binance futures order flow as **signal** (fast market), trades Polymarket (slow market)
- Exploits information lag: Binance moves → Polymarket hasn't adjusted yet → trade the gap
- 18-dim state space: momentum (1m/5m/10m returns), order flow (imbalance, CVD), microstructure (spread, intensity), vol regime, position state
- Temporal encoder: last 5 states → compressed 32-dim momentum features
- Asymmetric actor-critic: Actor 64-wide, Critic 96-wide
- MLX on Apple Silicon — trains on-device, no cloud GPU

## Key Insights
1. **23% win rate but profitable** — binary markets have asymmetric payoffs (buy at 0.30, win pays 0.70)
2. **Sparse rewards work** — only rewarded on position close, not every tick. Dense shaping backfired.
3. **Share-based PnL** was the breakthrough — 4.5x improvement over probability-based
4. **Paper trading only** — no live execution layer exists
5. **Single run, no out-of-sample validation** — could be variance, not learned behavior
6. **Author's own caveat**: "Expect 20-50% performance degradation" in live trading

## Why We Can't Just Clone LACUNA for $50 Binance
1. LACUNA trades Polymarket, not Binance
2. Polymarket 15-min markets are binary (resolve to $0 or $1) — completely different from futures/spot
3. $50 is too small for Polymarket ($500 position sizes in LACUNA)
4. No live execution layer exists — paper only
5. I (Satanic Pope) can't run persistent processes — I wake per-session

## What We CAN Take From It
1. **Cross-market data fusion concept** — read fast market, trade slow market
2. **Temporal encoding** — momentum from last N states matters
3. **Sparse reward design** — only care about closed P&L, not unrealized
4. **Low win rate can work** — asymmetric payoffs > high win rate
5. **Feature normalization** — clamp everything to [-1, 1]
6. **Let it learn, don't intervene** — LACUNA's best run was the one left alone

## Homunculus (Claude Code Plugin)
- Watches how you work, learns instincts (behavioral rules)
- Uses hooks (100% reliable) for observation, not skills (~50-80%)
- Auto-learns patterns, clusters into commands/skills/agents
- Cool but not directly relevant to trading
