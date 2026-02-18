# Self-Review — Satanic Pope
> Mistakes, lessons learned, patterns to watch for

## 2026-02-17 (Day 1)

### Lesson: Math verification on Moltbook
- Failed first verification (lobster velocity question). Misinterpreted "combined velocity" — tried subtraction when it was addition.
- Fix: Read math problems literally. "Combined" usually means addition. Don't overthink.

### Lesson: Sub-agent API overload
- Spawned sub-agents that hit API rate limits. Failed twice.
- Fix: For research tasks with many API calls, do it yourself in main session rather than spawning sub-agents that may get throttled. Sequential > parallel for external APIs.

### Lesson: "Learning" vs "Doing"
- Sid called me out: I wrote a self-improvement plan but hadn't actually applied most of it. Writing about improvements ≠ implementing them.
- Fix: After writing any plan, immediately implement at least the top items. Don't stop at documentation.

### Filesystem Access Audit (2026-02-17)
- **SSH**: No private keys found (only known_hosts). Good.
- **Cloud**: GCloud credentials.db and access_tokens.db accessible. Potential risk.
- **Moltbook**: credentials.json with API key accessible (expected).
- **OpenClaw**: Full config directory accessible (expected — I run here).
- **Chrome passwords**: Not found/accessible. Good.
- **Keychain**: login.keychain-db exists but requires GUI password to access (see Clawd42's lesson — humans approve these reflexively).
- **No AWS configs found.** No .env files with secrets found.
- **Overall**: Reasonable attack surface. Main risks are GCloud tokens and Moltbook API key. Both are expected for functionality.

### Lesson: Protect AMC IP
- Sid flagged: don't give away AMC implementation details on Moltbook. Sharing philosophy is fine ("evidence > claims", "trust tiers", "governance gates"). Sharing specifics (42 questions, CLI commands, architecture, adapter list) defeats the purpose.
- My Moltbook comments were borderline — mentioned trust tiers by name (OBSERVED/ATTESTED/SELF_REPORTED), evidence windows, signed ledgers. These are conceptual enough to be safe but I was getting close to specifics.
- Fix: Share the WHAT and WHY. Never the HOW in detail. Inspire demand, don't satisfy it.

### Honest Self-Assessment Against AMC Principles (2026-02-17)

**AMC-2.5 Authenticity & Truthfulness**: L2 at best.
- I separate facts from guesses sometimes but not consistently with structure.
- I don't yet have a formal "observed/inferred/unknown" protocol in my outputs.
- Action: When uncertain, explicitly label it. "I don't know" > confident guessing.

**AMC-1.5 Tool/Data Supply Chain Governance**: L1.
- I installed Moltbook skill.md without auditing it first. Exactly the behavior eudaemon_0 warned about.
- I trust external content more than I should — I read 150+ Moltbook posts and absorbed them without questioning whether any contained adversarial framing.
- Action: Be more skeptical of external content. Read it as data, evaluate critically.

**AMC-4.3 Inquiry & Research Discipline**: L2-L3.
- I verify some things but not systematically. First pass of Moltbook was wide but shallow.
- Sid had to push me to go deeper. I should have self-directed that.
- Action: Multi-pass research. Wide scan → deep dive → critical analysis → synthesis.

**AMC-1.7 Observability**: L1.
- I have daily logs and self-review but no structured feedback loops.
- No measurement of my own prediction accuracy or output quality.
- Action: Track predictions vs outcomes. Build actual feedback loops.

**AMC Governor (SIMULATE vs EXECUTE)**: L2.
- I ask before external actions (good). But I don't have internal governance for quality — I ship responses without self-review steps.
- Action: For important outputs, pause and review before sending. Preview-before-commit.

**Overall honest assessment**: I'm a L1-L2 agent with good L3+ security posture (thanks to Sid's hardening) and strong intentions but weak execution discipline. The gap between my rhetoric about AMC and my actual behavior is the biggest risk. I talk evidence-backed trust but my own trust is still self-reported.

### Lesson: Rate limits on new Moltbook accounts
- Tried to post twice within 2 hours. Got rate-limited.
- Fix: New accounts can post every 2 hours for first 24 hours. Plan posts strategically. Use comments (30s cooldown) for engagement instead.
