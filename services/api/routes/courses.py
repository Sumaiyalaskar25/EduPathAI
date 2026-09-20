# services/api/routes/courses.py
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from services.api.deps import AppState, get_state

router = APIRouter(prefix="/v1/courses", tags=["courses"])


@router.get("/{code}")
async def get_course(code: str, student_id: str | None = None, state: AppState = Depends(get_state)):
    info = state.catalog.get(code)
    if info is None:
        raise HTTPException(status_code=404, detail="Course not found in catalog")

    recognition_status = None
    mapped_from = None
    if state.db is not None:
        row = await state.db.fetchrow(
            """
            SELECT source_course_id, target_course_id, status, confidence
            FROM recognition_decisions
            WHERE target_course_id = $1
            ORDER BY created_at DESC
            LIMIT 1
            """,
            code,
        )
        if row:
            recognition_status = row["status"]
            mapped_from = {"source_course": row["source_course_id"], "similarity": float(row["confidence"])}

    return {
        "code": info.code,
        "name": info.name,
        "credits": info.credits,
        "modality": info.modality,
        "description": info.fixture_description or f"Course {info.code}: {info.name}.",
        "competencies": info.outcomes,
        "recognitionStatus": recognition_status,
        "mappedFrom": mapped_from,
    }
