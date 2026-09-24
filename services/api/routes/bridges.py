# services/api/routes/bridges.py
from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from services.api.deps import AppState, get_state

router = APIRouter(prefix="/v1/bridges", tags=["bridges"])


@router.get("/{bridge_id}")
async def get_bridge(bridge_id: UUID, state: AppState = Depends(get_state)):
    if state.db is None:
        raise HTTPException(status_code=503, detail="persistence_unavailable")

    row = await state.db.fetchrow("SELECT * FROM bridges WHERE id = $1", bridge_id)
    if not row:
        raise HTTPException(status_code=404, detail="Bridge not found")

    gap_row = await state.db.fetchrow("SELECT * FROM gaps WHERE id = $1", row["gap_id"])
    missing_outcomes = gap_row["missing_outcomes"] if gap_row else None
    if isinstance(missing_outcomes, str):
        import json as _json
        missing_outcomes = _json.loads(missing_outcomes)

    # The bridges table only stores the recognition decision (which resource,
    # what coverage, is it enrolled) — the human-readable catalog fields
    # (title, competency tags, prerequisites) live in the resource registry
    # that BridgePath matched against. Join them here so the frontend never
    # has to fall back to showing a raw resource_id as a title.
    resource = state.resources.get(row["resource_id"])

    return {
        "id": str(row["id"]),
        "gap_id": str(row["gap_id"]),
        "resource_id": row["resource_id"],
        "resource_provider": row["resource_provider"],
        "resource_url": row["resource_url"],
        "competency_coverage": float(row["competency_coverage"]),
        "duration_hours": row["duration_hours"],
        "assessment_available": row["assessment_available"],
        "recognition_status": row["recognition_status"],
        "prerequisite_met": row["prerequisite_met"],
        "enrolled": row["enrolled"],
        "title": resource.title if resource else row["resource_id"],
        "competencies": resource.competency_tags if resource else [],
        "prerequisites": resource.prerequisites if resource else [],
        "valid_until": resource.valid_until if resource else None,
        "gap": {
            "gap_type": gap_row["gap_type"],
            "description": gap_row["description"],
            "missing_outcomes": missing_outcomes,
        } if gap_row else None,
    }
