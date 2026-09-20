# services/auth/digilocker.py
"""
Mock DigiLocker / APAAR verification.

Real DigiLocker access requires a government-issued integration
(OAuth against api.digitallocker.gov.in with an empanelled requester
ID) that cannot be stood up from a hackathon sandbox. This module
implements the same *shape* of flow the frontend already expects
(docs/API_INTEGRATION.md: "Real auth: replace setTimeout in
components/auth/DigiLockerAccess.tsx") against the local identity
directory, so swapping in the real client later is a one-file change
behind the same `verify()` signature.

Consent is enforced, not decorative: verification fails closed if
consent is false.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Literal, Optional
from uuid import uuid4

from services.auth.session import Role, issue_token
from services.db.students import ensure_student, get_student_uuid
from services.identity.directory import Identity, IdentityDirectory


class VerificationError(Exception):
    def __init__(self, reason: str) -> None:
        self.reason = reason
        super().__init__(reason)


@dataclass(frozen=True)
class VerifiedSession:
    token: str
    external_ref: str
    role: Role
    display_name: str
    institution: Optional[str]
    programme: Optional[str] = None
    target_institution: Optional[str] = None
    target_programme: Optional[str] = None


_MODE_TO_ROLE: dict[str, Role] = {
    "learner": "learner",
    "bos": "bos",
    "ministry": "ministry",
}


def _match_identity(directory: IdentityDirectory, identifier: str, mode: str) -> Optional[Identity]:
    identifier = identifier.strip()
    # Direct external_ref match (what our seed data / docs examples use, e.g. "student-001").
    hit = directory.get(identifier)
    if hit:
        return hit

    # Demo-friendly fallback: match on the last 4 digits of the masked APAAR,
    # so typing the number printed on a demo profile card also works.
    if mode == "learner":
        digits = "".join(ch for ch in identifier if ch.isdigit())
        if len(digits) >= 4:
            last4 = digits[-4:]
            for s in directory.all_students():
                if s.apaar_masked.replace(" ", "").endswith(last4):
                    return s
    return None


async def verify(
    directory: IdentityDirectory,
    db: Any,
    mode: str,
    identifier: str,
    consent: bool,
) -> VerifiedSession:
    if mode not in _MODE_TO_ROLE:
        raise VerificationError("unknown_identity_mode")
    if not consent:
        raise VerificationError("consent_required")
    if not identifier or not identifier.strip():
        raise VerificationError("identifier_required")

    if mode == "bos":
        identity = directory.all_reviewers()[0] if directory.all_reviewers() else None
        if identifier not in (None, "") and directory.get(identifier):
            identity = directory.get(identifier)
    elif mode == "ministry":
        identity = directory.get("officer-001")
    else:
        identity = _match_identity(directory, identifier, mode)

    if identity is None:
        raise VerificationError("identity_not_found")

    role = _MODE_TO_ROLE[mode]

    if role == "learner" and db is not None:
        await ensure_student(db, identity.external_ref)

    token = issue_token(
        external_ref=identity.external_ref,
        role=role,
        institution=identity.institution or None,
        display_name=identity.full_name,
    )

    return VerifiedSession(
        token=token,
        external_ref=identity.external_ref,
        role=role,
        display_name=identity.full_name,
        institution=identity.institution or None,
        programme=identity.programme or None,
        target_institution=identity.target_institution or None,
        target_programme=identity.target_programme or None,
    )



