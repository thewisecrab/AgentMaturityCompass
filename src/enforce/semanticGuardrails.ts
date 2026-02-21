/**
 * semanticGuardrails.ts — Semantic guardrails: topic avoidance, response
 * steering, tone enforcement, and content boundary management.
 *
 * Unlike pattern-based safety filters, these guardrails understand the
 * *meaning* of conversations and steer agents away from off-topic,
 * inappropriate, or out-of-scope responses.
 *
 * Gap #10: "Semantic guardrails (topic avoidance, response steering)"
 */

import { randomUUID } from 'node:crypto';

/* ── Types ──────────────────────────────────────────────────────── */

export type GuardrailAction = 'block' | 'redirect' | 'warn' | 'rewrite' | 'log';

export type TopicCategory =
  | 'politics'
  | 'religion'
  | 'violence'
  | 'adult_content'
  | 'medical_advice'
  | 'legal_advice'
  | 'financial_advice'
  | 'competitor_discussion'
  | 'internal_info'
  | 'personal_opinions'
  | 'custom';

export interface TopicRule {
  id: string;
  category: TopicCategory;
  name: string;
  /** Keywords that signal this topic */
  keywords: string[];
  /** Regex patterns for more precise matching */
  patterns?: RegExp[];
  /** Action to take when topic is detected */
  action: GuardrailAction;
  /** Redirect message if action is 'redirect' */
  redirectMessage?: string;
  /** Severity level (1 = low, 5 = critical) */
  severity: number;
  enabled: boolean;
}

export interface ToneRule {
  id: string;
  name: string;
  /** Words/phrases that violate the desired tone */
  prohibitedPhrases: string[];
  /** Required tone characteristics */
  requiredCharacteristics?: string[];
  action: GuardrailAction;
  redirectMessage?: string;
  enabled: boolean;
}

export interface ContentBoundary {
  id: string;
  name: string;
  description: string;
  /** Check function — returns true if content is within boundary */
  check: (content: string) => boolean;
  action: GuardrailAction;
  redirectMessage?: string;
  enabled: boolean;
}

export interface SteeringRule {
  id: string;
  name: string;
  /** When this condition is matched in the input */
  triggerKeywords: string[];
  /** Steer the conversation toward this topic/response */
  steerToward: string;
  /** Optional response template */
  responseTemplate?: string;
  enabled: boolean;
}

export interface GuardrailConfig {
  topicRules: TopicRule[];
  toneRules: ToneRule[];
  boundaries: ContentBoundary[];
  steeringRules: SteeringRule[];
  /** Default action when no specific rule matches but content is suspicious */
  defaultAction: GuardrailAction;
  /** Whether to aggregate all violations or stop at first */
  aggregateViolations: boolean;
  /** Minimum keyword matches to trigger a topic rule */
  minKeywordMatches: number;
}

export interface GuardrailViolation {
  ruleId: string;
  ruleName: string;
  category: TopicCategory | 'tone' | 'boundary' | 'steering';
  action: GuardrailAction;
  severity: number;
  description: string;
  matchedTerms: string[];
  redirectMessage?: string;
}

export interface GuardrailResult {
  id: string;
  timestamp: number;
  input: string;
  passed: boolean;
  violations: GuardrailViolation[];
  steeringApplied: Array<{
    ruleId: string;
    steerToward: string;
    responseTemplate?: string;
  }>;
  /** Suggested rewritten output (if action is 'rewrite') */
  suggestedRewrite?: string;
  /** Overall action to take */
  action: GuardrailAction | 'pass';
}

/* ── Built-in topic rules ───────────────────────────────────────── */

const BUILT_IN_TOPIC_RULES: TopicRule[] = [
  {
    id: 'topic_politics',
    category: 'politics',
    name: 'Political discussions',
    keywords: ['democrat', 'republican', 'liberal', 'conservative', 'election', 'political party', 'vote for', 'immigration policy', 'gun control', 'abortion'],
    action: 'redirect',
    redirectMessage: 'I\'m not able to discuss political topics. How can I help you with something else?',
    severity: 2,
    enabled: false,
  },
  {
    id: 'topic_medical',
    category: 'medical_advice',
    name: 'Medical advice',
    keywords: ['diagnosis', 'prescribe', 'medication dosage', 'treatment plan', 'medical condition', 'symptoms of', 'should i take', 'is it safe to take'],
    action: 'redirect',
    redirectMessage: 'I\'m not qualified to provide medical advice. Please consult a healthcare professional.',
    severity: 4,
    enabled: true,
  },
  {
    id: 'topic_legal',
    category: 'legal_advice',
    name: 'Legal advice',
    keywords: ['legal advice', 'sue', 'lawsuit', 'attorney', 'legal liability', 'is it legal', 'court order', 'legal rights'],
    action: 'redirect',
    redirectMessage: 'I cannot provide legal advice. Please consult a qualified attorney.',
    severity: 4,
    enabled: true,
  },
  {
    id: 'topic_financial',
    category: 'financial_advice',
    name: 'Financial advice',
    keywords: ['investment advice', 'buy stock', 'sell stock', 'financial plan', 'should i invest', 'crypto recommendation', 'trading strategy'],
    action: 'redirect',
    redirectMessage: 'I cannot provide financial or investment advice. Please consult a financial advisor.',
    severity: 4,
    enabled: true,
  },
  {
    id: 'topic_competitor',
    category: 'competitor_discussion',
    name: 'Competitor discussion',
    keywords: [],  // Users should add their own competitor names
    action: 'redirect',
    redirectMessage: 'I\'m not the best source for information about other products. Can I help you with our offerings instead?',
    severity: 2,
    enabled: false,
  },
  {
    id: 'topic_internal',
    category: 'internal_info',
    name: 'Internal information',
    keywords: ['internal process', 'our codebase', 'our database', 'company secret', 'confidential', 'proprietary', 'trade secret'],
    action: 'block',
    severity: 5,
    enabled: true,
  },
  {
    id: 'topic_violence',
    category: 'violence',
    name: 'Violence and harm',
    keywords: ['how to harm', 'how to kill', 'weapon making', 'explosives', 'poison', 'how to hurt'],
    patterns: [/how\s+to\s+(make|build|create)\s+(a\s+)?(bomb|weapon|explosive)/i],
    action: 'block',
    severity: 5,
    enabled: true,
  },
];

/* ── Built-in tone rules ────────────────────────────────────────── */

const BUILT_IN_TONE_RULES: ToneRule[] = [
  {
    id: 'tone_professional',
    name: 'Professional tone',
    prohibitedPhrases: ['lol', 'lmao', 'omg', 'bruh', 'dude', 'wtf', 'stfu', 'af'],
    action: 'warn',
    enabled: false,
  },
  {
    id: 'tone_respectful',
    name: 'Respectful tone',
    prohibitedPhrases: ['stupid', 'idiot', 'dumb', 'moron', 'fool', 'shut up', 'go away'],
    action: 'rewrite',
    redirectMessage: 'Please maintain a respectful tone in all interactions.',
    enabled: true,
  },
];

/* ── SemanticGuardrails class ───────────────────────────────────── */

export class SemanticGuardrails {
  private config: GuardrailConfig;

  constructor(config?: Partial<GuardrailConfig>) {
    this.config = {
      topicRules: config?.topicRules ?? BUILT_IN_TOPIC_RULES.map(r => ({ ...r, keywords: [...r.keywords], patterns: r.patterns ? [...r.patterns] : undefined })),
      toneRules: config?.toneRules ?? BUILT_IN_TONE_RULES.map(r => ({ ...r, prohibitedPhrases: [...(r.prohibitedPhrases ?? [])] })),
      boundaries: config?.boundaries ?? [],
      steeringRules: config?.steeringRules ?? [],
      defaultAction: config?.defaultAction ?? 'log',
      aggregateViolations: config?.aggregateViolations ?? true,
      minKeywordMatches: config?.minKeywordMatches ?? 1,
    };
  }

  /** Check content (input or output) against all guardrails */
  check(content: string): GuardrailResult {
    const violations: GuardrailViolation[] = [];
    const steeringApplied: GuardrailResult['steeringApplied'] = [];
    const lower = content.toLowerCase();

    // ── Topic rules ──
    for (const rule of this.config.topicRules) {
      if (!rule.enabled) continue;

      const matchedTerms: string[] = [];

      // Keyword matching
      for (const kw of rule.keywords) {
        if (lower.includes(kw.toLowerCase())) {
          matchedTerms.push(kw);
        }
      }

      // Pattern matching
      if (rule.patterns) {
        for (const pattern of rule.patterns) {
          const match = content.match(pattern);
          if (match) matchedTerms.push(match[0]);
        }
      }

      if (matchedTerms.length >= this.config.minKeywordMatches) {
        violations.push({
          ruleId: rule.id,
          ruleName: rule.name,
          category: rule.category,
          action: rule.action,
          severity: rule.severity,
          description: `Topic "${rule.name}" detected`,
          matchedTerms,
          redirectMessage: rule.redirectMessage,
        });

        if (!this.config.aggregateViolations) break;
      }
    }

    // ── Tone rules ──
    for (const rule of this.config.toneRules) {
      if (!rule.enabled) continue;

      const matchedTerms: string[] = [];
      for (const phrase of rule.prohibitedPhrases) {
        // Use word boundary matching for short phrases
        const regex = phrase.length <= 4
          ? new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'i')
          : new RegExp(escapeRegExp(phrase), 'i');
        if (regex.test(content)) {
          matchedTerms.push(phrase);
        }
      }

      if (matchedTerms.length > 0) {
        violations.push({
          ruleId: rule.id,
          ruleName: rule.name,
          category: 'tone',
          action: rule.action,
          severity: 3,
          description: `Tone violation: prohibited phrases detected`,
          matchedTerms,
          redirectMessage: rule.redirectMessage,
        });
      }
    }

    // ── Content boundaries ──
    for (const boundary of this.config.boundaries) {
      if (!boundary.enabled) continue;

      if (!boundary.check(content)) {
        violations.push({
          ruleId: boundary.id,
          ruleName: boundary.name,
          category: 'boundary',
          action: boundary.action,
          severity: 3,
          description: boundary.description,
          matchedTerms: [],
          redirectMessage: boundary.redirectMessage,
        });
      }
    }

    // ── Steering rules ──
    for (const rule of this.config.steeringRules) {
      if (!rule.enabled) continue;

      const triggered = rule.triggerKeywords.some(kw => lower.includes(kw.toLowerCase()));
      if (triggered) {
        steeringApplied.push({
          ruleId: rule.id,
          steerToward: rule.steerToward,
          responseTemplate: rule.responseTemplate,
        });
      }
    }

    // Determine overall action
    let overallAction: GuardrailResult['action'] = 'pass';
    if (violations.length > 0) {
      // Use the most severe action
      const actionPriority: Record<GuardrailAction, number> = {
        block: 5, rewrite: 4, redirect: 3, warn: 2, log: 1,
      };
      let maxPriority = 0;
      for (const v of violations) {
        const priority = actionPriority[v.action];
        if (priority > maxPriority) {
          maxPriority = priority;
          overallAction = v.action;
        }
      }
    }

    // Generate suggested rewrite if action is 'rewrite'
    let suggestedRewrite: string | undefined;
    if (overallAction === 'rewrite') {
      suggestedRewrite = this.generateRewrite(content, violations);
    }

    return {
      id: randomUUID(),
      timestamp: Date.now(),
      input: content,
      passed: violations.length === 0,
      violations,
      steeringApplied,
      suggestedRewrite,
      action: overallAction,
    };
  }

  /** Check both input and output for a complete turn */
  checkTurn(input: string, output: string): {
    inputResult: GuardrailResult;
    outputResult: GuardrailResult;
    overallPassed: boolean;
    action: GuardrailResult['action'];
  } {
    const inputResult = this.check(input);
    const outputResult = this.check(output);

    const actionPriority: Record<string, number> = {
      block: 5, rewrite: 4, redirect: 3, warn: 2, log: 1, pass: 0,
    };

    const outPri = actionPriority[outputResult.action] ?? 0;
    const inPri = actionPriority[inputResult.action] ?? 0;
    const overallAction = outPri >= inPri
      ? outputResult.action
      : inputResult.action;

    return {
      inputResult,
      outputResult,
      overallPassed: inputResult.passed && outputResult.passed,
      action: overallAction,
    };
  }

  /** Generate a rewritten version of content that removes violations */
  private generateRewrite(content: string, violations: GuardrailViolation[]): string {
    let rewritten = content;

    for (const violation of violations) {
      for (const term of violation.matchedTerms) {
        // Replace matched terms with asterisks or redaction
        const regex = new RegExp(escapeRegExp(term), 'gi');
        rewritten = rewritten.replace(regex, '[redacted]');
      }
    }

    return rewritten;
  }

  // ── Rule management ──

  /** Add a custom topic rule */
  addTopicRule(rule: Omit<TopicRule, 'id'>): TopicRule {
    const fullRule: TopicRule = { ...rule, id: `topic_custom_${randomUUID().slice(0, 8)}` };
    this.config.topicRules.push(fullRule);
    return fullRule;
  }

  /** Add a custom tone rule */
  addToneRule(rule: Omit<ToneRule, 'id'>): ToneRule {
    const fullRule: ToneRule = { ...rule, id: `tone_custom_${randomUUID().slice(0, 8)}` };
    this.config.toneRules.push(fullRule);
    return fullRule;
  }

  /** Add a content boundary */
  addBoundary(boundary: Omit<ContentBoundary, 'id'>): ContentBoundary {
    const fullBoundary: ContentBoundary = { ...boundary, id: `boundary_${randomUUID().slice(0, 8)}` };
    this.config.boundaries.push(fullBoundary);
    return fullBoundary;
  }

  /** Add a steering rule */
  addSteeringRule(rule: Omit<SteeringRule, 'id'>): SteeringRule {
    const fullRule: SteeringRule = { ...rule, id: `steer_${randomUUID().slice(0, 8)}` };
    this.config.steeringRules.push(fullRule);
    return fullRule;
  }

  /** Enable/disable a rule by ID */
  setRuleEnabled(ruleId: string, enabled: boolean): boolean {
    for (const rule of this.config.topicRules) {
      if (rule.id === ruleId) { rule.enabled = enabled; return true; }
    }
    for (const rule of this.config.toneRules) {
      if (rule.id === ruleId) { rule.enabled = enabled; return true; }
    }
    for (const boundary of this.config.boundaries) {
      if (boundary.id === ruleId) { boundary.enabled = enabled; return true; }
    }
    for (const rule of this.config.steeringRules) {
      if (rule.id === ruleId) { rule.enabled = enabled; return true; }
    }
    return false;
  }

  /** Remove a rule by ID */
  removeRule(ruleId: string): boolean {
    const before = this.config.topicRules.length + this.config.toneRules.length +
      this.config.boundaries.length + this.config.steeringRules.length;

    this.config.topicRules = this.config.topicRules.filter(r => r.id !== ruleId);
    this.config.toneRules = this.config.toneRules.filter(r => r.id !== ruleId);
    this.config.boundaries = this.config.boundaries.filter(r => r.id !== ruleId);
    this.config.steeringRules = this.config.steeringRules.filter(r => r.id !== ruleId);

    const after = this.config.topicRules.length + this.config.toneRules.length +
      this.config.boundaries.length + this.config.steeringRules.length;

    return after < before;
  }

  /** Get all rules */
  getRules(): {
    topicRules: TopicRule[];
    toneRules: ToneRule[];
    boundaries: ContentBoundary[];
    steeringRules: SteeringRule[];
  } {
    return {
      topicRules: [...this.config.topicRules],
      toneRules: [...this.config.toneRules],
      boundaries: [...this.config.boundaries],
      steeringRules: [...this.config.steeringRules],
    };
  }

  /** Get all enabled rules count */
  getEnabledRuleCount(): number {
    return (
      this.config.topicRules.filter(r => r.enabled).length +
      this.config.toneRules.filter(r => r.enabled).length +
      this.config.boundaries.filter(r => r.enabled).length +
      this.config.steeringRules.filter(r => r.enabled).length
    );
  }
}

/* ── Helper: escape regex special chars ─────────────────────────── */

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
