"""
AMC API — Score Router
Exposes questionnaire lifecycle and scoring endpoints.

Sessions are persisted in SQLite so questionnaire state survives process
restarts and is safe for multi-instance deployments.
"""
from __future__ import annotations

import os
import sqlite3
import threading
import time
from pathlib import Path

import structlog
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from amc.score.questionnaire import QuestionnaireEngine, QuestionnaireSession
from amc.score.dimensions import CompositeScore

log = structlog.get_logger(__name__)

router = APIRouter(prefix="/api/v1/score", tags=["score"])
_engine = QuestionnaireEngine()


class _ScoreSessionStore:
    """SQLite-backed session store for questionnaire state."""

    def __init__(self, db_path: str | None = None) -> None:
        raw_path = db_path or os.environ.get("AMC_SCORE_DB_PATH", ".amc/score_sessions.sqlite")
        self._db_path = Path(raw_path)
        self._db_path.parent.mkdir(parents=True, exist_ok=True)
        self._conn = sqlite3.connect(str(self._db_path), check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._lock = threading.Lock()
        self._init_db()

    def _init_db(self) -> None:
        with self._conn:
            self._conn.executescript(
                """
                PRAGMA journal_mode = WAL;
                CREATE TABLE IF NOT EXISTS score_sessions (
                    session_id TEXT PRIMARY KEY,
                    payload_json TEXT NOT NULL,
                    completed INTEGER NOT NULL DEFAULT 0,
                    created_ts INTEGER NOT NULL,
                    updated_ts INTEGER NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_score_sessions_completed
                    ON score_sessions(completed);
                CREATE INDEX IF NOT EXISTS idx_score_sessions_updated
                    ON score_sessions(updated_ts);
                """
            )

    def save(self, session: QuestionnaireSession) -> None:
        now = int(time.time())
        with self._lock, self._conn:
            self._conn.execute(
                """
                INSERT INTO score_sessions(session_id, payload_json, completed, created_ts, updated_ts)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(session_id) DO UPDATE SET
                    payload_json = excluded.payload_json,
                    completed = excluded.completed,
                    updated_ts = excluded.updated_ts
                """,
                (
                    session.session_id,
                    session.model_dump_json(),
                    1 if session.completed else 0,
                    now,
                    now,
                ),
            )

    def get(self, session_id: str) -> QuestionnaireSession | None:
        with self._lock:
            row = self._conn.execute(
                "SELECT payload_json FROM score_sessions WHERE session_id = ?",
                (session_id,),
            ).fetchone()
        if not row:
            return None
        return QuestionnaireSession.model_validate_json(row["payload_json"])

    def active_sessions(self) -> int:
        with self._lock:
            row = self._conn.execute(
                "SELECT COUNT(*) AS c FROM score_sessions WHERE completed = 0"
            ).fetchone()
        return int(row["c"] if row else 0)

    def healthy(self) -> bool:
        try:
            with self._lock:
                self._conn.execute("SELECT 1").fetchone()
            return True
        except Exception:
            return False

    def close(self) -> None:
        with self._lock:
            self._conn.close()


_store = _ScoreSessionStore()


def score_db_status() -> str:
    """Health status for score session storage."""
    return "ok" if _store.healthy() else "degraded"


def close_score_store() -> None:
    """Close sqlite connection during process shutdown."""
    _store.close()


class ScoreSessionCreateResponse(BaseModel):
    """Response with new session id."""

    session_id: str
    total_questions: int


class ScoreQuestionResponse(BaseModel):
    """Question returned by questionnaire engine."""

    id: str
    dimension: str
    text: str
    evidence_prompt: str = ""
    scoring_rubric: dict[str, int] = Field(default_factory=dict)


class ScoreAnswerRequest(BaseModel):
    """Answer for a questionnaire question."""

    question_id: str
    answer_text: str


class ScoreAnswerResponse(BaseModel):
    """Updated session state after answering."""

    session_id: str
    current_question: int
    completed: bool


class ScoreCompleteResponse(BaseModel):
    """Final composite score payload."""

    score_id: str
    overall_level: str
    overall_score: int
    recommended_platform_modules: dict[str, list[str]]


@router.post("/session", response_model=ScoreSessionCreateResponse)
async def create_session() -> ScoreSessionCreateResponse:
    """Create a new questionnaire session and persist it."""
    session = _engine.start_session()
    _store.save(session)
    log.info("score.session.started", session_id=session.session_id, active_sessions=_store.active_sessions())
    return ScoreSessionCreateResponse(
        session_id=session.session_id,
        total_questions=len(_engine.questions),
    )


@router.get("/question/{session_id}", response_model=ScoreQuestionResponse | None)
async def get_next_question(session_id: str) -> ScoreQuestionResponse | None:
    """Get the next unanswered question for session id."""
    session = _store.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    q = _engine.next_question(session)
    if q is None:
        return None

    return ScoreQuestionResponse(**q.model_dump())


@router.post("/answer/{session_id}", response_model=ScoreAnswerResponse)
async def answer(session_id: str, req: ScoreAnswerRequest) -> ScoreAnswerResponse:
    """Submit an answer and advance the questionnaire session."""
    session = _store.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    updated = _engine.answer(session, req.question_id, req.answer_text)
    _store.save(updated)

    log.info(
        "score.question.answered",
        session_id=session_id,
        question_id=req.question_id,
        index=updated.current_question,
    )

    return ScoreAnswerResponse(
        session_id=session_id,
        current_question=updated.current_question,
        completed=updated.completed,
    )


@router.post("/complete/{session_id}", response_model=ScoreCompleteResponse)
async def complete(session_id: str) -> ScoreCompleteResponse:
    """Complete the session and return a composite score."""
    session = _store.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    composite: CompositeScore = _engine.complete(session)
    _store.save(session)
    return ScoreCompleteResponse(
        score_id=composite.score_id,
        overall_level=composite.overall_level.value,
        overall_score=composite.overall_score,
        recommended_platform_modules=composite.recommended_platform_modules,
    )
