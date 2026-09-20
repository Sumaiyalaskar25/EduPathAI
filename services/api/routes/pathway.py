# services/api/routes/pathway.py
from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from services.api.deps import AppState, get_state

router = APIRouter(prefix="/v1/pathway", tags=["pathway"])


class PathwayRequest(BaseModel):
    student_id: str
    target_programme: str
    institution: str


@router.post("/request")
async def pathway_request(req: PathwayRequest, state: AppState = Depends(get_state)):
    try:
        return await state.orchestrator.run(req.student_id, req.target_programme, req.institution)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class SubmitRequest(BaseModel):
    student_id: str
    decision_id: UUID
    pathway_mode: str


@router.post("/submit")
async def pathway_submit(req: SubmitRequest, state: AppState = Depends(get_state)):
    """
    "Lock and Submit Pathway" (docs/API_INTEGRATION.md CTA table). The
    recognition decision is already immutable in the audit ledger; this
    records the student's own act of choosing/locking one solved
    pathway mode, as a real outbox event a downstream enrollment
    system can consume.
    """
    await state.outbox.publish(
        topic="pathway.submitted",
        event_key=f"{req.student_id}:{req.decision_id}",
        payload={
            "student_id": req.student_id,
            "decision_id": str(req.decision_id),
            "pathway_mode": req.pathway_mode,
        },
    )
    return {"status": "submitted", "decision_id": req.decision_id, "pathway_mode": req.pathway_mode}
