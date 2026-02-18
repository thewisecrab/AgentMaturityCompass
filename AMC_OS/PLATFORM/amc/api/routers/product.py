"""AMC API — Product Feature Router.

Routes for navigating AMC’s feature roadmap and readiness posture.
This keeps non-core productization work visible to operators and automations
without hardcoding roadmap context in clients.
"""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from amc.core.models import PolicyDecision
from amc.product import Relevance, get_features
from amc.product.improvement import (
    FeedbackInput as FeedbackStoreInput,
    FeedbackLoop,
    FeedbackSentiment,
    get_feedback_loop,
)
from amc.product.metering import BillingInvoice, UsageEventInput, get_metering_ledger
from amc.product.version_control import get_version_control_store
from amc.product.tool_contract import ToolContractRegistry, repair_tool_call, validate_tool_contract
from amc.product.failure_clustering import (
    FailureClusterRequest,
    FailureClusterResponse,
    summarize_failure_clusters,
)
from amc.product.persona import (
    PersonaInput,
    PersonaRecord,
    get_persona_manager,
    apply_persona,
)
from amc.product.glossary import (
    TermInput,
    TermRecord,
    get_glossary_manager,
)
from amc.product.extractor import (
    ExtractionInput,
    ExtractionResult,
    get_extractor,
)
from amc.product.context_pack import (
    ContextPackInput,
    ContextPackRecord,
    ContextSource,
    get_context_pack_generator,
)
# Alias so existing code referencing PackSource still works
PackSource = ContextSource
from amc.product.data_quality import (
    CheckInput,
    ThresholdInput,
    QualityReport,
    BatchQualitySummary,
    get_data_quality_monitor,
)
from amc.product.cost_latency_router import (
    TaskDescriptor,
    TaskType,
    ModelTier,
    RoutingProfile,
    get_cost_latency_router,
)
from amc.product.ab_testing import (
    ExperimentStatus,
    get_ab_platform,
)
from amc.product.rollout_manager import (
    RolloutStatus,
    get_rollout_manager,
)
from amc.product.replay_debugger import (
    EventType,
    TraceStatus,
    get_replay_debugger,
)
from amc.product.scaffolding import (
    AgentTemplate,
    get_scaffolder,
)
from amc.product.dev_sandbox import (
    MockMode,
    get_dev_sandbox,
)

from fastapi import FastAPI
from amc.core.config import get_settings

router = APIRouter(prefix="/api/v1/product", tags=["product"])
features_router = APIRouter(prefix="/api/v1/product", tags=["product", "product-features"])
metering_router = APIRouter(prefix="/api/v1/product", tags=["product", "product-metering"])
feedback_router = APIRouter(prefix="/api/v1/product", tags=["product", "product-feedback"])
analytics_router = APIRouter(prefix="/api/v1/product", tags=["product", "product-analytics"])
versions_router = APIRouter(prefix="/api/v1/product", tags=["product", "product-versions"])
tool_contract_router = APIRouter(prefix="/api/v1/product", tags=["product", "product-tool-contract"])
failure_router = APIRouter(prefix="/api/v1/product", tags=["product", "product-failures"])
persona_router = APIRouter(prefix="/api/v1/product", tags=["product", "product-personas"])
glossary_router = APIRouter(prefix="/api/v1/product", tags=["product", "product-glossary"])
extractor_router = APIRouter(prefix="/api/v1/product", tags=["product", "product-extract"])
context_pack_router = APIRouter(prefix="/api/v1/product", tags=["product", "product-context-pack"])
data_quality_router = APIRouter(prefix="/api/v1/product", tags=["product", "product-data-quality"])
routing_router = APIRouter(prefix="/api/v1/product", tags=["product", "product-routing"])
ab_router = APIRouter(prefix="/api/v1/product", tags=["product", "product-ab"])
rollout_router = APIRouter(prefix="/api/v1/product", tags=["product", "product-rollout"])
replay_router = APIRouter(prefix="/api/v1/product", tags=["product", "product-replay"])
scaffold_router = APIRouter(prefix="/api/v1/product", tags=["product", "product-scaffold"])
devsandbox_router = APIRouter(prefix="/api/v1/product", tags=["product", "product-devsandbox"])
orchestration_router = APIRouter(prefix="/api/v1/product", tags=["product", "product-orchestration"])


def register_product_routes(app: FastAPI) -> None:
    """Register product subrouters according to module flags."""
    settings = get_settings()
    if not getattr(settings, "module_product_enabled", True):
        return

    module_routes = [
        (features_router, getattr(settings, "module_product_features_enabled", True)),
        (metering_router, getattr(settings, "module_product_metering_enabled", True)),
        (feedback_router, getattr(settings, "module_product_feedback_enabled", True)),
        (analytics_router, getattr(settings, "module_product_analytics_enabled", True)),
        (versions_router, getattr(settings, "module_product_versions_enabled", True)),
        (tool_contract_router, getattr(settings, "module_product_tool_contract_enabled", True)),
        (failure_router, getattr(settings, "module_product_failures_enabled", True)),
        (persona_router, getattr(settings, "module_product_personas_enabled", True)),
        (glossary_router, getattr(settings, "module_product_glossary_enabled", True)),
        (extractor_router, getattr(settings, "module_product_extractor_enabled", True)),
        (context_pack_router, getattr(settings, "module_product_context_pack_enabled", True)),
        (data_quality_router, getattr(settings, "module_product_data_quality_enabled", True)),
        (routing_router, getattr(settings, "module_product_routing_enabled", True)),
        (ab_router, getattr(settings, "module_product_ab_enabled", True)),
        (rollout_router, getattr(settings, "module_product_rollout_enabled", True)),
        (replay_router, getattr(settings, "module_product_replay_enabled", True)),
        (scaffold_router, getattr(settings, "module_product_scaffold_enabled", True)),
        (devsandbox_router, getattr(settings, "module_product_devsandbox_enabled", True)),
        (orchestration_router, getattr(settings, "module_product_orchestration_enabled", True)),
    ]
    for route, enabled in module_routes:
        if enabled:
            app.include_router(route)


class ProductFeatureRow(BaseModel):
    feature_id: int
    title: str
    lane: str
    summary: str
    relevance: str
    amc_fit: bool
    rationale: str
    owner_hint: str
    effort: str
    blockers: list[str] = Field(default_factory=list)


class ProductFeaturesResponse(BaseModel):
    count: int
    relevance: str | None = None
    amc_fit_only: bool = True
    features: list[ProductFeatureRow] = Field(default_factory=list)


class ProductFeatureSummary(BaseModel):
    total: int
    by_lane: dict[str, int]
    by_relevance: dict[str, int]
    fit_count: int
    recommendation_count: int


class MeteringUsageInput(BaseModel):
    tenant_id: str
    workflow_id: str
    run_id: str
    actor_id: str
    session_id: str | None = None
    started_at: datetime | None = None
    duration_ms: int = 0
    tool_calls: int = 0
    model_calls: int = 0
    input_tokens: int = 0
    output_tokens: int = 0
    browser_minutes: float = 0.0
    metadata: dict[str, Any] = Field(default_factory=dict)
    idempotency_key: str | None = None


class MeteringUsageResponse(BaseModel):
    event: dict[str, Any]


class MeteringQueryResponse(BaseModel):
    count: int
    events: list[dict[str, Any]] = Field(default_factory=list)


class MeteringBillingLineItem(BaseModel):
    workflow_id: str
    total_events: int
    total_cost_usd: float
    total_billing_units: float
    total_duration_ms: int
    total_tool_calls: int
    total_model_calls: int


class MeteringBillingResponse(BaseModel):
    tenant_id: str
    since: str | None = None
    until: str | None = None
    total_events: int
    total_cost_usd: float
    total_billing_units: float
    lines: list[MeteringBillingLineItem] = Field(default_factory=list)


class FeedbackInput(BaseModel):
    tenant_id: str
    workflow_id: str
    run_id: str | None = None
    session_id: str | None = None
    sentiment: FeedbackSentiment = FeedbackSentiment.POSITIVE
    rating: int = 5
    correction_note: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class FeedbackResponse(BaseModel):
    feedback: dict[str, Any]


class FeedbackListResponse(BaseModel):
    count: int
    feedback: list[dict[str, Any]] = Field(default_factory=list)


class FeedbackBucketResponse(BaseModel):
    bucket_start: str
    bucket_end: str
    total_feedback: int
    positive: int
    corrected: int
    negative: int
    score: float


class FeedbackScoreResponse(BaseModel):
    tenant_id: str
    workflow_id: str
    window_days: int
    total_feedback: int
    mean_rating: float
    current_score: float
    trend_vs_previous: float
    buckets: list[FeedbackBucketResponse] = Field(default_factory=list)


class ProductAnalyticsResponse(BaseModel):
    period_since: str | None = None
    period_until: str | None = None
    total_receipts: int = 0
    allowed_receipts: int = 0
    denied_receipts: int = 0
    other_receipts: int = 0
    success_rate: float = 0.0
    by_tool: dict[str, int] = Field(default_factory=dict)
    total_metering_events: int = 0
    total_metering_cost_usd: float = 0.0
    avg_run_duration_ms: float = 0.0
    unique_tenants: int = 0
    unique_workflows: int = 0
    top_workflows_by_cost: list[str] = Field(default_factory=list)
    improvement_score: float | None = None


@features_router.get("/features", response_model=ProductFeaturesResponse)
def list_product_features(
    relevance: str | None = None,
    amc_fit: bool = True,
    limit: int = 0,
) -> ProductFeaturesResponse:
    """Return the 50-feature extension catalog with optional filters."""
    rel = None
    if relevance is not None:
        try:
            rel = Relevance(relevance.lower())
        except ValueError as exc:
            raise HTTPException(
                status_code=400,
                detail=(
                    "invalid relevance value. Use one of: "
                    + ", ".join(r.value for r in Relevance)
                ),
            ) from exc

    feats = get_features(relevance=rel, amc_fit_only=amc_fit)
    if limit > 0:
        feats = feats[:limit]

    out = [
        ProductFeatureRow(
            feature_id=f.feature_id,
            title=f.title,
            lane=f.lane.value,
            summary=f.summary,
            relevance=f.relevance.value,
            amc_fit=f.amc_fit,
            rationale=f.rationale,
            owner_hint=f.owner_hint,
            effort=f.effort,
            blockers=list(f.blockers),
        )
        for f in feats
    ]

    return ProductFeaturesResponse(
        count=len(out),
        relevance=relevance.lower() if relevance else None,
        amc_fit_only=amc_fit,
        features=out,
    )


@features_router.get("/features/summary", response_model=ProductFeatureSummary)
def product_features_summary() -> ProductFeatureSummary:
    """Summary counts for quick planning automation and dashboards."""
    feats = get_features(amc_fit_only=True)

    by_lane: dict[str, int] = {}
    by_relevance: dict[str, int] = {}

    for feat in feats:
        by_lane[feat.lane.value] = by_lane.get(feat.lane.value, 0) + 1
        by_relevance[feat.relevance.value] = by_relevance.get(feat.relevance.value, 0) + 1

    recommendations = get_features(relevance=Relevance.HIGH, amc_fit_only=True)

    return ProductFeatureSummary(
        total=50,
        by_lane=by_lane,
        by_relevance=by_relevance,
        fit_count=len(feats),
        recommendation_count=len(recommendations),
    )


@metering_router.post("/metering", response_model=MeteringUsageResponse)
def add_usage_event(payload: MeteringUsageInput) -> MeteringUsageResponse:
    """Record a billable usage event for a tenant/run/workflow."""
    ledger = get_metering_ledger()
    usage = ledger.record_event(
        UsageEventInput(
            tenant_id=payload.tenant_id,
            workflow_id=payload.workflow_id,
            run_id=payload.run_id,
            actor_id=payload.actor_id,
            session_id=payload.session_id,
            started_at=payload.started_at,
            duration_ms=payload.duration_ms,
            tool_calls=payload.tool_calls,
            model_calls=payload.model_calls,
            input_tokens=payload.input_tokens,
            output_tokens=payload.output_tokens,
            browser_minutes=payload.browser_minutes,
            metadata=payload.metadata,
            idempotency_key=payload.idempotency_key,
        )
    )
    return MeteringUsageResponse(event=usage.dict)


@metering_router.get("/metering", response_model=MeteringQueryResponse)
def list_metering_events(
    tenant_id: str | None = None,
    workflow_id: str | None = None,
    run_id: str | None = None,
    session_id: str | None = None,
    since: str | None = None,
    until: str | None = None,
    limit: int = 100,
) -> MeteringQueryResponse:
    """Query usage events."""
    ledger = get_metering_ledger()
    since_dt = datetime.fromisoformat(since) if since else None
    until_dt = datetime.fromisoformat(until) if until else None

    events = ledger.query_events(
        tenant_id=tenant_id,
        workflow_id=workflow_id,
        run_id=run_id,
        session_id=session_id,
        since=since_dt,
        until=until_dt,
        limit=limit,
    )
    return MeteringQueryResponse(
        count=len(events),
        events=[e.dict for e in events],
    )


@metering_router.get("/metering/billing", response_model=MeteringBillingResponse)
def meter_billing(
    tenant_id: str,
    since: str | None = None,
    until: str | None = None,
) -> MeteringBillingResponse:
    """Return billing totals for a tenant across a date window."""
    ledger = get_metering_ledger()
    since_dt = datetime.fromisoformat(since) if since else None
    until_dt = datetime.fromisoformat(until) if until else None

    invoice: BillingInvoice = ledger.generate_invoice(
        tenant_id=tenant_id,
        since=since_dt,
        until=until_dt,
    )

    return MeteringBillingResponse(
        tenant_id=tenant_id,
        since=invoice.since_iso,
        until=invoice.until_iso,
        total_events=invoice.total_events,
        total_cost_usd=invoice.total_cost_usd,
        total_billing_units=invoice.total_billing_units,
        lines=[
            MeteringBillingLineItem(
                workflow_id=line.workflow_id,
                total_events=line.total_events,
                total_cost_usd=line.total_cost_usd,
                total_billing_units=line.total_billing_units,
                total_duration_ms=line.total_duration_ms,
                total_tool_calls=line.total_tool_calls,
                total_model_calls=line.total_model_calls,
            )
            for line in invoice.lines
        ],
    )


@feedback_router.post("/feedback", response_model=FeedbackResponse)
def capture_feedback(payload: FeedbackInput) -> FeedbackResponse:
    """Store user feedback/corrections used by the improvement loop."""
    ledger: FeedbackLoop = get_feedback_loop()
    item = ledger.record(
        FeedbackStoreInput(
            tenant_id=payload.tenant_id,
            workflow_id=payload.workflow_id,
            run_id=payload.run_id,
            session_id=payload.session_id,
            sentiment=payload.sentiment,
            rating=payload.rating,
            correction_note=payload.correction_note,
            metadata=payload.metadata,
        )
    )
    return FeedbackResponse(feedback=item.dict)


@feedback_router.get("/feedback", response_model=FeedbackListResponse)
def list_feedback(
    tenant_id: str | None = None,
    workflow_id: str | None = None,
    limit: int = 100,
) -> FeedbackListResponse:
    """List captured feedback events."""
    ledger = get_feedback_loop()
    items = ledger.query(tenant_id=tenant_id, workflow_id=workflow_id, limit=limit)
    return FeedbackListResponse(count=len(items), feedback=[item.dict for item in items])


@feedback_router.get("/feedback/score", response_model=FeedbackScoreResponse)
def feedback_score(
    tenant_id: str,
    workflow_id: str,
    window_days: int = Query(7, ge=1, le=60),
) -> FeedbackScoreResponse:
    """Compute a simple rolling improvement score over time for feedback data."""
    series = get_feedback_loop().compute_improvement(
        tenant_id=tenant_id,
        workflow_id=workflow_id,
        window_days=window_days,
    )

    return FeedbackScoreResponse(
        tenant_id=series.tenant_id,
        workflow_id=series.workflow_id,
        window_days=series.window_days,
        total_feedback=series.total_feedback,
        mean_rating=series.mean_rating,
        current_score=series.current_score,
        trend_vs_previous=series.trend_vs_previous,
        buckets=[
            FeedbackBucketResponse(
                bucket_start=b.bucket_start.isoformat(),
                bucket_end=b.bucket_end.isoformat(),
                total_feedback=b.total_feedback,
                positive=b.positive,
                corrected=b.corrected,
                negative=b.negative,
                score=b.score,
            )
            for b in series.buckets
        ],
    )


@analytics_router.get("/analytics", response_model=ProductAnalyticsResponse)
async def product_analytics(
    since: str | None = None,
    until: str | None = None,
    feedback_tenant_id: str | None = None,
    feedback_workflow_id: str | None = None,
    usage_tenant_id: str | None = None,
    usage_workflow_id: str | None = None,
    limit: int = Query(5000, ge=1, le=20000),
) -> ProductAnalyticsResponse:
    """Aggregate metering + watch-receipt signals into a lightweight dashboard."""
    from amc.watch.w1_receipts import get_ledger

    since_dt = datetime.fromisoformat(since) if since else None
    until_dt = datetime.fromisoformat(until) if until else None

    ledger = await get_ledger()
    receipts = await ledger.query(
        since=since_dt,
        limit=limit,
    )
    if until_dt is not None:
        receipts = [r for r in receipts if r.timestamp <= until_dt]

    total_receipts = len(receipts)
    by_tool: dict[str, int] = {}
    allowed = 0
    denied = 0
    others = 0

    for r in receipts:
        by_tool[r.tool_name] = by_tool.get(r.tool_name, 0) + 1
        if r.policy_decision == PolicyDecision.ALLOW:
            allowed += 1
        elif r.policy_decision == PolicyDecision.DENY:
            denied += 1
        else:
            others += 1

    success_rate = round((allowed / total_receipts) * 100.0, 4) if total_receipts else 0.0

    ledger = get_metering_ledger()
    events = ledger.query_events(
        tenant_id=usage_tenant_id,
        workflow_id=usage_workflow_id,
        since=since_dt,
        until=until_dt,
        limit=limit,
    )

    meter_cost = round(sum(e.cost_usd for e in events), 6)
    avg_duration = (
        round(sum(e.duration_ms for e in events) / len(events), 3)
        if events else 0.0
    )
    tenants = {e.tenant_id for e in events}
    workflows = {e.workflow_id for e in events}

    workflow_costs = {
        e.workflow_id: round(
            sum(x.cost_usd for x in events if x.workflow_id == e.workflow_id), 6
        )
        for e in events
    }
    top_workflows = [
        wf
        for wf, _ in sorted(
            workflow_costs.items(),
            key=lambda item: item[1],
            reverse=True,
        )
    ]

    improvement_score = None
    if feedback_tenant_id and feedback_workflow_id:
        improvement_score = get_feedback_loop().compute_improvement(
            tenant_id=feedback_tenant_id,
            workflow_id=feedback_workflow_id,
        ).current_score

    return ProductAnalyticsResponse(
        period_since=since,
        period_until=until,
        total_receipts=total_receipts,
        allowed_receipts=allowed,
        denied_receipts=denied,
        other_receipts=others,
        success_rate=success_rate,
        by_tool=by_tool,
        total_metering_events=len(events),
        total_metering_cost_usd=meter_cost,
        avg_run_duration_ms=avg_duration,
        unique_tenants=len(tenants),
        unique_workflows=len(workflows),
        top_workflows_by_cost=top_workflows[:5],
        improvement_score=improvement_score,
    )


def product_feature_matrix() -> dict[str, Any]:
    """Internal helper for matrix export from roadmap tools."""
    feats = get_features(amc_fit_only=True)
    out: dict[str, Any] = {"high": 0, "medium": 0, "low": 0}
    for feat in feats:
        out[feat.relevance.value] = out.get(feat.relevance.value, 0) + 1
    return out


# ---------------------------------------------------------------------------
# Prompt & workflow version control API
# ---------------------------------------------------------------------------


class ArtifactType(str, Enum):
    PROMPT = "prompt"
    WORKFLOW = "workflow"


class VersionSnapshotRequest(BaseModel):
    artifact_type: ArtifactType
    artifact_id: str
    content: dict[str, Any]
    note: str = ""


class VersionSnapshotResponse(BaseModel):
    artifact_type: str
    artifact_id: str
    version: int
    parent_version: int | None = None
    created_at: str
    note: str


class VersionDiffRequest(BaseModel):
    artifact_type: ArtifactType
    artifact_id: str
    from_version: int | None = None
    to_version: int | None = None


class VersionDiffResponse(BaseModel):
    artifact_type: str
    artifact_id: str
    from_version: int | None = None
    to_version: int | None = None
    added: list[str] = Field(default_factory=list)
    removed: list[str] = Field(default_factory=list)
    changed: list[str] = Field(default_factory=list)
    from_content: dict[str, Any] = Field(default_factory=dict)
    to_content: dict[str, Any] = Field(default_factory=dict)


class VersionRollbackRequest(BaseModel):
    artifact_type: ArtifactType
    artifact_id: str
    target_version: int


class VersionRollbackResponse(BaseModel):
    artifact_type: str
    artifact_id: str
    version: int
    note: str
    created_at: str
    parent_version: int | None = None


@versions_router.post("/versions/snapshot", response_model=VersionSnapshotResponse)
def version_snapshot(payload: VersionSnapshotRequest) -> VersionSnapshotResponse:
    """Create a prompt/workflow snapshot and return its metadata."""
    store = get_version_control_store()
    record = store.snapshot(
        artifact_type=payload.artifact_type.value,
        artifact_id=payload.artifact_id,
        content=payload.content,
        note=payload.note,
    )
    return VersionSnapshotResponse(
        artifact_type=record.artifact_type,
        artifact_id=record.artifact_id,
        version=record.version,
        parent_version=record.parent_version,
        created_at=record.created_at,
        note=record.note,
    )


@versions_router.post("/versions/diff", response_model=VersionDiffResponse)
def version_diff(payload: VersionDiffRequest) -> VersionDiffResponse:
    """Compute a key-aware diff between two snapshots of the same artifact."""
    store = get_version_control_store()
    diff = store.diff(
        artifact_type=payload.artifact_type.value,
        artifact_id=payload.artifact_id,
        from_version=payload.from_version,
        to_version=payload.to_version,
    )
    return VersionDiffResponse(**diff.model_dump())


@versions_router.post("/versions/rollback", response_model=VersionRollbackResponse)
def version_rollback(payload: VersionRollbackRequest) -> VersionRollbackResponse:
    """Rollback an artifact by creating a new snapshot at target content."""
    store = get_version_control_store()
    record = store.rollback(
        artifact_type=payload.artifact_type.value,
        artifact_id=payload.artifact_id,
        target_version=payload.target_version,
        create_new_snapshot=True,
    )
    return VersionRollbackResponse(
        artifact_type=record.artifact_type,
        artifact_id=record.artifact_id,
        version=record.version,
        note=record.note,
        created_at=record.created_at,
        parent_version=record.parent_version,
    )


# ---------------------------------------------------------------------------
# Tool contract validator APIs
# ---------------------------------------------------------------------------


_contract_registry = ToolContractRegistry()


class ToolContractCheckRequest(BaseModel):
    tool_name: str
    contract: dict[str, Any]
    invocation: dict[str, Any]


class ToolContractCheckResponse(BaseModel):
    tool_name: str
    valid: bool
    missing: list[str] = Field(default_factory=list)
    unexpected: list[str] = Field(default_factory=list)
    type_issues: list[str] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)
    repaired_payload: dict[str, Any] = Field(default_factory=dict)


class ToolContractRepairRequest(BaseModel):
    tool_name: str
    contract: dict[str, Any]
    invocation: dict[str, Any]


class ToolContractRepairResponse(BaseModel):
    tool_name: str
    repaired_payload: dict[str, Any]
    notes: list[str]


@tool_contract_router.post("/tool-contract/check", response_model=ToolContractCheckResponse)
def tool_contract_check(payload: ToolContractCheckRequest) -> ToolContractCheckResponse:
    """Validate invocation parameters against a contract and return schema checks."""
    _contract_registry.register(payload.contract)
    result = validate_tool_contract(_contract_registry, payload.tool_name, payload.invocation)
    return ToolContractCheckResponse(**result.model_dump())


@tool_contract_router.post("/tool-contract/repair", response_model=ToolContractRepairResponse)
def tool_contract_repair(payload: ToolContractRepairRequest) -> ToolContractRepairResponse:
    """Return a repaired copy of invocation for this contract."""
    contract = _contract_registry.register(payload.contract)
    repaired, notes = repair_tool_call(payload.invocation, contract)
    return ToolContractRepairResponse(
        tool_name=payload.tool_name,
        repaired_payload=repaired,
        notes=notes,
    )


# ---------------------------------------------------------------------------
# Failure clustering API
# ---------------------------------------------------------------------------


@failure_router.post("/failures/cluster", response_model=FailureClusterResponse)
def cluster_failures_route(payload: FailureClusterRequest) -> FailureClusterResponse:
    """Group watch findings/failures by pattern and return root-cause summaries."""
    summary = summarize_failure_clusters(payload.findings)
    return summary


# ===========================================================================
# Persona & preference manager API  (Feature #27)
# ===========================================================================


class PersonaCreateRequest(BaseModel):
    tenant_id: str
    name: str
    tone: str = "professional"
    style: str = "concise"
    brand_voice: str = ""
    forbidden_words: list[str] = Field(default_factory=list)
    preferred_words: dict[str, str] = Field(default_factory=dict)
    signature: str = ""
    metadata: dict[str, Any] = Field(default_factory=dict)


class PersonaUpdateRequest(BaseModel):
    tone: str | None = None
    style: str | None = None
    brand_voice: str | None = None
    forbidden_words: list[str] | None = None
    preferred_words: dict[str, str] | None = None
    signature: str | None = None
    active: bool | None = None
    metadata: dict[str, Any] | None = None


class PersonaApplyRequest(BaseModel):
    text: str
    persona_id: str


class PersonaApplyResponse(BaseModel):
    original: str
    transformed: str
    persona_id: str
    replacements_made: list[str] = Field(default_factory=list)
    forbidden_hits: list[str] = Field(default_factory=list)
    signature_appended: bool = False


@persona_router.post("/personas", response_model=dict)
def create_persona(payload: PersonaCreateRequest) -> dict:
    """Create a new tenant persona."""
    mgr = get_persona_manager()
    try:
        inp = PersonaInput(
            tenant_id=payload.tenant_id,
            name=payload.name,
            tone=payload.tone,
            style=payload.style,
            brand_voice=payload.brand_voice,
            forbidden_words=payload.forbidden_words,
            preferred_words=payload.preferred_words,
            signature=payload.signature,
            metadata=payload.metadata,
        )
        record = mgr.create(inp)
        return record.dict
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@persona_router.get("/personas/{persona_id}", response_model=dict)
def get_persona(persona_id: str) -> dict:
    """Fetch a persona by ID."""
    mgr = get_persona_manager()
    record = mgr.get(persona_id)
    if not record:
        raise HTTPException(status_code=404, detail="Persona not found")
    return record.dict


@persona_router.get("/personas", response_model=list)
def list_personas(
    tenant_id: str = Query(...),
    active_only: bool = True,
) -> list:
    """List all personas for a tenant."""
    mgr = get_persona_manager()
    return [r.dict for r in mgr.list_for_tenant(tenant_id, active_only=active_only)]


@persona_router.patch("/personas/{persona_id}", response_model=dict)
def update_persona(persona_id: str, payload: PersonaUpdateRequest) -> dict:
    """Partially update a persona."""
    mgr = get_persona_manager()
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    try:
        record = mgr.update(persona_id, updates)
        return record.dict
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@persona_router.delete("/personas/{persona_id}", response_model=dict)
def delete_persona(persona_id: str) -> dict:
    """Soft-delete (deactivate) a persona."""
    mgr = get_persona_manager()
    deleted = mgr.delete(persona_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Persona not found")
    return {"persona_id": persona_id, "deleted": True}


@persona_router.post("/personas/apply", response_model=PersonaApplyResponse)
def apply_persona_route(payload: PersonaApplyRequest) -> PersonaApplyResponse:
    """Apply a persona's preferences to text."""
    mgr = get_persona_manager()
    try:
        result = mgr.apply(payload.text, payload.persona_id)
        return PersonaApplyResponse(
            original=result.original,
            transformed=result.transformed,
            persona_id=result.persona_id,
            replacements_made=result.replacements_made,
            forbidden_hits=result.forbidden_hits,
            signature_appended=result.signature_appended,
        )
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


# ===========================================================================
# Domain glossary + terminology enforcer API  (Feature #29)
# ===========================================================================


class TermRegisterRequest(BaseModel):
    tenant_id: str
    canonical: str
    variants: list[str] = Field(default_factory=list)
    definition: str = ""
    domain: str = "general"
    severity: str = "warning"
    metadata: dict[str, Any] = Field(default_factory=dict)


class EnforceRequest(BaseModel):
    tenant_id: str
    text: str
    auto_correct: bool = True


@glossary_router.post("/glossary/terms", response_model=dict)
def register_term(payload: TermRegisterRequest) -> dict:
    """Register or update a glossary term."""
    mgr = get_glossary_manager()
    try:
        inp = TermInput(
            tenant_id=payload.tenant_id,
            canonical=payload.canonical,
            variants=payload.variants,
            definition=payload.definition,
            domain=payload.domain,
            severity=payload.severity,
            metadata=payload.metadata,
        )
        record = mgr.register(inp)
        return record.dict
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@glossary_router.get("/glossary/terms", response_model=list)
def list_glossary_terms(
    tenant_id: str = Query(...),
    domain: str | None = None,
    active_only: bool = True,
) -> list:
    """List glossary terms for a tenant."""
    mgr = get_glossary_manager()
    return [t.dict for t in mgr.list_terms(tenant_id, domain=domain, active_only=active_only)]


@glossary_router.get("/glossary/terms/{term_id}", response_model=dict)
def get_glossary_term(term_id: str) -> dict:
    mgr = get_glossary_manager()
    term = mgr.get(term_id)
    if not term:
        raise HTTPException(status_code=404, detail="Term not found")
    return term.dict


@glossary_router.delete("/glossary/terms/{term_id}", response_model=dict)
def delete_glossary_term(term_id: str) -> dict:
    mgr = get_glossary_manager()
    ok = mgr.delete(term_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Term not found")
    return {"term_id": term_id, "deleted": True}


@glossary_router.post("/glossary/enforce", response_model=dict)
def enforce_terminology(payload: EnforceRequest) -> dict:
    """Check text for terminology violations and return corrections."""
    mgr = get_glossary_manager()
    result = mgr.enforce(payload.text, payload.tenant_id, auto_correct=payload.auto_correct)
    return result.dict


# ===========================================================================
# Unstructured-to-structured extractor API  (Feature #30)
# ===========================================================================


class ExtractRequest(BaseModel):
    text: str
    entity_types: list[str] = Field(default_factory=list)
    context_window: int = 40
    metadata: dict[str, Any] = Field(default_factory=dict)


@extractor_router.post("/extract", response_model=dict)
def extract_entities(payload: ExtractRequest) -> dict:
    """Extract entities (vendors, amounts, dates, SKUs, etc.) from text."""
    extractor = get_extractor()
    result = extractor.extract(
        ExtractionInput(
            text=payload.text,
            entity_types=payload.entity_types,
            context_window=payload.context_window,
            metadata=payload.metadata,
        )
    )
    return result.dict


# ===========================================================================
# Context pack generator API  (Feature #31)
# ===========================================================================


class ContextSourceRequest(BaseModel):
    source_type: str
    source_id: str
    title: str
    content: str
    relevance_score: float = 1.0
    metadata: dict[str, Any] = Field(default_factory=dict)


class ContextPackBuildRequest(BaseModel):
    tenant_id: str
    task_type: str
    task_ref: str = ""
    sources: list[ContextSourceRequest] = Field(default_factory=list)
    token_budget: int = 2000
    priority_fields: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


@context_pack_router.post("/context-pack", response_model=dict)
def build_context_pack(payload: ContextPackBuildRequest) -> dict:
    """Build a minimal task-specific context pack from provided sources."""
    gen = get_context_pack_generator()
    sources = [
        PackSource(
            source_type=s.source_type,
            source_id=s.source_id,
            title=s.title,
            content=s.content,
            relevance_score=s.relevance_score,
            metadata=s.metadata,
        )
        for s in payload.sources
    ]
    inp = ContextPackInput(
        tenant_id=payload.tenant_id,
        task_type=payload.task_type,
        task_ref=payload.task_ref,
        sources=sources,
        token_budget=payload.token_budget,
        priority_fields=payload.priority_fields,
        keywords=payload.keywords,
        metadata=payload.metadata,
    )
    record = gen.build(inp)
    return record.dict


@context_pack_router.get("/context-pack/{pack_id}", response_model=dict)
def get_context_pack(pack_id: str) -> dict:
    """Retrieve a stored context pack by ID."""
    gen = get_context_pack_generator()
    record = gen.get(pack_id)
    if not record:
        raise HTTPException(status_code=404, detail="Context pack not found")
    return record.dict


@context_pack_router.get("/context-pack", response_model=list)
def list_context_packs(
    tenant_id: str = Query(...),
    task_type: str | None = None,
    task_ref: str | None = None,
    limit: int = 50,
) -> list:
    """List context packs for a tenant."""
    gen = get_context_pack_generator()
    return [
        r.dict
        for r in gen.list_packs(tenant_id, task_type=task_type, task_ref=task_ref, limit=limit)
    ]


@context_pack_router.delete("/context-pack/{pack_id}", response_model=dict)
def delete_context_pack(pack_id: str) -> dict:
    gen = get_context_pack_generator()
    ok = gen.delete(pack_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Context pack not found")
    return {"pack_id": pack_id, "deleted": True}


# ===========================================================================
# Data quality monitor API  (Feature #35)
# ===========================================================================


class DQCheckRequest(BaseModel):
    tenant_id: str
    record_type: str
    record_id: str
    record: dict[str, Any]
    required_fields: list[str] = Field(default_factory=list)
    stale_fields: dict[str, int] = Field(default_factory=dict)
    unique_fields: list[str] = Field(default_factory=list)
    corpus: list[dict[str, Any]] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


class DQThresholdRequest(BaseModel):
    tenant_id: str
    record_type: str
    check_type: str
    threshold_value: float
    field_name: str = "*"
    severity: str = "warning"
    metadata: dict[str, Any] = Field(default_factory=dict)


@data_quality_router.post("/data-quality/check", response_model=dict)
def dq_check(payload: DQCheckRequest) -> dict:
    """Run data quality checks on a record."""
    monitor = get_data_quality_monitor()
    inp = CheckInput(
        tenant_id=payload.tenant_id,
        record_type=payload.record_type,
        record_id=payload.record_id,
        record=payload.record,
        required_fields=payload.required_fields,
        stale_fields=payload.stale_fields,
        unique_fields=payload.unique_fields,
        corpus=payload.corpus,
        metadata=payload.metadata,
    )
    report = monitor.check(inp)
    return report.dict


@data_quality_router.get("/data-quality/reports", response_model=list)
def list_dq_reports(
    tenant_id: str = Query(...),
    record_type: str | None = None,
    record_id: str | None = None,
    min_score: float | None = None,
    max_score: float | None = None,
    limit: int = 100,
) -> list:
    """List data quality reports for a tenant."""
    monitor = get_data_quality_monitor()
    reports = monitor.list_reports(
        tenant_id=tenant_id,
        record_type=record_type,
        record_id=record_id,
        min_score=min_score,
        max_score=max_score,
        limit=limit,
    )
    return [r.dict for r in reports]


@data_quality_router.get("/data-quality/reports/{report_id}", response_model=dict)
def get_dq_report(report_id: str) -> dict:
    monitor = get_data_quality_monitor()
    report = monitor.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report.dict


@data_quality_router.get("/data-quality/summary", response_model=dict)
def dq_batch_summary(
    tenant_id: str = Query(...),
    record_type: str = Query(...),
    limit: int = 500,
) -> dict:
    """Aggregate quality summary for a record type."""
    monitor = get_data_quality_monitor()
    return monitor.batch_summary(tenant_id, record_type, limit=limit).dict


@data_quality_router.post("/data-quality/thresholds", response_model=dict)
def set_dq_threshold(payload: DQThresholdRequest) -> dict:
    """Create or update an alert threshold."""
    monitor = get_data_quality_monitor()
    try:
        inp = ThresholdInput(
            tenant_id=payload.tenant_id,
            record_type=payload.record_type,
            check_type=payload.check_type,
            threshold_value=payload.threshold_value,
            field_name=payload.field_name,
            severity=payload.severity,
            metadata=payload.metadata,
        )
        record = monitor.set_threshold(inp)
        return record.dict
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@data_quality_router.get("/data-quality/thresholds", response_model=list)
def list_dq_thresholds(
    tenant_id: str = Query(...),
    record_type: str | None = None,
    active_only: bool = True,
) -> list:
    """List alert thresholds for a tenant."""
    monitor = get_data_quality_monitor()
    return [
        t.dict
        for t in monitor.list_thresholds(tenant_id, record_type=record_type, active_only=active_only)
    ]


@data_quality_router.delete("/data-quality/thresholds/{threshold_id}", response_model=dict)
def delete_dq_threshold(threshold_id: str) -> dict:
    monitor = get_data_quality_monitor()
    ok = monitor.delete_threshold(threshold_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Threshold not found")
    return {"threshold_id": threshold_id, "deleted": True}


# ==========================================================================
# F47 — Cost + Latency Optimization Router
# ==========================================================================


class RoutingRequest(BaseModel):
    task_id: str = Field(default_factory=lambda: str(__import__("uuid").uuid4()))
    task_type: str = TaskType.GENERIC.value
    quality_floor: float = Field(0.7, ge=0.0, le=1.0)
    latency_sla_ms: int = Field(10000, ge=100)
    cost_cap_usd: float = Field(0.10, ge=0.0)
    estimated_tokens: int = Field(1000, ge=1)
    tenant_id: str = ""
    workflow_id: str = ""
    metadata: dict[str, Any] = Field(default_factory=dict)


class RoutingOutcomeRequest(BaseModel):
    observed_cost_usd: float = Field(..., ge=0.0)
    observed_latency_ms: int = Field(..., ge=0)
    outcome_quality: float | None = Field(None, ge=0.0, le=1.0)


class RegisterProfileRequest(BaseModel):
    profile_name: str
    model_tier: str = ModelTier.STANDARD.value
    max_tokens: int = 2048
    tool_timeout_ms: int = 5000
    cost_per_1k_tokens_usd: float = 0.002
    avg_latency_ms: int = 1500
    quality_score: float = Field(0.85, ge=0.0, le=1.0)
    task_types: list[str] = Field(default_factory=lambda: ["generic"])


@routing_router.post("/routing/route", response_model=dict)
def route_task(payload: RoutingRequest) -> dict:
    """Select the optimal model/tool profile for a task."""
    router_svc = get_cost_latency_router()
    task = TaskDescriptor(
        task_id=payload.task_id,
        task_type=TaskType(payload.task_type) if payload.task_type in TaskType.__members__.values() else TaskType.GENERIC,
        quality_floor=payload.quality_floor,
        latency_sla_ms=payload.latency_sla_ms,
        cost_cap_usd=payload.cost_cap_usd,
        estimated_tokens=payload.estimated_tokens,
        tenant_id=payload.tenant_id,
        workflow_id=payload.workflow_id,
        metadata=payload.metadata,
    )
    decision = router_svc.route(task)
    return decision.as_dict


@routing_router.post("/routing/{decision_id}/outcome", response_model=dict)
def record_routing_outcome(decision_id: str, payload: RoutingOutcomeRequest) -> dict:
    """Feed observed performance back to update the routing record."""
    router_svc = get_cost_latency_router()
    router_svc.record_outcome(
        decision_id=decision_id,
        observed_cost_usd=payload.observed_cost_usd,
        observed_latency_ms=payload.observed_latency_ms,
        outcome_quality=payload.outcome_quality,
    )
    return {"decision_id": decision_id, "updated": True}


@routing_router.get("/routing/decisions", response_model=list)
def list_routing_decisions(
    tenant_id: str | None = None,
    workflow_id: str | None = None,
    profile: str | None = None,
    limit: int = Query(100, ge=1, le=1000),
) -> list:
    """Query routing decisions."""
    router_svc = get_cost_latency_router()
    decisions = router_svc.query_decisions(
        tenant_id=tenant_id,
        workflow_id=workflow_id,
        profile=profile,
        limit=limit,
    )
    return [d.as_dict for d in decisions]


@routing_router.get("/routing/summary", response_model=dict)
def routing_cost_summary(tenant_id: str | None = None) -> dict:
    """Aggregate cost/latency statistics by profile."""
    router_svc = get_cost_latency_router()
    return router_svc.cost_summary(tenant_id=tenant_id)


@routing_router.post("/routing/profiles", response_model=dict)
def register_routing_profile(payload: RegisterProfileRequest) -> dict:
    """Register or update a routing profile."""
    from amc.product.cost_latency_router import RoutingProfile as _RoutingProfile
    router_svc = get_cost_latency_router()
    profile = _RoutingProfile(
        profile_name=payload.profile_name,
        model_tier=ModelTier(payload.model_tier),
        max_tokens=payload.max_tokens,
        tool_timeout_ms=payload.tool_timeout_ms,
        cost_per_1k_tokens_usd=payload.cost_per_1k_tokens_usd,
        avg_latency_ms=payload.avg_latency_ms,
        quality_score=payload.quality_score,
        task_types=payload.task_types,
    )
    router_svc.register_profile(profile)
    return {"profile_name": payload.profile_name, "registered": True}


# ==========================================================================
# F48 — A/B Testing Platform
# ==========================================================================


class ExperimentCreateRequest(BaseModel):
    name: str
    description: str = ""
    primary_metric: str = "success_rate"
    traffic_percent: float = Field(100.0, ge=0.0, le=100.0)
    min_sample_size: int = Field(100, ge=1)
    variants: list[dict[str, Any]] | None = None


class ObservationRequest(BaseModel):
    variant_id: str
    subject_id: str
    primary_metric_value: float
    run_id: str = ""
    secondary_metrics: dict[str, float] | None = None


@ab_router.post("/ab/experiments", response_model=dict)
def create_ab_experiment(payload: ExperimentCreateRequest) -> dict:
    """Create a new A/B experiment."""
    platform = get_ab_platform()
    exp = platform.create_experiment(
        name=payload.name,
        description=payload.description,
        primary_metric=payload.primary_metric,
        traffic_percent=payload.traffic_percent,
        min_sample_size=payload.min_sample_size,
        variants=payload.variants,
    )
    return exp.as_dict


@ab_router.post("/ab/experiments/{experiment_id}/start", response_model=dict)
def start_ab_experiment(experiment_id: str) -> dict:
    """Start an experiment."""
    platform = get_ab_platform()
    try:
        exp = platform.start_experiment(experiment_id)
        return exp.as_dict
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@ab_router.post("/ab/experiments/{experiment_id}/stop", response_model=dict)
def stop_ab_experiment(experiment_id: str, conclude: bool = False) -> dict:
    """Stop an experiment (optionally mark as concluded)."""
    platform = get_ab_platform()
    try:
        exp = platform.stop_experiment(experiment_id, conclude=conclude)
        return exp.as_dict
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@ab_router.get("/ab/experiments/{experiment_id}/assign", response_model=dict)
def assign_ab_variant(experiment_id: str, subject_id: str) -> dict:
    """Get (or create) a deterministic variant assignment for a subject."""
    platform = get_ab_platform()
    assignment = platform.assign_variant(experiment_id, subject_id)
    if assignment is None:
        raise HTTPException(status_code=409, detail="Experiment not running or not found")
    return {
        "experiment_id": assignment.experiment_id,
        "subject_id": assignment.subject_id,
        "variant_id": assignment.variant_id,
        "assigned_at": assignment.assigned_at,
        "variant_config": assignment.variant_config,
    }


@ab_router.post("/ab/experiments/{experiment_id}/observe", response_model=dict)
def record_ab_observation(experiment_id: str, payload: ObservationRequest) -> dict:
    """Record a metric observation for an experiment variant."""
    platform = get_ab_platform()
    obs_id = platform.record_observation(
        experiment_id=experiment_id,
        variant_id=payload.variant_id,
        subject_id=payload.subject_id,
        primary_metric_value=payload.primary_metric_value,
        run_id=payload.run_id,
        secondary_metrics=payload.secondary_metrics,
    )
    return {"obs_id": obs_id, "experiment_id": experiment_id}


@ab_router.get("/ab/experiments/{experiment_id}/analyze", response_model=dict)
def analyze_ab_experiment(experiment_id: str) -> dict:
    """Run statistical analysis and return winner/stats."""
    platform = get_ab_platform()
    try:
        analysis = platform.analyze(experiment_id)
        return analysis.as_dict
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@ab_router.get("/ab/experiments", response_model=list)
def list_ab_experiments(
    status: str | None = None,
    limit: int = Query(50, ge=1, le=500),
) -> list:
    """List experiments with optional status filter."""
    platform = get_ab_platform()
    status_enum = ExperimentStatus(status) if status else None
    experiments = platform.list_experiments(status=status_enum, limit=limit)
    return [e.as_dict for e in experiments]


@ab_router.get("/ab/experiments/{experiment_id}", response_model=dict)
def get_ab_experiment(experiment_id: str) -> dict:
    """Get a single experiment by ID."""
    platform = get_ab_platform()
    exp = platform.get_experiment(experiment_id)
    if exp is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return exp.as_dict


# ==========================================================================
# F25 — Workflow Rollout Manager
# ==========================================================================


class RolloutCreateRequest(BaseModel):
    artifact_id: str
    artifact_type: str = "workflow"
    description: str = ""
    stages: list[dict[str, Any]] | None = None
    success_metric: str = "success_rate"
    min_sample: int = Field(50, ge=1)
    promote_threshold: float = Field(0.95, ge=0.0, le=1.0)
    rollback_threshold: float = Field(0.80, ge=0.0, le=1.0)


class RolloutMetricRequest(BaseModel):
    metric_value: float
    subject_id: str = ""
    metric_name: str | None = None


@rollout_router.post("/rollout/plans", response_model=dict)
def create_rollout_plan(payload: RolloutCreateRequest) -> dict:
    """Create a staged rollout plan for a workflow or prompt artifact."""
    mgr = get_rollout_manager()
    plan = mgr.create_plan(
        artifact_id=payload.artifact_id,
        artifact_type=payload.artifact_type,
        description=payload.description,
        stages=payload.stages,
        success_metric=payload.success_metric,
        min_sample=payload.min_sample,
        promote_threshold=payload.promote_threshold,
        rollback_threshold=payload.rollback_threshold,
    )
    return plan.as_dict


@rollout_router.post("/rollout/plans/{plan_id}/start", response_model=dict)
def start_rollout_plan(plan_id: str) -> dict:
    """Start a rollout plan."""
    mgr = get_rollout_manager()
    try:
        plan = mgr.start_plan(plan_id)
        return plan.as_dict
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@rollout_router.get("/rollout/plans/{plan_id}/traffic", response_model=dict)
def check_traffic_split(plan_id: str, subject_id: str) -> dict:
    """Check whether a subject should receive the new version."""
    mgr = get_rollout_manager()
    is_new = mgr.is_new_version(plan_id=plan_id, subject_id=subject_id)
    plan = mgr.get_plan(plan_id)
    return {
        "plan_id": plan_id,
        "subject_id": subject_id,
        "use_new_version": is_new,
        "current_traffic_percent": plan.current_traffic_percent if plan else None,
    }


@rollout_router.post("/rollout/plans/{plan_id}/metrics", response_model=dict)
def record_rollout_metric(plan_id: str, payload: RolloutMetricRequest) -> dict:
    """Record an observed metric for the current rollout stage."""
    mgr = get_rollout_manager()
    try:
        metric_id = mgr.record_metric(
            plan_id=plan_id,
            metric_value=payload.metric_value,
            subject_id=payload.subject_id,
            metric_name=payload.metric_name,
        )
        return {"metric_id": metric_id, "plan_id": plan_id, "recorded": True}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@rollout_router.post("/rollout/plans/{plan_id}/gate", response_model=dict)
def evaluate_rollout_gate(plan_id: str) -> dict:
    """Evaluate the promotion gate for the current rollout stage."""
    mgr = get_rollout_manager()
    try:
        result = mgr.evaluate_gate(plan_id)
        return result.as_dict
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@rollout_router.get("/rollout/plans/{plan_id}", response_model=dict)
def get_rollout_plan(plan_id: str) -> dict:
    """Get a rollout plan by ID."""
    mgr = get_rollout_manager()
    plan = mgr.get_plan(plan_id)
    if plan is None:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan.as_dict


@rollout_router.get("/rollout/plans", response_model=list)
def list_rollout_plans(
    artifact_id: str | None = None,
    status: str | None = None,
    limit: int = Query(50, ge=1, le=500),
) -> list:
    """List rollout plans with optional filters."""
    mgr = get_rollout_manager()
    status_enum = RolloutStatus(status) if status else None
    plans = mgr.list_plans(artifact_id=artifact_id, status=status_enum, limit=limit)
    return [p.as_dict for p in plans]


# ==========================================================================
# F11 — Deterministic Replay Debugger
# ==========================================================================


class TraceStartRequest(BaseModel):
    run_id: str
    session_id: str = ""
    tenant_id: str = ""
    workflow_id: str = ""
    metadata: dict[str, Any] = Field(default_factory=dict)


class TraceEventRequest(BaseModel):
    event_type: str = EventType.TOOL_CALL.value
    actor: str = "agent"
    tool_name: str = ""
    inputs: dict[str, Any] = Field(default_factory=dict)
    outputs: dict[str, Any] = Field(default_factory=dict)
    state_before: dict[str, Any] = Field(default_factory=dict)
    state_after: dict[str, Any] = Field(default_factory=dict)
    duration_ms: int = 0
    error: str = ""


class TraceEndRequest(BaseModel):
    outcome: str = "completed"
    error: str = ""


class ReplayRequest(BaseModel):
    mock_tool_results: dict[str, Any] | None = None


@replay_router.post("/replay/traces", response_model=dict)
def start_trace(payload: TraceStartRequest) -> dict:
    """Start a new run trace recording."""
    debugger = get_replay_debugger()
    trace = debugger.start_trace(
        run_id=payload.run_id,
        session_id=payload.session_id,
        tenant_id=payload.tenant_id,
        workflow_id=payload.workflow_id,
        metadata=payload.metadata,
    )
    return {"trace_id": trace.trace_id, "run_id": trace.run_id, "started_at": trace.started_at}


@replay_router.post("/replay/traces/{trace_id}/events", response_model=dict)
def record_trace_event(trace_id: str, payload: TraceEventRequest) -> dict:
    """Record a single event within an active trace."""
    debugger = get_replay_debugger()
    try:
        event_type = EventType(payload.event_type)
    except ValueError:
        event_type = EventType.TOOL_CALL
    event = debugger.record_event(
        trace_id=trace_id,
        event_type=event_type,
        actor=payload.actor,
        tool_name=payload.tool_name,
        inputs=payload.inputs,
        outputs=payload.outputs,
        state_before=payload.state_before,
        state_after=payload.state_after,
        duration_ms=payload.duration_ms,
        error=payload.error,
    )
    return {"event_id": event.event_id, "seq": event.seq, "event_hash": event.event_hash}


@replay_router.post("/replay/traces/{trace_id}/end", response_model=dict)
def end_trace(trace_id: str, payload: TraceEndRequest) -> dict:
    """Mark a trace as completed."""
    debugger = get_replay_debugger()
    trace = debugger.end_trace(
        trace_id=trace_id,
        outcome=payload.outcome,
        error=payload.error,
    )
    return {"trace_id": trace.trace_id, "status": trace.status.value, "event_count": len(trace.events)}


@replay_router.post("/replay/traces/{trace_id}/replay", response_model=dict)
def replay_trace(trace_id: str, payload: ReplayRequest) -> dict:
    """Replay a recorded trace and return divergence analysis."""
    debugger = get_replay_debugger()
    try:
        result = debugger.replay(trace_id=trace_id, mock_tool_results=payload.mock_tool_results)
        return result.as_dict
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@replay_router.get("/replay/traces/{trace_id}", response_model=dict)
def get_trace(trace_id: str) -> dict:
    """Fetch a trace with all its events."""
    debugger = get_replay_debugger()
    trace = debugger.get_trace(trace_id)
    if trace is None:
        raise HTTPException(status_code=404, detail="Trace not found")
    return trace.as_dict


@replay_router.get("/replay/traces", response_model=list)
def list_traces(
    tenant_id: str | None = None,
    workflow_id: str | None = None,
    run_id: str | None = None,
    limit: int = Query(50, ge=1, le=500),
) -> list:
    """List traces with optional filters."""
    debugger = get_replay_debugger()
    traces = debugger.list_traces(
        tenant_id=tenant_id,
        workflow_id=workflow_id,
        run_id=run_id,
        limit=limit,
    )
    return [t.as_dict for t in traces]


# ==========================================================================
# F6 — Agent Scaffolding CLI
# ==========================================================================


class ScaffoldRequest(BaseModel):
    agent_name: str
    template: str = AgentTemplate.BASIC.value
    tools: list[str] | None = None
    description: str = ""


@scaffold_router.post("/scaffold/generate", response_model=dict)
def scaffold_agent(payload: ScaffoldRequest) -> dict:
    """Generate an AMC-compatible agent project skeleton."""
    scaffolder = get_scaffolder()
    try:
        template = AgentTemplate(payload.template)
    except ValueError:
        template = AgentTemplate.BASIC

    project = scaffolder.generate(
        agent_name=payload.agent_name,
        template=template,
        tools=payload.tools,
        description=payload.description,
    )
    return {
        "agent_name": project.agent_name,
        "template": project.template.value,
        "description": project.description,
        "file_count": project.file_count,
        "file_paths": project.file_paths,
        "files": [
            {"path": f.path, "content": f.content}
            for f in project.files
        ],
    }


@scaffold_router.get("/scaffold/templates", response_model=list)
def list_scaffold_templates() -> list:
    """List available agent scaffold templates."""
    scaffolder = get_scaffolder()
    return [
        {
            "template": t.value,
            "default_tools": scaffolder._DEFAULT_TOOLS.get(t, []),
        }
        for t in AgentTemplate
    ]


# ==========================================================================
# F12 — Local Dev Sandbox with Mocked Tools
# ==========================================================================


class MockRegisterRequest(BaseModel):
    name: str
    mode: str = MockMode.STATIC.value
    response: dict[str, Any] | None = None
    sequence: list[dict[str, Any]] | None = None
    error_message: str = "Mock error"
    input_schema: dict[str, Any] | None = None
    output_schema: dict[str, Any] | None = None
    latency_ms: int = 0


class SandboxCallRequest(BaseModel):
    tool_name: str
    params: dict[str, Any] = Field(default_factory=dict)


@devsandbox_router.post("/devsandbox/sessions", response_model=dict)
def create_sandbox_session() -> dict:
    """Create a new isolated dev sandbox session."""
    sandbox = get_dev_sandbox()
    session = sandbox.create_session()
    return {
        "session_id": session.session_id,
        "created_at": session.created_at,
        "available_tools": sandbox.registry.list_tools(),
    }


@devsandbox_router.post("/devsandbox/sessions/{session_id}/call", response_model=dict)
def sandbox_call_tool(session_id: str, payload: SandboxCallRequest) -> dict:
    """Call a mock tool within a sandbox session."""
    sandbox = get_dev_sandbox()
    try:
        result = sandbox.call_tool(
            session_id=session_id,
            tool_name=payload.tool_name,
            params=payload.params,
        )
        return {"result": result, "tool_name": payload.tool_name}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@devsandbox_router.get("/devsandbox/sessions/{session_id}", response_model=dict)
def get_sandbox_session(session_id: str) -> dict:
    """Get sandbox session details including call log."""
    sandbox = get_dev_sandbox()
    session = sandbox.get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session.as_dict


@devsandbox_router.post("/devsandbox/mocks", response_model=dict)
def register_mock_tool(payload: MockRegisterRequest) -> dict:
    """Register or replace a mock tool definition."""
    sandbox = get_dev_sandbox()
    try:
        mode = MockMode(payload.mode)
    except ValueError:
        mode = MockMode.STATIC
    tool = sandbox.register_mock(
        name=payload.name,
        mode=mode,
        response=payload.response,
        sequence=payload.sequence,
        error_message=payload.error_message,
        input_schema=payload.input_schema,
        output_schema=payload.output_schema,
    )
    return {"tool_name": tool.name, "mode": tool.response.mode.value, "registered": True}


@devsandbox_router.get("/devsandbox/mocks", response_model=list)
def list_mock_tools() -> list:
    """List all available mock tools."""
    sandbox = get_dev_sandbox()
    tools = sandbox.registry.list_tools()
    return [{"tool_name": t, "call_count": sandbox.registry.stats().get(t, 0)} for t in tools]


# ---------------------------------------------------------------------------
# Orchestration: Job Queue + Escalation Queue
# ---------------------------------------------------------------------------

from amc.product.jobs import SubmitParams, get_queue, reset_queue as _reset_job_queue
from amc.product.escalation import (
    EscalationTicket,
    get_queue as get_escalation_queue,
)


class QueueSubmitRequest(BaseModel):
    task_type: str
    payload: dict[str, Any] = Field(default_factory=dict)
    priority: int = 5
    sla_seconds: float | None = None
    idempotency_key: str | None = None


class QueueClaimRequest(BaseModel):
    worker_id: str = "worker"


class QueueAckRequest(BaseModel):
    job_id: str
    worker_id: str | None = None
    success: bool = True
    error: str | None = None


class EscalationSubmitRequest(BaseModel):
    source: str
    summary: str
    category: str = "general"
    severity: str = "low"
    metadata: dict[str, Any] = Field(default_factory=dict)


class EscalationClaimRequest(BaseModel):
    agent: str


class EscalationHandoffRequest(BaseModel):
    to_team: str
    reason: str


@orchestration_router.post("/queue/submit")
def queue_submit(payload: QueueSubmitRequest) -> dict[str, Any]:
    """Submit a job to the priority queue."""
    q = get_queue()
    job_payload = {"task_type": payload.task_type, **payload.payload}
    job = q.submit(SubmitParams(
        payload=job_payload,
        priority=payload.priority,
        sla_seconds=int(payload.sla_seconds) if payload.sla_seconds else 300,
    ))
    return {"job_id": job.id, "state": job.status, "priority": job.priority}


@orchestration_router.post("/queue/claim")
def queue_claim(payload: QueueClaimRequest) -> dict[str, Any]:
    """Claim the next available job."""
    q = get_queue()
    job = q.claim(worker_id=payload.worker_id)
    if job is None:
        return {"job_id": None, "message": "no jobs available"}
    return {"job_id": job.id, "payload": job.payload}


@orchestration_router.post("/queue/ack")
def queue_ack(payload: QueueAckRequest) -> dict[str, Any]:
    """Acknowledge completion or failure for a claimed job."""
    q = get_queue()
    job = q.ack(job_id=payload.job_id, worker_id=payload.worker_id, success=payload.success, error=payload.error)
    return {"job_id": job.id, "state": job.status}


@orchestration_router.get("/queue/retry-stats")
def queue_retry_stats() -> dict[str, Any]:
    """Return queue health stats."""
    stats = get_queue().retry_stats()
    return stats.model_dump() if hasattr(stats, "model_dump") else dict(stats.__dict__)


@orchestration_router.post("/escalation/submit")
def submit_escalation(payload: EscalationSubmitRequest) -> dict[str, Any]:
    """Submit an escalation ticket."""
    eq = get_escalation_queue()
    ticket = eq.submit(
        source=payload.source,
        summary=payload.summary,
        category=payload.category,
        severity=payload.severity,
    )
    return {"id": ticket.id, "route_team": ticket.route_team, "state": ticket.state}


@orchestration_router.post("/escalation/{ticket_id}/claim")
def claim_escalation(ticket_id: str, payload: EscalationClaimRequest) -> dict[str, Any]:
    """Claim an escalation ticket."""
    eq = get_escalation_queue()
    ticket = eq.claim(ticket_id=ticket_id, agent=payload.agent)
    return {"id": ticket.id, "state": ticket.state, "assigned_to": ticket.assigned_to}


@orchestration_router.post("/escalation/{ticket_id}/handoff")
def handoff_escalation(ticket_id: str, payload: EscalationHandoffRequest) -> dict[str, Any]:
    """Handoff an escalation ticket to another team."""
    eq = get_escalation_queue()
    ticket = eq.handoff(ticket_id=ticket_id, to_team=payload.to_team, reason=payload.reason)
    return {"id": ticket.id, "state": ticket.state, "route_team": ticket.route_team}


@orchestration_router.post("/escalation/{ticket_id}/resolve")
def resolve_escalation(ticket_id: str) -> dict[str, Any]:
    """Resolve an escalation ticket."""
    eq = get_escalation_queue()
    ticket = eq.resolve(ticket_id=ticket_id)
    return {"id": ticket.id, "state": ticket.state}


@orchestration_router.get("/escalation/stats")
def escalation_stats() -> dict[str, Any]:
    """Return escalation queue summary."""
    from amc.product.escalation import escalation_summary
    return escalation_summary(get_escalation_queue()).model_dump()
