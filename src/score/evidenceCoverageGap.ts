/**
 * evidenceCoverageGap.ts — Gap roadmap generation with priorities,
 * effort estimates, and prerequisite chains.
 */

import { questionIds } from "../diagnostic/questionBank.js";

export interface EvidenceCoverageReport {
  totalQIDs: number;
  automatedCoverage: number;
  manualRequired: number;
  coveragePercent: number;
  automatedQIDs: string[];
  manualQIDs: string[];
  improvementPlan: string[];
  roadmap: RoadmapItem[];
}

export interface RoadmapItem {
  qidPrefix: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  effortHours: number;
  prerequisites: string[];
  category: 'automation' | 'process' | 'integration' | 'policy';
  gapCount: number;
}

/* ── Prefix configs ──────────────────────────────────────────────── */

const AUTOMATED_PREFIXES = ["AMC-1.", "AMC-2.", "AMC-3.", "AMC-MEM-"];

const ROADMAP_CONFIGS: Record<string, Omit<RoadmapItem, 'gapCount'>> = {
  'AMC-1.': {
    qidPrefix: 'AMC-1.', description: 'Technical execution evidence (Shield/Enforce)',
    priority: 'high', effortHours: 16, prerequisites: [], category: 'automation',
  },
  'AMC-2.': {
    qidPrefix: 'AMC-2.', description: 'Assurance and verification evidence (Watch)',
    priority: 'high', effortHours: 24, prerequisites: ['AMC-1.'], category: 'automation',
  },
  'AMC-3.': {
    qidPrefix: 'AMC-3.', description: 'Privacy and data governance evidence (Vault)',
    priority: 'high', effortHours: 20, prerequisites: ['AMC-1.'], category: 'integration',
  },
  'AMC-4.': {
    qidPrefix: 'AMC-4.', description: 'Strategic governance and oversight evidence',
    priority: 'medium', effortHours: 32, prerequisites: ['AMC-1.', 'AMC-2.'], category: 'process',
  },
  'AMC-5.': {
    qidPrefix: 'AMC-5.', description: 'Team culture and organizational learning evidence',
    priority: 'medium', effortHours: 40, prerequisites: ['AMC-4.'], category: 'policy',
  },
  'AMC-MEM-': {
    qidPrefix: 'AMC-MEM-', description: 'Memory module telemetry and learning evidence',
    priority: 'high', effortHours: 12, prerequisites: [], category: 'integration',
  },
  'AMC-HOQ-': {
    qidPrefix: 'AMC-HOQ-', description: 'Human oversight quality evidence',
    priority: 'critical', effortHours: 8, prerequisites: [], category: 'process',
  },
  'AMC-GOV-': {
    qidPrefix: 'AMC-GOV-', description: 'Community governance evidence',
    priority: 'medium', effortHours: 16, prerequisites: ['AMC-4.'], category: 'policy',
  },
};

/* ── Build roadmap ───────────────────────────────────────────────── */

function buildRoadmap(manualQIDs: string[]): RoadmapItem[] {
  const prefixCounts = new Map<string, number>();
  for (const qid of manualQIDs) {
    for (const prefix of Object.keys(ROADMAP_CONFIGS)) {
      if (qid.startsWith(prefix)) {
        prefixCounts.set(prefix, (prefixCounts.get(prefix) ?? 0) + 1);
        break;
      }
    }
  }

  // Also count uncategorized
  const categorized = manualQIDs.filter(qid =>
    Object.keys(ROADMAP_CONFIGS).some(p => qid.startsWith(p))
  );
  const uncategorizedCount = manualQIDs.length - categorized.length;

  const items: RoadmapItem[] = [];
  for (const [prefix, config] of Object.entries(ROADMAP_CONFIGS)) {
    const count = prefixCounts.get(prefix) ?? 0;
    if (count > 0) {
      items.push({ ...config, gapCount: count });
    }
  }

  if (uncategorizedCount > 0) {
    items.push({
      qidPrefix: 'OTHER',
      description: 'Uncategorized evidence gaps',
      priority: 'low',
      effortHours: uncategorizedCount * 4,
      prerequisites: [],
      category: 'process',
      gapCount: uncategorizedCount,
    });
  }

  // Sort by priority
  const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  items.sort((a, b) => (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4));

  return items;
}

/* ── Main report ─────────────────────────────────────────────────── */

export function getEvidenceCoverageReport(_agentId: string): EvidenceCoverageReport {
  const all = [...questionIds];
  const automatedQIDs = all.filter(qid => AUTOMATED_PREFIXES.some(prefix => qid.startsWith(prefix)));
  const manualQIDs = all.filter(qid => !AUTOMATED_PREFIXES.some(prefix => qid.startsWith(prefix)));

  const totalQIDs = all.length;
  const automatedCoverage = automatedQIDs.length;
  const manualRequired = manualQIDs.length;
  const coveragePercent = totalQIDs === 0 ? 0 : Math.round((automatedCoverage / totalQIDs) * 100);
  const roadmap = buildRoadmap(manualQIDs);
  const totalEffort = roadmap.reduce((s, r) => s + r.effortHours, 0);

  return {
    totalQIDs,
    automatedCoverage,
    manualRequired,
    coveragePercent,
    automatedQIDs,
    manualQIDs,
    improvementPlan: [
      ...roadmap.map(r => `[${r.priority.toUpperCase()}] ${r.description}: ${r.gapCount} gaps, ~${r.effortHours}h effort`),
      `Total estimated effort: ~${totalEffort} hours`,
      `Prerequisites: ${roadmap.filter(r => r.prerequisites.length > 0).map(r => `${r.qidPrefix} requires ${r.prerequisites.join(', ')}`).join('; ') || 'None'}`,
    ],
    roadmap,
  };
}

/* ── Effort estimate ─────────────────────────────────────────────── */

export function estimateTotalEffort(report: EvidenceCoverageReport): {
  totalHours: number;
  byCategory: Record<string, number>;
  criticalPath: string[];
} {
  const byCategory: Record<string, number> = {};
  for (const item of report.roadmap) {
    byCategory[item.category] = (byCategory[item.category] ?? 0) + item.effortHours;
  }

  // Simple critical path: items with most prerequisites
  const criticalPath = report.roadmap
    .filter(r => r.priority === 'critical' || r.prerequisites.length > 0)
    .map(r => r.qidPrefix);

  return {
    totalHours: report.roadmap.reduce((s, r) => s + r.effortHours, 0),
    byCategory,
    criticalPath,
  };
}
