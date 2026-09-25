# services/api/routes/auth.py
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from services.api.deps import AppState, get_state
from services.auth import digilocker

router = APIRouter(prefix="/v1/auth", tags=["auth"])


class VerifyRequest(BaseModel):
    mode: str          # "learner" | "bos" | "ministry"
    identifier: str    # APAAR/ABC id, reviewer id, or officer id
    consent: bool = False


class VerifyResponse(BaseModel):
    token: str
    role: str
    external_ref: str
    display_name: str
    institution: str | None = None
    programme: str | None = None
    target_institution: str | None = None
    target_programme: str | None = None


@router.post("/verify", response_model=VerifyResponse)
async def verify(req: VerifyRequest, state: AppState = Depends(get_state)):
    try:
        result = await digilocker.verify(
            directory=state.identity,
            db=state.db,
            mode=req.mode,
            identifier=req.identifier,
            consent=req.consent,
        )
    except digilocker.VerificationError as e:
        raise HTTPException(status_code=400, detail=e.reason)

    return VerifyResponse(
        token=result.token,
        role=result.role,
        external_ref=result.external_ref,
        display_name=result.display_name,
        institution=result.institution,
        programme=result.programme,
        target_institution=result.target_institution,
        target_programme=result.target_programme,
    )


class StudentRegisterRequest(BaseModel):
    full_name: str
    institution: str
    programme: str
    semester: int = 4
    target_institution: str = "IIT Bombay"
    target_programme: str = "BTech-CSE"
    apaar_id: str | None = None
    courses: list[dict] = []
    consent: bool = True


@router.post("/register-student", response_model=VerifyResponse)
async def register_student(req: StudentRegisterRequest, state: AppState = Depends(get_state)):
    if not req.consent:
        raise HTTPException(status_code=400, detail="consent_required")
    if not req.full_name.strip() or not req.institution.strip():
        raise HTTPException(status_code=400, detail="Missing required student profile fields")

    identity = state.identity.register_student(
        full_name=req.full_name.strip(),
        institution=req.institution.strip(),
        programme=req.programme.strip(),
        semester=req.semester,
        target_institution=req.target_institution.strip(),
        target_programme=req.target_programme.strip(),
        apaar_id=req.apaar_id,
        courses=req.courses,
    )

    if state.db is not None:
        from services.db.students import ensure_student
        await ensure_student(state.db, identity.external_ref)

    from services.auth.session import issue_token
    token = issue_token(
        external_ref=identity.external_ref,
        role="learner",
        institution=identity.institution,
        display_name=identity.full_name,
    )

    return VerifyResponse(
        token=token,
        role="learner",
        external_ref=identity.external_ref,
        display_name=identity.full_name,
        institution=identity.institution,
        programme=identity.programme,
        target_institution=identity.target_institution,
        target_programme=identity.target_programme,
    )


@router.get("/overview")
async def auth_overview(state: AppState = Depends(get_state)):
    stats = {
        "institutions": 129,
        "courses": 15600,
        "disciplines": 22,
        "curricula": 520,
        "competencies": 62400,
        "ledgerHead": "SHA-256 Chained Genesis",
        "db": "connected" if state.db else "in-memory",
    }
    if state.db is not None:
        try:
            head_row = await state.db.fetchrow(
                "SELECT head_hash FROM audit_chain_heads WHERE chain_id = 'global' LIMIT 1"
            )
            if head_row and head_row["head_hash"]:
                stats["ledgerHead"] = head_row["head_hash"][:16] + "..."

            cnt = await state.db.fetchval("SELECT count(*) FROM courses")
            if cnt:
                stats["courses"] = cnt
            inst_cnt = await state.db.fetchval("SELECT count(*) FROM institutions")
            if inst_cnt:
                stats["institutions"] = inst_cnt
        except Exception:
            pass

    students = [
        {
            "id": s.external_ref,
            "name": s.full_name,
            "apaar": s.apaar_masked,
            "raw_id": s.external_ref,
            "source": s.institution,
            "target": s.target_institution,
            "programme": s.programme,
        }
        for s in state.identity.all_students()
    ]
    reviewers = [
        {
            "id": r.external_ref,
            "name": r.full_name,
            "raw_id": r.external_ref,
            "institution": r.institution,
            "role": "Board of Studies (BoS) Reviewer",
        }
        for r in state.identity.all_reviewers()
    ]
    officers = [
        {
            "id": o.external_ref,
            "name": o.full_name,
            "raw_id": o.external_ref,
            "department": o.institution or "Ministry of Education",
            "role": "State / Ministry Nodal Officer",
        }
        for o in [state.identity.get("officer-001")]
        if o
    ]

    return {
        "stats": stats,
        "personas": {
            "learner": students,
            "bos": reviewers,
            "ministry": officers,
        },
    }

