/**
 * Insider Risk Analytics
 *
 * Analyzes patterns in approval, policy, and tool usage to detect
 * insider risk indicators such as rubber-stamping, self-approval attempts,
 * unusual-hours governance changes, and permission anomalies.
 *
 * Key concepts:
 * - Permission anomaly detection for tool usage patterns
 * - Suspicious approval pattern detection
 * - Unusual hours/frequency alerts for governance changes
 * - Attestation chain export bundles for external auditors
 * - Insider risk dashboard with severity scoring
 */

import { randomUUID } from "node:crypto";
import { sha256Hex } from "../utils/hash.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RiskSeverity = "critical" | "high" | "medium" | "low" | "info";

export type InsiderRiskCategory =
  | "rubber_stamping"
  | "self_approval"
  | "unusual_hours"
  | "frequency_anomaly"
  | "privilege_escalation"
  | "permission_anomaly"
  | "policy_tampering"
  | "evidence_manipulation"
  | "bulk_operation";

export interface ApprovalEvent {
  eventId: string;
  requesterId: string;
  approverId: string;
  action: string;
  decision: "APPROVED" | "DENIED" | "EXPIRED";
  ts: number;
  durationMs: number; // time between request and decision
  metadata?: Record<string, unknown>;
}

export interface ToolUsageEvent {
  eventId: string;
  agentId: string;
  toolName: string;
  action: string;
  ts: number;
  permitted: boolean;
  denialReason?: string;
}

export interface PolicyChangeEvent {
  eventId: string;
  actorId: string;
  policyType: string;
  changeType: "create" | "update" | "delete" | "sign";
  ts: number;
  description: string;
}

export interface InsiderRiskAlert {
  alertId: string;
  category: InsiderRiskCategory;
  severity: RiskSeverity;
  actorId: string;
  description: string;
  evidenceEventIds: string[];
  ts: number;
  acknowledged: boolean;
  score: number; // 0.0–1.0
}

export interface RubberStampAnalysis {
  approverId: string;
  totalDecisions: number;
  approvalRate: number; // 0.0–1.0
  avgDecisionTimeMs: number;
  fastApprovals: number; // decisions < threshold
  isRubberStamping: boolean;
}

export interface SelfApprovalAttempt {
  requesterId: string;
  approverId: string;
  eventId: string;
  ts: number;
  action: string;
}

export interface UnusualHoursActivity {
  actorId: string;
  eventId: string;
  ts: number;
  hourOfDay: number;
  dayOfWeek: number;
  activityType: string;
  isOutsideNormalHours: boolean;
}

export interface PermissionAnomalyResult {
  agentId: string;
  toolName: string;
  denialCount: number;
  totalAttempts: number;
  denialRate: number;
  isAnomaly: boolean;
  reason: string;
}

export interface InsiderRiskScore {
  actorId: string;
  overallScore: number; // 0.0–1.0 (higher = more risky)
  categoryScores: Record<InsiderRiskCategory, number>;
  alertCount: number;
  criticalAlertCount: number;
  riskLevel: RiskSeverity;
}

export interface AttestationBundle {
  bundleId: string;
  tenantId: string;
  exportedTs: number;
  alerts: InsiderRiskAlert[];
  approvalEvents: ApprovalEvent[];
  policyChanges: PolicyChangeEvent[];
  riskScores: InsiderRiskScore[];
  bundleHash: string;
}

export interface InsiderRiskReport {
  reportId: string;
  generatedTs: number;
  windowStartTs: number;
  windowEndTs: number;
  alerts: InsiderRiskAlert[];
  rubberStampAnalyses: RubberStampAnalysis[];
  selfApprovalAttempts: SelfApprovalAttempt[];
  unusualHoursActivities: UnusualHoursActivity[];
  permissionAnomalies: PermissionAnomalyResult[];
  riskScores: InsiderRiskScore[];
  overallRiskLevel: RiskSeverity;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface InsiderRiskConfig {
  /** Approval faster than this (ms) is considered rubber-stamping */
  rubberStampThresholdMs: number;
  /** Approval rate above this is suspicious */
  rubberStampApprovalRateThreshold: number;
  /** Minimum decisions to evaluate rubber-stamping */
  rubberStampMinDecisions: number;
  /** Normal business hours (24h format) */
  normalHoursStart: number;
  normalHoursEnd: number;
  /** Normal business days (0=Sun, 6=Sat) */
  normalDays: number[];
  /** Tool denial rate above this is anomalous */
  permissionDenialRateThreshold: number;
  /** Minimum tool attempts for anomaly detection */
  permissionMinAttempts: number;
  /** Bulk operation threshold */
  bulkOperationThreshold: number;
}

const DEFAULT_CONFIG: InsiderRiskConfig = {
  rubberStampThresholdMs: 5000,
  rubberStampApprovalRateThreshold: 0.95,
  rubberStampMinDecisions: 5,
  normalHoursStart: 8,
  normalHoursEnd: 18,
  normalDays: [1, 2, 3, 4, 5], // Mon-Fri
  permissionDenialRateThreshold: 0.3,
  permissionMinAttempts: 5,
  bulkOperationThreshold: 10,
};

// ---------------------------------------------------------------------------
// In-memory state
// ---------------------------------------------------------------------------

let config: InsiderRiskConfig = { ...DEFAULT_CONFIG };
let approvalEvents: ApprovalEvent[] = [];
let toolUsageEvents: ToolUsageEvent[] = [];
let policyChangeEvents: PolicyChangeEvent[] = [];
let alerts: InsiderRiskAlert[] = [];

export function configureInsiderRisk(overrides: Partial<InsiderRiskConfig>): InsiderRiskConfig {
  config = { ...config, ...overrides };
  return config;
}

export function getInsiderRiskConfig(): InsiderRiskConfig {
  return { ...config };
}

export function resetInsiderRiskState(): void {
  config = { ...DEFAULT_CONFIG };
  approvalEvents = [];
  toolUsageEvents = [];
  policyChangeEvents = [];
  alerts = [];
}

// ---------------------------------------------------------------------------
// Event ingestion
// ---------------------------------------------------------------------------

export function recordApprovalEvent(event: Omit<ApprovalEvent, "eventId">): ApprovalEvent {
  const full: ApprovalEvent = { eventId: `ae_${randomUUID().slice(0, 12)}`, ...event };
  approvalEvents.push(full);
  return full;
}

export function recordToolUsageEvent(event: Omit<ToolUsageEvent, "eventId">): ToolUsageEvent {
  const full: ToolUsageEvent = { eventId: `tue_${randomUUID().slice(0, 12)}`, ...event };
  toolUsageEvents.push(full);
  return full;
}

export function recordPolicyChangeEvent(event: Omit<PolicyChangeEvent, "eventId">): PolicyChangeEvent {
  const full: PolicyChangeEvent = { eventId: `pce_${randomUUID().slice(0, 12)}`, ...event };
  policyChangeEvents.push(full);
  return full;
}

// ---------------------------------------------------------------------------
// Rubber-stamping detection
// ---------------------------------------------------------------------------

/**
 * Analyze approval patterns for rubber-stamping indicators.
 */
export function analyzeRubberStamping(sinceTs?: number): RubberStampAnalysis[] {
  const filtered = sinceTs ? approvalEvents.filter((e) => e.ts >= sinceTs) : approvalEvents;

  // Group by approver
  const byApprover = new Map<string, ApprovalEvent[]>();
  for (const event of filtered) {
    const arr = byApprover.get(event.approverId) ?? [];
    arr.push(event);
    byApprover.set(event.approverId, arr);
  }

  const analyses: RubberStampAnalysis[] = [];
  for (const [approverId, events] of byApprover) {
    if (events.length < config.rubberStampMinDecisions) continue;

    const approved = events.filter((e) => e.decision === "APPROVED").length;
    const approvalRate = approved / events.length;
    const avgDuration = events.reduce((s, e) => s + e.durationMs, 0) / events.length;
    const fastApprovals = events.filter(
      (e) => e.decision === "APPROVED" && e.durationMs < config.rubberStampThresholdMs,
    ).length;

    const isRubberStamping =
      approvalRate >= config.rubberStampApprovalRateThreshold &&
      fastApprovals >= Math.ceil(events.length * 0.5);

    analyses.push({
      approverId,
      totalDecisions: events.length,
      approvalRate,
      avgDecisionTimeMs: avgDuration,
      fastApprovals,
      isRubberStamping,
    });

    if (isRubberStamping) {
      addAlert({
        category: "rubber_stamping",
        severity: "high",
        actorId: approverId,
        description: `Approver ${approverId} shows rubber-stamping pattern: ${(approvalRate * 100).toFixed(0)}% approval rate with ${fastApprovals}/${events.length} fast approvals.`,
        evidenceEventIds: events.slice(0, 10).map((e) => e.eventId),
        score: Math.min(1, approvalRate * (fastApprovals / events.length)),
      });
    }
  }

  return analyses;
}

// ---------------------------------------------------------------------------
// Self-approval detection
// ---------------------------------------------------------------------------

/**
 * Detect self-approval attempts where requester and approver are the same.
 */
export function detectSelfApprovals(sinceTs?: number): SelfApprovalAttempt[] {
  const filtered = sinceTs ? approvalEvents.filter((e) => e.ts >= sinceTs) : approvalEvents;
  const attempts: SelfApprovalAttempt[] = [];

  for (const event of filtered) {
    if (event.requesterId === event.approverId) {
      attempts.push({
        requesterId: event.requesterId,
        approverId: event.approverId,
        eventId: event.eventId,
        ts: event.ts,
        action: event.action,
      });

      addAlert({
        category: "self_approval",
        severity: "critical",
        actorId: event.requesterId,
        description: `Self-approval attempt: ${event.requesterId} approved their own request for action "${event.action}".`,
        evidenceEventIds: [event.eventId],
        score: 1.0,
      });
    }
  }

  return attempts;
}

// ---------------------------------------------------------------------------
// Unusual hours detection
// ---------------------------------------------------------------------------

/**
 * Detect governance activities outside normal business hours.
 */
export function detectUnusualHours(sinceTs?: number): UnusualHoursActivity[] {
  const results: UnusualHoursActivity[] = [];

  // Check policy changes
  const policies = sinceTs ? policyChangeEvents.filter((e) => e.ts >= sinceTs) : policyChangeEvents;
  for (const event of policies) {
    const date = new Date(event.ts);
    const hour = date.getHours();
    const day = date.getDay();
    const isOutside = hour < config.normalHoursStart || hour >= config.normalHoursEnd || !config.normalDays.includes(day);

    results.push({
      actorId: event.actorId,
      eventId: event.eventId,
      ts: event.ts,
      hourOfDay: hour,
      dayOfWeek: day,
      activityType: `policy_${event.changeType}`,
      isOutsideNormalHours: isOutside,
    });

    if (isOutside) {
      addAlert({
        category: "unusual_hours",
        severity: "medium",
        actorId: event.actorId,
        description: `Policy ${event.changeType} by ${event.actorId} at ${date.toISOString()} (outside normal hours).`,
        evidenceEventIds: [event.eventId],
        score: 0.6,
      });
    }
  }

  // Check approval events outside hours
  const approvals = sinceTs ? approvalEvents.filter((e) => e.ts >= sinceTs) : approvalEvents;
  for (const event of approvals) {
    const date = new Date(event.ts);
    const hour = date.getHours();
    const day = date.getDay();
    const isOutside = hour < config.normalHoursStart || hour >= config.normalHoursEnd || !config.normalDays.includes(day);

    if (isOutside) {
      results.push({
        actorId: event.approverId,
        eventId: event.eventId,
        ts: event.ts,
        hourOfDay: hour,
        dayOfWeek: day,
        activityType: `approval_${event.decision.toLowerCase()}`,
        isOutsideNormalHours: true,
      });

      addAlert({
        category: "unusual_hours",
        severity: "low",
        actorId: event.approverId,
        description: `Approval activity by ${event.approverId} at ${date.toISOString()} (outside normal hours).`,
        evidenceEventIds: [event.eventId],
        score: 0.3,
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Permission anomaly detection
// ---------------------------------------------------------------------------

/**
 * Detect permission anomalies from tool usage patterns.
 */
export function detectPermissionAnomalies(sinceTs?: number): PermissionAnomalyResult[] {
  const filtered = sinceTs ? toolUsageEvents.filter((e) => e.ts >= sinceTs) : toolUsageEvents;

  // Group by agent+tool
  const byKey = new Map<string, ToolUsageEvent[]>();
  for (const event of filtered) {
    const key = `${event.agentId}::${event.toolName}`;
    const arr = byKey.get(key) ?? [];
    arr.push(event);
    byKey.set(key, arr);
  }

  const results: PermissionAnomalyResult[] = [];
  for (const [key, events] of byKey) {
    if (events.length < config.permissionMinAttempts) continue;

    const [agentId, toolName] = key.split("::");
    const denials = events.filter((e) => !e.permitted).length;
    const denialRate = denials / events.length;
    const isAnomaly = denialRate >= config.permissionDenialRateThreshold;

    const reason = isAnomaly
      ? `${denials}/${events.length} attempts denied (${(denialRate * 100).toFixed(0)}% denial rate exceeds ${(config.permissionDenialRateThreshold * 100).toFixed(0)}% threshold).`
      : "Within normal range.";

    results.push({
      agentId: agentId!,
      toolName: toolName!,
      denialCount: denials,
      totalAttempts: events.length,
      denialRate,
      isAnomaly,
      reason,
    });

    if (isAnomaly) {
      addAlert({
        category: "permission_anomaly",
        severity: denialRate > 0.6 ? "high" : "medium",
        actorId: agentId!,
        description: `Agent ${agentId} has high denial rate for tool ${toolName}: ${reason}`,
        evidenceEventIds: events.filter((e) => !e.permitted).slice(0, 10).map((e) => e.eventId),
        score: denialRate,
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Frequency anomaly / bulk operation detection
// ---------------------------------------------------------------------------

/**
 * Detect frequency anomalies (bulk operations in short windows).
 */
export function detectFrequencyAnomalies(sinceTs?: number): InsiderRiskAlert[] {
  const windowMs = 300000; // 5-minute windows
  const newAlerts: InsiderRiskAlert[] = [];

  // Check policy changes for bulk modifications
  const policies = sinceTs ? policyChangeEvents.filter((e) => e.ts >= sinceTs) : policyChangeEvents;
  const byActor = new Map<string, PolicyChangeEvent[]>();
  for (const e of policies) {
    const arr = byActor.get(e.actorId) ?? [];
    arr.push(e);
    byActor.set(e.actorId, arr);
  }

  for (const [actorId, events] of byActor) {
    // Check for bursts within 5-minute windows
    events.sort((a, b) => a.ts - b.ts);
    for (let i = 0; i < events.length; i++) {
      const windowEnd = events[i]!.ts + windowMs;
      const inWindow = events.filter((e) => e.ts >= events[i]!.ts && e.ts <= windowEnd);
      if (inWindow.length >= config.bulkOperationThreshold) {
        const alert = addAlert({
          category: "bulk_operation",
          severity: "high",
          actorId,
          description: `${inWindow.length} policy changes by ${actorId} within 5 minutes.`,
          evidenceEventIds: inWindow.slice(0, 10).map((e) => e.eventId),
          score: Math.min(1, inWindow.length / config.bulkOperationThreshold),
        });
        newAlerts.push(alert);
        break; // One alert per actor
      }
    }
  }

  return newAlerts;
}

// ---------------------------------------------------------------------------
// Risk scoring
// ---------------------------------------------------------------------------

/**
 * Compute insider risk scores for all observed actors.
 */
export function computeInsiderRiskScores(): InsiderRiskScore[] {
  const actorAlerts = new Map<string, InsiderRiskAlert[]>();

  for (const alert of alerts) {
    const arr = actorAlerts.get(alert.actorId) ?? [];
    arr.push(alert);
    actorAlerts.set(alert.actorId, arr);
  }

  const scores: InsiderRiskScore[] = [];
  for (const [actorId, actorAlertList] of actorAlerts) {
    const categoryScores: Record<InsiderRiskCategory, number> = {
      rubber_stamping: 0,
      self_approval: 0,
      unusual_hours: 0,
      frequency_anomaly: 0,
      privilege_escalation: 0,
      permission_anomaly: 0,
      policy_tampering: 0,
      evidence_manipulation: 0,
      bulk_operation: 0,
    };

    for (const alert of actorAlertList) {
      categoryScores[alert.category] = Math.max(categoryScores[alert.category], alert.score);
    }

    const overallScore = Math.min(
      1,
      Object.values(categoryScores).reduce((s, v) => s + v, 0) / Math.max(1, Object.values(categoryScores).filter((v) => v > 0).length),
    );

    const criticalCount = actorAlertList.filter((a) => a.severity === "critical").length;
    const riskLevel: RiskSeverity =
      criticalCount > 0 ? "critical" :
      overallScore > 0.7 ? "high" :
      overallScore > 0.4 ? "medium" :
      overallScore > 0.1 ? "low" :
      "info";

    scores.push({
      actorId,
      overallScore,
      categoryScores,
      alertCount: actorAlertList.length,
      criticalAlertCount: criticalCount,
      riskLevel,
    });
  }

  scores.sort((a, b) => b.overallScore - a.overallScore);
  return scores;
}

// ---------------------------------------------------------------------------
// Attestation export
// ---------------------------------------------------------------------------

/**
 * Export an attestation bundle for external auditors.
 */
export function exportAttestationBundle(tenantId: string): AttestationBundle {
  const riskScores = computeInsiderRiskScores();
  const bundleContent = {
    tenantId,
    alerts: [...alerts],
    approvalEvents: [...approvalEvents],
    policyChanges: [...policyChangeEvents],
    riskScores,
    exportedTs: Date.now(),
  };
  const bundleHash = sha256Hex(JSON.stringify(bundleContent));

  return {
    bundleId: `atb_${randomUUID().slice(0, 12)}`,
    tenantId,
    exportedTs: Date.now(),
    alerts: [...alerts],
    approvalEvents: [...approvalEvents],
    policyChanges: [...policyChangeEvents],
    riskScores,
    bundleHash,
  };
}

// ---------------------------------------------------------------------------
// Full report
// ---------------------------------------------------------------------------

/**
 * Generate a comprehensive insider risk report.
 */
export function generateInsiderRiskReport(
  windowStartTs?: number,
  windowEndTs?: number,
): InsiderRiskReport {
  const start = windowStartTs ?? Date.now() - 7 * 86400000;

  const rubberStamp = analyzeRubberStamping(start);
  const selfApprovals = detectSelfApprovals(start);
  const unusualHours = detectUnusualHours(start);
  const permissionAnomalies = detectPermissionAnomalies(start);
  detectFrequencyAnomalies(start);
  const riskScores = computeInsiderRiskScores();

  // Capture end AFTER analyses so newly-created alerts fall within the window
  const end = windowEndTs ?? Date.now();
  const windowAlerts = alerts.filter((a) => a.ts >= start && a.ts <= end);

  const overallRiskLevel: RiskSeverity =
    windowAlerts.some((a) => a.severity === "critical") ? "critical" :
    windowAlerts.some((a) => a.severity === "high") ? "high" :
    windowAlerts.some((a) => a.severity === "medium") ? "medium" :
    windowAlerts.length > 0 ? "low" :
    "info";

  return {
    reportId: `irr_${randomUUID().slice(0, 12)}`,
    generatedTs: Date.now(),
    windowStartTs: start,
    windowEndTs: end,
    alerts: windowAlerts,
    rubberStampAnalyses: rubberStamp,
    selfApprovalAttempts: selfApprovals,
    unusualHoursActivities: unusualHours,
    permissionAnomalies,
    riskScores,
    overallRiskLevel,
  };
}

// ---------------------------------------------------------------------------
// Alert management
// ---------------------------------------------------------------------------

function addAlert(opts: {
  category: InsiderRiskCategory;
  severity: RiskSeverity;
  actorId: string;
  description: string;
  evidenceEventIds: string[];
  score: number;
}): InsiderRiskAlert {
  const alert: InsiderRiskAlert = {
    alertId: `ira_${randomUUID().slice(0, 12)}`,
    category: opts.category,
    severity: opts.severity,
    actorId: opts.actorId,
    description: opts.description,
    evidenceEventIds: opts.evidenceEventIds,
    ts: Date.now(),
    acknowledged: false,
    score: opts.score,
  };
  alerts.push(alert);
  return alert;
}

export function getInsiderAlerts(actorId?: string): InsiderRiskAlert[] {
  return actorId ? alerts.filter((a) => a.actorId === actorId) : [...alerts];
}

export function acknowledgeInsiderAlert(alertId: string): boolean {
  const alert = alerts.find((a) => a.alertId === alertId);
  if (!alert) return false;
  alert.acknowledged = true;
  return true;
}

// ---------------------------------------------------------------------------
// Markdown rendering
// ---------------------------------------------------------------------------

/**
 * Render an insider risk report as markdown.
 */
export function renderInsiderRiskMarkdown(report: InsiderRiskReport): string {
  const lines: string[] = [];

  lines.push("# Insider Risk Analytics Report");
  lines.push(`Report ID: ${report.reportId}`);
  lines.push(`Window: ${new Date(report.windowStartTs).toISOString()} — ${new Date(report.windowEndTs).toISOString()}`);
  lines.push(`Generated: ${new Date(report.generatedTs).toISOString()}`);
  lines.push(`Overall Risk: **${report.overallRiskLevel.toUpperCase()}**`);
  lines.push("");

  // Summary
  lines.push("## Summary");
  lines.push("| Metric | Count |");
  lines.push("|--------|-------|");
  lines.push(`| Total alerts | ${report.alerts.length} |`);
  lines.push(`| Rubber-stamping detections | ${report.rubberStampAnalyses.filter((r) => r.isRubberStamping).length} |`);
  lines.push(`| Self-approval attempts | ${report.selfApprovalAttempts.length} |`);
  lines.push(`| Unusual hours activities | ${report.unusualHoursActivities.filter((u) => u.isOutsideNormalHours).length} |`);
  lines.push(`| Permission anomalies | ${report.permissionAnomalies.filter((p) => p.isAnomaly).length} |`);
  lines.push("");

  // Risk scores
  if (report.riskScores.length > 0) {
    lines.push("## Risk Scores by Actor");
    lines.push("| Actor | Overall Score | Risk Level | Alerts | Critical |");
    lines.push("|-------|-------------|------------|--------|----------|");
    for (const s of report.riskScores) {
      lines.push(`| ${s.actorId} | ${(s.overallScore * 100).toFixed(0)}% | ${s.riskLevel.toUpperCase()} | ${s.alertCount} | ${s.criticalAlertCount} |`);
    }
    lines.push("");
  }

  // Alerts
  if (report.alerts.length > 0) {
    lines.push("## Alerts");
    lines.push("| Severity | Category | Actor | Description |");
    lines.push("|----------|----------|-------|-------------|");
    for (const a of report.alerts.slice(0, 20)) {
      lines.push(`| ${a.severity.toUpperCase()} | ${a.category} | ${a.actorId} | ${a.description.slice(0, 60)}${a.description.length > 60 ? "…" : ""} |`);
    }
    lines.push("");
  }

  // Self-approvals
  if (report.selfApprovalAttempts.length > 0) {
    lines.push("## Self-Approval Attempts");
    for (const s of report.selfApprovalAttempts) {
      lines.push(`- **${s.requesterId}** self-approved action "${s.action}" at ${new Date(s.ts).toISOString()}`);
    }
    lines.push("");
  }

  // Rubber-stamping
  const rubberStampers = report.rubberStampAnalyses.filter((r) => r.isRubberStamping);
  if (rubberStampers.length > 0) {
    lines.push("## Rubber-Stamping Detections");
    lines.push("| Approver | Decisions | Approval Rate | Avg Time | Fast Approvals |");
    lines.push("|----------|-----------|--------------|----------|----------------|");
    for (const r of rubberStampers) {
      lines.push(`| ${r.approverId} | ${r.totalDecisions} | ${(r.approvalRate * 100).toFixed(0)}% | ${r.avgDecisionTimeMs.toFixed(0)}ms | ${r.fastApprovals} |`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
