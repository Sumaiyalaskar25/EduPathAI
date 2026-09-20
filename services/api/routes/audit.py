# services/api/routes/audit.py
from __future__ import annotations

import hashlib
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel

from services.api.deps import AppState, get_state
from services.api.pdf import render_document_pdf
from services.auth.session import Session
from services.api.auth_deps import get_session

router = APIRouter(prefix="/v1/audit", tags=["audit"])


@router.get("/list")
async def audit_list(student_id: str | None = None, limit: int = 50, state: AppState = Depends(get_state)):
    if student_id and state.db is not None:
        from services.db.students import get_student_uuid
        student_uuid = await get_student_uuid(state.db, student_id)
        if student_uuid is None:
            return []
        rows = await state.db.fetch(
            f"""
            SELECT {state.ledger._SELECT_COLUMNS}
            FROM audit_ledger a
            WHERE a.decision_id IN (
                SELECT DISTINCT decision_id FROM recognition_decisions WHERE student_id = $1
            )
            ORDER BY a.timestamp DESC
            LIMIT $2
            """,
            student_uuid, limit,
        )
        return [state.ledger._row_to_record(r) for r in rows]

    return await state.ledger.list_recent(limit=limit)


@router.get("/{decision_id}")
async def audit_get(decision_id: UUID, state: AppState = Depends(get_state)):
    rec = await state.ledger.get_by_decision_id(decision_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Audit record not found")
    return rec


@router.get("/{decision_id}/history")
async def audit_history(decision_id: UUID, state: AppState = Depends(get_state)):
    """Full timeline for a decision — AI recommendation, then any human
    review/contest events. Powers DecisionTimeline.tsx."""
    history = await state.ledger.get_history(decision_id)
    if not history:
        raise HTTPException(status_code=404, detail="Audit record not found")
    return history


@router.get("/{decision_id}/replay")
async def audit_replay(decision_id: UUID, state: AppState = Depends(get_state)):
    """'Replay exact decision state': the frozen DecisionBundle (13
    versions) plus the full ledger history for this decision — everything
    needed to reproduce exactly what the pipeline saw and decided."""
    rec = await state.ledger.get_by_decision_id(decision_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Audit record not found")
    bundle = await state.orchestrator.bundles.get(rec.bundle_id)
    history = await state.ledger.get_history(decision_id)
    return {"decision_id": decision_id, "bundle": bundle, "history": history}


class ContestRequest(BaseModel):
    reason: str


@router.post("/{decision_id}/contest")
async def audit_contest(decision_id: UUID, req: ContestRequest, state: AppState = Depends(get_state),
                         session: Session = Depends(get_session)):
    original = await state.ledger.get_by_decision_id(decision_id)
    if not original:
        raise HTTPException(status_code=404, detail="Audit record not found")

    record = await state.ledger.append(
        decision_id=decision_id,
        bundle=await state.orchestrator.bundles.get(original.bundle_id) or _bundle_stub(original),
        input_hash=original.output_hash,
        output_hash=hashlib.sha256(req.reason.encode("utf-8")).hexdigest(),
        confidence=original.confidence,
        evidence=[],
        ai_recommendation=f"Contested by student: {req.reason}",
        trace_id=original.trace_id,
        chain_id=original.chain_id,
        human_decision="CONTESTED",
        auditor_name=session.display_name,
        auditor_role=session.role,
    )
    return record


@router.get("/{decision_id}/pdf")
async def audit_pdf(decision_id: UUID, state: AppState = Depends(get_state)):
    rec = await state.ledger.get_by_decision_id(decision_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Audit record not found")
    history = await state.ledger.get_history(decision_id)

    sections = [
        ("Decision", [
            ("Decision ID", str(rec.decision_id)),
            ("Trace ID", rec.trace_id),
            ("Timestamp (UTC)", rec.timestamp.isoformat()),
            ("Confidence", f"{rec.confidence:.4f}"),
        ]),
        ("Hash Chain", [
            ("Chain", rec.chain_id),
            ("Previous Hash", rec.previous_hash),
            ("Current Hash", rec.current_hash),
            ("Bundle ID", str(rec.bundle_id)),
            ("Input Hash", rec.input_hash),
            ("Output Hash", rec.output_hash),
        ]),
    ]
    if len(history) > 1:
        review_rows = []
        for h in history[1:]:
            review_rows.append((f"{h.timestamp.isoformat()} — {h.human_decision}",
                                 f"{h.auditor_name or ''} ({h.auditor_role or ''})"))
        sections.append(("Human Review", review_rows))

    pdf_bytes = render_document_pdf(
        title="EduPathAI — Cryptographic Decision Proof",
        subtitle="This certificate reproduces the hash-chained audit ledger entry for one recognition decision.",
        sections=sections,
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="decision-{decision_id}.pdf"'},
    )


def _bundle_stub(rec):
    """Fallback DecisionBundle when replaying in in-memory mode (no DB
    row to fetch). Real deployments always have the DB row."""
    from datetime import datetime, timezone
    from services.schemas import DecisionBundle
    return DecisionBundle(
        id=rec.bundle_id, curriculum_version="unknown", policy_version="unknown",
        model_version="unknown", prompt_version="unknown", embedding_model_version="unknown",
        cross_encoder_version="unknown", retrieval_threshold=0.0, solver_version="unknown",
        solver_parameters_hash="", resource_catalog_version="unknown", ontology_version="unknown",
        ruleset_commit="unknown", tool_definitions_hash="", captured_at=datetime.now(timezone.utc),
    )
