# Bridge Prompt Enforcement

AMC Bridge enforces Northstar prompts at request time for supported compatibility routes:

- OpenAI `/bridge/openai/v1/chat/completions` and `/responses`
- Anthropic `/bridge/anthropic/v1/messages`
- Gemini `/bridge/gemini/v1beta/models/:model:generateContent`
- xAI/OpenRouter OpenAI-shaped routes

## Enforcement Flow

1. Resolve workspace and agent from lease claim.
2. Load/refresh latest signed prompt pack.
3. Verify policy + pack + lint state.
4. Inject enforced system prompt by provider shape.
5. Detect override attempts (`ignore previous`, `bypass policy`, etc.).
6. Forward upstream call.
7. Bind receipts to `promptPackSha256`, `packId`, `templateId`, `cgxPackSha256`.
8. Run Truthguard on model output; optionally block with `422` when policy sets `ENFORCE`.

Response headers:
- `x-amc-prompt-pack-sha256`
- `x-amc-prompt-pack-id`

## Override Handling

- With `rejectIfUserTriesToOverride=true`, Bridge returns `400` with `PROMPT_OVERRIDE_REJECTED`.
- With rejection disabled, Bridge still logs/audits override attempts and transparency events.

## Why This Blocks Prompt Tampering

When agents route through Bridge, AMC owns the system prompt boundary and can deterministically replace user-provided system prompts. This prevents silent prompt-drop or prompt-rewrite attacks in the client.

## Honest Limitation

If an agent bypasses Bridge and calls providers directly, AMC cannot enforce prompts for those calls. AMC labels trust/evidence coverage accordingly and does not inflate maturity from unobserved model traffic.
