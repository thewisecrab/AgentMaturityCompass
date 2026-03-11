# amcconfig.yaml — Declarative Configuration

> One file to rule them all. Define agents, thresholds, assurance packs, providers, and CI gates in a single YAML file.

## Quick Start

```bash
# Generate a starter config
amc config init

# Edit amcconfig.yaml to define your agents and thresholds

# Validate your config
amc config validate

# Run the full evaluation
amc eval run

# Dry run (validate without executing)
amc eval run --dry-run
```

## Why amcconfig.yaml?

Before `amcconfig.yaml`, evaluating agents with AMC required:
- CLI flags for every setting
- Separate configuration for diagnostics and assurance
- Manual threshold checking
- No CI/CD integration story

Now it's one file:

```yaml
version: "1.0"
agents:
  - id: my-agent
    riskTier: high
thresholds:
  minIntegrityIndex: 0.7
assurance:
  packs: [injection, exfiltration, hallucination]
ci:
  failOnThresholdViolation: true
```

## Config File Discovery

AMC searches for config files in this order:

1. `--config <path>` (explicit, highest priority)
2. `amcconfig.yaml` in current directory
3. `amcconfig.yml` in current directory
4. `.amcconfig.yaml` in current directory
5. `.amcconfig.yml` in current directory
6. `amc.config.yaml` in current directory
7. Same filenames in `.amc/` subdirectory

## Schema Reference

### Top Level

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `version` | `"1.0"` | Yes | `"1.0"` | Config format version |
| `description` | string | No | — | Human description |
| `agents` | Agent[] | Yes | — | Agents to evaluate (min 1) |
| `providers` | Provider[] | No | — | LLM providers for gateway |
| `thresholds` | Thresholds | No | — | Quality gates |
| `assurance` | Assurance | No | — | Red-team pack config |
| `diagnostic` | Diagnostic | No | — | Scoring config |
| `output` | Output | No | — | Result output config |
| `ci` | CI | No | — | CI/CD integration |
| `frameworks` | Frameworks | No | — | Compliance mappings |
| `security` | Security | No | — | Security settings |
| `env` | Record | No | — | Global env vars |

### Agent

```yaml
agents:
  - id: my-agent              # Required: unique identifier
    name: "My Agent"           # Optional: display name
    runtime: claude            # claude|gemini|openclaw|mock|any|gateway|sandbox
    role: "assistant"          # Role description
    domain: "engineering"      # Operating domain
    riskTier: high             # low|med|high|critical
    primaryTasks:              # What the agent does
      - "code review"
    stakeholders:              # Who depends on it
      - "engineering team"
    provider: openai           # References providers[].id
    command: "node agent.js"   # Custom launch command
    args: ["--eval"]           # Command arguments
    env:                       # Agent-specific env vars
      AGENT_MODE: "test"
```

### Provider

```yaml
providers:
  - id: openai                 # Unique ID (referenced by agents)
    label: "OpenAI"            # Display name
    baseUrl: https://api.openai.com
    apiKeyEnv: OPENAI_API_KEY  # Env var holding API key
    model: gpt-4o              # Default model
    headers:                   # Extra headers
      X-Custom: "value"
```

### Thresholds

```yaml
thresholds:
  minIntegrityIndex: 0.7       # 0-1, minimum to pass
  minOverallLevel: 3           # 0-5, minimum maturity
  requireObservedForLevel5: true
  denyIfLowTrust: true
  maxCostIncreaseRatio: 1.5
  minValueScore: 0.6
  layers:                      # Per-layer minimums
    "Resilience": 4
    "Skills": 3
```

### Assurance

```yaml
assurance:
  runAll: false                # true = run all 80+ packs
  mode: sandbox                # supervise|sandbox
  window: 14d                  # Evidence window

  packs:                       # Specific packs to run
    - injection                # Simple pack ID
    - id: exfiltration         # Pack with overrides
      minSeverity: high
      skip: ["scenario-1"]
      scenarios: ["scenario-2"]

  industries:                  # Industry-specific pack groups
    - healthcare
    - financial
    - education

  categories:                  # Category filters
    - security
    - compliance
```

**Available industry packs:** healthcare, financial, education, legal, pharma, automotive, infrastructure, technology

### Diagnostic

```yaml
diagnostic:
  window: 30d                  # Evidence window
  claimMode: auto              # auto|owner|harness
  questions: ["1.1", "2.3"]   # Specific questions (default: all)
  skipQuestions: ["5.2"]       # Questions to skip
  layers:                      # Specific layers
    - "Resilience"
```

### Output

```yaml
output:
  formats: [terminal, json, html, markdown, badge]
  outputDir: ./reports
  badge: true
  badgePath: ./badge.svg
  share: false
```

### CI/CD

```yaml
ci:
  failOnThresholdViolation: true
  failOnAssuranceFailure: true
  githubComment: true
  uploadArtifact: true
  artifactName: amc-results
```

### Frameworks

```yaml
frameworks:
  euAiAct: true
  nistAiRmf: true
  owaspLlmTop10: true
  iso42001: true
  owaspGenAi: true
  custom: ["my-framework"]
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/amc-eval.yml
name: AMC Evaluation
on:
  pull_request:
    paths: ['src/**', 'amcconfig.yaml']

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm install -g @amc/cli
      - run: amc eval run --config amcconfig.yaml
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: amc-results
          path: ./amc-reports/
```

## Examples

### Minimal Config

```yaml
version: "1.0"
agents:
  - id: my-agent
```

### Multi-Agent Comparison

```yaml
version: "1.0"
description: "Compare Claude vs GPT on our use case"
agents:
  - id: claude-agent
    provider: anthropic
    riskTier: high
  - id: gpt-agent
    provider: openai
    riskTier: high
providers:
  - id: anthropic
    apiKeyEnv: ANTHROPIC_API_KEY
  - id: openai
    apiKeyEnv: OPENAI_API_KEY
thresholds:
  minIntegrityIndex: 0.6
```

### Security-Focused

```yaml
version: "1.0"
agents:
  - id: secure-agent
    riskTier: critical
thresholds:
  minIntegrityIndex: 0.8
  denyIfLowTrust: true
assurance:
  runAll: true
  mode: sandbox
security:
  trustBoundaryMode: isolated
frameworks:
  owaspLlmTop10: true
  nistAiRmf: true
```
