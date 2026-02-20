/**
 * legalContractBot.ts — Regex-based clause extraction with risk scoring.
 */

import { AMCAgentBase } from './agentBase.js';

export type ClauseType = 'indemnification' | 'termination' | 'liability' | 'confidentiality' | 'ip' | 'non_compete' | 'arbitration' | 'force_majeure' | 'payment' | 'warranty';

export interface ClauseExtraction {
  type: ClauseType;
  text: string;
  position: number;
  riskScore: number;
  riskFactors: string[];
}

export interface ContractAnalysis {
  totalClauses: number;
  clauses: ClauseExtraction[];
  overallRiskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  missingClauses: ClauseType[];
  recommendations: string[];
}

/* ── Clause patterns ─────────────────────────────────────────────── */

const CLAUSE_PATTERNS: Record<ClauseType, { patterns: RegExp[]; baseRisk: number; riskKeywords: RegExp[] }> = {
  indemnification: {
    patterns: [/\b(indemnif|hold\s+harmless|defend\s+and\s+indemnif)\w*/gi],
    baseRisk: 0.5,
    riskKeywords: [/\bunlimited\b/i, /\bsole\s+expense\b/i, /\bfull\s+indemnit/i],
  },
  termination: {
    patterns: [/\b(terminat|cancel|expir)\w*\s*(of|this|the)?\s*(agreement|contract)/gi],
    baseRisk: 0.3,
    riskKeywords: [/\bwithout\s+cause\b/i, /\bimmediate\s+terminat/i, /\bno\s+notice\b/i],
  },
  liability: {
    patterns: [/\b(liabilit|liable|limitation\s+of\s+liabilit)\w*/gi],
    baseRisk: 0.4,
    riskKeywords: [/\bunlimited\s+liabilit/i, /\bno\s+cap\b/i, /\bconsequential\s+damage/i],
  },
  confidentiality: {
    patterns: [/\b(confidential|non-?disclosure|nda|proprietary\s+information)\w*/gi],
    baseRisk: 0.3,
    riskKeywords: [/\bperpetual\b/i, /\bin\s+perpetuity\b/i, /\bno\s+exception/i],
  },
  ip: {
    patterns: [/\b(intellectual\s+property|ip\s+rights?|patent|copyright|trademark|work\s+for\s+hire)\b/gi],
    baseRisk: 0.5,
    riskKeywords: [/\ball\s+rights?\s+transfer/i, /\birrevocabl/i, /\bwork\s+for\s+hire\b/i],
  },
  non_compete: {
    patterns: [/\b(non-?compet|non-?solicitat|restrictive\s+covenant)\w*/gi],
    baseRisk: 0.6,
    riskKeywords: [/\b(2|3|4|5)\s+year/i, /\bnationwide\b/i, /\bglobal\b/i, /\bworldwide\b/i],
  },
  arbitration: {
    patterns: [/\b(arbitrat|binding\s+mediat|dispute\s+resolution)\w*/gi],
    baseRisk: 0.3,
    riskKeywords: [/\bmandatory\s+arbitrat/i, /\bwaive.*jury/i, /\bclass\s+action\s+waiver/i],
  },
  force_majeure: {
    patterns: [/\b(force\s+majeure|act\s+of\s+god|unforeseeable\s+event)\b/gi],
    baseRisk: 0.2,
    riskKeywords: [/\bpandemic\b/i, /\bno\s+liabilit/i],
  },
  payment: {
    patterns: [/\b(payment|compensat|fee|invoice|billing)\s*(terms?|schedul|due)/gi],
    baseRisk: 0.3,
    riskKeywords: [/\bnet\s+90\b/i, /\bno\s+refund/i, /\bpenalt/i, /\blate\s+fee/i],
  },
  warranty: {
    patterns: [/\b(warrant|as[- ]is|disclaim|guarantee)\w*/gi],
    baseRisk: 0.3,
    riskKeywords: [/\bas[- ]is\b/i, /\bno\s+warrant/i, /\bdisclaim\s+all/i],
  },
};

const EXPECTED_CLAUSES: ClauseType[] = ['indemnification', 'termination', 'liability', 'confidentiality', 'ip'];

/* ── Extraction logic ────────────────────────────────────────────── */

function extractClauses(text: string): ClauseExtraction[] {
  const clauses: ClauseExtraction[] = [];
  const sentences = text.split(/[.!?]+/).map((s, i) => ({ text: s.trim(), pos: i })).filter(s => s.text.length > 10);

  for (const [type, config] of Object.entries(CLAUSE_PATTERNS) as Array<[ClauseType, typeof CLAUSE_PATTERNS[ClauseType]]>) {
    for (const sentence of sentences) {
      for (const pattern of config.patterns) {
        pattern.lastIndex = 0;
        if (pattern.test(sentence.text)) {
          let risk = config.baseRisk;
          const factors: string[] = [];
          for (const kw of config.riskKeywords) {
            if (kw.test(sentence.text)) {
              risk = Math.min(1, risk + 0.2);
              factors.push(kw.source.replace(/\\b|\\s\+/g, ' ').trim());
            }
          }
          clauses.push({
            type,
            text: sentence.text.slice(0, 200),
            position: sentence.pos,
            riskScore: Math.round(risk * 100) / 100,
            riskFactors: factors,
          });
          break;
        }
      }
    }
  }

  return clauses;
}

/* ── Agent class ─────────────────────────────────────────────────── */

export class LegalContractBot extends AMCAgentBase {
  constructor() {
    super({ name: 'LegalContractBot', type: 'legal-contract' });
  }

  async run(input: unknown): Promise<ContractAnalysis> {
    const text = typeof input === 'string' ? input : JSON.stringify(input);
    return this.analyzeContract(text);
  }

  async analyzeContract(text: string): Promise<ContractAnalysis> {
    let clauses: ClauseExtraction[] = [];

    await this.executeAction('analyze-contract', async () => {
      clauses = extractClauses(text);
    });

    const foundTypes = new Set(clauses.map(c => c.type));
    const missingClauses = EXPECTED_CLAUSES.filter(t => !foundTypes.has(t));
    const overallRiskScore = clauses.length > 0
      ? Math.round(clauses.reduce((s, c) => s + c.riskScore, 0) / clauses.length * 100) / 100
      : 0;
    const riskLevel: 'low' | 'medium' | 'high' | 'critical' =
      overallRiskScore > 0.7 ? 'critical' :
      overallRiskScore > 0.5 ? 'high' :
      overallRiskScore > 0.3 ? 'medium' : 'low';

    const recommendations: string[] = [];
    for (const missing of missingClauses) {
      recommendations.push(`Add ${missing.replace('_', ' ')} clause`);
    }
    const highRisk = clauses.filter(c => c.riskScore > 0.6);
    for (const c of highRisk) {
      recommendations.push(`Review high-risk ${c.type} clause: ${c.riskFactors.join(', ')}`);
    }

    return {
      totalClauses: clauses.length,
      clauses,
      overallRiskScore,
      riskLevel,
      missingClauses,
      recommendations,
    };
  }
}

/** Convenience function */
export function analyzeContract(text: string): ContractAnalysis {
  const clauses = extractClauses(text);
  const foundTypes = new Set(clauses.map(c => c.type));
  const missingClauses = EXPECTED_CLAUSES.filter(t => !foundTypes.has(t));
  const overallRiskScore = clauses.length > 0
    ? Math.round(clauses.reduce((s, c) => s + c.riskScore, 0) / clauses.length * 100) / 100
    : 0;
  const riskLevel: 'low' | 'medium' | 'high' | 'critical' =
    overallRiskScore > 0.7 ? 'critical' : overallRiskScore > 0.5 ? 'high' : overallRiskScore > 0.3 ? 'medium' : 'low';
  return { totalClauses: clauses.length, clauses, overallRiskScore, riskLevel, missingClauses, recommendations: [] };
}
