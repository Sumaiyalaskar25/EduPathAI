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
