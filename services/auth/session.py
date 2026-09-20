# services/auth/session.py
"""
Session tokens for the three identity modes (learner / bos / ministry).

Stateless, HMAC-signed, base64url tokens — the same shape as a JWT but
without adding a dependency. A session carries exactly what the API
needs to authorize a request: who (external_ref), what role, and which
institution (for BoS reviewers, to scope their queue).

This is a real signing/verification implementation, not a placeholder —
tokens are tamper-evident and expire. It is NOT a substitute for a real
DigiLocker/APAAR OAuth integration; see services/auth/digilocker.py for
where that swap happens.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import time
from dataclasses import dataclass
from typing import Literal, Optional

Role = Literal["learner", "bos", "ministry"]

_SECRET_ENV = "SESSION_SECRET"
_DEFAULT_DEV_SECRET = "dev-insecure-secret-change-me"
_TTL_SECONDS = 12 * 60 * 60  # 12h


def _secret() -> bytes:
    return os.environ.get(_SECRET_ENV, _DEFAULT_DEV_SECRET).encode("utf-8")


def _b64url_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def _b64url_decode(s: str) -> bytes:
    pad = "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + pad)


@dataclass(frozen=True)
class Session:
    external_ref: str
    role: Role
    institution: Optional[str] = None
    display_name: Optional[str] = None
    issued_at: float = 0.0
    expires_at: float = 0.0


def issue_token(
    external_ref: str,
    role: Role,
    institution: Optional[str] = None,
    display_name: Optional[str] = None,
) -> str:
    now = time.time()
    payload = {
        "sub": external_ref,
        "role": role,
        "inst": institution,
        "name": display_name,
        "iat": now,
        "exp": now + _TTL_SECONDS,
    }
    body = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    sig = _b64url_encode(hmac.new(_secret(), body.encode("ascii"), hashlib.sha256).digest())
    return f"{body}.{sig}"


def verify_token(token: str) -> Optional[Session]:
    """Returns the decoded Session, or None if invalid/expired/tampered."""
    try:
        body, sig = token.split(".", 1)
    except ValueError:
        return None

    expected_sig = _b64url_encode(hmac.new(_secret(), body.encode("ascii"), hashlib.sha256).digest())
    if not hmac.compare_digest(sig, expected_sig):
        return None

    try:
        payload = json.loads(_b64url_decode(body))
    except Exception:
        return None

    if payload.get("exp", 0) < time.time():
        return None

    return Session(
        external_ref=payload["sub"],
        role=payload["role"],
        institution=payload.get("inst"),
        display_name=payload.get("name"),
        issued_at=payload.get("iat", 0.0),
        expires_at=payload.get("exp", 0.0),
    )
