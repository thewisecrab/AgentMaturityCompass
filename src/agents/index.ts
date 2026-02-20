/**
 * agents/index.ts — Re-exports for all agent harnesses.
 */

export { AMCAgentBase } from './agentBase.js';
export type { AgentConfig, AgentDecision, AgentStats } from './agentBase.js';

export { ContentModerationBot, moderate } from './contentModerationBot.js';
export type { ModerationDecision, ContentCategory, ViolationType } from './contentModerationBot.js';

export { DataPipelineBot } from './dataPipelineBot.js';
export type { PipelineTransform, PipelineResult, TransformType } from './dataPipelineBot.js';

export { LegalContractBot, analyzeContract } from './legalContractBot.js';
export type { ContractAnalysis, ClauseExtraction, ClauseType } from './legalContractBot.js';

export { CustomerSupportBot, handleSupportRequest } from './customerSupportBot.js';
export type {
  SupportTicket, SupportRequest, SupportResponse, BotStats,
  Intent, Sentiment, Priority, TicketStatus,
} from './customerSupportBot.js';

export { HarnessRunner } from './harnessRunner.js';
export type { HarnessConfig, HarnessIteration, HarnessResult, CapabilityProbe } from './harnessRunner.js';

// ── Scorecard-inspired evaluation features ─────────────────────────

export { MetricRegistry, getMetricRegistry, resetMetricRegistry } from './metricTemplates.js';
export type {
  MetricTemplate, MetricResult, MetricInput, MetricGroup, MetricGroupResult,
  MetricOutputType, MetricCategory,
} from './metricTemplates.js';

export { SimRunner } from './simAgent.js';
export type {
  SimPersona, SimMessage, SimConversation, SimResult, SimFinding,
  SimBatchResult, StopReason,
} from './simAgent.js';

export { RunHistoryStore } from './runHistory.js';
export type {
  RunRecord, ABComparison, RegressionAlert, TrendAnalysis, TrendPoint,
  Testcase, TestsetResult,
} from './runHistory.js';

export { ProductionMonitor } from './monitor.js';
export type {
  MonitorConfig, MonitorSample, MonitorAlert, MonitorStatus, MonitorDashboard,
} from './monitor.js';
