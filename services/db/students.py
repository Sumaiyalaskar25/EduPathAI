# services/db/students.py
"""Resolve/ensure a `students` row by external_ref (APAAR/ABC token).

Shared by services/auth/digilocker.py (on login) and
services/api/orchestrator.py (on pathway persistence) so both
paths agree on the same internal UUID for a given external_ref.
"""
from __future__ import annotations

from typing import Any, Optional


async def ensure_student(db: Any, external_ref: str) -> str:
    """Idempotent upsert; returns the internal UUID as a string."""
    row = await db.fetchrow(
        """
        INSERT INTO students (id, external_ref)
        VALUES (gen_random_uuid(), $1)
        ON CONFLICT (external_ref) DO UPDATE SET external_ref = EXCLUDED.external_ref
        RETURNING id
        """,
        external_ref,
    )
    return str(row["id"])


async def get_student_uuid(db: Any, external_ref: str) -> Optional[str]:
    if db is None:
        return None
    row = await db.fetchrow("SELECT id FROM students WHERE external_ref = $1", external_ref)
    return str(row["id"]) if row else None
