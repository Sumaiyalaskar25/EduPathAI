# services/api/auth_deps.py
from __future__ import annotations

from fastapi import Header, HTTPException

from services.auth.session import Session, verify_token


async def get_session(authorization: str | None = Header(default=None)) -> Session:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="missing_bearer_token")
    token = authorization.split(" ", 1)[1].strip()
    session = verify_token(token)
    if session is None:
        raise HTTPException(status_code=401, detail="invalid_or_expired_session")
    return session


def require_role(*roles: str):
    """Depends(require_role("bos")) — 403s if the session's role doesn't match."""
    from fastapi import Depends

    async def _checked(session: Session = Depends(get_session)) -> Session:
        if session.role not in roles:
            raise HTTPException(status_code=403, detail=f"requires_role:{'|'.join(roles)}")
        return session

    return _checked
