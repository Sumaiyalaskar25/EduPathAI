# services/api/routes/hei.py
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from services.api.auth_deps import get_session
from services.api.deps import AppState, get_state
from services.auth.session import Session

router = APIRouter(prefix="/v1/hei", tags=["hei"])

_INSTITUTIONS_PATH = Path("data/institutions_directory.json")


def _load_institutions() -> list[dict]:
    if not _INSTITUTIONS_PATH.exists():
        return []
    return json.loads(_INSTITUTIONS_PATH.read_text(encoding="utf-8"))


def _age_str(ts: datetime) -> tuple[str, str]:
    delta = datetime.now(timezone.utc) - ts
    hours = delta.total_seconds() / 3600
    if hours < 1:
        age = f"{int(delta.total_seconds() // 60)}m ago"
    elif hours < 24:
        age = f"{int(hours)}h ago"
    else:
        age = f"{int(hours // 24)}d ago"
    priority = "high" if hours >= 12 else ("normal" if hours >= 4 else "low")
    return age, priority


async def _course_summary(state: AppState, decision_id: UUID) -> tuple[str, str, bool]:
    """Returns (courses_text, ai_recommendation, bridge_required) from the
    real recognition_decisions rows for this decision."""
    rows = await state.db.fetch(
        "SELECT source_course_id, target_course_id, status FROM recognition_decisions WHERE decision_id = $1",
        decision_id,
    )
    if not rows:
        return "—", "REVIEW", False
    courses = ", ".join(f"{r['target_course_id']}" for r in rows)
    statuses = [r["status"] for r in rows]
    # Most concerning status wins the headline recommendation.
    for s in ("MISSING", "POLICY_CONFLICT", "REVIEW", "BRIDGE", "DIRECT"):
        if s in statuses:
            rec = s if s in ("DIRECT", "BRIDGE", "MISSING") else "REVIEW"
            break
    else:
        rec = "REVIEW"
    return courses, rec, ("BRIDGE" in statuses)


@router.get("/{institution}/queue")
async def hei_queue(institution: str, state: AppState = Depends(get_state)):
    if state.db is None:
        return {"items": [], "stats": {"pending": 0, "approvedToday": 0, "rejectedToday": 0, "avgReviewTime": "n/a"}}

    pending_rows = await state.db.fetch(
        """
        SELECT decision_id, timestamp, confidence
        FROM audit_ledger a
        WHERE chain_id = $1
          AND human_decision IS NULL
          AND decision_id NOT IN (
              SELECT decision_id FROM audit_ledger WHERE chain_id = $1 AND human_decision IS NOT NULL
          )
        ORDER BY timestamp ASC
        """,
        institution,
    )

    items = []
    for row in pending_rows:
        decision_id = row["decision_id"]
        courses, ai_rec, bridge_required = await _course_summary(state, decision_id)

        student_row = await state.db.fetchrow(
            """
            SELECT s.external_ref FROM recognition_decisions rd
            JOIN students s ON s.id = rd.student_id
            WHERE rd.decision_id = $1 LIMIT 1
            """,
            decision_id,
        )
        identity = state.identity.get(student_row["external_ref"]) if student_row else None
        age, priority = _age_str(row["timestamp"])

        items.append({
            "id": str(decision_id),
            "decisionId": str(decision_id),
            "studentName": identity.full_name if identity else "Unknown",
            "studentProgramme": identity.programme if identity else "",
            "sourceInstitution": identity.institution if identity else "",
            "targetInstitution": institution,
            "courses": courses,
            "aiRecommendation": ai_rec,
            "confidence": float(row["confidence"]),
            "bridgeRequired": bridge_required,
            "submittedAt": row["timestamp"].isoformat(),
            "age": age,
            "priority": priority,
            "status": "PENDING",
        })

    # Real counts for today's reviews on this chain.
    today_rows = await state.db.fetch(
        "SELECT human_decision FROM audit_ledger WHERE chain_id = $1 AND human_decision IS NOT NULL "
        "AND timestamp::date = NOW()::date",
        institution,
    )
    approved_today = sum(1 for r in today_rows if r["human_decision"] == "APPROVED")
    rejected_today = sum(1 for r in today_rows if r["human_decision"] == "REJECTED")

    return {
        "items": items,
        "stats": {
            "pending": len(items),
            "approvedToday": approved_today,
            "rejectedToday": rejected_today,
            "avgReviewTime": "n/a",
        },
    }


class ReviewRequest(BaseModel):
    notes: str = ""


@router.post("/decision/{decision_id}/approve")
async def approve_decision(decision_id: UUID, req: ReviewRequest, state: AppState = Depends(get_state),
                            session: Session = Depends(get_session)):
    return await _review(state, session, decision_id, "APPROVED", req.notes)


@router.post("/decision/{decision_id}/reject")
async def reject_decision(decision_id: UUID, req: ReviewRequest, state: AppState = Depends(get_state),
                           session: Session = Depends(get_session)):
    return await _review(state, session, decision_id, "REJECTED", req.notes)


async def _review(state: AppState, session: Session, decision_id: UUID, decision: str, notes: str):
    if session.role != "bos":
        raise HTTPException(status_code=403, detail="requires_role:bos")

    original = await state.ledger.get_by_decision_id(decision_id)
    if not original:
        raise HTTPException(status_code=404, detail="Decision not found")

    bundle = await state.orchestrator.bundles.get(original.bundle_id)
    if bundle is None:
        raise HTTPException(status_code=409, detail="decision_bundle_unavailable")

    import hashlib
    record = await state.ledger.append(
        decision_id=decision_id,
        bundle=bundle,
        input_hash=original.output_hash,
        output_hash=hashlib.sha256(f"{decision}:{notes}".encode("utf-8")).hexdigest(),
        confidence=1.0,
        evidence=[],
        ai_recommendation=f"Human review: {decision}" + (f" — {notes}" if notes else ""),
        trace_id=original.trace_id,
        chain_id=original.chain_id,
        human_decision=decision,
        auditor_name=session.display_name,
        auditor_role="BoS Reviewer",
    )
    return record


@router.get("/{institution}/approved")
async def hei_approved(institution: str, state: AppState = Depends(get_state)):
    if state.db is None:
        return {"items": [], "stats": {}}

    rows = await state.db.fetch(
        """
        SELECT decision_id, timestamp, human_decision, auditor_name
        FROM audit_ledger
        WHERE chain_id = $1 AND human_decision IS NOT NULL
        ORDER BY timestamp DESC
        LIMIT 100
        """,
        institution,
    )

    items = []
    for row in rows:
        decision_id = row["decision_id"]
        courses, _, bridge_required = await _course_summary(state, decision_id)
        student_row = await state.db.fetchrow(
            """
            SELECT s.external_ref FROM recognition_decisions rd
            JOIN students s ON s.id = rd.student_id
            WHERE rd.decision_id = $1 LIMIT 1
            """,
            decision_id,
        )
        identity = state.identity.get(student_row["external_ref"]) if student_row else None
        original = await state.ledger.get_by_decision_id(decision_id)

        review_minutes = None
        if original:
            review_minutes = int((row["timestamp"] - original.timestamp).total_seconds() // 60)

        items.append({
            "id": str(decision_id),
            "decisionId": str(decision_id),
            "studentName": identity.full_name if identity else "Unknown",
            "studentProgramme": identity.programme if identity else "",
            "sourceInstitution": identity.institution if identity else "",
            "targetInstitution": institution,
            "courses": courses,
            "outcome": row["human_decision"],
            "bridgeRequired": bridge_required,
            "decidedAt": row["timestamp"].isoformat(),
            "reviewer": row["auditor_name"] or "Unknown",
            "reviewDuration": f"{review_minutes} min" if review_minutes is not None else "n/a",
        })

    approved = sum(1 for i in items if i["outcome"] == "APPROVED")
    rejected = sum(1 for i in items if i["outcome"] == "REJECTED")
    contested = sum(1 for i in items if i["outcome"] == "CONTESTED")

    return {
        "items": items,
        "stats": {
            "approvedThisWeek": approved,
            "rejectedThisWeek": rejected,
            "escalatedThisWeek": contested,
            "avgReviewDuration": "n/a",
            "approvalRate": round(approved / len(items), 2) if items else 0.0,
        },
    }


@router.get("/institutions")
async def hei_institutions(state: AppState = Depends(get_state)):
    directory = _load_institutions()
    items = []
    for inst in directory:
        short_name = inst["short_name"]
        students_active = 0
        decisions_this_month = 0
        recognition_rate = 0.0

        if state.db is not None:
            row = await state.db.fetchrow(
                "SELECT COUNT(DISTINCT decision_id) AS decisions, "
                "COUNT(*) FILTER (WHERE human_decision = 'APPROVED') AS approved, "
                "COUNT(*) FILTER (WHERE human_decision IS NOT NULL) AS reviewed "
                "FROM audit_ledger WHERE chain_id = $1 "
                "AND timestamp >= date_trunc('month', NOW())",
                short_name,
            )
            if row:
                decisions_this_month = row["decisions"] or 0
                if row["reviewed"]:
                    recognition_rate = round(row["approved"] / row["reviewed"], 2)
            student_row = await state.db.fetchrow(
                "SELECT COUNT(DISTINCT student_id) AS n FROM recognition_decisions rd "
                "JOIN audit_ledger a ON a.decision_id = rd.decision_id WHERE a.chain_id = $1",
                short_name,
            )
            students_active = student_row["n"] if student_row else 0

        items.append({
            **{k.replace("_", "_"): v for k, v in inst.items()},  # pass through as-is
            "shortName": short_name,
            "studentsActive": students_active,
            "decisionsThisMonth": decisions_this_month,
            "recognitionRate": recognition_rate,
            "avgReviewTime": "n/a",
        })

    return {"items": items, "stats": {
        "total": len(items),
        "active": sum(1 for i in items if i["status"] == "active"),
        "pending": sum(1 for i in items if i["status"] == "pending"),
        "paused": sum(1 for i in items if i["status"] == "paused"),
        "totalStudents": sum(i["studentsActive"] for i in items),
        "totalDecisionsThisMonth": sum(i["decisionsThisMonth"] for i in items),
    }}
