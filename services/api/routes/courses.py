# services/api/routes/courses.py
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from services.api.deps import AppState, get_state

router = APIRouter(prefix="/v1/courses", tags=["courses"])


@router.get("/{code}")
async def get_course(code: str, student_id: str | None = None, state: AppState = Depends(get_state)):
    info = state.catalog.get(code)
    if info is None and state.db is not None:
        row = await state.db.fetchrow(
            """
            SELECT s.subject_id, s.course_code, s.subject_name, s.credits,
                   s.verification_status, i.name as inst_name
            FROM subjects s
            JOIN semesters sem ON s.semester_id = sem.semester_id
            JOIN curriculum_versions cv ON sem.curriculum_id = cv.curriculum_id
            JOIN institutions i ON cv.institution_id = i.institution_id
            WHERE s.course_code = $1
            LIMIT 1
            """,
            code,
        )
        if row:
            outcome_rows = await state.db.fetch(
                "SELECT outcome_text FROM learning_outcomes WHERE subject_id = $1 ORDER BY outcome_no",
                row["subject_id"],
            )
            outcomes = [r["outcome_text"] for r in outcome_rows]
            from services.matching.course_catalog import CourseInfo
            info = CourseInfo(
                code=row["course_code"],
                name=row["subject_name"],
                credits=float(row["credits"] or 4.0),
                outcomes=outcomes,
                modality="theory",
                fixture_description=f"{row['subject_name']} at {row['inst_name']}.",
                verification_status=row["verification_status"],
                institution=row["inst_name"],
            )

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
        "verificationStatus": getattr(info, "verification_status", "OFFICIAL_SOURCE"),
        "institution": getattr(info, "institution", ""),
    }
